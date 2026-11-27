
import { useCallback, useEffect, useState } from "react";

import { getReportData } from "../../../services/reportService.js";
import { exportReportExcel } from "../../../services/reportExportService.js";

import ReportChartPanel from "./ReportChartPanel.jsx";

import "./AdminReports.css";

const formatPrice = (value) =>
    `${new Intl.NumberFormat("vi-VN").format(Number(value) || 0)}đ`;

const formatDateTime = (value) => {
    if (!value) return "Chưa cập nhật";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Không hợp lệ";

    return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
};

const getToday = () => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const getMonthStart = () => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    return `${year}-${month}-01`;
};

const PAYMENT_STATUS_LABELS = {
    Success: "Thành công",
    Failed: "Thất bại",
    Pending: "Đang xử lý"
};

const PAYMENT_METHOD_LABELS = {
    MoMo: "MoMo",
    Card: "Thẻ ngân hàng"
};

const DEFAULT_CHART_TYPES = {
    revenue: "text",
    method: "text",
    movies: "text",
    cinemas: "text"
};

function AdminReports() {
    // =====================================================
    // 1. BỘ LỌC BÁO CÁO
    // =====================================================

    const [fromDate, setFromDate] = useState(getMonthStart);
    const [toDate, setToDate] = useState(getToday);

    const [paymentStatus, setPaymentStatus] = useState("All");
    const [paymentMethod, setPaymentMethod] = useState("All");
    const [groupBy, setGroupBy] = useState("day");

    // =====================================================
    // 2. DỮ LIỆU VÀ TRẠNG THÁI
    // =====================================================

    const [report, setReport] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isExportingExcel, setIsExportingExcel] = useState(false);
    const [error, setError] = useState("");

    // Mỗi biểu đồ có kiểu hiển thị riêng.
    const [chartTypes, setChartTypes] = useState(
        DEFAULT_CHART_TYPES
    );

    // =====================================================
    // 3. TẢI DỮ LIỆU BÁO CÁO
    // =====================================================

    const loadReport = useCallback(async () => {
        try {
            setIsLoading(true);
            setError("");

            const result = await getReportData({
                fromDate,
                toDate,
                paymentStatus,
                paymentMethod,
                groupBy
            });

            setReport(result);
        } catch (err) {
            console.error("Không thể tải báo cáo:", err);

            setError(
                err.message || "Không thể tải dữ liệu báo cáo."
            );
        } finally {
            setIsLoading(false);
        }
    }, [
        fromDate,
        toDate,
        paymentStatus,
        paymentMethod,
        groupBy
    ]);

    useEffect(() => {
        loadReport();
    }, [loadReport]);

    // =====================================================
    // 4. THAY ĐỔI KIỂU BIỂU ĐỒ
    // =====================================================

    const handleChartTypeChange = (chartName, value) => {
        setChartTypes((previous) => ({
            ...previous,
            [chartName]: value
        }));
    };

    // =====================================================
    // 5. ĐẶT LẠI BỘ LỌC
    // =====================================================

    const handleResetFilters = () => {
        setFromDate(getMonthStart());
        setToDate(getToday());

        setPaymentStatus("All");
        setPaymentMethod("All");
        setGroupBy("day");

        setChartTypes(DEFAULT_CHART_TYPES);
    };

    // =====================================================
    // 6. XUẤT FILE CSV
    // =====================================================

    const handleExportCsv = () => {
        if (!report?.allTransactions?.length) return;

        const rows = [
            [
                "Mã giao dịch",
                "Mã đặt vé",
                "Phim",
                "Rạp",
                "Ngày thanh toán",
                "Phương thức",
                "Trạng thái",
                "Giá trị (VND)",
                "Trạng thái đơn"
            ],

            ...report.allTransactions.map((payment) => [
                payment.paymentCode || "",
                payment.bookingCode || "",
                payment.movie?.title || "",
                payment.cinema?.name || "",
                formatDateTime(payment.paymentDate),

                PAYMENT_METHOD_LABELS[payment.paymentMethod] ||
                    payment.paymentMethod ||
                    "",

                PAYMENT_STATUS_LABELS[payment.paymentStatus] ||
                    payment.paymentStatus ||
                    "",

                Number(payment.amount) || 0,
                payment.bookingStatus || ""
            ])
        ];

        const csv =
            "\uFEFF" +
            rows
                .map((row) =>
                    row
                        .map(
                            (value) =>
                                `"${String(value ?? "").replace(/"/g, '""')}"`
                        )
                        .join(",")
                )
                .join("\r\n");

        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download =
            `viewbook-reports-${fromDate}-to-${toDate}.csv`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        window.setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);
    };

    // =====================================================
    // 7. XUẤT FILE EXCEL
    // =====================================================

    const handleExportExcel = async () => {
        if (!report || isExportingExcel) return;

        try {
            setIsExportingExcel(true);
            setError("");

            await exportReportExcel({
                report,
                chartTypes,
                fromDate,
                toDate,
                paymentMethodLabels: PAYMENT_METHOD_LABELS,
                paymentStatusLabels: PAYMENT_STATUS_LABELS
            });
        } catch (err) {
            console.error("Không thể xuất Excel:", err);

            setError(
                err.message || "Không thể xuất file Excel."
            );
        } finally {
            setIsExportingExcel(false);
        }
    };

    // =====================================================
    // 8. TRẠNG THÁI ĐANG TẢI
    // =====================================================

    if (isLoading && !report) {
        return (
            <div className="admin-reports">
                <div className="admin-reports-state">
                    <span
                        className="spinner-border"
                        role="status"
                        aria-hidden="true"
                    ></span>

                    <strong>
                        Đang tổng hợp dữ liệu báo cáo...
                    </strong>
                </div>
            </div>
        );
    }

    // =====================================================
    // 9. TRẠNG THÁI LỖI
    // =====================================================

    if (error && !report) {
        return (
            <div className="admin-reports">
                <div className="admin-reports-state error">
                    <i className="bi bi-exclamation-circle"></i>

                    <strong>Không thể tải báo cáo</strong>

                    <p>{error}</p>

                    <button
                        type="button"
                        onClick={loadReport}
                    >
                        Thử tải lại
                    </button>
                </div>
            </div>
        );
    }

    const summary = report?.summary || {};

    // =====================================================
    // 10. GIAO DIỆN CHÍNH
    // =====================================================

    return (
        <div className="admin-reports">

            {/* =================================================
                TIÊU ĐỀ VÀ CÁC NÚT CHỨC NĂNG
            ================================================= */}

            <div className="admin-page-intro admin-reports-intro">
                <div>
                    <h3>Báo cáo thống kê</h3>

                    <p>
                        Theo dõi doanh thu, giao dịch, hiệu quả phim
                        và hoạt động kinh doanh của ViewBookCinemas.
                    </p>
                </div>

                <div className="admin-reports-actions">

                    {/* Xuất CSV */}

                    <button
                        type="button"
                        className="admin-reports-export"
                        onClick={handleExportCsv}
                        disabled={!report?.allTransactions?.length}
                    >
                        <i className="bi bi-filetype-csv"></i>
                        Xuất CSV
                    </button>

                    {/* Xuất Excel */}

                    <button
                        type="button"
                        className="admin-reports-excel"
                        onClick={handleExportExcel}
                        disabled={!report || isExportingExcel}
                    >
                        <i
                            className={`bi bi-file-earmark-excel ${
                                isExportingExcel ? "spin" : ""
                            }`}
                        ></i>

                        {isExportingExcel
                            ? "Đang xuất..."
                            : "Xuất Excel"}
                    </button>

                    {/* Làm mới */}

                    <button
                        type="button"
                        className="admin-reports-refresh"
                        onClick={loadReport}
                        disabled={isLoading}
                    >
                        <i
                            className={`bi bi-arrow-clockwise ${
                                isLoading ? "spin" : ""
                            }`}
                        ></i>

                        Làm mới
                    </button>
                </div>
            </div>

            {/* =================================================
                THÔNG BÁO LỖI
            ================================================= */}

            {error && (
                <div className="admin-reports-inline-error">
                    <i className="bi bi-exclamation-triangle"></i>
                    {error}
                </div>
            )}

            {/* =================================================
                BỘ LỌC BÁO CÁO
            ================================================= */}

            <section className="admin-reports-filter">

                <div className="admin-reports-filter-heading">
                    <div>
                        <h5>
                            <i className="bi bi-funnel"></i>
                            Điều kiện báo cáo
                        </h5>

                        <p>
                            Chọn khoảng thời gian và loại giao dịch
                            cần thống kê.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleResetFilters}
                    >
                        Đặt lại bộ lọc
                    </button>
                </div>

                <div className="admin-reports-filter-grid">

                    {/* Từ ngày */}

                    <div className="admin-reports-field">
                        <label htmlFor="reportFromDate">
                            Từ ngày
                        </label>

                        <input
                            id="reportFromDate"
                            type="date"
                            value={fromDate}
                            max={toDate || undefined}
                            onChange={(event) =>
                                setFromDate(event.target.value)
                            }
                        />
                    </div>

                    {/* Đến ngày */}

                    <div className="admin-reports-field">
                        <label htmlFor="reportToDate">
                            Đến ngày
                        </label>

                        <input
                            id="reportToDate"
                            type="date"
                            value={toDate}
                            min={fromDate || undefined}
                            max={getToday()}
                            onChange={(event) =>
                                setToDate(event.target.value)
                            }
                        />
                    </div>

                    {/* Trạng thái giao dịch */}

                    <div className="admin-reports-field">
                        <label htmlFor="reportPaymentStatus">
                            Trạng thái giao dịch
                        </label>

                        <select
                            id="reportPaymentStatus"
                            value={paymentStatus}
                            onChange={(event) =>
                                setPaymentStatus(event.target.value)
                            }
                        >
                            <option value="All">
                                Tất cả trạng thái
                            </option>

                            <option value="Success">
                                Thành công
                            </option>

                            <option value="Failed">
                                Thất bại
                            </option>

                            <option value="Pending">
                                Đang xử lý
                            </option>
                        </select>
                    </div>

                    {/* Phương thức thanh toán */}

                    <div className="admin-reports-field">
                        <label htmlFor="reportPaymentMethod">
                            Phương thức thanh toán
                        </label>

                        <select
                            id="reportPaymentMethod"
                            value={paymentMethod}
                            onChange={(event) =>
                                setPaymentMethod(event.target.value)
                            }
                        >
                            <option value="All">
                                Tất cả phương thức
                            </option>

                            <option value="MoMo">
                                MoMo
                            </option>

                            <option value="Card">
                                Thẻ ngân hàng
                            </option>
                        </select>
                    </div>

                    {/* Thống kê theo ngày / tháng */}

                    <div className="admin-reports-field">
                        <label htmlFor="reportGroupBy">
                            Thống kê biểu đồ theo
                        </label>

                        <select
                            id="reportGroupBy"
                            value={groupBy}
                            onChange={(event) =>
                                setGroupBy(event.target.value)
                            }
                        >
                            <option value="day">
                                Ngày
                            </option>

                            <option value="month">
                                Tháng
                            </option>
                        </select>
                    </div>
                </div>
            </section>

            {/* =================================================
                KẾT QUẢ THỐNG KÊ
            ================================================= */}

            <div className="admin-reports-result-heading">
                <div>
                    <h4>Kết quả thống kê</h4>

                    <p>
                        {fromDate || "Tất cả"}
                        {" — "}
                        {toDate || "Hiện tại"}
                    </p>
                </div>

                {isLoading && (
                    <span className="admin-reports-updating">
                        Đang cập nhật...
                    </span>
                )}
            </div>

            {/* =================================================
                4 THẺ THỐNG KÊ
            ================================================= */}

            <section className="admin-reports-statistics">

                {/* Doanh thu đơn chưa hủy */}

                <article className="admin-report-stat-card revenue">
                    <div className="admin-report-stat-top">
                        <span>
                            Doanh thu đơn chưa hủy
                        </span>

                        <span className="admin-report-stat-icon">
                            <i className="bi bi-cash-stack"></i>
                        </span>
                    </div>

                    <strong>
                        {formatPrice(summary.activeOrderRevenue)}
                    </strong>

                    <small>
                        Giao dịch thành công, không thuộc đơn đã hủy
                    </small>
                </article>

                {/* Tổng giao dịch */}

                <article className="admin-report-stat-card blue">
                    <div className="admin-report-stat-top">
                        <span>Tổng giao dịch</span>

                        <span className="admin-report-stat-icon">
                            <i className="bi bi-receipt"></i>
                        </span>
                    </div>

                    <strong>
                        {summary.totalTransactions || 0}
                    </strong>

                    <small>
                        {summary.successful || 0} thành công ·{" "}
                        {summary.failed || 0} thất bại
                    </small>
                </article>

                {/* Vé đã bán */}

                <article className="admin-report-stat-card purple">
                    <div className="admin-report-stat-top">
                        <span>Vé đã bán</span>

                        <span className="admin-report-stat-icon">
                            <i className="bi bi-ticket-perforated"></i>
                        </span>
                    </div>

                    <strong>
                        {summary.ticketsSold || 0}
                    </strong>

                    <small>
                        Vé thuộc các đơn đã thanh toán, chưa bị hủy
                    </small>
                </article>

                {/* Đơn đã hủy */}

                <article className="admin-report-stat-card orange">
                    <div className="admin-report-stat-top">
                        <span>Đơn đã hủy</span>

                        <span className="admin-report-stat-icon">
                            <i className="bi bi-x-circle"></i>
                        </span>
                    </div>

                    <strong>
                        {summary.cancelledBookings || 0}
                    </strong>

                    <small>
                        Giá trị đã thanh toán:{" "}
                        {formatPrice(summary.cancelledPaidAmount)}
                    </small>
                </article>
            </section>

            {/* =================================================
                BIỂU ĐỒ GIAO DỊCH VÀ PHƯƠNG THỨC THANH TOÁN
            ================================================= */}

            <section className="admin-reports-main-grid">

                {/* Giao dịch thành công */}

                <ReportChartPanel
                    title="Biểu đồ giao dịch thành công"
                    description={`Giá trị thanh toán theo ${
                        groupBy === "day" ? "ngày" : "tháng"
                    }`}
                    icon="bi-graph-up-arrow"
                    items={report?.revenueTrend || []}
                    type={chartTypes.revenue}
                    onTypeChange={(value) =>
                        handleChartTypeChange("revenue", value)
                    }
                    emptyMessage="Chưa có dữ liệu giao dịch thành công"
                />

                {/* Phương thức thanh toán */}

                <ReportChartPanel
                    title="Phương thức thanh toán"
                    description="Phân bổ giá trị giao dịch thành công"
                    icon="bi-wallet2"
                    items={report?.methodBreakdown || []}
                    type={chartTypes.method}
                    onTypeChange={(value) =>
                        handleChartTypeChange("method", value)
                    }
                    emptyMessage="Chưa có giao dịch thành công"
                />
            </section>

            {/* =================================================
                TOP PHIM VÀ TOP RẠP
            ================================================= */}

            <section className="admin-reports-ranking-grid">

                {/* Top phim */}

                <ReportChartPanel
                    title="Top phim theo doanh thu"
                    description="Không tính các đơn đã bị hủy"
                    icon="bi-film"
                    items={report?.topMovies || []}
                    type={chartTypes.movies}
                    onTypeChange={(value) =>
                        handleChartTypeChange("movies", value)
                    }
                    emptyMessage="Chưa có dữ liệu phim"
                />

                {/* Top rạp */}

                <ReportChartPanel
                    title="Top rạp theo doanh thu"
                    description="Không tính các đơn đã bị hủy"
                    icon="bi-building"
                    items={report?.topCinemas || []}
                    type={chartTypes.cinemas}
                    onTypeChange={(value) =>
                        handleChartTypeChange("cinemas", value)
                    }
                    emptyMessage="Chưa có dữ liệu rạp"
                />
            </section>

            {/* =================================================
                GIAO DỊCH GẦN ĐÂY
            ================================================= */}

            <section className="admin-report-panel admin-report-transactions">

                <div className="admin-report-panel-heading">
                    <div>
                        <h5>Giao dịch gần đây</h5>

                        <p>
                            8 giao dịch mới nhất trong khoảng thời gian
                            đã chọn
                        </p>
                    </div>
                </div>

                {report?.recentTransactions?.length ? (
                    <div className="admin-report-table-wrapper">
                        <table className="admin-report-table">

                            <thead>
                                <tr>
                                    <th>Mã giao dịch</th>
                                    <th>Phim / Rạp</th>
                                    <th>Ngày thanh toán</th>
                                    <th>Phương thức</th>
                                    <th>Giá trị</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>

                            <tbody>
                                {report.recentTransactions.map(
                                    (payment, index) => (
                                        <tr
                                            key={
                                                payment.paymentId ||
                                                payment.paymentCode ||
                                                index
                                            }
                                        >
                                            {/* Mã giao dịch */}

                                            <td>
                                                <strong>
                                                    {payment.paymentCode || "—"}
                                                </strong>

                                                <small>
                                                    {payment.bookingCode || "—"}
                                                </small>
                                            </td>

                                            {/* Phim và rạp */}

                                            <td>
                                                <strong>
                                                    {payment.movie?.title ||
                                                        "Chưa rõ phim"}
                                                </strong>

                                                <small>
                                                    {payment.cinema?.name ||
                                                        "Chưa rõ rạp"}
                                                </small>
                                            </td>

                                            {/* Ngày thanh toán */}

                                            <td>
                                                {formatDateTime(
                                                    payment.paymentDate
                                                )}
                                            </td>

                                            {/* Phương thức */}

                                            <td>
                                                {PAYMENT_METHOD_LABELS[
                                                    payment.paymentMethod
                                                ] ||
                                                    payment.paymentMethod ||
                                                    "—"}
                                            </td>

                                            {/* Giá trị */}

                                            <td>
                                                <strong>
                                                    {formatPrice(
                                                        payment.amount
                                                    )}
                                                </strong>
                                            </td>

                                            {/* Trạng thái */}

                                            <td>
                                                <span
                                                    className={`admin-report-status ${
                                                        payment.paymentStatus?.toLowerCase() ||
                                                        "unknown"
                                                    }`}
                                                >
                                                    {PAYMENT_STATUS_LABELS[
                                                        payment.paymentStatus
                                                    ] ||
                                                        payment.paymentStatus ||
                                                        "Không rõ"}
                                                </span>

                                                {payment.bookingStatus ===
                                                    "Cancelled" && (
                                                    <small className="admin-report-cancelled-label">
                                                        Đơn đã hủy
                                                    </small>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="admin-report-empty">
                        <i className="bi bi-receipt"></i>

                        <strong>
                            Không có giao dịch phù hợp
                        </strong>

                        <span>
                            Hãy thử điều chỉnh bộ lọc báo cáo.
                        </span>
                    </div>
                )}
            </section>

            {/* =================================================
                GHI CHÚ NGHIỆP VỤ
            ================================================= */}

            <div className="admin-reports-disclaimer">
                <i className="bi bi-info-circle"></i>

                <p>
                    Báo cáo sử dụng dữ liệu thanh toán mô phỏng được lưu
                    trên trình duyệt. “Doanh thu đơn chưa hủy” loại trừ
                    đơn đã hủy; “Tổng giá trị giao dịch thành công” vẫn
                    bao gồm giao dịch của đơn đã hủy vì hệ thống chưa có
                    nghiệp vụ hoàn tiền thật.
                </p>
            </div>
        </div>
    );
}

export default AdminReports;
