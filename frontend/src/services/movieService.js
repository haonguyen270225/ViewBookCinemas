
import moviesData from "../data/movies.js";

const STORAGE_KEY = "viewbook-admin-movies";

// Đọc danh sách phim
export const getMovies = async () => {
    try {
        const savedMovies = localStorage.getItem(STORAGE_KEY);

        // Chưa có dữ liệu lưu: sử dụng dữ liệu demo
        if (savedMovies === null) {
            return [...moviesData];
        }

        const parsedMovies = JSON.parse(savedMovies);

        if (!Array.isArray(parsedMovies)) {
            throw new Error("Dữ liệu phim không hợp lệ.");
        }

        return parsedMovies;
    } catch (error) {
        console.error("Không thể đọc dữ liệu phim:", error);

        throw new Error(
            "Không thể tải danh sách phim. Vui lòng thử lại."
        );
    }
};

// Lấy phim theo ID
export const getMovieById = async (id) => {
    const movies = await getMovies();

    return (
        movies.find(
            (movie) => String(movie.id) === String(id)
        ) || null
    );
};

// Lưu danh sách phim
const saveMovies = (movies) => {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(movies)
        );
    } catch (error) {
        console.error("Không thể lưu dữ liệu phim:", error);

        throw new Error(
            "Không thể lưu dữ liệu phim trên trình duyệt."
        );
    }
};

// Thêm phim
export const createMovie = async (movieData) => {
    const movies = await getMovies();

    const newId =
        Math.max(
            0,
            ...movies.map((movie) => Number(movie.id) || 0)
        ) + 1;

    const newMovie = {
        ...movieData,
        id: newId
    };

    const updatedMovies = [...movies, newMovie];

    saveMovies(updatedMovies);

    return newMovie;
};

// Cập nhật phim
export const updateMovie = async (id, movieData) => {
    const movies = await getMovies();

    const movieExists = movies.some(
        (movie) => String(movie.id) === String(id)
    );

    if (!movieExists) {
        throw new Error("Không tìm thấy phim cần cập nhật.");
    }

    const updatedMovies = movies.map((movie) =>
        String(movie.id) === String(id)
            ? { ...movie, ...movieData, id: movie.id }
            : movie
    );

    saveMovies(updatedMovies);

    return updatedMovies.find(
        (movie) => String(movie.id) === String(id)
    );
};

// Xóa phim
export const deleteMovie = async (id) => {
    const movies = await getMovies();

    const updatedMovies = movies.filter(
        (movie) => String(movie.id) !== String(id)
    );

    if (updatedMovies.length === movies.length) {
        throw new Error("Không tìm thấy phim cần xóa.");
    }

    saveMovies(updatedMovies);

    return true;
};
