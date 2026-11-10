
import { useEffect, useMemo, useState } from "react";
import reviewsData from "../../../data/reviews.js";
import "./MovieReviews.css";

function MovieReviews({ movieId }) {

    //=================== State ========================

    const [movieReviews, setMovieReviews] = useState(() =>
        reviewsData.filter(
            (review) => String(review.movieId) === String(movieId)
        )
    );

    const [userName, setUserName] = useState("");
    const [rating, setRating] = useState(10);
    const [content, setContent] = useState("");
    const [error, setError] = useState("");

    //=================== Load Reviews ========================

    useEffect(() => {
        const filteredReviews = reviewsData.filter(
            (review) => String(review.movieId) === String(movieId)
        );

        setMovieReviews(filteredReviews);
        setRating(10);
        setContent("");
        setError("");
    }, [movieId]);

    //=================== Review Statistics ========================

    const averageRating = useMemo(() => {
        if (movieReviews.length === 0) return 0;

        const totalRating = movieReviews.reduce(
            (total, review) => total + review.rating,
            0
        );

        return totalRating / movieReviews.length;
    }, [movieReviews]);

    const ratingStatistics = useMemo(() => {
        return Array.from({ length: 10 }, (_, index) => {
            const score = 10 - index;

            const count = movieReviews.filter(
                (review) => review.rating === score
            ).length;

            const percentage = movieReviews.length > 0
                ? (count / movieReviews.length) * 100
                : 0;

            return {
                score,
                count,
                percentage
            };
        });
    }, [movieReviews]);

    const sortedReviews = useMemo(() => {
        return [...movieReviews].sort(
            (a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
        );
    }, [movieReviews]);

    //=================== Submit Review ========================

    const handleSubmitReview = (event) => {
        event.preventDefault();

        const trimmedName = userName.trim();
        const trimmedContent = content.trim();

        if (!trimmedName) {
            setError("Vui lòng nhập tên người đánh giá.");
            return;
        }

        if (!trimmedContent) {
            setError("Vui lòng nhập nội dung đánh giá.");
            return;
        }

        const newReview = {
            id: Date.now(),
            movieId: movieId,
            userName: trimmedName,
            rating: Number(rating),
            content: trimmedContent,
            createdAt: new Date().toISOString()
        };

        setMovieReviews((previousReviews) => [
            newReview,
            ...previousReviews
        ]);

        setUserName("");
        setRating(10);
        setContent("");
        setError("");
    };

    //=================== Format Date ========================

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    //=================== Render ========================

    return (
        <section className="movie-reviews">

            {/*=================== Section Header ========================*/}

            <div className="movie-reviews-header">
                <div>
                    <h2 className="movie-reviews-title">
                        Đánh giá từ người xem
                    </h2>

                    <p className="movie-reviews-subtitle">
                        Chia sẻ cảm nhận và đánh giá của bạn về bộ phim.
                    </p>
                </div>
            </div>

            {/*=================== Rating Overview ========================*/}

            <div className="movie-reviews-overview">

                <div className="movie-reviews-average">
                    <span className="movie-reviews-average-score">
                        {averageRating.toFixed(1)}
                    </span>

                    <span className="movie-reviews-average-max">
                        / 10
                    </span>

                    <div className="movie-reviews-average-stars">
                        <span>★</span>
                        <span className="movie-reviews-total">
                            {movieReviews.length} lượt đánh giá
                        </span>
                    </div>
                </div>

                <div className="movie-reviews-statistics">

                    {ratingStatistics.map((item) => (
                        <div
                            className="movie-reviews-stat-row"
                            key={item.score}
                        >
                            <span className="movie-reviews-stat-score">
                                {item.score}
                            </span>

                            <div className="movie-reviews-stat-track">
                                <div
                                    className="movie-reviews-stat-fill"
                                    style={{
                                        width: `${item.percentage}%`
                                    }}
                                />
                            </div>

                            <span className="movie-reviews-stat-count">
                                {item.count}
                            </span>
                        </div>
                    ))}

                </div>

            </div>

            {/*=================== Review Form ========================*/}

            <div className="movie-review-form-wrapper">

                <h3 className="movie-review-form-title">
                    Viết đánh giá của bạn
                </h3>

                <form onSubmit={handleSubmitReview}>

                    <div className="movie-review-rating-input">

                        <label className="movie-review-label">
                            Mức điểm đánh giá
                        </label>

                        <div className="movie-review-score-options">

                            {Array.from(
                                { length: 10 },
                                (_, index) => index + 1
                            ).map((score) => (
                                <button
                                    key={score}
                                    type="button"
                                    className={`movie-review-score-btn ${
                                        rating === score ? "active" : ""
                                    }`}
                                    onClick={() => setRating(score)}
                                    aria-label={`Đánh giá ${score} trên 10`}
                                    aria-pressed={rating === score}
                                >
                                    {score}
                                </button>
                            ))}

                        </div>

                        <span className="movie-review-selected-score">
                            Bạn đang chọn: {rating}/10
                        </span>

                    </div>

                    <div className="movie-review-input-group">

                        <label
                            htmlFor="review-user-name"
                            className="movie-review-label"
                        >
                            Tên người đánh giá
                        </label>

                        <input
                            id="review-user-name"
                            type="text"
                            className="movie-review-input"
                            placeholder="Nhập tên của bạn..."
                            value={userName}
                            maxLength={100}
                            onChange={(event) =>
                                setUserName(event.target.value)
                            }
                        />

                    </div>

                    <div className="movie-review-input-group">

                        <label
                            htmlFor="review-content"
                            className="movie-review-label"
                        >
                            Nội dung đánh giá
                        </label>

                        <textarea
                            id="review-content"
                            className="movie-review-textarea"
                            placeholder="Chia sẻ cảm nhận của bạn về bộ phim..."
                            rows={4}
                            maxLength={1000}
                            value={content}
                            onChange={(event) =>
                                setContent(event.target.value)
                            }
                        />

                        <div className="movie-review-character-count">
                            {content.length}/1000 ký tự
                        </div>

                    </div>

                    {error && (
                        <div className="movie-review-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="movie-review-submit"
                    >
                        <span>Gửi đánh giá</span>
                        <span className="movie-review-submit-icon">
                            ➤
                        </span>
                    </button>

                </form>

            </div>

            {/*=================== Review List ========================*/}

            <div className="movie-reviews-list-section">

                <div className="movie-reviews-list-header">
                    <h3 className="movie-reviews-list-title">
                        Đánh giá của người xem
                    </h3>

                    <span className="movie-reviews-list-count">
                        {movieReviews.length} đánh giá
                    </span>
                </div>

                {sortedReviews.length > 0 ? (

                    <div className="movie-reviews-list">

                        {sortedReviews.map((review) => (
                            <article
                                className="movie-review-item"
                                key={review.id}
                            >

                                <div className="movie-review-item-header">

                                    <div className="movie-review-user">

                                        <div className="movie-review-avatar">
                                            {review.userName
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>

                                        <div className="movie-review-user-info">

                                            <h4 className="movie-review-user-name">
                                                {review.userName}
                                            </h4>

                                            <span className="movie-review-date">
                                                {formatDate(review.createdAt)}
                                            </span>

                                        </div>

                                    </div>

                                    <div className="movie-review-rating-badge">
                                        <span>★</span>
                                        {review.rating}/10
                                    </div>

                                </div>

                                <p className="movie-review-content">
                                    {review.content}
                                </p>

                            </article>
                        ))}

                    </div>

                ) : (

                    <div className="movie-reviews-empty">
                        <div className="movie-reviews-empty-icon">
                            ★
                        </div>

                        <h4>Chưa có đánh giá nào</h4>

                        <p>
                            Hãy là người đầu tiên chia sẻ cảm nhận
                            về bộ phim này nhé!
                        </p>
                    </div>

                )}

            </div>

        </section>
    );
}

export default MovieReviews;
