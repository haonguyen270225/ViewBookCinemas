
import { getRooms } from "./roomService.js";
import { seatTypes } from "../data/seatTypes.js";

const STORAGE_KEY = "viewbook-admin-seats";

const SEAT_LAYOUTS = {
    Standard: {
        totalRows: 10,
        seatsPerRow: 10
    },
    VIP: {
        totalRows: 8,
        seatsPerRow: 10
    },
    IMAX: {
        totalRows: 10,
        seatsPerRow: 15
    }
};

const SEAT_ROWS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const SEAT_STATUS_OPTIONS = [
    "Active",
    "Inactive"
];

// Xác định loại ghế theo loại phòng và hàng ghế
const getSeatTypeId = (room, rowIndex) => {
    const typeIds = Object.fromEntries(
        seatTypes.map((item) => [
            item.seatTypeName,
            item.seatTypeId
        ])
    );

    if (room.roomType === "VIP") {
        return typeIds["Ghế VIP"];
    }

    if (rowIndex <= 6) {
        return typeIds["Ghế thường"];
    }

    if (rowIndex <= 8) {
        return typeIds["Ghế VIP"];
    }

    return typeIds["Ghế đôi"];
};

// Tạo ghế cho một phòng
const generateRoomSeats = (room, startId) => {
    const layout = SEAT_LAYOUTS[room.roomType];

    if (!layout) {
        return [];
    }

    const generatedSeats = [];

    for (let rowIndex = 1; rowIndex <= layout.totalRows; rowIndex++) {
        const seatRow = SEAT_ROWS[rowIndex - 1];

        for (
            let seatNumber = 1;
            seatNumber <= layout.seatsPerRow;
            seatNumber++
        ) {
            generatedSeats.push({
                seatId: startId + generatedSeats.length,
                roomId: room.roomId,
                seatTypeId: getSeatTypeId(room, rowIndex),
                seatCode: `${seatRow}${seatNumber}`,
                seatRow,
                seatNumber,
                status: "Active"
            });
        }
    }

    return generatedSeats;
};

// Lưu dữ liệu ghế
const saveSeats = (seats) => {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(seats)
        );
    } catch (error) {
        console.error("Không thể lưu dữ liệu ghế:", error);

        throw new Error(
            "Không thể lưu dữ liệu ghế trên trình duyệt."
        );
    }
};

// Lấy toàn bộ ghế và đồng bộ theo danh sách phòng hiện tại
export const getSeats = async () => {
    try {
        const rooms = await getRooms();

        const savedSeats = localStorage.getItem(STORAGE_KEY);

        // Chưa có dữ liệu: tạo ghế từ các phòng hiện tại
        if (savedSeats === null) {
            let nextId = 1;

            const initialSeats = rooms
                .slice()
                .sort((a, b) => Number(a.roomId) - Number(b.roomId))
                .flatMap((room) => {
                    const roomSeats = generateRoomSeats(room, nextId);
                    nextId += roomSeats.length;

                    return roomSeats;
                });

            saveSeats(initialSeats);

            return initialSeats;
        }

        const parsedSeats = JSON.parse(savedSeats);

        if (!Array.isArray(parsedSeats)) {
            throw new Error("Dữ liệu ghế không hợp lệ.");
        }

        const currentRoomIds = new Set(
            rooms.map((room) => String(room.roomId))
        );

        // Loại bỏ ghế thuộc phòng đã bị xóa
        let synchronizedSeats = parsedSeats.filter(
            (seat) => currentRoomIds.has(String(seat.roomId))
        );

        let nextId =
            Math.max(
                0,
                ...synchronizedSeats.map(
                    (seat) => Number(seat.seatId) || 0
                )
            ) + 1;

        // Kiểm tra và đồng bộ số ghế theo từng phòng
        for (const room of rooms) {
            const layout = SEAT_LAYOUTS[room.roomType];

            if (!layout) continue;

            const expectedCount =
                layout.totalRows * layout.seatsPerRow;

            const roomSeats = synchronizedSeats.filter(
                (seat) => String(seat.roomId) === String(room.roomId)
            );

            const hasCorrectLayout =
                roomSeats.length === expectedCount &&
                roomSeats.every(
                    (seat) =>
                        typeof seat.seatCode === "string" &&
                        seat.seatCode.length > 1
                );

            // Giữ dữ liệu cũ nếu sơ đồ ghế vẫn phù hợp
            if (hasCorrectLayout) continue;

            // Thay thế sơ đồ ghế nếu phòng vừa thay đổi loại
            synchronizedSeats = synchronizedSeats.filter(
                (seat) => String(seat.roomId) !== String(room.roomId)
            );

            const newRoomSeats = generateRoomSeats(room, nextId);

            synchronizedSeats.push(...newRoomSeats);

            nextId += newRoomSeats.length;
        }

        saveSeats(synchronizedSeats);

        return synchronizedSeats;
    } catch (error) {
        console.error("Không thể tải dữ liệu ghế:", error);

        throw new Error(
            error.message || "Không thể tải dữ liệu ghế."
        );
    }
};

// Lấy danh sách ghế theo phòng
export const getSeatsByRoomId = async (roomId) => {
    const seats = await getSeats();

    return seats
        .filter(
            (seat) =>
                String(seat.roomId) === String(roomId)
        )
        .sort((a, b) => {
            if (a.seatRow !== b.seatRow) {
                return a.seatRow.localeCompare(b.seatRow);
            }

            return a.seatNumber - b.seatNumber;
        });
};

// Lấy ghế theo ID
export const getSeatById = async (id) => {
    const seats = await getSeats();

    return (
        seats.find(
            (seat) => String(seat.seatId) === String(id)
        ) || null
    );
};

// Cập nhật thông tin ghế
export const updateSeat = async (id, seatData) => {
    const seats = await getSeats();

    const existingSeat = seats.find(
        (seat) => String(seat.seatId) === String(id)
    );

    if (!existingSeat) {
        throw new Error("Không tìm thấy ghế cần cập nhật.");
    }

    if (
        seatData.seatTypeId !== undefined &&
        !seatTypes.some(
            (type) => Number(type.seatTypeId) === Number(seatData.seatTypeId)
        )
    ) {
        throw new Error("Loại ghế không hợp lệ.");
    }

    if (
        seatData.status !== undefined &&
        !SEAT_STATUS_OPTIONS.includes(seatData.status)
    ) {
        throw new Error("Trạng thái ghế không hợp lệ.");
    }

    const updatedSeats = seats.map((seat) =>
        String(seat.seatId) === String(id)
            ? {
                ...seat,
                ...seatData,
                seatId: seat.seatId,
                roomId: seat.roomId,
                seatCode: seat.seatCode,
                seatRow: seat.seatRow,
                seatNumber: seat.seatNumber
            }
            : seat
    );

    saveSeats(updatedSeats);

    return updatedSeats.find(
        (seat) => String(seat.seatId) === String(id)
    );
};

// Lấy danh sách loại ghế
export const getSeatTypes = async () => {
    return [...seatTypes];
};
