
import { useEffect, useMemo, useState } from "react";

import {
    getBookings,
    updateBookingStatus
} from "../../../services/bookingService.js";

import "./AdminBookings.css";

const STATUS_OPTIONS = [
    { value: "Confirmed", label: "Đã xác nhận" },
    { value: "Cancelled", label: "Đã hủy" },
    { value: "Completed", label: "Đã hoàn thành" }
];

const PAYMENT_OPTIONS = [
    { value: "MoMo", label: "MoMo" },
    { value: "Card", label: "Thẻ ngân hàng" }
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

const getStatusLabel = (status) =>
    STATUS_OPTIONS.find((item) => item.value === status)?.label || status;

const getPaymentLabel = (method) =>
    PAYMENT_OPTIONS.find((item) => item.value === method)?.label || method || "Chưa rõ";

const getStatusClass = (status) => {
    if (status === "Confirmed") return "confirmed";
    if (status === "Completed") return "completed";
    return "cancelled";
};

function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("Tất cả");
    const [selectedPayment, setSelectedPayment] = useState("Tất cả");
    const [selectedDate, setSelectedDate] = useState("");

    // Tải dữ liệu đơn đặt vé
    const loadBookings = async () => {
        try {
            setIsLoading(true);
            setError("");

            const data = await getBookings();

            setBookings(
                [...data].sort(
                    (a, b) =>
                        new Date(b.bookingDate).getTime() -
                        new Date(a.bookingDate).getTime()
                )
            );
        } catch (err) {
            console.error("Không thể tải danh sách đơn đặt vé:", err);
            setError(err.message || "Không thể tải danh sách đơn đặt vé.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadBookings();
    }, []);

    // Thống kê đơn đặt vé
    const statistics = useMemo(() => ({
        total: bookings.length,
        confirmed: bookings.filter(
            (item) => item.bookingStatus === "Confirmed"
        ).length,
        completed: bookings.filter(
            (item) => item.bookingStatus === "Completed"
        ).length,
        cancelled: bookings.filter(
            (item) => item.bookingStatus === "Cancelled"
        ).length
    }), [bookings]);

    // Tìm kiếm và lọc
    const filteredBookings = useMemo(() => {
        const keyword = searchTerm.trim().toLocaleLowerCase("vi");

        return bookings.filter((booking) => {
            const searchableText = [
                booking.bookingCode,
                booking.movie?.title,
                booking.cinema?.name,
                booking.room?.roomName,
                ...(booking.seats || []).map((seat) => seat.seatCode)
            ]
                .filter(Boolean)
                .join(" ")
                .toLocaleLowerCase("vi");

            const matchesSearch =
                !keyword || searchableText.includes(keyword);

            const matchesStatus =
                selectedStatus === "Tất cả" ||
                booking.bookingStatus === selectedStatus;

            const matchesPayment =
                selectedPayment === "Tất cả" ||
                booking.paymentMethod === selectedPayment;

            const matchesDate =
                !selectedDate ||
                booking.bookingDate?.slice(0, 10) === selectedDate;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPayment &&
                matchesDate
            );
        });
    }, [
        bookings,
        searchTerm,
        selectedStatus,
        selectedPayment,
        selectedDate
    ]);

    // Xóa bộ lọc
    const handleClearFilters = () => {
        setSearchTerm("");
        setSelectedStatus("Tất cả");
        setSelectedPayment("Tất cả");
        setSelectedDate("");
    };

    // Hủy đơn đặt vé
    const handleCancelBooking = async (booking) => {
        if (booking.bookingStatus !== "Confirmed") {
            alert("Chỉ có thể hủy đơn đang được xác nhận.");
            return;
        }

        const confirmed = window.confirm(
            `Bạn có chắc chắn muốn hủy đơn ${booking.bookingCode} không?`
        );

        if (!confirmed) return;

        try {
            setUpdatingId(booking.bookingId);

            const updatedBooking = await updateBookingStatus(
                booking.bookingId,
                "Cancelled"
            );

            setBookings((current) =>
                current.map((item) =>
                    String(item.bookingId) === String(updatedBooking.bookingId)
                        ? updatedBooking
                        : item
                )
            );

            setSelectedBooking((current) =>
                current &&
                String(current.bookingId) === String(updatedBooking.bookingId)
                    ? updatedBooking
                    : current
            );
        } catch (err) {
            console.error("Không thể hủy đơn đặt vé:", err);
            alert(err.message || "Không thể hủy đơn đặt vé.");
        } finally {
            setUpdatingId(null);
        }
    };

    // Xem chi tiết đơn
    const handleViewDetail = (booking) => {
        setSelectedBooking(booking);
    };

    if (isLoading) {
        return (
            <div className="admin-bookings">
                <div className="admin-bookings-empty">
                    <i className="bi bi-hourglass-split"></i>
                    <h5>Đang tải danh sách đơn đặt vé...</h5>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-bookings">
                <div className="admin-bookings-empty">
                    <i className="bi bi-exclamation-circle"></i>
                    <h5>Không thể tải dữ liệu</h5>
                    <p>{error}</p>
                    <button type="button" onClick={loadBookings}>
                        Thử tải lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-bookings">
            {/* Tiêu đề */}
            <div className="admin-page-intro admin-bookings-intro">
                <div>
                    <h3>Quản lý đặt vé</h3>
                    <p>
                        Theo dõi đơn đặt vé, thông tin thanh toán và trạng thái
                        giao dịch của khách hàng.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-bookings-refresh"
                    onClick={loadBookings}
                    disabled={isLoading}
                >
                    <i className="bi bi-arrow-clockwise"></i>
                    Làm mới
                </button>
            </div>

            {/* Thống kê */}
            <div className="admin-bookings-statistics">
                <div className="admin-booking-stat-card">
                    <div className="admin-booking-stat-icon blue">
                        <i className="bi bi-ticket-perforated"></i>
                    </div>
                    <div>
                        <span>Tổng đơn đặt vé</span>
                        <strong>{statistics.total}</strong>
                    </div>
                </div>

                <div className="admin-booking-stat-card">
                    <div className="admin-booking-stat-icon green">
                        <i className="bi bi-check-circle"></i>
                    </div>
                    <div>
                        <span>Đã xác nhận</span>
                        <strong>{statistics.confirmed}</strong>
                    </div>
                </div>

                <div className="admin-booking-stat-card">
                    <div className="admin-booking-stat-icon purple">
                        <i className="bi bi-check2-all"></i>
                    </div>
                    <div>
                        <span>Đã hoàn thành</span>
                        <strong>{statistics.completed}</strong>
                    </div>
                </div>

                <div className="admin-booking-stat-card">
                    <div className="admin-booking-stat-icon red">
                        <i className="bi bi-x-circle"></i>
                    </div>
                    <div>
                        <span>Đã hủy</span>
                        <strong>{statistics.cancelled}</strong>
                    </div>
                </div>
            </div>

            {/* Bộ lọc */}
            <section className="admin-bookings-filter">
                <div className="admin-bookings-filter-heading">
                    <div>
                        <h5>
                            <i className="bi bi-funnel"></i>
                            Tìm kiếm và lọc
                        </h5>
                        <p>Tìm đơn theo mã đặt vé, phim, rạp hoặc ghế.</p>
                    </div>

                    <button
                        type="button"
                        className="admin-bookings-clear"
                        onClick={handleClearFilters}
                    >
                        Xóa bộ lọc
                    </button>
                </div>

                <div className="admin-bookings-filter-grid">
                    <div className="admin-bookings-field search">
                        <label htmlFor="bookingSearch">Từ khóa</label>
                        <div className="admin-bookings-search-box">
                            <i className="bi bi-search"></i>
                            <input
                                id="bookingSearch"
                                type="text"
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                                placeholder="Mã đơn, tên phim, rạp, ghế..."
                            />
                        </div>
                    </div>

                    <div className="admin-bookings-field">
                        <label htmlFor="bookingStatus">Trạng thái đơn</label>
                        <select
                            id="bookingStatus"
                            value={selectedStatus}
                            onChange={(event) =>
                                setSelectedStatus(event.target.value)
                            }
                        >
                            <option value="Tất cả">Tất cả trạng thái</option>
                            {STATUS_OPTIONS.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="admin-bookings-field">
                        <label htmlFor="bookingPayment">Thanh toán</label>
                        <select
                            id="bookingPayment"
                            value={selectedPayment}
                            onChange={(event) =>
                                setSelectedPayment(event.target.value)
                            }
                        >
                            <option value="Tất cả">Tất cả phương thức</option>
                            {PAYMENT_OPTIONS.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="admin-bookings-field">
                        <label htmlFor="bookingDate">Ngày đặt</label>
                        <input
                            id="bookingDate"
                            type="date"
                            value={selectedDate}
                            onChange={(event) =>
                                setSelectedDate(event.target.value)
                            }
                        />
                    </div>
                </div>
            </section>

            {/* Danh sách đơn */}
            <section className="admin-bookings-list">
                <div className="admin-bookings-list-heading">
                    <div>
                        <h5>Danh sách đơn đặt vé</h5>
                        <p>
                            Hiển thị {filteredBookings.length} / {bookings.length} đơn
                        </p>
                    </div>
                </div>

                <div className="admin-bookings-table-wrapper">
                    <table className="admin-bookings-table">
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                <th>Thông tin phim</th>
                                <th>Ngày đặt</th>
                                <th>Ghế</th>
                                <th>Tổng tiền</th>
                                <th>Thanh toán</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredBookings.map((booking) => (
                                <tr key={booking.bookingId}>
                                    <td>
                                        <strong className="admin-booking-code">
                                            {booking.bookingCode}
                                        </strong>
                                    </td>

                                    <td>
                                        <div className="admin-booking-movie">
                                            <strong>
                                                {booking.movie?.title || "Chưa rõ phim"}
                                            </strong>
                                            <span>
                                                {booking.cinema?.name || "Chưa rõ rạp"}
                                            </span>
                                            <small>
                                                {booking.room?.roomName || "Chưa rõ phòng"}
                                            </small>
                                        </div>
                                    </td>

                                    <td>{formatDateTime(booking.bookingDate)}</td>

                                    <td>
                                        <div className="admin-booking-seat-list">
                                            {(booking.seats || []).map((seat) => (
                                                <span key={seat.seatId}>
                                                    {seat.seatCode}
                                                </span>
                                            ))}
                                        </div>
                                    </td>

                                    <td>
                                        <strong className="admin-booking-price">
                                            {formatPrice(booking.totalPrice)}
                                        </strong>
                                    </td>

                                    <td>
                                        <div className="admin-booking-payment">
                                            <span>{getPaymentLabel(booking.paymentMethod)}</span>
                                            <small>
                                                {booking.paymentStatus === "Success"
                                                    ? "Thành công"
                                                    : booking.paymentStatus || "Chưa rõ"}
                                            </small>
                                        </div>
                                    </td>

                                    <td>
                                        <span
                                            className={`admin-booking-status ${getStatusClass(
                                                booking.bookingStatus
                                            )}`}
                                        >
                                            {getStatusLabel(booking.bookingStatus)}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="admin-booking-actions">
                                            <button
                                                type="button"
                                                className="view"
                                                title="Xem chi tiết"
                                                onClick={() =>
                                                    handleViewDetail(booking)
                                                }
                                            >
                                                <i className="bi bi-eye"></i>
                                            </button>

                                            <button
                                                type="button"
                                                className="cancel"
                                                title="Hủy đơn"
                                                disabled={
                                                    booking.bookingStatus !== "Confirmed" ||
                                                    updatingId === booking.bookingId
                                                }
                                                onClick={() =>
                                                    handleCancelBooking(booking)
                                                }
                                            >
                                                {updatingId === booking.bookingId ? (
                                                    <span className="spinner-border spinner-border-sm"></span>
                                                ) : (
                                                    <i className="bi bi-x-lg"></i>
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredBookings.length === 0 && (
                        <div className="admin-bookings-empty">
                            <i className="bi bi-ticket-perforated"></i>
                            <h5>Không tìm thấy đơn đặt vé</h5>
                            <p>
                                Chưa có đơn phù hợp với điều kiện tìm kiếm hiện tại.
                            </p>
                            <button
                                type="button"
                                onClick={handleClearFilters}
                            >
                                Xóa bộ lọc
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Modal chi tiết đơn */}
            {selectedBooking && (
                <div
                    className="admin-booking-modal-overlay"
                    onClick={() => setSelectedBooking(null)}
                >
                    <div
                        className="admin-booking-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="adminBookingModalTitle"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="admin-booking-modal-header">
                            <div>
                                <h4 id="adminBookingModalTitle">
                                    Chi tiết đơn đặt vé
                                </h4>
                                <p>{selectedBooking.bookingCode}</p>
                            </div>

                            <button
                                type="button"
                                aria-label="Đóng"
                                onClick={() => setSelectedBooking(null)}
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <div className="admin-booking-modal-body">
                            <div className="admin-booking-detail-status">
                                <span
                                    className={`admin-booking-status ${getStatusClass(
                                        selectedBooking.bookingStatus
                                    )}`}
                                >
                                    {getStatusLabel(selectedBooking.bookingStatus)}
                                </span>
                                <span>
                                    Đặt lúc: {formatDateTime(selectedBooking.bookingDate)}
                                </span>
                            </div>

                            <div className="admin-booking-detail-section">
                                <h5>Thông tin suất chiếu</h5>
                                <div className="admin-booking-detail-grid">
                                    <div>
                                        <span>Phim</span>
                                        <strong>{selectedBooking.movie?.title || "—"}</strong>
                                    </div>
                                    <div>
                                        <span>Rạp</span>
                                        <strong>{selectedBooking.cinema?.name || "—"}</strong>
                                    </div>
                                    <div>
                                        <span>Phòng</span>
                                        <strong>{selectedBooking.room?.roomName || "—"}</strong>
                                    </div>
                                    <div>
                                        <span>Định dạng</span>
                                        <strong>
                                            {selectedBooking.showtime?.movieVersion || "—"}
                                        </strong>
                                    </div>
                                    <div>
                                        <span>Bắt đầu</span>
                                        <strong>
                                            {formatDateTime(selectedBooking.showtime?.startTime)}
                                        </strong>
                                    </div>
                                    <div>
                                        <span>Kết thúc</span>
                                        <strong>
                                            {formatDateTime(selectedBooking.showtime?.endTime)}
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            <div className="admin-booking-detail-section">
                                <h5>Ghế đã đặt</h5>
                                <div className="admin-booking-detail-items">
                                    {(selectedBooking.seats || []).map((seat) => (
                                        <div key={seat.seatId}>
                                            <span>
                                                {seat.seatCode} · {seat.seatTypeName}
                                            </span>
                                            <strong>{formatPrice(seat.totalPrice)}</strong>
                                        </div>
                                    ))}
                                </div>
                                <div className="admin-booking-detail-total">
                                    <span>Tổng tiền ghế</span>
                                    <strong>{formatPrice(selectedBooking.seatTotal)}</strong>
                                </div>
                            </div>

                            {(selectedBooking.products || []).length > 0 && (
                                <div className="admin-booking-detail-section">
                                    <h5>Sản phẩm</h5>
                                    <div className="admin-booking-detail-items">
                                        {selectedBooking.products.map((item) => (
                                            <div key={item.productId}>
                                                <span>
                                                    {item.productName} × {item.quantity}
                                                </span>
                                                <strong>{formatPrice(item.totalPrice)}</strong>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="admin-booking-detail-total">
                                        <span>Tổng tiền sản phẩm</span>
                                        <strong>{formatPrice(selectedBooking.productTotal)}</strong>
                                    </div>
                                </div>
                            )}

                            {(selectedBooking.combos || []).length > 0 && (
                                <div className="admin-booking-detail-section">
                                    <h5>Combo</h5>
                                    <div className="admin-booking-detail-items">
                                        {selectedBooking.combos.map((item) => (
                                            <div key={item.comboId}>
                                                <span>
                                                    {item.comboName} × {item.quantity}
                                                </span>
                                                <strong>{formatPrice(item.totalPrice)}</strong>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="admin-booking-detail-total">
                                        <span>Tổng tiền combo</span>
                                        <strong>{formatPrice(selectedBooking.comboTotal)}</strong>
                                    </div>
                                </div>
                            )}

                            <div className="admin-booking-detail-payment">
                                <div>
                                    <span>Phương thức thanh toán</span>
                                    <strong>{getPaymentLabel(selectedBooking.paymentMethod)}</strong>
                                </div>
                                <div>
                                    <span>Trạng thái thanh toán</span>
                                    <strong>{selectedBooking.paymentStatus || "—"}</strong>
                                </div>
                                <div>
                                    <span>Thời gian thanh toán</span>
                                    <strong>{formatDateTime(selectedBooking.paidAt)}</strong>
                                </div>
                            </div>

                            <div className="admin-booking-detail-grand-total">
                                <span>Tổng thanh toán</span>
                                <strong>{formatPrice(selectedBooking.totalPrice)}</strong>
                            </div>
                        </div>

                        <div className="admin-booking-modal-footer">
                            {selectedBooking.bookingStatus === "Confirmed" && (
                                <button
                                    type="button"
                                    className="danger"
                                    disabled={updatingId === selectedBooking.bookingId}
                                    onClick={() =>
                                        handleCancelBooking(selectedBooking)
                                    }
                                >
                                    <i className="bi bi-x-circle"></i>
                                    Hủy đơn
                                </button>
                            )}

                            <button
                                type="button"
                                className="close"
                                onClick={() => setSelectedBooking(null)}
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

export default AdminBookings;
