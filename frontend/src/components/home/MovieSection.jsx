
import MovieCard from "./MovieCard";

function MovieSection({ title, movies, subtitle }) {
    return (
        <section className="movie-section py-5">

            <div className="container">

                <div className="section-heading mb-4">
                    <div>
                        <h2>{title}</h2>
                        <p>{subtitle}</p>
                    </div>

                    <a href="/movies" className="view-all">
                        Xem tất cả →
                    </a>
                </div>

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

            </div>

        </section>
    );
}

export default MovieSection;
