
import { Link } from "react-router-dom";

import { movies } from "../../../data/movies.js";
import { cinemas } from "../../../data/cinemas.js";
import { showtimes } from "../../../data/showtimes.js";
import { products } from "../../../data/products.js";
import { promotions } from "../../../data/promotions.js";

const statistics = [
    {
        title: "Tổng số phim",
        value: movies.length,
        icon: "bi-film",
        color: "blue",
        link: "/admin/movies"
    },
    {
        title: "Rạp chiếu",
        value: cinemas.length,
        icon: "bi-building",
        color: "purple",
        link: "/admin/cinemas"
    },
    {
        title: "Lịch chiếu",
        value: showtimes.length,
        icon: "bi-calendar-event",
        color: "orange",
        link: "/admin/showtimes"
    },
    {
        title: "Sản phẩm",
        value: products.length,
        icon: "bi-box-seam",
        color: "green",
        link: "/admin/products"
    }
];

function Dashboard() {
    const recentShowtimes = [...showtimes]
        .sort(
            (a, b) =>
                new Date(a.startTime) - new Date(b.startTime)
        )
        .slice(0, 5);

    const activePromotions = promotions.filter(
        (promotion) => promotion.status === "Active"
    ).length;

    const activeMovies = movies.filter(
        (movie) => movie.status === "Đang chiếu"
    ).length;

    const formatDate = (value) => {
        return new Date(value).toLocaleDateString("vi-VN");
    };

    const formatTime = (value) => {
        return new Date(value).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className="admin-dashboard">
            {/* Page Introduction */}

            <div className="admin-page-intro">
                <div>
                    <h3>Xin chào, Administrator!</h3>
                    <p>
                        Chào mừng bạn đến với hệ thống quản lý
                        ViewBookCinemas.
                    </p>
                </div>

                <div className="admin-date">
                    <i className="bi bi-calendar3"></i>
                    {new Date().toLocaleDateString("vi-VN")}
                </div>
            </div>

            {/* Statistics */}

            <div className="admin-statistics">
                {statistics.map((item) => (
                    <Link
                        to={item.link}
                        className="admin-stat-card"
                        key={item.title}
                    >
                        <div className="admin-stat-card-top">
                            <div className={`admin-stat-icon ${item.color}`}>
                                <i className={`bi ${item.icon}`}></i>
                            </div>

                            <i className="bi bi-arrow-up-right admin-stat-arrow"></i>
                        </div>

                        <div className="admin-stat-value">
                            {item.value}
                        </div>

                        <div className="admin-stat-title">
                            {item.title}
                        </div>
                    </Link>
                ))}
            </div>

            {/* Overview */}

            <div className="admin-dashboard-grid">
                <section className="admin-panel admin-overview-panel">
                    <div className="admin-panel-heading">
                        <div>
                            <h5>Tổng quan hệ thống</h5>
                            <p>Trạng thái dữ liệu hiện tại</p>
                        </div>

                        <i className="bi bi-activity"></i>
                    </div>

                    <div className="admin-overview-list">
                        <div className="admin-overview-item">
                            <span>Phim đang chiếu</span>
                            <strong>{activeMovies}</strong>
                        </div>

                        <div className="admin-overview-item">
                            <span>Rạp đang hoạt động</span>
                            <strong>
                                {cinemas.filter(
                                    (cinema) => cinema.status === "Active"
                                ).length}
                            </strong>
                        </div>

                        <div className="admin-overview-item">
                            <span>Lịch chiếu đã tạo</span>
                            <strong>{showtimes.length}</strong>
                        </div>

                        <div className="admin-overview-item">
                            <span>Khuyến mãi đang hoạt động</span>
                            <strong>{activePromotions}</strong>
                        </div>
                    </div>
                </section>

                <section className="admin-panel admin-notice-panel">
                    <div className="admin-panel-heading">
                        <div>
                            <h5>Thông tin phát triển</h5>
                            <p>Tiến độ hệ thống quản trị</p>
                        </div>

                        <i className="bi bi-info-circle"></i>
                    </div>

                    <div className="admin-notice-content">
                        <div className="admin-notice-icon">
                            <i className="bi bi-tools"></i>
                        </div>

                        <div>
                            <strong>Đang phát triển Admin</strong>
                            <p>
                                Các chức năng quản lý sẽ được hoàn thiện
                                lần lượt theo từng phân hệ.
                            </p>
                        </div>
                    </div>

                    <div className="admin-notice-footer">
                        <span>Giai đoạn hiện tại</span>
                        <strong>Admin Foundation</strong>
                    </div>
                </section>
            </div>

            {/* Recent Showtimes */}

            <section className="admin-panel admin-showtimes-panel">
                <div className="admin-panel-heading">
                    <div>
                        <h5>Lịch chiếu gần đây</h5>
                        <p>Dữ liệu lấy từ danh sách lịch chiếu hiện tại</p>
                    </div>

                    <Link to="/admin/showtimes">
                        Xem tất cả
                        <i className="bi bi-arrow-right"></i>
                    </Link>
                </div>

                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Phim</th>
                                <th>Rạp chiếu</th>
                                <th>Phòng</th>
                                <th>Ngày chiếu</th>
                                <th>Giờ chiếu</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>

                        <tbody>
                            {recentShowtimes.map((showtime) => {
                                const movie = movies.find(
                                    (item) => item.id === showtime.movieId
                                );

                                const cinema = cinemas.find(
                                    (item) => item.id === showtime.cinemaId
                                );

                                return (
                                    <tr key={showtime.id}>
                                        <td>
                                            <strong>
                                                {movie?.title || "Chưa xác định"}
                                            </strong>
                                        </td>

                                        <td>
                                            {cinema?.name || "Chưa xác định"}
                                        </td>

                                        <td>{showtime.roomName}</td>

                                        <td>
                                            {formatDate(showtime.startTime)}
                                        </td>

                                        <td>
                                            {formatTime(showtime.startTime)}
                                        </td>

                                        <td>
                                            <span className="admin-status-badge">
                                                {showtime.status === "Scheduled"
                                                    ? "Đã lên lịch"
                                                    : showtime.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

export default Dashboard;
