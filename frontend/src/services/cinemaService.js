
import { cinemas as cinemasData } from "../data/cinemas.js";

const STORAGE_KEY = "viewbook-admin-cinemas";

//=================== Lấy danh sách rạp ========================

export const getCinemas = async () => {
    try {
        const savedCinemas = localStorage.getItem(STORAGE_KEY);

        // Chưa có dữ liệu lưu: sử dụng dữ liệu demo
        if (savedCinemas === null) {
            return [...cinemasData];
        }

        const parsedCinemas = JSON.parse(savedCinemas);

        if (!Array.isArray(parsedCinemas)) {
            throw new Error("Dữ liệu rạp chiếu không hợp lệ.");
        }

        return parsedCinemas;
    } catch (error) {
        console.error("Không thể đọc dữ liệu rạp:", error);

        throw new Error(
            "Không thể tải danh sách rạp chiếu. Vui lòng thử lại."
        );
    }
};

//=================== Lấy rạp theo ID ========================

export const getCinemaById = async (id) => {
    const cinemas = await getCinemas();

    return (
        cinemas.find(
            (cinema) => String(cinema.id) === String(id)
        ) || null
    );
};

//=================== Lưu danh sách rạp ========================

const saveCinemas = (cinemas) => {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(cinemas)
        );
    } catch (error) {
        console.error("Không thể lưu dữ liệu rạp:", error);

        throw new Error(
            "Không thể lưu dữ liệu rạp trên trình duyệt."
        );
    }
};

//=================== Thêm rạp ========================

export const createCinema = async (cinemaData) => {
    const cinemas = await getCinemas();

    const newId =
        Math.max(
            0,
            ...cinemas.map((cinema) => Number(cinema.id) || 0)
        ) + 1;

    const newCinema = {
        ...cinemaData,
        id: newId
    };

    saveCinemas([...cinemas, newCinema]);

    return newCinema;
};

//=================== Cập nhật rạp ========================

export const updateCinema = async (id, cinemaData) => {
    const cinemas = await getCinemas();

    const cinemaExists = cinemas.some(
        (cinema) => String(cinema.id) === String(id)
    );

    if (!cinemaExists) {
        throw new Error("Không tìm thấy rạp cần cập nhật.");
    }

    const updatedCinemas = cinemas.map((cinema) =>
        String(cinema.id) === String(id)
            ? { ...cinema, ...cinemaData, id: cinema.id }
            : cinema
    );

    saveCinemas(updatedCinemas);

    return updatedCinemas.find(
        (cinema) => String(cinema.id) === String(id)
    );
};

//=================== Xóa rạp ========================

export const deleteCinema = async (id) => {
    const cinemas = await getCinemas();

    const updatedCinemas = cinemas.filter(
        (cinema) => String(cinema.id) !== String(id)
    );

    if (updatedCinemas.length === cinemas.length) {
        throw new Error("Không tìm thấy rạp cần xóa.");
    }

    saveCinemas(updatedCinemas);

    return true;
};
