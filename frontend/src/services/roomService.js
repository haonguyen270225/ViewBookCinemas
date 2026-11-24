
import { cinemaRooms as roomsData } from "../data/cinemaRooms.js";

const STORAGE_KEY = "viewbook-admin-rooms";

//=================== Lấy danh sách phòng chiếu ========================

export const getRooms = async () => {
    try {
        const savedRooms = localStorage.getItem(STORAGE_KEY);

        // Chưa có dữ liệu lưu: sử dụng dữ liệu mẫu
        if (savedRooms === null) {
            return [...roomsData];
        }

        const parsedRooms = JSON.parse(savedRooms);

        if (!Array.isArray(parsedRooms)) {
            throw new Error("Dữ liệu phòng chiếu không hợp lệ.");
        }

        return parsedRooms;
    } catch (error) {
        console.error("Không thể đọc dữ liệu phòng chiếu:", error);

        throw new Error(
            "Không thể tải danh sách phòng chiếu. Vui lòng thử lại."
        );
    }
};

//=================== Lấy phòng chiếu theo ID ========================

export const getRoomById = async (id) => {
    const rooms = await getRooms();

    return (
        rooms.find(
            (room) => String(room.roomId) === String(id)
        ) || null
    );
};

//=================== Lưu danh sách phòng chiếu ========================

const saveRooms = (rooms) => {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(rooms)
        );
    } catch (error) {
        console.error("Không thể lưu dữ liệu phòng chiếu:", error);

        throw new Error(
            "Không thể lưu dữ liệu phòng chiếu trên trình duyệt."
        );
    }
};

//=================== Thêm phòng chiếu ========================

export const createRoom = async (roomData) => {
    const rooms = await getRooms();

    const newId =
        Math.max(
            0,
            ...rooms.map((room) => Number(room.roomId) || 0)
        ) + 1;

    const newRoom = {
        ...roomData,
        roomId: newId
    };

    saveRooms([...rooms, newRoom]);

    return newRoom;
};

//=================== Cập nhật phòng chiếu ========================

export const updateRoom = async (id, roomData) => {
    const rooms = await getRooms();

    const roomExists = rooms.some(
        (room) => String(room.roomId) === String(id)
    );

    if (!roomExists) {
        throw new Error("Không tìm thấy phòng chiếu cần cập nhật.");
    }

    const updatedRooms = rooms.map((room) =>
        String(room.roomId) === String(id)
            ? { ...room, ...roomData, roomId: room.roomId }
            : room
    );

    saveRooms(updatedRooms);

    return updatedRooms.find(
        (room) => String(room.roomId) === String(id)
    );
};

//=================== Xóa phòng chiếu ========================

export const deleteRoom = async (id) => {
    const rooms = await getRooms();

    const updatedRooms = rooms.filter(
        (room) => String(room.roomId) !== String(id)
    );

    if (updatedRooms.length === rooms.length) {
        throw new Error("Không tìm thấy phòng chiếu cần xóa.");
    }

    saveRooms(updatedRooms);

    return true;
};
