
import { useEffect, useMemo, useState } from "react";

import reviewsData from "../../../data/reviews.js";
import "./MovieReviews.css";

//=================== Tài khoản demo ========================

const DEMO_USER_ID = "demo-user";
const DEMO_USER_NAME = "Bạn";

//=================== Component MovieReviews ========================

function MovieReviews({ movieId }) {

    //=================== Khởi tạo trạng thái ========================

    const [reviews, setReviews] = useState(
        () => reviewsData.filter(
            (review) => review.movieId === movieId
        )
    );

    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [content, setContent] = useState("");

    const [editingReviewId, setEditingReviewId] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    //=================== Cập nhật khi đổi phim ========================

    useEffect(() => {
        setReviews(
            reviewsData.filter(
                (review) => review.movieId === movieId
            )
        );

        setRating(5);
        setHoverRating(0);
        setContent("");
        setEditingReviewId(null);
        setErrorMessage("");
        setSuccessMessage("");
    }, [movieId]);

    //=================== Lọc và sắp xếp đánh giá ========================

    const sortedReviews = useMemo(() => {
        return [...reviews].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }, [reviews]);

    //=================== Tính điểm trung bình ========================

    const averageRating = useMemo(() => {
        if (reviews.length === 0) return 0;

        const total = reviews.reduce(
            (sum, review) => sum + review.rating,
            0
        );

        return total / reviews.length;
    }, [reviews]);

    //=================== Thống kê số lượng sao ========================

    const ratingStatistics = useMemo(() => {
        return [5, 4, 3, 2, 1].map((score) => {
            const count = reviews.filter(
                (review) => review.rating === score
            ).length;

            return {
                score,
                count,
                percentage: reviews.length > 0
                    ? (count / reviews.length) * 100
                    : 0
            };
        });
    }, [reviews]);

    //=================== Tìm đánh giá của tài khoản demo ========================

    const myReview = reviews.find(
        (review) => review.authorId === DEMO_USER_ID
    );

    //=================== Định dạng ngày đánh giá ========================

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    //=================== Bắt đầu chỉnh sửa đánh giá ========================

    const handleEditReview = (review) => {
        setEditingReviewId(review.id);
        setRating(review.rating);
        setContent(review.content);
        setHoverRating(0);
        setErrorMessage("");
        setSuccessMessage("");

        document.getElementById("movie-review-form")?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    };

    //=================== Hủy chỉnh sửa ========================

    const handleCancelEdit = () => {
        setEditingReviewId(null);
        setRating(5);
        setHoverRating(0);
        setContent("");
        setErrorMessage("");
        setSuccessMessage("");
    };

    //=================== Gửi hoặc cập nhật đánh giá ========================

    const handleSubmitReview = (event) => {
        event.preventDefault();

        setErrorMessage("");
        setSuccessMessage("");

        if (!content.trim()) {
            setErrorMessage("Vui lòng nhập nội dung đánh giá.");
            return;
        }

        if (content.trim().length < 10) {
            setErrorMessage("Nội dung đánh giá cần ít nhất 10 ký tự.");
            return;
        }

        if (editingReviewId !== null) {

            //=================== Cập nhật đánh giá hiện tại ========================

            setReviews((previousReviews) =>
                previousReviews.map((review) =>
                    review.id === editingReviewId
                        ? {
                            ...review,
                            rating,
                            content: content.trim(),
                            createdAt: new Date().toISOString()
                        }
                        : review
                )
            );

            setSuccessMessage("Cập nhật đánh giá thành công!");

        } else {

            //=================== Kiểm tra đánh giá trùng ========================

            const existingReview = reviews.find(
                (review) => review.authorId === DEMO_USER_ID
            );

            if (existingReview) {
                setErrorMessage(
                    "Bạn đã đánh giá phim này. Hãy chỉnh sửa đánh giá hiện tại."
                );
                return;
            }

            //=================== Tạo đánh giá mới ========================

            const newReview = {
                id: Date.now(),
                movieId,
                authorId: DEMO_USER_ID,
                userName: DEMO_USER_NAME,
                rating,
                content: content.trim(),
                createdAt: new Date().toISOString()
            };

            setReviews((previousReviews) => [
                ...previousReviews,
                newReview
            ]);

            setSuccessMessage("Gửi đánh giá thành công!");
        }

        //=================== Đặt lại biểu mẫu ========================

        setEditingReviewId(null);
        setRating(5);
        setHoverRating(0);
        setContent("");
    };

    //=================== Hiển thị MovieReviews ========================

    return (
      <div className="movie-reviews">
        {/*=================== Tiêu đề ========================*/}

        <div className="movie-reviews-header">
          <div>
            <span className="movie-reviews-subtitle">ĐÁNH GIÁ TỪ KHÁN GIẢ</span>

            <h2>Đánh giá phim</h2>

            <p>Chia sẻ cảm nhận của bạn về bộ phim.</p>
          </div>
        </div>

        {/*=================== Tổng quan đánh giá ========================*/}

        <div className="movie-reviews-overview">
          <div className="movie-reviews-average">
            <strong>
              {reviews.length > 0 ? averageRating.toFixed(1) : "0.0"}
            </strong>

            <div className="movie-reviews-average-stars">
              {"★".repeat(Math.round(averageRating))}
              {"☆".repeat(5 - Math.round(averageRating))}
            </div>

            <span>{reviews.length} lượt đánh giá</span>
          </div>

          {/*=================== Thống kê số sao ========================*/}

          <div className="movie-reviews-statistics">
            {ratingStatistics.map((item) => (
              <div className="movie-reviews-stat-row" key={item.score}>
                <span className="movie-reviews-stat-label">
                  {item.score} <span>★</span>
                </span>

                <div className="movie-reviews-stat-track">
                  <div
                    className="movie-reviews-stat-fill"
                    style={{
                      width: `${item.percentage}%`,
                    }}
                  />
                </div>

                <span className="movie-reviews-stat-count">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/*=================== Form đánh giá ========================*/}

        <div className="movie-review-form-wrapper" id="movie-review-form">
          <div className="movie-review-form-heading">
            <h3>
              {editingReviewId !== null
                ? "Chỉnh sửa đánh giá"
                : myReview
                  ? "Đánh giá của bạn"
                  : "Viết đánh giá của bạn"}
            </h3>

            <p>
              {editingReviewId !== null
                ? "Cập nhật số sao và nội dung đánh giá."
                : "Hãy chia sẻ trải nghiệm của bạn sau khi xem phim."}
            </p>
          </div>

          <form onSubmit={handleSubmitReview}>
            {/*=================== Chọn số sao ========================*/}

            <div className="movie-review-rating-input">
              <label>Đánh giá của bạn</label>

              <div className="movie-review-star-picker">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    className={star <= (hoverRating || rating) ? "active" : ""}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={`${star} sao`}
                    title={`${star} sao`}
                  >
                    ★
                  </button>
                ))}

                <span>{rating}/5 sao</span>
              </div>
            </div>

            {/*=================== Nội dung đánh giá ========================*/}

            <div className="movie-review-content-input">
              <label htmlFor="movieReviewContent">Nội dung đánh giá</label>

              <textarea
                id="movieReviewContent"
                rows="4"
                maxLength="1000"
                placeholder="Hãy chia sẻ cảm nhận của bạn về bộ phim..."
                value={content}
                onChange={(event) => setContent(event.target.value)}
              />

              <span className="movie-review-character-count">
                {content.length}/1000 ký tự
              </span>
            </div>

            {/*=================== Thông báo ========================*/}

            {errorMessage && (
              <p className="movie-review-message error">{errorMessage}</p>
            )}

            {successMessage && (
              <p className="movie-review-message success">{successMessage}</p>
            )}

            {/*=================== Nút thao tác ========================*/}

            <button type="submit" className="movie-review-submit">
              <i
                className={`bi ${
                  editingReviewId !== null ? "bi-check2-circle" : "bi-send-fill"
                }`}
              ></i>

              {editingReviewId !== null ? "Lưu thay đổi" : "Gửi đánh giá"}
            </button>
          </form>
        </div>

        {/*=================== Danh sách đánh giá ========================*/}

        <div className="movie-reviews-list">
          <div className="movie-reviews-list-heading">
            <h3>Nhận xét từ khán giả</h3>

            <span>{reviews.length} đánh giá</span>
          </div>

          {sortedReviews.length > 0 ? (
            sortedReviews.map((review) => (
              <article
                className={`movie-review-item ${
                  review.authorId === DEMO_USER_ID
                    ? "movie-review-item--mine"
                    : ""
                }`}
                key={review.id}
              >
                {/*=================== Thông tin người đánh giá ========================*/}

                <div className="movie-review-item-header">
                  <div className="movie-review-user">
                    <div className="movie-review-avatar">
                      {review.userName.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h4>{review.userName}</h4>

                      <span>{formatDate(review.createdAt)}</span>
                    </div>
                  </div>

                  <div className="movie-review-item-rating">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </div>
                </div>

                {/*=================== Nội dung đánh giá ========================*/}

                <p className="movie-review-item-content">{review.content}</p>

                {/*=================== Chỉnh sửa đánh giá của mình ========================*/}

                {review.authorId === DEMO_USER_ID && (
                  <button
                    type="button"
                    className="movie-review-edit"
                    onClick={() => handleEditReview(review)}
                  >
                    <i className="bi bi-pencil-square"></i>
                    Chỉnh sửa đánh giá
                  </button>
                )}
              </article>
            ))
          ) : (
            <div className="movie-reviews-empty">
              <i className="bi bi-chat-square-text"></i>

              <h4>Chưa có đánh giá nào</h4>

              <p>Hãy là người đầu tiên chia sẻ cảm nhận về bộ phim này.</p>
            </div>
          )}
        </div>
      </div>
    );
}

export default MovieReviews;
