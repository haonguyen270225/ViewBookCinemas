
import { Link } from "react-router-dom";
import MovieCard from "./MovieCard.jsx";
import "./MovieList.css";

//=================== Danh sách phim ========================

function MovieList({
    title,
    subtitle,
    movies = [],
    emptyMessage = "Hiện chưa có phim trong danh sách.",
    viewAllLink,
    titleTone = "default"
}) {
    return (
        <div className="movie-list-section">

            {/*=================== Tiêu đề danh sách ========================*/}

            <div className="movie-list-header">

                <div className="movie-list-heading">

                    <h2 className={`movie-list-title movie-list-title--${titleTone}`}>
                        {title}
                    </h2>

                    {subtitle && (
                        <p className="movie-list-subtitle">
                            {subtitle}
                        </p>
                    )}

                </div>

                {viewAllLink && (
                    <Link
                        to={viewAllLink}
                        className="movie-list-view-all"
                    >
                        Xem tất cả →
                    </Link>
                )}

            </div>

            {/*=================== Danh sách thẻ phim ========================*/}

            {movies.length > 0 ? (

                <div className="row g-4">

                    {movies.map((movie) => (
                        <div
                            className="col-6 col-md-4 col-lg-3"
                            key={movie.id}
                        >
                            <MovieCard movie={movie} />
                        </div>
                    ))}

                </div>

            ) : (

                <div className="movie-list-empty">
                    {emptyMessage}
                </div>

            )}

        </div>
    );
}

export default MovieList;
