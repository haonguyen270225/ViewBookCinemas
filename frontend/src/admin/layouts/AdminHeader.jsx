
import { useLocation } from "react-router-dom";

const pageTitles = {
    "/admin": "Dashboard",
    "/admin/dashboard": "Dashboard",
    "/admin/movies": "Quản lý phim",
    "/admin/genres": "Quản lý thể loại",
    "/admin/cinemas": "Quản lý rạp chiếu",
    "/admin/rooms": "Quản lý phòng chiếu",
    "/admin/seats": "Quản lý ghế ngồi",
    "/admin/showtimes": "Quản lý lịch chiếu",
    "/admin/bookings": "Quản lý đặt vé",
    "/admin/tickets": "Quản lý vé",
    "/admin/payments": "Quản lý thanh toán",
    "/admin/customers": "Quản lý khách hàng",
    "/admin/products": "Quản lý sản phẩm",
    "/admin/categories": "Quản lý danh mục",
    "/admin/combos": "Quản lý combo",
    "/admin/promotions": "Quản lý khuyến mãi",
    "/admin/reports": "Báo cáo thống kê",
    "/admin/settings": "Cài đặt hệ thống"
};

function AdminHeader({ onMenuClick }) {
    const location = useLocation();

    const pageTitle =
        pageTitles[location.pathname] || "Quản trị hệ thống";

    return (
        <header className="admin-header">
            <div className="admin-header-left">
                <button
                    type="button"
                    className="admin-menu-toggle"
                    onClick={onMenuClick}
                    aria-label="Mở menu"
                >
                    <i className="bi bi-list"></i>
                </button>

                <div className="admin-header-heading">
                    <h5>{pageTitle}</h5>
                    <span>ViewBookCinemas / Admin</span>
                </div>
            </div>

            <div className="admin-header-right">
                <button
                    type="button"
                    className="admin-header-icon"
                    aria-label="Thông báo"
                >
                    <i className="bi bi-bell"></i>
                </button>

                <div className="admin-profile">
                    <div className="admin-profile-avatar">
                        <i className="bi bi-person-fill"></i>
                    </div>

                    <div className="admin-profile-info">
                        <strong>Administrator</strong>
                        <span>Quản trị viên</span>
                    </div>

                    <i className="bi bi-chevron-down admin-profile-arrow"></i>
                </div>
            </div>
        </header>
    );
}

export default AdminHeader;
