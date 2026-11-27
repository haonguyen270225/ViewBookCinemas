
import ExcelJS from "exceljs";

const formatPrice = (value) =>
    `${new Intl.NumberFormat("vi-VN").format(Number(value) || 0)}đ`;

const CHART_COLORS = [
    "#6558D3",
    "#2695D6",
    "#20A77A",
    "#E5A13B",
    "#D66C8B",
    "#7D8BA5"
];

const drawChart = (items, type, title) =>
    new Promise((resolve, reject) => {
        if (type === "text") {
            resolve(null);
            return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = 1000;
        canvas.height = 480;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
            reject(new Error("Không thể tạo biểu đồ Excel."));
            return;
        }

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#263047";
        ctx.font = "bold 25px Arial";
        ctx.fillText(title, 35, 45);

        if (!items.length) {
            ctx.font = "20px Arial";
            ctx.fillText("Không có dữ liệu", 35, 100);
            resolve(canvas.toDataURL("image/png"));
            return;
        }

        const values = items.map(
            (item) => Number(item.value) || 0
        );

        const maxValue = Math.max(...values, 1);
        const total = values.reduce((sum, value) => sum + value, 0);

        if (type === "bar") {
            const rowHeight = Math.min(
                65,
                360 / items.length
            );

            items.forEach((item, index) => {
                const y = 90 + index * rowHeight;
                const barWidth =
                    (Number(item.value) / maxValue) * 600;

                ctx.fillStyle = "#536078";
                ctx.font = "17px Arial";
                ctx.fillText(
                    String(item.label).slice(0, 25),
                    35,
                    y + 22
                );

                ctx.fillStyle = "#6558D3";
                ctx.fillRect(330, y, Math.max(barWidth, 2), 25);

                ctx.fillStyle = "#263047";
                ctx.fillText(
                    formatPrice(item.value),
                    345 + barWidth,
                    y + 20
                );
            });
        }

        if (type === "line") {
            const points = items.map((item, index) => ({
                x:
                    items.length === 1
                        ? 500
                        : 70 + (index * 850) / (items.length - 1),
                y:
                    390 -
                    (Number(item.value) / maxValue) * 290
            }));

            ctx.strokeStyle = "#6558D3";
            ctx.lineWidth = 5;
            ctx.beginPath();

            points.forEach((point, index) => {
                if (index === 0) {
                    ctx.moveTo(point.x, point.y);
                } else {
                    ctx.lineTo(point.x, point.y);
                }
            });

            ctx.stroke();

            points.forEach((point, index) => {
                ctx.fillStyle = "#6558D3";
                ctx.beginPath();
                ctx.arc(point.x, point.y, 7, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = "#263047";
                ctx.font = "14px Arial";
                ctx.fillText(
                    String(items[index].label).slice(0, 12),
                    point.x - 30,
                    430
                );
            });
        }

        if (type === "pie") {
            let startAngle = -Math.PI / 2;

            items.forEach((item, index) => {
                const value = Number(item.value) || 0;
                const angle =
                    total > 0
                        ? (value / total) * Math.PI * 2
                        : 0;

                ctx.beginPath();
                ctx.moveTo(270, 260);
                ctx.arc(
                    270,
                    260,
                    175,
                    startAngle,
                    startAngle + angle
                );
                ctx.closePath();

                ctx.fillStyle =
                    CHART_COLORS[index % CHART_COLORS.length];
                ctx.fill();

                startAngle += angle;

                const legendY = 115 + index * 52;

                ctx.fillRect(540, legendY - 15, 20, 20);

                ctx.fillStyle = "#263047";
                ctx.font = "17px Arial";
                ctx.fillText(
                    `${item.label}: ${formatPrice(value)}`,
                    575,
                    legendY
                );
            });
        }

        resolve(canvas.toDataURL("image/png"));
    });

const toExcelRows = (items) =>
    items.map((item, index) => ({
        STT: index + 1,
        "Tên thống kê": item.label,
        "Doanh thu (VND)": Number(item.value) || 0
    }));

export const exportReportExcel = async ({
    report,
    chartTypes,
    fromDate,
    toDate,
    paymentMethodLabels,
    paymentStatusLabels
}) => {
    if (!report) {
        throw new Error("Không có dữ liệu báo cáo để xuất.");
    }

    const workbook = new ExcelJS.Workbook();

    workbook.creator = "ViewBookCinemas";
    workbook.created = new Date();
    workbook.subject = "Báo cáo thống kê";
    workbook.title = "Báo cáo ViewBookCinemas";

    const transactionSheet = workbook.addWorksheet("Giao dịch");

    transactionSheet.columns = [
        { header: "Mã giao dịch", key: "paymentCode", width: 25 },
        { header: "Mã đặt vé", key: "bookingCode", width: 25 },
        { header: "Phim", key: "movie", width: 30 },
        { header: "Rạp", key: "cinema", width: 30 },
        { header: "Ngày thanh toán", key: "date", width: 24 },
        { header: "Phương thức", key: "method", width: 20 },
        { header: "Trạng thái", key: "status", width: 18 },
        { header: "Giá trị (VND)", key: "amount", width: 20 },
        { header: "Trạng thái đơn", key: "bookingStatus", width: 20 }
    ];

    transactionSheet.addRows(
        report.allTransactions.map((payment) => ({
            paymentCode: payment.paymentCode || "",
            bookingCode: payment.bookingCode || "",
            movie: payment.movie?.title || "",
            cinema: payment.cinema?.name || "",
            date: payment.paymentDate
                ? new Date(payment.paymentDate).toLocaleString("vi-VN")
                : "",
            method:
                paymentMethodLabels[payment.paymentMethod] ||
                payment.paymentMethod ||
                "",
            status:
                paymentStatusLabels[payment.paymentStatus] ||
                payment.paymentStatus ||
                "",
            amount: Number(payment.amount) || 0,
            bookingStatus: payment.bookingStatus || ""
        }))
    );

    const header = transactionSheet.getRow(1);
    header.font = { bold: true, color: { argb: "FFFFFFFF" } };
    header.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF6558D3" }
    };

    transactionSheet.views = [{ state: "frozen", ySplit: 1 }];
    transactionSheet.autoFilter = {
        from: "A1",
        to: "I1"
    };

    transactionSheet.getColumn("amount").numFmt = '#,##0 "₫"';

    const chartSheet = workbook.addWorksheet("Biểu đồ");

    chartSheet.getColumn(1).width = 28;
    chartSheet.getColumn(2).width = 22;
    chartSheet.getColumn(10).width = 28;
    chartSheet.getColumn(11).width = 22;

    chartSheet.mergeCells("A1:K1");
    chartSheet.getCell("A1").value =
        `BÁO CÁO VIEWBOOKCINEMAS (${fromDate} - ${toDate})`;
    chartSheet.getCell("A1").font = {
        bold: true,
        size: 16,
        color: { argb: "FF6558D3" }
    };

    const chartGroups = [
        {
            title: "Biểu đồ giao dịch thành công",
            items: report.revenueTrend.map((item) => ({
                label: item.label,
                value: item.revenue
            })),
            type: chartTypes.revenue
        },
        {
            title: "Phương thức thanh toán",
            items: report.methodBreakdown.map((item) => ({
                label: item.label,
                value: item.revenue
            })),
            type: chartTypes.method
        },
        {
            title: "Top phim theo doanh thu",
            items: report.topMovies.map((item) => ({
                label: item.name,
                value: item.revenue
            })),
            type: chartTypes.movies
        },
        {
            title: "Top rạp theo doanh thu",
            items: report.topCinemas.map((item) => ({
                label: item.name,
                value: item.revenue
            })),
            type: chartTypes.cinemas
        }
    ];

    const positions = [
        { col: 0, row: 3 },
        { col: 9, row: 3 },
        { col: 0, row: 28 },
        { col: 9, row: 28 }
    ];

    for (let index = 0; index < chartGroups.length; index += 1) {
        const group = chartGroups[index];
        const position = positions[index];

        chartSheet.getCell(position.row, position.col + 1).value =
            group.title;

        chartSheet.getCell(position.row, position.col + 1).font = {
            bold: true,
            size: 13
        };

        chartSheet.getCell(position.row + 1, position.col + 1).value =
            `Kiểu hiển thị: ${
                group.type === "text"
                    ? "Văn bản"
                    : group.type === "bar"
                        ? "Biểu đồ cột"
                        : group.type === "line"
                            ? "Biểu đồ đường"
                            : "Biểu đồ quạt"
            }`;

        if (group.type === "text") {
            const startRow = position.row + 3;

            chartSheet.getCell(startRow, position.col + 1).value =
                "Tên thống kê";
            chartSheet.getCell(startRow, position.col + 2).value =
                "Doanh thu (VND)";

            toExcelRows(group.items).forEach((item, rowIndex) => {
                chartSheet.getCell(
                    startRow + rowIndex + 1,
                    position.col + 1
                ).value = item["Tên thống kê"];

                chartSheet.getCell(
                    startRow + rowIndex + 1,
                    position.col + 2
                ).value = item["Doanh thu (VND)"];
            });
        } else {
            const imageData = await drawChart(
                group.items,
                group.type,
                group.title
            );

            const imageId = workbook.addImage({
                base64: imageData,
                extension: "png"
            });

            chartSheet.addImage(imageId, {
                tl: {
                    col: position.col,
                    row: position.row + 2
                },
                ext: {
                    width: 500,
                    height: 240
                }
            });
        }
    }

    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `viewbook-reports-${fromDate}-to-${toDate}.xlsx`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};
