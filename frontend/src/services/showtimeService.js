
import { showtimes as showtimesData } from "../data/showtimes.js";

import { getMovies } from "./movieService.js";
import { getCinemas } from "./cinemaService.js";
import { getRooms } from "./roomService.js";

const STORAGE_KEY = "viewbook-admin-showtimes";

const SHOWTIME_STATUS_OPTIONS = [
    "Scheduled",
    "Cancelled",
    "Completed"
];

//=================== Lưu danh sách suất chiếu ========================

const saveShowtimes = (showtimes) => {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(showtimes)
        );
    } catch (error) {
        console.error("Không thể lưu dữ liệu suất chiếu:", error);

        throw new Error(
            "Không thể lưu dữ liệu suất chiếu trên trình duyệt."
        );
    }
};

//=================== Chuẩn hóa dữ liệu suất chiếu cũ ========================

// Chuyển roomName cũ thành roomId.
// Nếu đã có roomId hợp lệ thì giữ nguyên.
const migrateShowtimes = (showtimes, rooms) => {
    let hasChanges = false;

    const migratedShowtimes = showtimes.map((showtime) => {
        // Dữ liệu đã có roomId hợp lệ.
        if (showtime.roomId !== undefined && showtime.roomId !== null) {
            return showtime;
        }

        // Tìm phòng từ dữ liệu cũ sử dụng roomName.
        const matchedRoom = rooms.find(
            (room) =>
                String(room.cinemaId) === String(showtime.cinemaId) &&
                room.roomName === showtime.roomName
        );

        hasChanges = true;

        const {
            roomName,
            ...showtimeData
        } = showtime;

        return {
            ...showtimeData,
            roomId: matchedRoom?.roomId ?? null
        };
    });

    if (hasChanges) {
        saveShowtimes(migratedShowtimes);
    }

    return migratedShowtimes;
};

//=================== Lấy danh sách suất chiếu ========================

export const getShowtimes = async () => {
    try {
        const rooms = await getRooms();

        const savedShowtimes = localStorage.getItem(STORAGE_KEY);

        // Chưa có dữ liệu: khởi tạo từ dữ liệu mẫu.
        if (savedShowtimes === null) {
            const initialShowtimes = showtimesData.map((showtime) => {
                // Dữ liệu mẫu mới đã có roomId.
                if (showtime.roomId !== undefined && showtime.roomId !== null) {
                    return { ...showtime };
                }

                // Hỗ trợ dữ liệu mẫu cũ còn roomName.
                const matchedRoom = rooms.find(
                    (room) =>
                        String(room.cinemaId) === String(showtime.cinemaId) &&
                        room.roomName === showtime.roomName
                );

                const {
                    roomName,
                    ...showtimeData
                } = showtime;

                return {
                    ...showtimeData,
                    roomId: matchedRoom?.roomId ?? null
                };
            });

            saveShowtimes(initialShowtimes);

            return initialShowtimes;
        }

        const parsedShowtimes = JSON.parse(savedShowtimes);

        if (!Array.isArray(parsedShowtimes)) {
            throw new Error("Dữ liệu suất chiếu không hợp lệ.");
        }

        return migrateShowtimes(parsedShowtimes, rooms);
    } catch (error) {
        console.error("Không thể tải dữ liệu suất chiếu:", error);

        throw new Error(
            error.message || "Không thể tải danh sách suất chiếu."
        );
    }
};

//=================== Lấy suất chiếu theo ID ========================

export const getShowtimeById = async (id) => {
    const showtimes = await getShowtimes();

    return (
        showtimes.find(
            (showtime) => String(showtime.id) === String(id)
        ) || null
    );
};

//=================== Lấy suất chiếu theo rạp ========================

export const getShowtimesByCinemaId = async (cinemaId) => {
    const showtimes = await getShowtimes();

    return showtimes.filter(
        (showtime) =>
            String(showtime.cinemaId) === String(cinemaId)
    );
};

//=================== Lấy suất chiếu theo phim ========================

export const getShowtimesByMovieId = async (movieId) => {
    const showtimes = await getShowtimes();

    return showtimes.filter(
        (showtime) =>
            String(showtime.movieId) === String(movieId)
    );
};

//=================== Kiểm tra dữ liệu suất chiếu ========================

const validateShowtime = async (showtimeData, currentId = null) => {
    const {
        movieId,
        cinemaId,
        roomId,
        movieVersion,
        startTime,
        endTime,
        basePrice,
        status
    } = showtimeData;

    if (
        !Number.isInteger(Number(movieId)) ||
        Number(movieId) <= 0 ||
        !Number.isInteger(Number(cinemaId)) ||
        Number(cinemaId) <= 0 ||
        !Number.isInteger(Number(roomId)) ||
        Number(roomId) <= 0
    ) {
        throw new Error("Phim, rạp và phòng chiếu không hợp lệ.");
    }

    if (!movieVersion?.trim()) {
        throw new Error("Vui lòng chọn phiên bản phim.");
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (
        !startTime ||
        !endTime ||
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime()) ||
        end <= start
    ) {
        throw new Error("Thời gian kết thúc phải sau thời gian bắt đầu.");
    }

    if (
        !Number.isFinite(Number(basePrice)) ||
        Number(basePrice) <= 0
    ) {
        throw new Error("Giá vé phải lớn hơn 0.");
    }

    if (!SHOWTIME_STATUS_OPTIONS.includes(status)) {
        throw new Error("Trạng thái suất chiếu không hợp lệ.");
    }

    const [movies, cinemas, rooms, showtimes] = await Promise.all([
        getMovies(),
        getCinemas(),
        getRooms(),
        getShowtimes()
    ]);

    const selectedMovie = movies.find(
        (movie) => String(movie.id) === String(movieId)
    );

    if (!selectedMovie) {
        throw new Error("Không tìm thấy phim được chọn.");
    }

    const selectedCinema = cinemas.find(
        (cinema) => String(cinema.id) === String(cinemaId)
    );

    if (!selectedCinema || selectedCinema.status !== "Active") {
        throw new Error("Rạp chiếu không tồn tại hoặc đang ngừng hoạt động.");
    }

    const selectedRoom = rooms.find(
        (room) => String(room.roomId) === String(roomId)
    );

    if (!selectedRoom) {
        throw new Error("Không tìm thấy phòng chiếu được chọn.");
    }

    if (String(selectedRoom.cinemaId) !== String(cinemaId)) {
        throw new Error("Phòng chiếu không thuộc rạp đã chọn.");
    }

    if (selectedRoom.status !== "Active") {
        throw new Error("Phòng chiếu hiện không hoạt động.");
    }

    // Kiểm tra trùng lịch trong cùng một phòng.
    // Chỉ các suất Scheduled mới được tính là lịch đang sử dụng phòng.
    if (status === "Scheduled") {
        const hasConflict = showtimes.some((item) => {
            if (
                String(item.id) === String(currentId) ||
                String(item.roomId) !== String(roomId) ||
                item.status !== "Scheduled"
            ) {
                return false;
            }

            const existingStart = new Date(item.startTime);
            const existingEnd = new Date(item.endTime);

            return start < existingEnd && end > existingStart;
        });

        if (hasConflict) {
            throw new Error(
                "Phòng chiếu đã có suất chiếu trùng thời gian."
            );
        }
    }
};

//=================== Thêm suất chiếu ========================

export const createShowtime = async (showtimeData) => {
    const showtimes = await getShowtimes();

    await validateShowtime(showtimeData);

    const newId =
        Math.max(
            0,
            ...showtimes.map(
                (item) => Number(item.id) || 0
            )
        ) + 1;

    const newShowtime = {
        ...showtimeData,
        id: newId,
        movieId: Number(showtimeData.movieId),
        cinemaId: Number(showtimeData.cinemaId),
        roomId: Number(showtimeData.roomId),
        basePrice: Number(showtimeData.basePrice)
    };

    saveShowtimes([...showtimes, newShowtime]);

    return newShowtime;
};

//=================== Cập nhật suất chiếu ========================

export const updateShowtime = async (id, showtimeData) => {
    const showtimes = await getShowtimes();

    const existingShowtime = showtimes.find(
        (item) => String(item.id) === String(id)
    );

    if (!existingShowtime) {
        throw new Error("Không tìm thấy suất chiếu cần cập nhật.");
    }

    const updatedData = {
        ...existingShowtime,
        ...showtimeData
    };

    await validateShowtime(updatedData, id);

    const updatedShowtimes = showtimes.map((item) =>
        String(item.id) === String(id)
            ? {
                ...updatedData,
                id: item.id,
                movieId: Number(updatedData.movieId),
                cinemaId: Number(updatedData.cinemaId),
                roomId: Number(updatedData.roomId),
                basePrice: Number(updatedData.basePrice)
            }
            : item
    );

    saveShowtimes(updatedShowtimes);

    return updatedShowtimes.find(
        (item) => String(item.id) === String(id)
    );
};

//=================== Xóa suất chiếu ========================

export const deleteShowtime = async (id) => {
    const showtimes = await getShowtimes();

    const updatedShowtimes = showtimes.filter(
        (item) => String(item.id) !== String(id)
    );

    if (updatedShowtimes.length === showtimes.length) {
        throw new Error("Không tìm thấy suất chiếu cần xóa.");
    }

    saveShowtimes(updatedShowtimes);

    return true;
};
