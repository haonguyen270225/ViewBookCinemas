
import { useEffect, useMemo, useState } from "react";

import {
    getTickets,
    updateTicketStatus
} from "../../../services/ticketService.js";

import "./AdminTickets.css";

const STATUS_OPTIONS = [
    { value: "Unused", label: "Chưa sử dụng" },
    { value: "Used", label: "Đã sử dụng" },
    { value: "Cancelled", label: "Đã hủy" }
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

const getStatusClass = (status) => {
    if (status === "Used") return "used";
    if (status === "Cancelled") return "cancelled";
    return "unused";
};

function AdminTickets() {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("Tất cả");
    const [selectedCinema, setSelectedCinema] = useState("Tất cả");
    const [selectedDate, setSelectedDate] = useState("");

    // Tải danh sách vé
    const loadTickets = async () => {
        try {
            setIsLoading(true);
            setError("");

            const data = await getTickets();

            const sortedTickets = [...data].sort(
                (a, b) =>
                    new Date(b.issuedAt).getTime() -
                    new Date(a.issuedAt).getTime()
            );

            setTickets(sortedTickets);
        } catch (err) {
            console.error("Không thể tải danh sách vé:", err);
            setError(err.message || "Không thể tải danh sách vé.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadTickets();
    }, []);

    // Danh sách rạp dùng cho bộ lọc
    const cinemaOptions = useMemo(() => {
        const uniqueCinemas = new Map();

        tickets.forEach((ticket) => {
            if (ticket.cinema?.cinemaId) {
                uniqueCinemas.set(
                    String(ticket.cinema.cinemaId),
                    ticket.cinema
                );
            }
        });

        return [...uniqueCinemas.values()];
    }, [tickets]);

    // Thống kê vé
    const statistics = useMemo(() => ({
        total: tickets.length,
        unused: tickets.filter(
            (ticket) => ticket.ticketStatus === "Unused"
        ).length,
        used: tickets.filter(
            (ticket) => ticket.ticketStatus === "Used"
        ).length,
        cancelled: tickets.filter(
            (ticket) => ticket.ticketStatus === "Cancelled"
        ).length
    }), [tickets]);

    // Tìm kiếm và lọc
    const filteredTickets = useMemo(() => {
        const keyword = searchTerm.trim().toLocaleLowerCase("vi");

        return tickets.filter((ticket) => {
            const searchableText = [
                ticket.ticketCode,
                ticket.bookingCode,
                ticket.movie?.title,
                ticket.cinema?.name,
                ticket.room?.roomName,
                ticket.seat?.seatCode
            ]
                .filter(Boolean)
                .join(" ")
                .toLocaleLowerCase("vi");

            const matchesSearch =
                !keyword || searchableText.includes(keyword);

            const matchesStatus =
                selectedStatus === "Tất cả" ||
                ticket.ticketStatus === selectedStatus;

            const matchesCinema =
                selectedCinema === "Tất cả" ||
                String(ticket.cinema?.cinemaId) === selectedCinema;

            const matchesDate =
                !selectedDate ||
                ticket.showtime?.startTime?.slice(0, 10) === selectedDate;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesCinema &&
                matchesDate
            );
        });
    }, [
        tickets,
        searchTerm,
        selectedStatus,
        selectedCinema,
        selectedDate
    ]);

    // Xóa bộ lọc
    const handleClearFilters = () => {
        setSearchTerm("");
        setSelectedStatus("Tất cả");
        setSelectedCinema("Tất cả");
        setSelectedDate("");
    };

    // Đánh dấu vé đã sử dụng
    const handleMarkAsUsed = async (ticket) => {
        if (ticket.ticketStatus !== "Unused") {
            alert("Chỉ có thể sử dụng vé đang ở trạng thái Chưa sử dụng.");
            return;
        }

        const confirmed = window.confirm(
            `Xác nhận vé ${ticket.ticketCode} đã được sử dụng?`
        );

        if (!confirmed) return;

        try {
            setUpdatingId(ticket.ticketId);

            const updatedTicket = await updateTicketStatus(
                ticket.ticketId,
                "Used"
            );

            setTickets((current) =>
                current.map((item) =>
                    item.ticketId === updatedTicket.ticketId
                        ? updatedTicket
                        : item
                )
            );

            setSelectedTicket((current) =>
                current?.ticketId === updatedTicket.ticketId
                    ? updatedTicket
                    : current
            );
        } catch (err) {
            console.error("Không thể cập nhật trạng thái vé:", err);
            alert(err.message || "Không thể cập nhật trạng thái vé.");
        } finally {
            setUpdatingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="admin-tickets">
                <div className="admin-tickets-empty">
                    <i className="bi bi-hourglass-split"></i>
                    <h5>Đang tải danh sách vé...</h5>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-tickets">
                <div className="admin-tickets-empty">
                    <i className="bi bi-exclamation-circle"></i>
                    <h5>Không thể tải dữ liệu</h5>
                    <p>{error}</p>
                    <button type="button" onClick={loadTickets}>
                        Thử tải lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-tickets">
            {/* Tiêu đề */}
            <div className="admin-page-intro admin-tickets-intro">
                <div>
                    <h3>Quản lý vé xem phim</h3>
                    <p>
                        Theo dõi vé được phát hành từ các đơn đặt vé đã thanh toán
                        thành công.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-tickets-refresh"
                    onClick={loadTickets}
                >
                    <i className="bi bi-arrow-clockwise"></i>
                    Làm mới
                </button>
            </div>

            {/* Thống kê */}
            <div className="admin-tickets-statistics">
                <div className="admin-ticket-stat-card">
                    <div className="admin-ticket-stat-icon blue">
                        <i className="bi bi-ticket-perforated"></i>
                    </div>
                    <div>
                        <span>Tổng số vé</span>
                        <strong>{statistics.total}</strong>
                    </div>
                </div>

                <div className="admin-ticket-stat-card">
                    <div className="admin-ticket-stat-icon orange">
                        <i className="bi bi-ticket"></i>
                    </div>
                    <div>
                        <span>Chưa sử dụng</span>
                        <strong>{statistics.unused}</strong>
                    </div>
                </div>

                <div className="admin-ticket-stat-card">
                    <div className="admin-ticket-stat-icon green">
                        <i className="bi bi-check-circle"></i>
                    </div>
                    <div>
                        <span>Đã sử dụng</span>
                        <strong>{statistics.used}</strong>
                    </div>
                </div>

                <div className="admin-ticket-stat-card">
                    <div className="admin-ticket-stat-icon red">
                        <i className="bi bi-x-circle"></i>
                    </div>
                    <div>
                        <span>Đã hủy</span>
                        <strong>{statistics.cancelled}</strong>
                    </div>
                </div>
            </div>

            {/* Bộ lọc */}
            <section className="admin-tickets-filter">
                <div className="admin-tickets-filter-heading">
                    <div>
                        <h5>
                            <i className="bi bi-funnel"></i>
                            Tìm kiếm và lọc
                        </h5>
                        <p>
                            Tìm theo mã vé, mã đơn, phim, rạp hoặc số ghế.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="admin-tickets-clear"
                        onClick={handleClearFilters}
                    >
                        Xóa bộ lọc
                    </button>
                </div>

                <div className="admin-tickets-filter-grid">
                    <div className="admin-tickets-field search">
                        <label htmlFor="ticketSearch">Từ khóa</label>
                        <div className="admin-tickets-search-box">
                            <i className="bi bi-search"></i>
                            <input
                                id="ticketSearch"
                                type="text"
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                                placeholder="Mã vé, mã đơn, phim, ghế..."
                            />
                        </div>
                    </div>

                    <div className="admin-tickets-field">
                        <label htmlFor="ticketStatus">Trạng thái vé</label>
                        <select
                            id="ticketStatus"
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

                    <div className="admin-tickets-field">
                        <label htmlFor="ticketCinema">Rạp chiếu</label>
                        <select
                            id="ticketCinema"
                            value={selectedCinema}
                            onChange={(event) =>
                                setSelectedCinema(event.target.value)
                            }
                        >
                            <option value="Tất cả">Tất cả rạp</option>
                            {cinemaOptions.map((cinema) => (
                                <option
                                    key={cinema.cinemaId}
                                    value={String(cinema.cinemaId)}
                                >
                                    {cinema.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="admin-tickets-field">
                        <label htmlFor="ticketDate">Ngày chiếu</label>
                        <input
                            id="ticketDate"
                            type="date"
                            value={selectedDate}
                            onChange={(event) =>
                                setSelectedDate(event.target.value)
                            }
                        />
                    </div>
                </div>
            </section>

            {/* Danh sách vé */}
            <section className="admin-tickets-list">
                <div className="admin-tickets-list-heading">
                    <div>
                        <h5>Danh sách vé xem phim</h5>
                        <p>
                            Hiển thị {filteredTickets.length} / {tickets.length} vé
                        </p>
                    </div>
                </div>

                <div className="admin-tickets-table-wrapper">
                    <table className="admin-tickets-table">
                        <thead>
                            <tr>
                                <th>Mã vé</th>
                                <th>Phim</th>
                                <th>Rạp / Phòng</th>
                                <th>Suất chiếu</th>
                                <th>Ghế</th>
                                <th>Giá vé</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredTickets.map((ticket) => (
                                <tr key={ticket.ticketId}>
                                    <td>
                                        <strong className="admin-ticket-code">
                                            {ticket.ticketCode}
                                        </strong>
                                        <small className="admin-ticket-booking-code">
                                            {ticket.bookingCode}
                                        </small>
                                    </td>

                                    <td>
                                        <strong className="admin-ticket-movie">
                                            {ticket.movie?.title || "Chưa rõ phim"}
                                        </strong>
                                    </td>

                                    <td>
                                        <div className="admin-ticket-cinema">
                                            <strong>
                                                {ticket.cinema?.name || "Chưa rõ rạp"}
                                            </strong>
                                            <span>
                                                {ticket.room?.roomName || "Chưa rõ phòng"}
                                            </span>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="admin-ticket-showtime">
                                            <strong>
                                                {formatDateTime(ticket.showtime?.startTime)}
                                            </strong>
                                            <span>
                                                {ticket.showtime?.movieVersion || "—"}
                                            </span>
                                        </div>
                                    </td>

                                    <td>
                                        <span className="admin-ticket-seat">
                                            {ticket.seat?.seatCode || "—"}
                                        </span>
                                    </td>

                                    <td>
                                        <strong className="admin-ticket-price">
                                            {formatPrice(ticket.ticketPrice)}
                                        </strong>
                                    </td>

                                    <td>
                                        <span
                                            className={`admin-ticket-status ${getStatusClass(
                                                ticket.ticketStatus
                                            )}`}
                                        >
                                            {getStatusLabel(ticket.ticketStatus)}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="admin-ticket-actions">
                                            <button
                                                type="button"
                                                className="view"
                                                title="Xem chi tiết"
                                                onClick={() =>
                                                    setSelectedTicket(ticket)
                                                }
                                            >
                                                <i className="bi bi-eye"></i>
                                            </button>

                                            <button
                                                type="button"
                                                className="use"
                                                title="Đánh dấu đã sử dụng"
                                                disabled={
                                                    ticket.ticketStatus !== "Unused" ||
                                                    updatingId === ticket.ticketId
                                                }
                                                onClick={() =>
                                                    handleMarkAsUsed(ticket)
                                                }
                                            >
                                                {updatingId === ticket.ticketId ? (
                                                    <span className="spinner-border spinner-border-sm"></span>
                                                ) : (
                                                    <i className="bi bi-check-lg"></i>
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredTickets.length === 0 && (
                        <div className="admin-tickets-empty">
                            <i className="bi bi-ticket-perforated"></i>
                            <h5>Không tìm thấy vé xem phim</h5>
                            <p>
                                Chưa có vé phù hợp với điều kiện tìm kiếm hiện tại.
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

            {/* Chi tiết vé */}
            {selectedTicket && (
                <div
                    className="admin-ticket-modal-overlay"
                    onClick={() => setSelectedTicket(null)}
                >
                    <div
                        className="admin-ticket-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="adminTicketModalTitle"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="admin-ticket-modal-header">
                            <div>
                                <h4 id="adminTicketModalTitle">
                                    Chi tiết vé xem phim
                                </h4>
                                <p>{selectedTicket.ticketCode}</p>
                            </div>

                            <button
                                type="button"
                                aria-label="Đóng"
                                onClick={() => setSelectedTicket(null)}
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <div className="admin-ticket-modal-body">
                            <div className="admin-ticket-detail-banner">
                                <div className="admin-ticket-detail-icon">
                                    <i className="bi bi-ticket-perforated"></i>
                                </div>
                                <div>
                                    <span>Mã vé</span>
                                    <strong>{selectedTicket.ticketCode}</strong>
                                    <small>Đơn đặt vé: {selectedTicket.bookingCode}</small>
                                </div>
                                <span
                                    className={`admin-ticket-status ${getStatusClass(
                                        selectedTicket.ticketStatus
                                    )}`}
                                >
                                    {getStatusLabel(selectedTicket.ticketStatus)}
                                </span>
                            </div>

                            <div className="admin-ticket-detail-section">
                                <h5>Thông tin phim và suất chiếu</h5>

                                <div className="admin-ticket-detail-grid">
                                    <div>
                                        <span>Tên phim</span>
                                        <strong>
                                            {selectedTicket.movie?.title || "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Phiên bản</span>
                                        <strong>
                                            {selectedTicket.showtime?.movieVersion || "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Rạp chiếu</span>
                                        <strong>
                                            {selectedTicket.cinema?.name || "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Phòng chiếu</span>
                                        <strong>
                                            {selectedTicket.room?.roomName || "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Thời gian bắt đầu</span>
                                        <strong>
                                            {formatDateTime(selectedTicket.showtime?.startTime)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Thời gian kết thúc</span>
                                        <strong>
                                            {formatDateTime(selectedTicket.showtime?.endTime)}
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            <div className="admin-ticket-detail-section">
                                <h5>Thông tin ghế</h5>

                                <div className="admin-ticket-seat-detail">
                                    <div>
                                        <span>Vị trí ghế</span>
                                        <strong>
                                            {selectedTicket.seat?.seatCode || "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Loại ghế</span>
                                        <strong>
                                            {selectedTicket.seat?.seatTypeName || "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Giá vé</span>
                                        <strong>
                                            {formatPrice(selectedTicket.ticketPrice)}
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            <div className="admin-ticket-detail-section">
                                <h5>Thông tin thanh toán</h5>

                                <div className="admin-ticket-detail-grid">
                                    <div>
                                        <span>Phương thức</span>
                                        <strong>
                                            {selectedTicket.paymentMethod || "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Trạng thái thanh toán</span>
                                        <strong>
                                            {selectedTicket.paymentStatus || "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Ngày phát hành</span>
                                        <strong>
                                            {formatDateTime(selectedTicket.issuedAt)}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="admin-ticket-modal-footer">
                            {selectedTicket.ticketStatus === "Unused" && (
                                <button
                                    type="button"
                                    className="use"
                                    disabled={updatingId === selectedTicket.ticketId}
                                    onClick={() =>
                                        handleMarkAsUsed(selectedTicket)
                                    }
                                >
                                    <i className="bi bi-check-circle"></i>
                                    Xác nhận đã sử dụng
                                </button>
                            )}

                            <button
                                type="button"
                                className="close"
                                onClick={() => setSelectedTicket(null)}
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

export default AdminTickets;
