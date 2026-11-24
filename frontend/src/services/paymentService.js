
import { getBookings } from "./bookingService.js";

//=================== Chuẩn hóa giao dịch ========================

const normalizePayment = (booking) => {
    if (!booking || !booking.paymentStatus) {
        return null;
    }

    return {
        paymentId: booking.bookingId,

        paymentCode: `VBP-${booking.bookingCode}`,

        bookingId: booking.bookingId,
        bookingCode: booking.bookingCode,

        paymentMethod: booking.paymentMethod,
        paymentStatus: booking.paymentStatus,

        amount: Number(booking.totalPrice) || 0,

        paymentDate:
            booking.paidAt ||
            booking.bookingDate ||
            null,

        bookingStatus: booking.bookingStatus,

        movie: booking.movie || {},
        cinema: booking.cinema || {},
        room: booking.room || {},
        showtime: booking.showtime || {},

        seats: booking.seats || [],
        products: booking.products || [],
        combos: booking.combos || [],

        seatTotal: Number(booking.seatTotal) || 0,
        productTotal: Number(booking.productTotal) || 0,
        comboTotal: Number(booking.comboTotal) || 0,

        createdAt: booking.bookingDate || null
    };
};

//=================== Lấy danh sách thanh toán ========================

export const getPayments = async () => {
    const bookings = await getBookings();

    return bookings
        .map(normalizePayment)
        .filter(Boolean)
        .sort((a, b) => {
            return (
                new Date(b.paymentDate || 0).getTime() -
                new Date(a.paymentDate || 0).getTime()
            );
        });
};

//=================== Lấy thanh toán theo ID ========================

export const getPaymentById = async (id) => {
    const payments = await getPayments();

    return (
        payments.find(
            (payment) =>
                String(payment.paymentId) === String(id)
        ) || null
    );
};

//=================== Lấy thanh toán theo mã ========================

export const getPaymentByCode = async (paymentCode) => {
    const payments = await getPayments();

    return (
        payments.find(
            (payment) =>
                payment.paymentCode === paymentCode
        ) || null
    );
};

//=================== Lấy thanh toán theo đơn đặt vé ========================

export const getPaymentByBookingId = async (bookingId) => {
    const payments = await getPayments();

    return (
        payments.find(
            (payment) =>
                String(payment.bookingId) === String(bookingId)
        ) || null
    );
};

//=================== Thống kê thanh toán ========================

export const getPaymentStatistics = async () => {
    const payments = await getPayments();

    const successfulPayments = payments.filter(
        (payment) => payment.paymentStatus === "Success"
    );

    const failedPayments = payments.filter(
        (payment) => payment.paymentStatus === "Failed"
    );

    const pendingPayments = payments.filter(
        (payment) => payment.paymentStatus === "Pending"
    );

    const cancelledBookings = successfulPayments.filter(
        (payment) => payment.bookingStatus === "Cancelled"
    );

    return {
        total: payments.length,

        successful: successfulPayments.length,
        failed: failedPayments.length,
        pending: pendingPayments.length,

        totalRevenue: successfulPayments.reduce(
            (total, payment) => total + payment.amount,
            0
        ),

        cancelledBookingPayments: cancelledBookings.length
    };
};
