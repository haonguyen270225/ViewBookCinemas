
import { getShowtimeById } from "./showtimeService.js";
import { getMovieById } from "./movieService.js";
import { getCinemaById } from "./cinemaService.js";
import { getRoomById } from "./roomService.js";
import { getSeatsByRoomId } from "./seatService.js";

import { seatTypes } from "../data/seatTypes.js";

import {
    getActiveProducts,
    decreaseProductStock,
    restoreProductStock
} from "./productService.js";

import { getActiveCombos } from "./comboService.js";

const STORAGE_KEY = "viewbook-bookings";

const BOOKING_STATUS_OPTIONS = [
    "Confirmed",
    "Cancelled",
    "Completed"
];

//=================== Lưu danh sách đơn đặt vé ========================

const saveBookings = (bookings) => {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(bookings)
        );
    } catch (error) {
        console.error("Không thể lưu đơn đặt vé:", error);

        throw new Error(
            "Không thể lưu đơn đặt vé trên trình duyệt."
        );
    }
};

//=================== Lấy danh sách đơn đặt vé ========================

export const getBookings = async () => {
    try {
        const savedBookings = localStorage.getItem(STORAGE_KEY);

        if (savedBookings === null) {
            return [];
        }

        const parsedBookings = JSON.parse(savedBookings);

        if (!Array.isArray(parsedBookings)) {
            throw new Error("Dữ liệu đơn đặt vé không hợp lệ.");
        }

        return parsedBookings;
    } catch (error) {
        console.error("Không thể tải đơn đặt vé:", error);

        throw new Error(
            error.message || "Không thể tải danh sách đơn đặt vé."
        );
    }
};

//=================== Lấy đơn đặt vé theo ID ========================

export const getBookingById = async (id) => {
    const bookings = await getBookings();

    return (
        bookings.find(
            (booking) => String(booking.bookingId) === String(id)
        ) || null
    );
};

//=================== Lấy đơn đặt vé theo suất chiếu ========================

export const getBookingsByShowtimeId = async (showtimeId) => {
    const bookings = await getBookings();

    return bookings.filter(
        (booking) =>
            String(booking.showtimeId) === String(showtimeId)
    );
};

//=================== Lấy danh sách ghế đã đặt ========================

export const getBookedSeatIdsByShowtimeId = async (showtimeId) => {
    const bookings = await getBookings();

    return bookings
        .filter(
            (booking) =>
                String(booking.showtimeId) === String(showtimeId) &&
                booking.bookingStatus === "Confirmed" &&
                booking.paymentStatus === "Success"
        )
        .flatMap((booking) =>
            booking.seats.map((seat) => Number(seat.seatId))
        );
};

//=================== Chuẩn hóa danh sách sản phẩm ========================

const buildSelectedItems = (quantities, catalog, idField, nameField) => {
    if (!quantities || typeof quantities !== "object") {
        return [];
    }

    return Object.entries(quantities)
        .filter(([, quantity]) => Number(quantity) > 0)
        .map(([id, quantity]) => {
            const normalizedQuantity = Number(quantity);

            if (
                !Number.isInteger(normalizedQuantity) ||
                normalizedQuantity <= 0
            ) {
                throw new Error(
                    "Số lượng sản phẩm hoặc combo không hợp lệ."
                );
            }

            const item = catalog.find(
                (data) => String(data[idField]) === String(id)
            );

            if (!item || item.status !== "Active") {
                throw new Error(
                    `Sản phẩm hoặc combo có ID ${id} không khả dụng.`
                );
            }

            return {
                [idField]: item[idField],
                [nameField]: item[nameField],
                price: Number(item.price),
                quantity: normalizedQuantity,
                totalPrice: Number(item.price) * normalizedQuantity
            };
        });
};

//=================== Tạo đơn đặt vé ========================

export const createBooking = async (bookingData) => {
    const {
        showtimeId,
        seatIds,
        selectedProductQuantities = {},
        selectedComboQuantities = {},
        paymentResult
    } = bookingData || {};

    // 1. Kiểm tra dữ liệu đầu vào

    if (!showtimeId) {
        throw new Error("Không tìm thấy suất chiếu.");
    }

    if (!Array.isArray(seatIds) || seatIds.length === 0) {
        throw new Error("Vui lòng chọn ít nhất một ghế.");
    }

    if (
        new Set(seatIds.map(Number)).size !== seatIds.length ||
        seatIds.some(
            (id) => !Number.isInteger(Number(id)) || Number(id) <= 0
        )
    ) {
        throw new Error("Danh sách ghế không hợp lệ hoặc bị trùng.");
    }

    if (
        !paymentResult ||
        paymentResult.paymentStatus !== "Success" ||
        !["MoMo", "Card"].includes(paymentResult.paymentMethod)
    ) {
        throw new Error("Thông tin thanh toán không hợp lệ.");
    }

    // 2. Lấy thông tin suất chiếu

    const showtime = await getShowtimeById(showtimeId);

    if (!showtime || showtime.status !== "Scheduled") {
        throw new Error(
            "Suất chiếu không tồn tại hoặc không khả dụng."
        );
    }

    // 3. Lấy thông tin phim, rạp và phòng

    const [movie, cinema, room] = await Promise.all([
        getMovieById(showtime.movieId),
        getCinemaById(showtime.cinemaId),
        getRoomById(showtime.roomId)
    ]);

    if (!movie) {
        throw new Error("Không tìm thấy thông tin phim.");
    }

    if (!cinema || cinema.status !== "Active") {
        throw new Error("Rạp chiếu hiện không hoạt động.");
    }

    if (!room || room.status !== "Active") {
        throw new Error("Phòng chiếu hiện không hoạt động.");
    }

    if (String(room.cinemaId) !== String(showtime.cinemaId)) {
        throw new Error(
            "Phòng chiếu không thuộc rạp của suất chiếu."
        );
    }

    // 4. Kiểm tra ghế

    const roomSeats = await getSeatsByRoomId(showtime.roomId);

    const selectedSeats = seatIds.map((seatId) => {
        const seat = roomSeats.find(
            (item) => String(item.seatId) === String(seatId)
        );

        if (!seat || seat.status !== "Active") {
            throw new Error(
                `Ghế có ID ${seatId} không tồn tại hoặc không khả dụng.`
            );
        }

        const seatType = seatTypes.find(
            (item) => Number(item.seatTypeId) === Number(seat.seatTypeId)
        );

        if (!seatType) {
            throw new Error(
                `Không tìm thấy loại ghế của ghế ${seat.seatCode}.`
            );
        }

        const unitPrice =
            Number(showtime.basePrice) +
            Number(seatType.additionalPrice || 0);

        return {
            seatId: seat.seatId,
            seatCode: seat.seatCode,
            seatTypeId: seat.seatTypeId,
            seatTypeName: seatType.seatTypeName,
            unitPrice,
            totalPrice: unitPrice
        };
    });

    // 5. Kiểm tra ghế đã được đặt trước đó

    const bookings = await getBookings();

    const bookedSeatIds = bookings
        .filter(
            (booking) =>
                String(booking.showtimeId) === String(showtimeId) &&
                booking.bookingStatus === "Confirmed" &&
                booking.paymentStatus === "Success"
        )
        .flatMap((booking) =>
            booking.seats.map((seat) => String(seat.seatId))
        );

    const hasBookedSeat = selectedSeats.some((seat) =>
        bookedSeatIds.includes(String(seat.seatId))
    );

    if (hasBookedSeat) {
        throw new Error(
            "Một hoặc nhiều ghế bạn chọn đã được đặt. Vui lòng chọn lại."
        );
    }

    // 6. Chuẩn hóa sản phẩm và combo

    // Lấy danh sách sản phẩm đang kinh doanh

    const activeProducts = await getActiveProducts();

    const selectedProducts = buildSelectedItems(
        selectedProductQuantities,
        activeProducts,
        "productId",
        "productName"
    );

    // Lấy danh sách Combo đang kinh doanh

    const activeCombos = await getActiveCombos();

    const selectedCombos = buildSelectedItems(
        selectedComboQuantities,
        activeCombos,
        "comboId",
        "comboName"
    );

    // 7. Tính tổng tiền từ dữ liệu gốc

    const seatTotal = selectedSeats.reduce(
        (total, seat) => total + seat.totalPrice,
        0
    );

    const productTotal = selectedProducts.reduce(
        (total, product) => total + product.totalPrice,
        0
    );

    const comboTotal = selectedCombos.reduce(
        (total, combo) => total + combo.totalPrice,
        0
    );

    const totalPrice = seatTotal + productTotal + comboTotal;

    // Không tin tưởng số tiền gửi lên từ giao diện

    if (
        !Number.isFinite(Number(paymentResult.amount)) ||
        Number(paymentResult.amount) !== totalPrice
    ) {
        throw new Error(
            "Số tiền thanh toán không khớp với tổng giá trị đơn hàng."
        );
    }

    // 8. Tạo mã đơn đặt vé

    const newId =
        Math.max(
            0,
            ...bookings.map(
                (booking) => Number(booking.bookingId) || 0
            )
        ) + 1;

    const bookingCode = `VBC-${Date.now()}-${newId}`;

    // 9. Tạo bản ghi đơn đặt vé

    const newBooking = {
        bookingId: newId,
        bookingCode,

        showtimeId: showtime.id,
        bookingDate: new Date().toISOString(),

        bookingStatus: "Confirmed",

        movie: {
            movieId: movie.id,
            title: movie.title,
            poster: movie.poster
        },

        cinema: {
            cinemaId: cinema.id,
            name: cinema.name
        },

        room: {
            roomId: room.roomId,
            roomName: room.roomName,
            roomType: room.roomType
        },

        showtime: {
            startTime: showtime.startTime,
            endTime: showtime.endTime,
            movieVersion: showtime.movieVersion,
            basePrice: showtime.basePrice
        },

        seats: selectedSeats,
        products: selectedProducts,
        combos: selectedCombos,

        seatTotal,
        productTotal,
        comboTotal,
        totalPrice,

        paymentMethod: paymentResult.paymentMethod,
        paymentStatus: "Success",
        paidAt: new Date().toISOString()
    };

    // 10. Trừ tồn kho sản phẩm và lưu đơn đặt vé

    // Product Service sẽ kiểm tra lại tồn kho thực tế
    // trước khi trừ số lượng sản phẩm.

    await decreaseProductStock(selectedProductQuantities);

    try {
        // Lưu đơn đặt vé

        saveBookings([...bookings, newBooking]);

        return newBooking;
    } catch (error) {
        console.error(
            "Không thể lưu đơn đặt vé, đang hoàn lại tồn kho:",
            error
        );

        // Nếu lưu đơn thất bại, hoàn lại số lượng sản phẩm

        try {
            await restoreProductStock(selectedProductQuantities);
        } catch (restoreError) {
            console.error(
                "Không thể hoàn lại tồn kho sản phẩm:",
                restoreError
            );
        }

        throw error;
    }
};




//=================== Cập nhật trạng thái đơn đặt vé ========================

export const updateBookingStatus = async (id, status) => {
    const bookings = await getBookings();

    if (!BOOKING_STATUS_OPTIONS.includes(status)) {
        throw new Error("Trạng thái đơn đặt vé không hợp lệ.");
    }

    const existingBooking = bookings.find(
        (booking) => String(booking.bookingId) === String(id)
    );

    if (!existingBooking) {
        throw new Error("Không tìm thấy đơn đặt vé cần cập nhật.");
    }

    // Nếu trạng thái không thay đổi thì không thực hiện lại thao tác.
    if (existingBooking.bookingStatus === status) {
        return existingBooking;
    }

    // Chỉ cho phép cập nhật đơn đang được xác nhận.
    // Đơn đã hủy hoặc hoàn thành không được kích hoạt lại.
    if (existingBooking.bookingStatus !== "Confirmed") {
        throw new Error(
            "Đơn đã hủy hoặc hoàn thành, không thể thay đổi trạng thái."
        );
    }

    const updatedBooking = {
        ...existingBooking,
        bookingStatus: status,
        updatedAt: new Date().toISOString()
    };

    const updatedBookings = bookings.map((booking) =>
        String(booking.bookingId) === String(id)
            ? updatedBooking
            : booking
    );

    // Chỉ hoàn kho khi đơn chuyển từ Confirmed sang Cancelled
    // và thanh toán đã thành công.
    const shouldRestoreStock =
        status === "Cancelled" &&
        existingBooking.paymentStatus === "Success";

    if (shouldRestoreStock) {
        const productQuantities = {};

        (existingBooking.products || []).forEach((product) => {
            const productId = String(product.productId);
            const quantity = Number(product.quantity);

            if (
                !Number.isSafeInteger(quantity) ||
                quantity <= 0
            ) {
                throw new Error(
                    `Số lượng sản phẩm "${product.productName}" trong đơn không hợp lệ.`
                );
            }

            productQuantities[productId] =
                (productQuantities[productId] || 0) + quantity;
        });

        // Lưu trạng thái đơn trước khi hoàn kho.
        saveBookings(updatedBookings);

        try {
            if (Object.keys(productQuantities).length > 0) {
                await restoreProductStock(productQuantities);
            }
        } catch (error) {
            // Hoàn lại trạng thái đơn nếu hoàn kho thất bại.
            try {
                saveBookings(bookings);
            } catch (rollbackError) {
                console.error(
                    "Không thể khôi phục trạng thái đơn đặt vé:",
                    rollbackError
                );
            }

            throw error;
        }

        return updatedBooking;
    }

    saveBookings(updatedBookings);

    return updatedBooking;
};


//=================== Hủy đơn đặt vé ========================

export const cancelBooking = async (id) => {
    const booking = await getBookingById(id);

    if (!booking) {
        throw new Error("Không tìm thấy đơn đặt vé cần hủy.");
    }

    if (booking.bookingStatus !== "Confirmed") {
        throw new Error(
            "Chỉ có thể hủy đơn đặt vé đang được xác nhận."
        );
    }

    return updateBookingStatus(id, "Cancelled");
};
