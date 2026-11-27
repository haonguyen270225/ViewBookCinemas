
import { useCallback, useEffect, useMemo, useState } from "react";

import { getReportData } from "../../../services/reportService.js";

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

function AdminReports() {
    const [fromDate, setFromDate] = useState(getMonthStart);
    const [toDate, setToDate] = useState(getToday);
    const [paymentStatus, setPaymentStatus] = useState("All");
    const [paymentMethod, setPaymentMethod] = useState("All");
    const [groupBy, setGroupBy] = useState("day");

    const [report, setReport] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

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

    const handleResetFilters = () => {
        setFromDate(getMonthStart());
        setToDate(getToday());
        setPaymentStatus("All");
        setPaymentMethod("All");
        setGroupBy("day");
    };

    // Xuất toàn bộ giao dịch phù hợp với bộ lọc hiện tại.
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
                "Giá trị"
            ],
            ...report.allTransactions.map((payment) => [
                payment.paymentCode,
                payment.bookingCode,
                payment.movie?.title || "",
                payment.cinema?.name || "",
                formatDateTime(payment.paymentDate),
                PAYMENT_METHOD_LABELS[payment.paymentMethod] ||
                    payment.paymentMethod ||
                    "",
                PAYMENT_STATUS_LABELS[payment.paymentStatus] ||
                    payment.paymentStatus ||
                    "",
                Number(payment.amount) || 0
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
        link.download = `viewbook-reports-${fromDate}-to-${toDate}.csv`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    const maxRevenue = useMemo(() => {
        if (!report?.revenueTrend?.length) return 0;

        return Math.max(
            ...report.revenueTrend.map((item) => item.revenue),
            1
        );
    }, [report]);

    const maxMovieRevenue = useMemo(() => {
        if (!report?.topMovies?.length) return 0;

        return Math.max(
            ...report.topMovies.map((item) => item.revenue),
            1
        );
    }, [report]);

    const maxCinemaRevenue = useMemo(() => {
        if (!report?.topCinemas?.length) return 0;

        return Math.max(
            ...report.topCinemas.map((item) => item.revenue),
            1
        );
    }, [report]);

    if (isLoading && !report) {
        return (
            <div className="admin-reports">
                <div className="admin-reports-state">
                    <span className="spinner-border" role="status"></span>
                    <strong>Đang tổng hợp dữ liệu báo cáo...</strong>
                </div>
            </div>
        );
    }

    if (error && !report) {
        return (
            <div className="admin-reports">
                <div className="admin-reports-state error">
                    <i className="bi bi-exclamation-circle"></i>
                    <strong>Không thể tải báo cáo</strong>
                    <p>{error}</p>

                    <button type="button" onClick={loadReport}>
                        Thử tải lại
                    </button>
                </div>
            </div>
        );
    }

    const summary = report?.summary || {};

    return (
        <div className="admin-reports">
            {/* Tiêu đề */}
            <div className="admin-page-intro admin-reports-intro">
                <div>
                    <h3>Báo cáo thống kê</h3>
                    <p>
                        Theo dõi doanh thu, giao dịch, hiệu quả phim và
                        hoạt động kinh doanh của ViewBookCinemas.
                    </p>
                </div>

                <div className="admin-reports-actions">
                    <button
                        type="button"
                        className="admin-reports-export"
                        onClick={handleExportCsv}
                        disabled={!report?.allTransactions?.length}
                    >
                        <i className="bi bi-download"></i>
                        Xuất CSV
                    </button>

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

            {/* Bộ lọc */}
            <section className="admin-reports-filter">
                <div className="admin-reports-filter-heading">
                    <div>
                        <h5>
                            <i className="bi bi-funnel"></i>
                            Điều kiện báo cáo
                        </h5>
                        <p>
                            Chọn khoảng thời gian và loại giao dịch cần thống kê.
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
                    <div className="admin-reports-field">
                        <label htmlFor="reportFromDate">Từ ngày</label>
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

                    <div className="admin-reports-field">
                        <label htmlFor="reportToDate">Đến ngày</label>
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
                            <option value="All">Tất cả trạng thái</option>
                            <option value="Success">Thành công</option>
                            <option value="Failed">Thất bại</option>
                            <option value="Pending">Đang xử lý</option>
                        </select>
                    </div>

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
                            <option value="All">Tất cả phương thức</option>
                            <option value="MoMo">MoMo</option>
                            <option value="Card">Thẻ ngân hàng</option>
                        </select>
                    </div>

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
                            <option value="day">Ngày</option>
                            <option value="month">Tháng</option>
                        </select>
                    </div>
                </div>
            </section>

            {error && (
                <div className="admin-reports-inline-error">
                    <i className="bi bi-exclamation-triangle"></i>
                    {error}
                </div>
            )}

            {/* Kết quả */}
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

            {/* Thẻ thống kê */}
            <section className="admin-reports-statistics">
                <article className="admin-report-stat-card revenue">
                    <div className="admin-report-stat-top">
                        <span>Doanh thu đơn chưa hủy</span>
                        <span className="admin-report-stat-icon">
                            <i className="bi bi-cash-stack"></i>
                        </span>
                    </div>
                    <strong>{formatPrice(summary.activeOrderRevenue)}</strong>
                    <small>
                        Giao dịch thành công, không thuộc đơn đã hủy
                    </small>
                </article>

                <article className="admin-report-stat-card blue">
                    <div className="admin-report-stat-top">
                        <span>Tổng giao dịch</span>
                        <span className="admin-report-stat-icon">
                            <i className="bi bi-receipt"></i>
                        </span>
                    </div>
                    <strong>{summary.totalTransactions || 0}</strong>
                    <small>
                        {summary.successful || 0} thành công ·{" "}
                        {summary.failed || 0} thất bại
                    </small>
                </article>

                <article className="admin-report-stat-card purple">
                    <div className="admin-report-stat-top">
                        <span>Vé đã bán</span>
                        <span className="admin-report-stat-icon">
                            <i className="bi bi-ticket-perforated"></i>
                        </span>
                    </div>
                    <strong>{summary.ticketsSold || 0}</strong>
                    <small>
                        Vé thuộc các đơn đã thanh toán, chưa bị hủy
                    </small>
                </article>

                <article className="admin-report-stat-card orange">
                    <div className="admin-report-stat-top">
                        <span>Đơn đã hủy</span>
                        <span className="admin-report-stat-icon">
                            <i className="bi bi-x-circle"></i>
                        </span>
                    </div>
                    <strong>{summary.cancelledBookings || 0}</strong>
                    <small>
                        Giá trị đã thanh toán:{" "}
                        {formatPrice(summary.cancelledPaidAmount)}
                    </small>
                </article>
            </section>

            {/* Biểu đồ và phương thức thanh toán */}
            <section className="admin-reports-main-grid">
                <article className="admin-report-panel">
                    <div className="admin-report-panel-heading">
                        <div>
                            <h5>Biểu đồ giao dịch thành công</h5>
                            <p>
                                Giá trị thanh toán theo{" "}
                                {groupBy === "day" ? "ngày" : "tháng"}
                            </p>
                        </div>

                        <span className="admin-report-heading-icon">
                            <i className="bi bi-graph-up-arrow"></i>
                        </span>
                    </div>

                    {report?.revenueTrend?.length ? (
                        <div className="admin-report-chart">
                            {report.revenueTrend.map((item) => (
                                <div
                                    className="admin-report-chart-row"
                                    key={item.key}
                                >
                                    <span className="admin-report-chart-label">
                                        {item.label}
                                    </span>

                                    <div className="admin-report-chart-track">
                                        <div
                                            className="admin-report-chart-bar"
                                            style={{
                                                width: `${
                                                    Math.max(
                                                        (item.revenue /
                                                            maxRevenue) *
                                                            100,
                                                        1
                                                    )
                                                }%`
                                            }}
                                        ></div>
                                    </div>

                                    <strong>
                                        {formatPrice(item.revenue)}
                                    </strong>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="admin-report-empty">
                            <i className="bi bi-bar-chart-line"></i>
                            <strong>Chưa có dữ liệu doanh thu</strong>
                            <span>
                                Thử thay đổi khoảng thời gian hoặc bộ lọc.
                            </span>
                        </div>
                    )}
                </article>

                <article className="admin-report-panel">
                    <div className="admin-report-panel-heading">
                        <div>
                            <h5>Phương thức thanh toán</h5>
                            <p>Phân bổ giá trị giao dịch thành công</p>
                        </div>

                        <span className="admin-report-heading-icon">
                            <i className="bi bi-wallet2"></i>
                        </span>
                    </div>

                    {report?.methodBreakdown?.length ? (
                        <div className="admin-report-method-list">
                            {report.methodBreakdown.map((item) => {
                                const percent = summary.grossRevenue
                                    ? (item.revenue /
                                          summary.grossRevenue) *
                                      100
                                    : 0;

                                return (
                                    <div
                                        className="admin-report-method-item"
                                        key={item.method}
                                    >
                                        <div className="admin-report-method-meta">
                                            <strong>{item.label}</strong>
                                            <span>{percent.toFixed(1)}%</span>
                                        </div>

                                        <div className="admin-report-method-track">
                                            <div
                                                style={{
                                                    width: `${percent}%`
                                                }}
                                            ></div>
                                        </div>

                                        <small>
                                            {formatPrice(item.revenue)}
                                        </small>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="admin-report-empty compact">
                            <i className="bi bi-wallet"></i>
                            <strong>Chưa có giao dịch thành công</strong>
                        </div>
                    )}

                    <div className="admin-report-method-total">
                        <span>Tổng giá trị giao dịch thành công</span>
                        <strong>{formatPrice(summary.grossRevenue)}</strong>
                    </div>
                </article>
            </section>

            {/* Xếp hạng phim và rạp */}
            <section className="admin-reports-ranking-grid">
                <article className="admin-report-panel">
                    <div className="admin-report-panel-heading">
                        <div>
                            <h5>Top phim theo doanh thu</h5>
                            <p>Không tính các đơn đã bị hủy</p>
                        </div>

                        <span className="admin-report-heading-icon">
                            <i className="bi bi-film"></i>
                        </span>
                    </div>

                    {report?.topMovies?.length ? (
                        <div className="admin-report-ranking-list">
                            {report.topMovies.map((item, index) => (
                                <div
                                    className="admin-report-ranking-item"
                                    key={item.name}
                                >
                                    <span className="admin-report-rank">
                                        {index + 1}
                                    </span>

                                    <div className="admin-report-ranking-content">
                                        <div className="admin-report-ranking-meta">
                                            <strong title={item.name}>
                                                {item.name}
                                            </strong>
                                            <span>
                                                {formatPrice(item.revenue)}
                                            </span>
                                        </div>

                                        <div className="admin-report-ranking-track">
                                            <div
                                                style={{
                                                    width: `${
                                                        (item.revenue /
                                                            maxMovieRevenue) *
                                                        100
                                                    }%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="admin-report-empty compact">
                            <i className="bi bi-film"></i>
                            <strong>Chưa có dữ liệu phim</strong>
                        </div>
                    )}
                </article>

                <article className="admin-report-panel">
                    <div className="admin-report-panel-heading">
                        <div>
                            <h5>Top rạp theo doanh thu</h5>
                            <p>Không tính các đơn đã bị hủy</p>
                        </div>

                        <span className="admin-report-heading-icon">
                            <i className="bi bi-building"></i>
                        </span>
                    </div>

                    {report?.topCinemas?.length ? (
                        <div className="admin-report-ranking-list">
                            {report.topCinemas.map((item, index) => (
                                <div
                                    className="admin-report-ranking-item"
                                    key={item.name}
                                >
                                    <span className="admin-report-rank">
                                        {index + 1}
                                    </span>

                                    <div className="admin-report-ranking-content">
                                        <div className="admin-report-ranking-meta">
                                            <strong title={item.name}>
                                                {item.name}
                                            </strong>
                                            <span>
                                                {formatPrice(item.revenue)}
                                            </span>
                                        </div>

                                        <div className="admin-report-ranking-track">
                                            <div
                                                style={{
                                                    width: `${
                                                        (item.revenue /
                                                            maxCinemaRevenue) *
                                                        100
                                                    }%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="admin-report-empty compact">
                            <i className="bi bi-building"></i>
                            <strong>Chưa có dữ liệu rạp</strong>
                        </div>
                    )}
                </article>
            </section>

            {/* Giao dịch gần đây */}
            <section className="admin-report-panel admin-report-transactions">
                <div className="admin-report-panel-heading">
                    <div>
                        <h5>Giao dịch gần đây</h5>
                        <p>
                            8 giao dịch mới nhất trong khoảng thời gian đã chọn
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
                                {report.recentTransactions.map((payment) => (
                                    <tr key={payment.paymentId}>
                                        <td>
                                            <strong>
                                                {payment.paymentCode}
                                            </strong>
                                            <small>
                                                {payment.bookingCode}
                                            </small>
                                        </td>

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

                                        <td>
                                            {formatDateTime(payment.paymentDate)}
                                        </td>

                                        <td>
                                            {PAYMENT_METHOD_LABELS[
                                                payment.paymentMethod
                                            ] ||
                                                payment.paymentMethod ||
                                                "—"}
                                        </td>

                                        <td>
                                            <strong>
                                                {formatPrice(payment.amount)}
                                            </strong>
                                        </td>

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
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="admin-report-empty">
                        <i className="bi bi-receipt"></i>
                        <strong>Không có giao dịch phù hợp</strong>
                        <span>
                            Hãy thử điều chỉnh bộ lọc báo cáo.
                        </span>
                    </div>
                )}
            </section>

            <div className="admin-reports-disclaimer">
                <i className="bi bi-info-circle"></i>
                <p>
                    Báo cáo sử dụng dữ liệu thanh toán mô phỏng được lưu trên
                    trình duyệt. “Doanh thu đơn chưa hủy” loại trừ đơn đã hủy;
                    “Tổng giá trị giao dịch thành công” vẫn bao gồm giao dịch
                    của đơn đã hủy vì hệ thống chưa có nghiệp vụ hoàn tiền thật.
                </p>
            </div>
        </div>
    );
}

export default AdminReports;
