
import { getBookings } from "./bookingService.js";

const STORAGE_KEY = "viewbook-tickets";

const TICKET_STATUS_OPTIONS = [
    "Unused",
    "Used",
    "Cancelled"
];

//=================== Lưu danh sách vé ========================

const saveTickets = (tickets) => {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(tickets)
        );
    } catch (error) {
        console.error("Không thể lưu danh sách vé:", error);

        throw new Error(
            "Không thể lưu dữ liệu vé trên trình duyệt."
        );
    }
};

//=================== Đọc dữ liệu vé đã lưu ========================

const getSavedTickets = () => {
    try {
        const savedTickets = localStorage.getItem(STORAGE_KEY);

        if (savedTickets === null) {
            return [];
        }

        const parsedTickets = JSON.parse(savedTickets);

        if (!Array.isArray(parsedTickets)) {
            throw new Error("Dữ liệu vé không hợp lệ.");
        }

        return parsedTickets;
    } catch (error) {
        console.error("Không thể đọc dữ liệu vé:", error);

        throw new Error(
            error.message || "Không thể tải danh sách vé."
        );
    }
};

//=================== Tạo mã vé ========================

const generateTicketCode = (booking, seat) => {
    return `VBT-${booking.bookingId}-${seat.seatId}`;
};

//=================== Đồng bộ vé từ đơn đặt vé ========================

// Mỗi ghế trong một đơn đã thanh toán thành công tương ứng một vé.
// Không tạo vé trùng khi người dùng tải lại trang.
const synchronizeTickets = async () => {
    const [bookings, savedTickets] = await Promise.all([
        getBookings(),
        Promise.resolve(getSavedTickets())
    ]);

    const ticketMap = new Map(
        savedTickets.map((ticket) => [
            String(ticket.ticketId),
            ticket
        ])
    );

    const synchronizedTickets = [];

    bookings.forEach((booking) => {
        // Chỉ tạo vé cho đơn đã thanh toán thành công.
        if (booking.paymentStatus !== "Success") {
            return;
        }

        if (!Array.isArray(booking.seats)) {
            return;
        }

        booking.seats.forEach((seat) => {
            const ticketId = `${booking.bookingId}-${seat.seatId}`;

            const existingTicket = ticketMap.get(ticketId);

            const isCancelled =
                booking.bookingStatus === "Cancelled";

            const ticket = {
                ticketId,
                ticketCode: generateTicketCode(booking, seat),

                bookingId: booking.bookingId,
                bookingCode: booking.bookingCode,

                showtimeId: booking.showtimeId,

                movie: booking.movie || {},
                cinema: booking.cinema || {},
                room: booking.room || {},
                showtime: booking.showtime || {},

                seat: {
                    seatId: seat.seatId,
                    seatCode: seat.seatCode,
                    seatTypeId: seat.seatTypeId,
                    seatTypeName: seat.seatTypeName,
                    unitPrice: Number(seat.unitPrice) || 0,
                    totalPrice: Number(seat.totalPrice) || 0
                },

                paymentMethod: booking.paymentMethod,
                paymentStatus: booking.paymentStatus,

                ticketPrice: Number(seat.totalPrice) || 0,

                ticketStatus: isCancelled
                    ? "Cancelled"
                    : existingTicket?.ticketStatus === "Used"
                        ? "Used"
                        : "Unused",

                issuedAt:
                    existingTicket?.issuedAt ||
                    booking.paidAt ||
                    booking.bookingDate,

                updatedAt: existingTicket?.updatedAt || null
            };

            synchronizedTickets.push(ticket);
        });
    });

    // Lưu khi có thay đổi để giữ trạng thái vé đã sử dụng.
    const hasChanges =
        synchronizedTickets.length !== savedTickets.length ||
        synchronizedTickets.some((ticket, index) => {
            const oldTicket = savedTickets[index];

            return (
                !oldTicket ||
                oldTicket.ticketId !== ticket.ticketId ||
                oldTicket.ticketStatus !== ticket.ticketStatus ||
                oldTicket.bookingStatus !== ticket.bookingStatus
            );
        });

    if (hasChanges) {
        saveTickets(synchronizedTickets);
    }

    return synchronizedTickets;
};

//=================== Lấy danh sách vé ========================

export const getTickets = async () => {
    return synchronizeTickets();
};

//=================== Lấy vé theo ID ========================

export const getTicketById = async (id) => {
    const tickets = await getTickets();

    return (
        tickets.find(
            (ticket) => String(ticket.ticketId) === String(id)
        ) || null
    );
};

//=================== Lấy vé theo mã vé ========================

export const getTicketByCode = async (ticketCode) => {
    const tickets = await getTickets();

    return (
        tickets.find(
            (ticket) => ticket.ticketCode === ticketCode
        ) || null
    );
};

//=================== Lấy vé theo đơn đặt vé ========================

export const getTicketsByBookingId = async (bookingId) => {
    const tickets = await getTickets();

    return tickets.filter(
        (ticket) =>
            String(ticket.bookingId) === String(bookingId)
    );
};

//=================== Lấy vé theo suất chiếu ========================

export const getTicketsByShowtimeId = async (showtimeId) => {
    const tickets = await getTickets();

    return tickets.filter(
        (ticket) =>
            String(ticket.showtimeId) === String(showtimeId)
    );
};

//=================== Cập nhật trạng thái vé ========================

export const updateTicketStatus = async (id, status) => {
    if (!TICKET_STATUS_OPTIONS.includes(status)) {
        throw new Error("Trạng thái vé không hợp lệ.");
    }

    if (status === "Cancelled") {
        throw new Error(
            "Trạng thái vé sẽ tự động chuyển thành Đã hủy theo đơn đặt vé."
        );
    }

    const tickets = await getTickets();

    const existingTicket = tickets.find(
        (ticket) => String(ticket.ticketId) === String(id)
    );

    if (!existingTicket) {
        throw new Error("Không tìm thấy vé cần cập nhật.");
    }

    if (existingTicket.ticketStatus === "Cancelled") {
        throw new Error("Không thể cập nhật vé thuộc đơn đã hủy.");
    }

    if (status === "Used" && existingTicket.ticketStatus === "Used") {
        throw new Error("Vé này đã được sử dụng.");
    }

    if (status === "Used") {
        const booking = (
            await getBookings()
        ).find(
            (item) =>
                String(item.bookingId) ===
                String(existingTicket.bookingId)
        );

        if (
            !booking ||
            booking.bookingStatus !== "Confirmed" ||
            booking.paymentStatus !== "Success"
        ) {
            throw new Error(
                "Chỉ có thể sử dụng vé thuộc đơn đã xác nhận và thanh toán thành công."
            );
        }
    }

    const updatedTicket = {
        ...existingTicket,
        ticketStatus: status,
        updatedAt: new Date().toISOString()
    };

    const updatedTickets = tickets.map((ticket) =>
        String(ticket.ticketId) === String(id)
            ? updatedTicket
            : ticket
    );

    saveTickets(updatedTickets);

    return updatedTicket;
};

//=================== Thống kê vé ========================

export const getTicketStatistics = async () => {
    const tickets = await getTickets();

    return {
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
    };
};
