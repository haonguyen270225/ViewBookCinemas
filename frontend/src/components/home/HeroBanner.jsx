
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import featuredMovies from "../../data/hero_banner.js";

import "./HeroBanner.css";

//=================== Component Hero Banner ========================

function HeroBanner() {
    const movies = [...featuredMovies]
        .filter((movie) => movie.isFeatured)
        .sort((a, b) => a.displayOrder - b.displayOrder);

    const [activeIndex, setActiveIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(true);

    const videoRef = useRef(null);

    const activeMovie = movies[activeIndex];

    //=================== Tự động chuyển slide ========================

    useEffect(() => {
        if (movies.length <= 1) return;

        const interval = setInterval(() => {
            setActiveIndex((currentIndex) =>
                (currentIndex + 1) % movies.length
            );
        }, 7000);

        return () => clearInterval(interval);
    }, [movies.length]);

    //=================== Xử lý video khi chuyển phim ========================

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.load();
            videoRef.current.play().catch(() => {});
        }
    }, [activeIndex]);

    //=================== Chuyển phim ========================

    const handleNext = () => {
        setActiveIndex((currentIndex) =>
            (currentIndex + 1) % movies.length
        );
    };

    const handlePrevious = () => {
        setActiveIndex((currentIndex) =>
            (currentIndex - 1 + movies.length) % movies.length
        );
    };

    //=================== Bật / tắt âm thanh ========================

    const handleToggleSound = () => {
        setIsMuted((current) => !current);
    };

    //=================== Kiểm tra dữ liệu ========================

    if (!activeMovie) {
        return null;
    }

    return (
        <section className="vbc-hero">

            {/*=================== Background ========================*/}

            <div className="vbc-hero-background">

                {activeMovie.trailerUrl ? (
                    <video
                        ref={videoRef}
                        key={activeMovie.trailerUrl}
                        className="vbc-hero-video"
                        src={activeMovie.trailerUrl}
                        poster={activeMovie.backdropUrl}
                        autoPlay
                        muted={isMuted}
                        loop
                        playsInline
                    />
                ) : (
                    <img
                        className="vbc-hero-image"
                        src={activeMovie.backdropUrl}
                        alt={activeMovie.title}
                    />
                )}

            </div>

            {/*=================== Overlay ========================*/}

            <div className="vbc-hero-overlay"></div>

            {/*=================== Content ========================*/}

            <div className="container vbc-hero-container">

                <div className="vbc-hero-content">

                    <span className="vbc-hero-label">
                        <span className="vbc-hero-label-dot"></span>
                        VIEWBOOKCINEMAS ORIGINAL EXPERIENCE
                    </span>

                    <span className="vbc-hero-status">
                        {activeMovie.status === "NOW_SHOWING"
                            ? "ĐANG CHIẾU"
                            : "SẮP KHỞI CHIẾU"}
                    </span>

                    <h1 className="vbc-hero-title">
                        {activeMovie.title}
                    </h1>

                    <div className="vbc-hero-meta">

                        <span className="vbc-hero-rating">
                            <span className="vbc-hero-star">★</span>
                            {activeMovie.rating}
                        </span>

                        <span>{activeMovie.ageRating}</span>

                        <span>{activeMovie.durationMinutes} phút</span>

                        <span>
                            {new Date(activeMovie.releaseDate).toLocaleDateString(
                                "vi-VN"
                            )}
                        </span>

                    </div>

                    <div className="vbc-hero-genres">
                        {activeMovie.genres?.map((genre) => (
                            <span key={genre}>{genre}</span>
                        ))}
                    </div>

                    <p className="vbc-hero-description">
                        {activeMovie.description}
                    </p>

                    {/*=================== Actions ========================*/}

                    <div className="vbc-hero-actions">

                        <Link
                            to="/movies"
                            className="vbc-hero-btn vbc-hero-btn-primary"
                        >
                            <span>Đặt vé ngay</span>
                            <span className="vbc-hero-btn-arrow">→</span>
                        </Link>

                        {activeMovie.trailerPageUrl && (
                            <a
                                href={activeMovie.trailerPageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="vbc-hero-btn vbc-hero-btn-outline"
                            >
                                <span className="vbc-hero-play">▶</span>
                                Xem video
                            </a>
                        )}

                    </div>

                </div>

            </div>

            {/*=================== Controls ========================*/}

            <div className="vbc-hero-controls">

                <div className="vbc-hero-pagination">

                    <span className="vbc-hero-current">
                        {String(activeIndex + 1).padStart(2, "0")}
                    </span>

                    <span className="vbc-hero-pagination-line"></span>

                    <span className="vbc-hero-total">
                        {String(movies.length).padStart(2, "0")}
                    </span>

                </div>

                <div className="vbc-hero-navigation">

                    <button
                        type="button"
                        onClick={handlePrevious}
                        aria-label="Phim trước"
                    >
                        ←
                    </button>

                    <button
                        type="button"
                        onClick={handleNext}
                        aria-label="Phim tiếp theo"
                    >
                        →
                    </button>

                </div>

                {activeMovie.trailerUrl && (
                    <button
                        type="button"
                        className="vbc-hero-sound"
                        onClick={handleToggleSound}
                        aria-label={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
                    >
                        {isMuted ? "Âm thanh: Tắt" : "Âm thanh: Bật"}
                    </button>
                )}

            </div>

            {/*=================== Slide Indicators ========================*/}

            <div className="vbc-hero-indicators">

                {movies.map((movie, index) => (
                    <button
                        key={movie.id}
                        type="button"
                        className={
                            index === activeIndex
                                ? "active"
                                : ""
                        }
                        onClick={() => setActiveIndex(index)}
                        aria-label={`Chọn phim ${movie.title}`}
                    />
                ))}

            </div>

        </section>
    );
}

export default HeroBanner;
