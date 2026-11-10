
function MovieCard({ movie }) {
    return (
        <div className="movie-card h-100">

            <div className="movie-poster">
                <img
                    src={movie.image}
                    alt={movie.title}
                    className="img-fluid"
                />

                <span className="movie-age">
                    {movie.ageRating}
                </span>
            </div>

            <div className="movie-info">
                <h5 className="movie-title">
                    {movie.title}
                </h5>

                <p className="movie-genre">
                    {movie.genre}
                </p>

                <div className="movie-meta">
                    <span>
                        <i className="bi bi-clock"></i>
                        {" "}{movie.duration} phút
                    </span>

                    <span>
                        <i className="bi bi-star-fill text-warning"></i>
                        {" "}{movie.rating}
                    </span>
                </div>

                <button className="btn btn-danger w-100 mt-3">
                    Đặt vé
                </button>
            </div>

        </div>
    );
}

export default MovieCard;
