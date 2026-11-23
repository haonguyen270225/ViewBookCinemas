
import { cinemaRooms } from "./cinemaRooms.js";
import { seatTypes } from "./seatTypes.js";

//=================== Ánh xạ ID loại ghế ========================

const seatTypeIds = Object.fromEntries(
    seatTypes.map((seatType) => [
        seatType.seatTypeName,
        seatType.seatTypeId
    ])
);

//=================== Cấu hình sơ đồ ghế ========================

const seatLayouts = {
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

//=================== Danh sách tên hàng ghế ========================

const seatRows = "ABCDEFGHIJ".split("");

//=================== Xác định loại ghế ========================

const getSeatTypeId = (room, rowIndex) => {
    // Phòng VIP: toàn bộ ghế là ghế VIP
    if (room.roomType === "VIP") {
        return seatTypeIds["Ghế VIP"];
    }

    // Hàng A - F: Ghế thường
    if (rowIndex <= 6) {
        return seatTypeIds["Ghế thường"];
    }

    // Hàng G - H: Ghế VIP
    if (rowIndex <= 8) {
        return seatTypeIds["Ghế VIP"];
    }

    // Hàng I - J: Ghế đôi
    return seatTypeIds["Ghế đôi"];
};

//=================== Tạo danh sách ghế ========================

let nextSeatId = 1;

export const seats = cinemaRooms.flatMap((room) => {
    const layout = seatLayouts[room.roomType];

    if (!layout) {
        return [];
    }

    const roomSeats = [];

    for (let rowIndex = 1; rowIndex <= layout.totalRows; rowIndex++) {
        const seatRow = seatRows[rowIndex - 1];

        for (
            let seatNumber = 1;
            seatNumber <= layout.seatsPerRow;
            seatNumber++
        ) {
            const seatId = nextSeatId++;

            roomSeats.push({
                seatId,
                roomId: room.roomId,
                seatTypeId: getSeatTypeId(room, rowIndex),

                // Mã ghế được tạo từ hàng và số ghế
                seatCode: `${seatRow}${seatNumber}`,

                seatRow,
                seatNumber,
                status: "Active"
            });
        }
    }

    return roomSeats;
});
