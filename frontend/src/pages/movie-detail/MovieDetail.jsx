
import { Link, useParams } from "react-router-dom";
import movies from "../../data/movies.js";
import "./MovieDetail.css";

//=================== Trang chi tiết phim ========================

function MovieDetail() {
    const { id } = useParams();

    //=================== Tìm phim theo ID ========================

    const movie = movies.find(
        (item) => String(item.id) === id
    );

    //=================== Kiểm tra phim ========================

    if (!movie) {
        return (
            <div className="movie-detail-not-found">
                <h2>Không tìm thấy phim!</h2>

                <p>
                    Phim bạn đang tìm kiếm không tồn tại.
                </p>

                <Link
                    to="/movies"
                    className="btn-back-movies"
                >
                    Quay lại danh sách phim
                </Link>
            </div>
        );
    }

    //=================== Hiển thị chi tiết phim ========================

    return (
        <div className="movie-detail-page">

            <div className="movie-detail-container">

                {/*=================== Nút quay lại ========================*/}

                <Link
                    to="/movies"
                    className="movie-detail-back"
                >
                    <span className="movie-detail-back-arrow">
                        ←
                    </span>

                    <span>
                        Quay lại danh sách phim
                    </span>
                </Link>

                {/*=================== Thông tin phim ========================*/}

                <div className="movie-detail-content">

                    {/*=================== Poster phim ========================*/}

                    <div className="movie-detail-poster">
                        <img
                            src={movie.poster}
                            alt={movie.title}
                        />
                    </div>

                    {/*=================== Nội dung thông tin ========================*/}

                    <div className="movie-detail-info">

                        {/* Trạng thái phim */}

                        <span className="movie-detail-status">
                            {movie.status}
                        </span>

                        {/* Tên phim */}

                        <h1>{movie.title}</h1>

                        {/* Thông tin cơ bản */}

                        <div className="movie-detail-meta">

                            {movie.ageRating && (
                                <span>
                                    {movie.ageRating}
                                </span>
                            )}

                            {movie.duration && (
                                <span>
                                    {movie.duration} phút
                                </span>
                            )}

                            {movie.rating != null && (
                                <span className="movie-detail-rating">
                                    <span className="movie-detail-star">
                                        ★
                                    </span>

                                    {movie.rating}/10
                                </span>
                            )}

                        </div>

                        {/*=================== Thể loại ========================*/}

                        {Array.isArray(movie.genres) &&
                            movie.genres.length > 0 && (
                                <div className="movie-detail-genres">

                                    {movie.genres.map((genre, index) => (
                                        <span key={index}>
                                            {genre}
                                        </span>
                                    ))}

                                </div>
                            )}

                        {/*=================== Nội dung phim ========================*/}

                        <div className="movie-detail-description">

                            <h3>Nội dung phim</h3>

                            <p>
                                {movie.description ||
                                    "Thông tin nội dung phim đang được cập nhật."}
                            </p>

                        </div>

                        {/*=================== Nút đặt vé ========================*/}

                        <Link
                            to="/showtimes"
                            className="movie-detail-booking"
                        >
                            Đặt vé ngay
                        </Link>

                    </div>

                </div>

                {/*=================== Trailer phim ========================*/}

                {movie.trailerUrl && (
                    <div className="movie-detail-trailer">

                        <h2>Trailer phim</h2>

                        <video
                            src={movie.trailerUrl}
                            controls
                            preload="metadata"
                        />

                    </div>
                )}

            </div>

        </div>
    );
}

export default MovieDetail;
