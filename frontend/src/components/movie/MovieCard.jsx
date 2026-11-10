
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import "./MovieCard.css";

//=================== Component Movie Card ========================

function MovieCard({ movie }) {

    const [isPreviewing, setIsPreviewing] = useState(false);

    const videoRef = useRef(null);

    const hasTrailer = Boolean(movie.trailerUrl);

    //=================== Xử lý phát video Preview ========================

    useEffect(() => {

        const video = videoRef.current;

        if (!isPreviewing || !hasTrailer || !video) {
            return;
        }

        video.currentTime = 0;

        const playPromise = video.play();

        if (playPromise !== undefined) {
            playPromise.catch(() => {
                // Trình duyệt có thể từ chối autoplay.
            });
        }

        return () => {
            video.pause();
            video.currentTime = 0;
        };

    }, [isPreviewing, hasTrailer, movie.trailerUrl]);

    //=================== Xử lý Hover ========================

    const handleMouseEnter = () => {
        if (hasTrailer) {
            setIsPreviewing(true);
        }
    };

    const handleMouseLeave = () => {
        setIsPreviewing(false);
    };

    //=================== Hỗ trợ bàn phím ========================

    const handleFocus = () => {
        if (hasTrailer) {
            setIsPreviewing(true);
        }
    };

    const handleBlur = (event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsPreviewing(false);
        }
    };

    return (
        <div
            className={`movie-card ${isPreviewing ? "movie-card--preview" : ""}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocusCapture={handleFocus}
            onBlurCapture={handleBlur}
        >

            {/*=================== Poster ========================*/}

            <div className="movie-card__poster-wrapper">

                <img
                    src={movie.poster}
                    alt={movie.title}
                    className="movie-card__poster"
                />

                {/*=================== Video Preview ========================*/}

                {isPreviewing && hasTrailer && (
                    <video
                        ref={videoRef}
                        className="movie-card__preview-video"
                        src={movie.trailerUrl}
                        poster={movie.poster}
                        muted
                        loop
                        playsInline
                        preload="auto"
                    />
                )}

                {/*=================== Preview Label ========================*/}

                {isPreviewing && hasTrailer && (
                    <span className="movie-card__preview-label">
                        PREVIEW
                    </span>
                )}

                {/*=================== Age Rating ========================*/}

                {movie.ageRating && (
                    <span className="movie-card__age">
                        {movie.ageRating}
                    </span>
                )}

                {/*=================== Movie Status ========================*/}

                {movie.status && (
                    <span className="movie-card__status">
                        {movie.status}
                    </span>
                )}

            </div>

            {/*=================== Movie Information ========================*/}

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

                {/*=================== Detail Button ========================*/}

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
