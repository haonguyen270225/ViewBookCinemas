import genresData from "../data/genres.js";

const STORAGE_KEY = "viewbook-admin-genres";

// Đọc danh sách thể loại
export const getGenres = () => {
    try {
        const savedGenres = localStorage.getItem(STORAGE_KEY);

        if (savedGenres) {
            const parsedGenres = JSON.parse(savedGenres);

            if (Array.isArray(parsedGenres)) {
                return parsedGenres;
            }
        }
    } catch (error) {
        console.error("Không thể đọc dữ liệu thể loại:", error);
    }

    // Trả về dữ liệu demo ban đầu
    return [...genresData];
};

// Lưu danh sách thể loại
export const saveGenres = (genres) => {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(genres)
        );

        return true;
    } catch (error) {
        console.error("Không thể lưu dữ liệu thể loại:", error);
        return false;
    }
};

// Lấy thể loại theo ID
export const getGenreById = (id) => {
    const genres = getGenres();

    return genres.find((genre) => genre.id === id) || null;
};

// Thêm thể loại
export const createGenre = (genreData) => {
    const genres = getGenres();

    const newGenre = {
        ...genreData,
        id: `genre-${Date.now()}`
    };

    const updatedGenres = [...genres, newGenre];

    if (!saveGenres(updatedGenres)) {
        throw new Error("Không thể thêm thể loại.");
    }

    return newGenre;
};

// Cập nhật thể loại
export const updateGenre = (id, genreData) => {
    const genres = getGenres();

    const updatedGenres = genres.map((genre) =>
        genre.id === id
            ? { ...genre, ...genreData, id }
            : genre
    );

    if (!saveGenres(updatedGenres)) {
        throw new Error("Không thể cập nhật thể loại.");
    }

    return updatedGenres.find((genre) => genre.id === id);
};

// Xóa thể loại
export const deleteGenre = (id) => {
    const genres = getGenres();

    const updatedGenres = genres.filter(
        (genre) => genre.id !== id
    );

    if (!saveGenres(updatedGenres)) {
        throw new Error("Không thể xóa thể loại.");
    }

    return true;
};