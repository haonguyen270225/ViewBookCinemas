
import { useEffect, useMemo, useState } from "react";

import {
    getPayments,
    getPaymentStatistics
} from "../../../services/paymentService.js";

import "./AdminPayments.css";

const PAYMENT_METHOD_OPTIONS = [
    { value: "MoMo", label: "Ví điện tử MoMo" },
    { value: "Card", label: "Thẻ ngân hàng" }
];

const PAYMENT_STATUS_OPTIONS = [
    { value: "Success", label: "Thành công" },
    { value: "Failed", label: "Thất bại" },
    { value: "Pending", label: "Đang xử lý" }
];

const formatPrice = (price) =>
    `${new Intl.NumberFormat("vi-VN").format(Number(price) || 0)}đ`;

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

const getPaymentMethodLabel = (method) =>
    PAYMENT_METHOD_OPTIONS.find(
        (item) => item.value === method
    )?.label || method || "Chưa rõ";

const getPaymentStatusLabel = (status) =>
    PAYMENT_STATUS_OPTIONS.find(
        (item) => item.value === status
    )?.label || status || "Chưa xác định";

const getPaymentStatusClass = (status) => {
    if (status === "Success") return "success";
    if (status === "Failed") return "failed";
    if (status === "Pending") return "pending";
    return "unknown";
};

function AdminPayments() {
    const [payments, setPayments] = useState([]);
    const [statistics, setStatistics] = useState({
        total: 0,
        successful: 0,
        failed: 0,
        pending: 0,
        totalRevenue: 0,
        cancelledBookingPayments: 0
    });

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedPayment, setSelectedPayment] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMethod, setSelectedMethod] = useState("Tất cả");
    const [selectedStatus, setSelectedStatus] = useState("Tất cả");
    const [selectedDate, setSelectedDate] = useState("");

    //=================== Tải dữ liệu thanh toán ========================

    const loadPayments = async () => {
        try {
            setIsLoading(true);
            setError("");

            const [paymentData, statisticsData] = await Promise.all([
                getPayments(),
                getPaymentStatistics()
            ]);

            setPayments(Array.isArray(paymentData) ? paymentData : []);
            setStatistics(statisticsData);
        } catch (err) {
            console.error("Không thể tải dữ liệu thanh toán:", err);

            setError(
                err.message || "Không thể tải danh sách thanh toán."
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPayments();
    }, []);

    //=================== Tìm kiếm và lọc ========================

    const filteredPayments = useMemo(() => {
        const keyword = searchTerm.trim().toLocaleLowerCase("vi");

        return payments.filter((payment) => {
            const searchableText = [
                payment.paymentCode,
                payment.bookingCode,
                payment.movie?.title,
                payment.cinema?.name,
                payment.room?.roomName,
                payment.paymentMethod
            ]
                .filter(Boolean)
                .join(" ")
                .toLocaleLowerCase("vi");

            const matchesSearch =
                !keyword || searchableText.includes(keyword);

            const matchesMethod =
                selectedMethod === "Tất cả" ||
                payment.paymentMethod === selectedMethod;

            const matchesStatus =
                selectedStatus === "Tất cả" ||
                payment.paymentStatus === selectedStatus;

            const matchesDate =
                !selectedDate ||
                payment.paymentDate?.slice(0, 10) === selectedDate;

            return (
                matchesSearch &&
                matchesMethod &&
                matchesStatus &&
                matchesDate
            );
        });
    }, [
        payments,
        searchTerm,
        selectedMethod,
        selectedStatus,
        selectedDate
    ]);

    //=================== Xóa bộ lọc ========================

    const handleClearFilters = () => {
        setSearchTerm("");
        setSelectedMethod("Tất cả");
        setSelectedStatus("Tất cả");
        setSelectedDate("");
    };

    //=================== Xem chi tiết giao dịch ========================

    const handleViewDetail = (payment) => {
        setSelectedPayment(payment);
    };

    //=================== Trạng thái tải dữ liệu ========================

    if (isLoading) {
        return (
            <div className="admin-payments">
                <div className="admin-payments-empty">
                    <i className="bi bi-hourglass-split"></i>
                    <h5>Đang tải danh sách thanh toán...</h5>
                </div>
            </div>
        );
    }

    //=================== Xử lý lỗi ========================

    if (error) {
        return (
            <div className="admin-payments">
                <div className="admin-payments-empty">
                    <i className="bi bi-exclamation-circle"></i>
                    <h5>Không thể tải dữ liệu</h5>
                    <p>{error}</p>

                    <button
                        type="button"
                        onClick={loadPayments}
                        disabled={isLoading}
                    >
                        Thử tải lại
                    </button>
                </div>
            </div>
        );
    }

    //=================== Giao diện quản lý thanh toán ========================

    return (
        <div className="admin-payments">
            {/* Tiêu đề */}
            <div className="admin-page-intro admin-payments-intro">
                <div>
                    <h3>Quản lý thanh toán</h3>
                    <p>
                        Theo dõi giao dịch, phương thức thanh toán và doanh
                        thu từ các đơn đặt vé.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-payments-refresh"
                    onClick={loadPayments}
                    disabled={isLoading}
                >
                    <i className="bi bi-arrow-clockwise"></i>
                    Làm mới
                </button>
            </div>

            {/* Thống kê */}
            <div className="admin-payments-statistics">
                <div className="admin-payment-stat-card">
                    <div className="admin-payment-stat-icon blue">
                        <i className="bi bi-receipt"></i>
                    </div>
                    <div>
                        <span>Tổng giao dịch</span>
                        <strong>{statistics.total}</strong>
                    </div>
                </div>

                <div className="admin-payment-stat-card">
                    <div className="admin-payment-stat-icon green">
                        <i className="bi bi-check-circle"></i>
                    </div>
                    <div>
                        <span>Thành công</span>
                        <strong>{statistics.successful}</strong>
                    </div>
                </div>

                <div className="admin-payment-stat-card">
                    <div className="admin-payment-stat-icon red">
                        <i className="bi bi-x-circle"></i>
                    </div>
                    <div>
                        <span>Thất bại</span>
                        <strong>{statistics.failed}</strong>
                    </div>
                </div>

                <div className="admin-payment-stat-card">
                    <div className="admin-payment-stat-icon purple">
                        <i className="bi bi-cash-stack"></i>
                    </div>
                    <div>
                        <span>Doanh thu thành công</span>
                        <strong className="revenue">
                            {formatPrice(statistics.totalRevenue)}
                        </strong>
                    </div>
                </div>
            </div>

            {/* Thông tin nghiệp vụ */}
            <div className="admin-payments-note">
                <i className="bi bi-info-circle"></i>
                <div>
                    <strong>Lưu ý về dữ liệu giao dịch</strong>
                    <p>
                        Đây là dữ liệu thanh toán mô phỏng được ghi nhận từ
                        các đơn đặt vé. Đơn bị hủy không đồng nghĩa với giao
                        dịch đã được hoàn tiền.
                    </p>
                </div>
            </div>

            {/* Bộ lọc */}
            <section className="admin-payments-filter">
                <div className="admin-payments-filter-heading">
                    <div>
                        <h5>
                            <i className="bi bi-funnel"></i>
                            Tìm kiếm và lọc
                        </h5>
                        <p>
                            Tìm theo mã giao dịch, mã đặt vé, phim hoặc rạp.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="admin-payments-clear"
                        onClick={handleClearFilters}
                    >
                        Xóa bộ lọc
                    </button>
                </div>

                <div className="admin-payments-filter-grid">
                    <div className="admin-payments-field search">
                        <label htmlFor="paymentSearch">Từ khóa</label>

                        <div className="admin-payments-search-box">
                            <i className="bi bi-search"></i>
                            <input
                                id="paymentSearch"
                                type="text"
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                                placeholder="Mã giao dịch, mã đơn, phim..."
                            />
                        </div>
                    </div>

                    <div className="admin-payments-field">
                        <label htmlFor="paymentMethod">
                            Phương thức thanh toán
                        </label>

                        <select
                            id="paymentMethod"
                            value={selectedMethod}
                            onChange={(event) =>
                                setSelectedMethod(event.target.value)
                            }
                        >
                            <option value="Tất cả">
                                Tất cả phương thức
                            </option>

                            {PAYMENT_METHOD_OPTIONS.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="admin-payments-field">
                        <label htmlFor="paymentStatus">
                            Trạng thái giao dịch
                        </label>

                        <select
                            id="paymentStatus"
                            value={selectedStatus}
                            onChange={(event) =>
                                setSelectedStatus(event.target.value)
                            }
                        >
                            <option value="Tất cả">
                                Tất cả trạng thái
                            </option>

                            {PAYMENT_STATUS_OPTIONS.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="admin-payments-field">
                        <label htmlFor="paymentDate">
                            Ngày thanh toán
                        </label>

                        <input
                            id="paymentDate"
                            type="date"
                            value={selectedDate}
                            onChange={(event) =>
                                setSelectedDate(event.target.value)
                            }
                        />
                    </div>
                </div>
            </section>

            {/* Danh sách giao dịch */}
            <section className="admin-payments-list">
                <div className="admin-payments-list-heading">
                    <div>
                        <h5>Danh sách giao dịch</h5>
                        <p>
                            Hiển thị {filteredPayments.length} / {payments.length} giao dịch
                        </p>
                    </div>
                </div>

                <div className="admin-payments-table-wrapper">
                    <table className="admin-payments-table">
                        <thead>
                            <tr>
                                <th>Mã giao dịch</th>
                                <th>Mã đơn đặt vé</th>
                                <th>Thông tin phim</th>
                                <th>Ngày thanh toán</th>
                                <th>Phương thức</th>
                                <th>Số tiền</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredPayments.length > 0 ? (
                                filteredPayments.map((payment) => (
                                    <tr key={payment.paymentId}>
                                        <td>
                                            <strong className="admin-payment-code">
                                                {payment.paymentCode}
                                            </strong>
                                        </td>

                                        <td>
                                            <strong className="admin-payment-booking-code">
                                                {payment.bookingCode}
                                            </strong>
                                        </td>

                                        <td>
                                            <div className="admin-payment-movie">
                                                <strong>
                                                    {payment.movie?.title || "Chưa rõ phim"}
                                                </strong>
                                                <span>
                                                    {payment.cinema?.name || "Chưa rõ rạp"}
                                                </span>
                                            </div>
                                        </td>

                                        <td>
                                            {formatDateTime(payment.paymentDate)}
                                        </td>

                                        <td>
                                            <span className={`admin-payment-method ${payment.paymentMethod === "MoMo" ? "momo" : "card"}`}>
                                                <i className={`bi ${payment.paymentMethod === "MoMo" ? "bi-wallet2" : "bi-credit-card"}`}></i>
                                                {getPaymentMethodLabel(payment.paymentMethod)}
                                            </span>
                                        </td>

                                        <td>
                                            <strong className="admin-payment-amount">
                                                {formatPrice(payment.amount)}
                                            </strong>
                                        </td>

                                        <td>
                                            <span className={`admin-payment-status ${getPaymentStatusClass(payment.paymentStatus)}`}>
                                                {getPaymentStatusLabel(payment.paymentStatus)}
                                            </span>
                                        </td>

                                        <td>
                                            <button
                                                type="button"
                                                className="admin-payment-detail-button"
                                                onClick={() => handleViewDetail(payment)}
                                                title="Xem chi tiết giao dịch"
                                            >
                                                <i className="bi bi-eye"></i>
                                                Chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8">
                                        <div className="admin-payments-no-result">
                                            <i className="bi bi-search"></i>
                                            <strong>Không tìm thấy giao dịch</strong>
                                            <span>
                                                Thử thay đổi từ khóa hoặc điều kiện lọc.
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Modal chi tiết giao dịch */}
            {selectedPayment && (
                <div
                    className="admin-payment-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setSelectedPayment(null);
                        }
                    }}
                >
                    <div
                        className="admin-payment-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="paymentDetailTitle"
                    >
                        <div className="admin-payment-modal-header">
                            <div>
                                <span>THÔNG TIN GIAO DỊCH</span>
                                <h4 id="paymentDetailTitle">
                                    Chi tiết thanh toán
                                </h4>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedPayment(null)}
                                aria-label="Đóng"
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <div className="admin-payment-modal-body">
                            <div className="admin-payment-detail-highlight">
                                <span>Số tiền giao dịch</span>
                                <strong>
                                    {formatPrice(selectedPayment.amount)}
                                </strong>
                                <span className={`admin-payment-status ${getPaymentStatusClass(selectedPayment.paymentStatus)}`}>
                                    {getPaymentStatusLabel(selectedPayment.paymentStatus)}
                                </span>
                            </div>

                            <div className="admin-payment-detail-section">
                                <h5>Thông tin thanh toán</h5>

                                <div className="admin-payment-detail-grid">
                                    <div>
                                        <span>Mã giao dịch</span>
                                        <strong>{selectedPayment.paymentCode}</strong>
                                    </div>

                                    <div>
                                        <span>Phương thức</span>
                                        <strong>
                                            {getPaymentMethodLabel(selectedPayment.paymentMethod)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Ngày thanh toán</span>
                                        <strong>
                                            {formatDateTime(selectedPayment.paymentDate)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Trạng thái đơn đặt vé</span>
                                        <strong>
                                            {selectedPayment.bookingStatus === "Confirmed"
                                                ? "Đã xác nhận"
                                                : selectedPayment.bookingStatus === "Cancelled"
                                                    ? "Đã hủy"
                                                    : selectedPayment.bookingStatus === "Completed"
                                                        ? "Đã hoàn thành"
                                                        : selectedPayment.bookingStatus || "Chưa xác định"}
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            <div className="admin-payment-detail-section">
                                <h5>Thông tin đơn đặt vé</h5>

                                <div className="admin-payment-detail-grid">
                                    <div>
                                        <span>Mã đơn đặt vé</span>
                                        <strong>{selectedPayment.bookingCode}</strong>
                                    </div>

                                    <div>
                                        <span>Phim</span>
                                        <strong>
                                            {selectedPayment.movie?.title || "Chưa rõ phim"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Rạp chiếu</span>
                                        <strong>
                                            {selectedPayment.cinema?.name || "Chưa rõ rạp"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Phòng chiếu</span>
                                        <strong>
                                            {selectedPayment.room?.roomName || "Chưa rõ phòng"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Suất chiếu</span>
                                        <strong>
                                            {formatDateTime(selectedPayment.showtime?.startTime)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Ghế đã đặt</span>
                                        <strong>
                                            {(selectedPayment.seats || [])
                                                .map((seat) => seat.seatCode)
                                                .filter(Boolean)
                                                .join(", ") || "Không có"}
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            <div className="admin-payment-detail-section">
                                <h5>Chi tiết số tiền</h5>

                                <div className="admin-payment-price-row">
                                    <span>Tiền vé</span>
                                    <strong>
                                        {formatPrice(selectedPayment.seatTotal)}
                                    </strong>
                                </div>

                                <div className="admin-payment-price-row">
                                    <span>Sản phẩm</span>
                                    <strong>
                                        {formatPrice(selectedPayment.productTotal)}
                                    </strong>
                                </div>

                                <div className="admin-payment-price-row">
                                    <span>Combo</span>
                                    <strong>
                                        {formatPrice(selectedPayment.comboTotal)}
                                    </strong>
                                </div>

                                <div className="admin-payment-price-row total">
                                    <span>Tổng thanh toán</span>
                                    <strong>
                                        {formatPrice(selectedPayment.amount)}
                                    </strong>
                                </div>
                            </div>

                            {selectedPayment.bookingStatus === "Cancelled" &&
                                selectedPayment.paymentStatus === "Success" && (
                                    <div className="admin-payment-refund-note">
                                        <i className="bi bi-info-circle"></i>
                                        Đơn đặt vé đã bị hủy nhưng giao dịch vẫn
                                        được ghi nhận thành công. Hệ thống hiện
                                        chưa ghi nhận nghiệp vụ hoàn tiền.
                                    </div>
                                )}
                        </div>

                        <div className="admin-payment-modal-footer">
                            <button
                                type="button"
                                onClick={() => setSelectedPayment(null)}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminPayments;
