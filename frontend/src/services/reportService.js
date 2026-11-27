
import { getPayments } from "./paymentService.js";

const toDateKey = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const formatPeriod = (value, groupBy) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return groupBy === "month"
        ? `${year}-${month}`
        : `${year}-${month}-${day}`;
};

const formatPeriodLabel = (key, groupBy) => {
    if (groupBy === "month") {
        const [year, month] = key.split("-");
        return `${month}/${year}`;
    }

    const [, month, day] = key.split("-");
    return `${day}/${month}`;
};

const sumAmounts = (items) =>
    items.reduce(
        (total, item) => total + (Number(item.amount) || 0),
        0
    );

const sortByRevenue = (map) =>
    [...map.entries()]
        .map(([name, revenue]) => ({ name, revenue }))
        .sort((a, b) => b.revenue - a.revenue);

export const getReportData = async ({
    fromDate = "",
    toDate = "",
    paymentStatus = "All",
    paymentMethod = "All",
    groupBy = "day"
} = {}) => {
    const payments = await getPayments();

    const filteredPayments = payments.filter((payment) => {
        const paymentDate = toDateKey(payment.paymentDate);

        if (!paymentDate) return false;
        if (fromDate && paymentDate < fromDate) return false;
        if (toDate && paymentDate > toDate) return false;

        if (
            paymentStatus !== "All" &&
            payment.paymentStatus !== paymentStatus
        ) {
            return false;
        }

        if (
            paymentMethod !== "All" &&
            payment.paymentMethod !== paymentMethod
        ) {
            return false;
        }

        return true;
    });

    const successfulPayments = filteredPayments.filter(
        (payment) => payment.paymentStatus === "Success"
    );

    const failedPayments = filteredPayments.filter(
        (payment) => payment.paymentStatus === "Failed"
    );

    const pendingPayments = filteredPayments.filter(
        (payment) => payment.paymentStatus === "Pending"
    );

    const cancelledPaidPayments = successfulPayments.filter(
        (payment) => payment.bookingStatus === "Cancelled"
    );

    const activePaidPayments = successfulPayments.filter(
        (payment) => payment.bookingStatus !== "Cancelled"
    );

    // Tổng hợp giá trị giao dịch thành công theo ngày hoặc tháng.
    const trendMap = new Map();

    successfulPayments.forEach((payment) => {
        const key = formatPeriod(payment.paymentDate, groupBy);

        if (!key) return;

        trendMap.set(
            key,
            (trendMap.get(key) || 0) + (Number(payment.amount) || 0)
        );
    });

    const revenueTrend = [...trendMap.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, revenue]) => ({
            key,
            label: formatPeriodLabel(key, groupBy),
            revenue
        }));

    // Xếp hạng phim và rạp, không tính đơn đã hủy.
    const movieMap = new Map();
    const cinemaMap = new Map();

    activePaidPayments.forEach((payment) => {
        const movieName = payment.movie?.title || "Chưa xác định";
        const cinemaName = payment.cinema?.name || "Chưa xác định";
        const amount = Number(payment.amount) || 0;

        movieMap.set(
            movieName,
            (movieMap.get(movieName) || 0) + amount
        );

        cinemaMap.set(
            cinemaName,
            (cinemaMap.get(cinemaName) || 0) + amount
        );
    });

    // Thống kê phương thức thanh toán.
    const methodMap = new Map();

    successfulPayments.forEach((payment) => {
        const method = payment.paymentMethod || "Khác";

        methodMap.set(
            method,
            (methodMap.get(method) || 0) + (Number(payment.amount) || 0)
        );
    });

    const methodBreakdown = [...methodMap.entries()]
        .map(([method, revenue]) => ({
            method,
            label:
                method === "MoMo"
                    ? "Ví điện tử MoMo"
                    : method === "Card"
                        ? "Thẻ ngân hàng"
                        : method,
            revenue
        }))
        .sort((a, b) => b.revenue - a.revenue);

    const sortedPayments = [...filteredPayments].sort(
        (a, b) =>
            new Date(b.paymentDate || 0).getTime() -
            new Date(a.paymentDate || 0).getTime()
    );

    return {
        summary: {
            totalTransactions: filteredPayments.length,
            successful: successfulPayments.length,
            failed: failedPayments.length,
            pending: pendingPayments.length,

            cancelledBookings: filteredPayments.filter(
                (payment) => payment.bookingStatus === "Cancelled"
            ).length,

            // Bao gồm tất cả giao dịch đã thanh toán thành công,
            // kể cả giao dịch thuộc đơn đã hủy.
            grossRevenue: sumAmounts(successfulPayments),

            // Loại trừ đơn đã hủy.
            activeOrderRevenue: sumAmounts(activePaidPayments),

            cancelledPaidAmount: sumAmounts(cancelledPaidPayments),

            ticketsSold: activePaidPayments.reduce(
                (total, payment) =>
                    total +
                    (Array.isArray(payment.seats)
                        ? payment.seats.length
                        : 0),
                0
            )
        },

        revenueTrend,
        topMovies: sortByRevenue(movieMap).slice(0, 5),
        topCinemas: sortByRevenue(cinemaMap).slice(0, 5),
        methodBreakdown,

        // Dùng cho bảng và chức năng xuất CSV đầy đủ.
        allTransactions: sortedPayments,
        recentTransactions: sortedPayments.slice(0, 8)
    };
};
