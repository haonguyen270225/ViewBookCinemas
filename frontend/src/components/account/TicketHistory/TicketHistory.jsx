import { useEffect, useMemo, useState } from "react";
import { Ticket, Film } from "lucide-react";

import { useAuth } from "../../../contexts/AuthContext.jsx";

import {
    getBookingsByUserId
} from "../../../services/bookingService.js";

import {
    getMovieById
} from "../../../services/movieService.js";

import TicketCard from "./TicketCard";
import TicketPagination from "./TicketPagination";

import "./TicketHistory.css";

const ITEMS_PER_PAGE = 5;

const FILTERS = [
    { value: "all", label: "Tất cả" },
    { value: "valid", label: "Còn hiệu lực" },
    { value: "used", label: "Đã sử dụng" },
    { value: "expired", label: "Đã hết hạn" },
    { value: "cancelled", label: "Đã hủy" }
];

//====================================================
// Lấy ID phim từ booking
// Hỗ trợ cả dữ liệu mới và dữ liệu cũ
//====================================================

const getBookingMovieId = (booking) => {
    return (
        booking?.movie?.movieId ??
        booking?.movie?.id ??
        booking?.movieId ??
        null
    );
};

//====================================================
// Định dạng ngày giờ
//====================================================

const formatDate = (value) => {
    if (!value) return "--";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "--";
    }

    return date.toLocaleDateString("vi-VN");
};

const formatTime = (value) => {
    if (!value) return "--";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "--";
    }

    return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
};

//====================================================
// Xác định trạng thái vé
//====================================================

const getTicketStatus = (booking) => {
    if (booking.bookingStatus === "Cancelled") {
        return "cancelled";
    }

    if (booking.bookingStatus === "Completed") {
        return "used";
    }

    const endTime = booking.showtime?.endTime;

    if (endTime) {
        const endDate = new Date(endTime);

        if (
            !Number.isNaN(endDate.getTime()) &&
            endDate.getTime() < Date.now()
        ) {
            return "expired";
        }
    }

    return "valid";
};

//====================================================
// Chuyển Booking thành dữ liệu TicketCard
//====================================================

const mapBookingToTicket = (booking, movieDetail) => {
    const movie = movieDetail || {};

    const showtime = booking.showtime || {};

    const seats = Array.isArray(booking.seats)
        ? booking.seats
        : [];

    const originalPrice = Number(
        booking.originalTotalPrice ??
        booking.totalPrice ??
        0
    );

    const discountAmount = Number(
        booking.discountAmount ?? 0
    );

    const paidAmount = Number(
        booking.actualPaidAmount ??
        booking.totalPrice ??
        (originalPrice - discountAmount)
    );

    const movieId = getBookingMovieId(booking);

    return {
        ticketId: booking.bookingId,

        movieId,

        ticketCode: booking.bookingCode,

        qrCode: booking.bookingCode,

        status: getTicketStatus(booking),

        movieTitle:
            booking.movie?.title ||
            movie.title ||
            "Phim không xác định",

        genre: Array.isArray(movie.genres)
            ? movie.genres.join(", ")
            : "Chưa cập nhật thể loại",

        duration: Number(movie.duration) || 0,

        showDate: formatDate(showtime.startTime),

        showTime: formatTime(showtime.startTime),

        cinema:
            booking.cinema?.name ||
            "Chưa xác định rạp",

        room:
            booking.room?.roomName ||
            "Chưa xác định phòng",

        seat: seats.length > 0
            ? seats
                .map((seat) => seat.seatCode)
                .filter(Boolean)
                .join(", ")
            : "--",

        //================================================
        // Thông tin thanh toán
        //================================================

        price: originalPrice,

        originalPrice,

        promotionCode:
            booking.promotion?.promotionCode || null,

        discountAmount,

        paidAmount,

        purchaseDate: formatDate(booking.bookingDate),

        posterUrl:
            booking.movie?.poster ||
            movie.poster ||
            "",

        paymentMethod: booking.paymentMethod || "--"
    };
};

//====================================================
// Ticket History
//====================================================

function TicketHistory() {
    const { user } = useAuth();

    const [tickets, setTickets] = useState([]);

    const [activeFilter, setActiveFilter] = useState("all");

    const [currentPage, setCurrentPage] = useState(1);

    const [isLoading, setIsLoading] = useState(true);

    const [errorMessage, setErrorMessage] = useState("");

    //====================================================
    // Tải lịch sử đặt vé của tài khoản hiện tại
    //====================================================

    useEffect(() => {
        let isMounted = true;

        const loadTicketHistory = async () => {
            if (!user?.userId) {
                setTickets([]);
                setErrorMessage("");
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setErrorMessage("");

                const bookings = await getBookingsByUserId(
                    user.userId
                );

                if (!Array.isArray(bookings)) {
                    throw new Error(
                        "Dữ liệu lịch sử đặt vé không hợp lệ."
                    );
                }

                //================================================
                // Sắp xếp booking mới nhất lên đầu
                //================================================

                const sortedBookings = [...bookings].sort(
                    (bookingA, bookingB) => {
                        const dateA = new Date(
                            bookingA.bookingDate || 0
                        ).getTime();

                        const dateB = new Date(
                            bookingB.bookingDate || 0
                        ).getTime();

                        return dateB - dateA;
                    }
                );

                //================================================
                // Lấy danh sách ID phim từ tất cả booking
                //================================================

                const movieIds = [
                    ...new Set(
                        sortedBookings
                            .map(getBookingMovieId)
                            .filter(
                                (id) =>
                                    id !== null &&
                                    id !== undefined &&
                                    id !== ""
                            )
                            .map(String)
                    )
                ];

                //================================================
                // Tải thông tin bổ sung của các phim
                //================================================

                const movieResults = await Promise.all(
                    movieIds.map(async (movieId) => {
                        try {
                            const movie = await getMovieById(
                                movieId
                            );

                            return [
                                String(movieId),
                                movie || null
                            ];
                        } catch (error) {
                            console.error(
                                `Không thể tải thông tin phim ${movieId}:`,
                                error
                            );

                            return [
                                String(movieId),
                                null
                            ];
                        }
                    })
                );

                const movieMap = new Map(movieResults);

                //================================================
                // Chuyển booking thành ticket
                //================================================

                const mappedTickets = sortedBookings.map(
                    (booking) => {
                        const movieId = getBookingMovieId(
                            booking
                        );

                        const movieDetail = movieId !== null
                            ? movieMap.get(String(movieId))
                            : null;

                        return mapBookingToTicket(
                            booking,
                            movieDetail
                        );
                    }
                );

                if (isMounted) {
                    setTickets(mappedTickets);
                    setCurrentPage(1);
                }

            } catch (error) {
                console.error(
                    "Không thể tải lịch sử đặt vé:",
                    error
                );

                if (isMounted) {
                    setTickets([]);

                    setErrorMessage(
                        error.message ||
                        "Không thể tải lịch sử đặt vé."
                    );
                }

            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadTicketHistory();

        return () => {
            isMounted = false;
        };
    }, [user?.userId]);

    //====================================================
    // Lọc vé
    //====================================================

    const filteredTickets = useMemo(() => {
        if (activeFilter === "all") {
            return tickets;
        }

        return tickets.filter(
            (ticket) => ticket.status === activeFilter
        );
    }, [tickets, activeFilter]);

    //====================================================
    // Phân trang
    //====================================================

    const totalPages = Math.ceil(
        filteredTickets.length / ITEMS_PER_PAGE
    );

    const startIndex =
        (currentPage - 1) * ITEMS_PER_PAGE;

    const currentTickets = filteredTickets.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
    );

    //====================================================
    // Thay đổi bộ lọc
    //====================================================

    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
        setCurrentPage(1);
    };

    //====================================================
    // Thay đổi trang
    //====================================================

    const handlePageChange = (page) => {
        setCurrentPage(page);

        document
            .querySelector(".ticket-history-section")
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
    };

    //====================================================
    // Render
    //====================================================

    return (
        <section className="ticket-history-section">

            {/* Header */}

            <div className="ticket-history-header">

                <div className="ticket-history-title">

                    <div className="ticket-history-icon">
                        <Ticket size={22} />
                    </div>

                    <div>
                        <h2>Lịch sử đặt vé</h2>

                        <p>
                            Quản lý và xem lại các vé xem phim của bạn.
                        </p>
                    </div>

                </div>

                <span className="ticket-total">
                    {filteredTickets.length} vé
                </span>

            </div>

            {/* Filters */}

            <div className="ticket-history-filters">

                {FILTERS.map((filter) => (
                    <button
                        key={filter.value}
                        type="button"
                        className={`ticket-filter-btn ${
                            activeFilter === filter.value
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            handleFilterChange(filter.value)
                        }
                    >
                        {filter.label}
                    </button>
                ))}

            </div>

            {/* Ticket List */}

            <div className="ticket-history-list">

                {isLoading ? (

                    <div className="ticket-history-empty">
                        <div
                            className="spinner-border text-danger"
                            role="status"
                        />

                        <p>Đang tải lịch sử đặt vé...</p>
                    </div>

                ) : errorMessage ? (

                    <div className="ticket-history-empty">
                        <Film size={42} />

                        <h3>Không thể tải dữ liệu</h3>

                        <p>{errorMessage}</p>
                    </div>

                ) : currentTickets.length > 0 ? (

                    currentTickets.map((ticket) => (
                        <TicketCard
                            key={ticket.ticketId}
                            ticket={ticket}
                        />
                    ))

                ) : (

                    <div className="ticket-history-empty">
                        <Film size={42} />

                        <h3>Chưa có vé nào</h3>

                        <p>
                            Không tìm thấy vé phù hợp với bộ lọc hiện tại.
                        </p>
                    </div>

                )}

            </div>

            {/* Pagination */}

            {!isLoading &&
                !errorMessage &&
                totalPages > 1 && (
                    <TicketPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}

        </section>
    );
}

export default TicketHistory;