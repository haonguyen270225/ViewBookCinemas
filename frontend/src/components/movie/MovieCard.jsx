import { Link } from "react-router-dom";
import "./MovieCard.css";

function MovieCard({ movie }) {
    return (
        <div className="movie-card">
            <div className="movie-card__poster-wrapper">
                <img
                    src={movie.poster}
                    alt={movie.title}
                    className="movie-card__poster"
                />

                {movie.ageRating && (
                    <span className="movie-card__age">
                        {movie.ageRating}
                    </span>
                )}

                {movie.status && (
                    <span className="movie-card__status">
                        {movie.status}
                    </span>
                )}
            </div>

            <div className="movie-card__content">
                <h5 className="movie-card__title">
                    {movie.title}
                </h5>

                <p className="movie-card__genres">
                    {movie.genres?.join(" • ")}
                </p>

                <div className="movie-card__info">
                    <span>
                        <i className="bi bi-clock"></i>
                        {" "}{movie.duration} phút
                    </span>

                    {movie.rating && (
                        <span>
                            <i className="bi bi-star-fill"></i>
                            {" "}{movie.rating}
                        </span>
                    )}
                </div>

                <Link
                    to={`/movies/${movie.id}`}
                    className="movie-card__button"
                >
                    Xem chi tiết
                </Link>
            </div>
        </div>
    );
}

export default MovieCard;