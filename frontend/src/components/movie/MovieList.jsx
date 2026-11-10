import { Link } from "react-router-dom";
import MovieCard from "./MovieCard.jsx";
import "./MovieList.css";

function MovieList({
    title,
    subtitle,
    movies = [],
    emptyMessage = "Hiện chưa có phim để hiển thị.",
    viewAllLink
}) {
    return (
        <section className="movie-list-section">
            <div className="movie-list-header">
                <div>
                    <h2 className="movie-list-title">{title}</h2>

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
                        Xem tất cả
                        <i className="bi bi-arrow-right"></i>
                    </Link>
                )}
            </div>

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
        </section>
    );
}

export default MovieList;