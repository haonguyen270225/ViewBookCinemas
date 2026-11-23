
import { movies } from "./movies.js";

//=================== Dữ liệu phim nổi bật cho Hero Banner ========================

// Lấy dữ liệu từ movies.js, không khai báo phim lần thứ hai.
// Chuyển đổi một số tên trường để tương thích với HeroBanner.jsx hiện tại.

export const featuredMovies = movies
    .filter((movie) => movie.isFeatured)
    .map((movie) => ({
        ...movie,

        // Tương thích với component HeroBanner hiện tại
        posterUrl: movie.poster,
        durationMinutes: movie.duration,

        // Chuyển trạng thái sang định dạng mà HeroBanner đang sử dụng
        status:
            movie.status === "Đang chiếu"
                ? "NOW_SHOWING"
                : "COMING_SOON"
    }))
    .sort((a, b) => a.displayOrder - b.displayOrder);

//=================== Xuất dữ liệu mặc định ========================

export default featuredMovies;
