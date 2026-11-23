
import { NavLink } from "react-router-dom";

const menuGroups = [
    {
        title: "TỔNG QUAN",
        items: [
            {
                label: "Dashboard",
                path: "/admin",
                icon: "bi-grid-1x2"
            }
        ]
    },
    {
        title: "QUẢN LÝ NỘI DUNG",
        items: [
            {
                label: "Phim",
                path: "/admin/movies",
                icon: "bi-film"
            },
            {
                label: "Thể loại",
                path: "/admin/genres",
                icon: "bi-tags"
            },
            {
                label: "Rạp chiếu",
                path: "/admin/cinemas",
                icon: "bi-building"
            },
            {
                label: "Phòng chiếu",
                path: "/admin/rooms",
                icon: "bi-display"
            },
            {
                label: "Ghế ngồi",
                path: "/admin/seats",
                icon: "bi-grid-3x3"
            },
            {
                label: "Lịch chiếu",
                path: "/admin/showtimes",
                icon: "bi-calendar-event"
            }
        ]
    },
    {
        title: "QUẢN LÝ GIAO DỊCH",
        items: [
            {
                label: "Đặt vé",
                path: "/admin/bookings",
                icon: "bi-ticket-perforated"
            },
            {
                label: "Vé xem phim",
                path: "/admin/tickets",
                icon: "bi-ticket"
            },
            {
                label: "Thanh toán",
                path: "/admin/payments",
                icon: "bi-credit-card"
            }
        ]
    },
    {
        title: "QUẢN LÝ DỊCH VỤ",
        items: [
            {
                label: "Khách hàng",
                path: "/admin/customers",
                icon: "bi-people"
            },
            {
                label: "Sản phẩm",
                path: "/admin/products",
                icon: "bi-box-seam"
            },
            {
                label: "Danh mục",
                path: "/admin/categories",
                icon: "bi-collection"
            },
            {
                label: "Combo",
                path: "/admin/combos",
                icon: "bi-basket"
            },
            {
                label: "Khuyến mãi",
                path: "/admin/promotions",
                icon: "bi-gift"
            }
        ]
    },
    {
        title: "HỆ THỐNG",
        items: [
            {
                label: "Báo cáo",
                path: "/admin/reports",
                icon: "bi-bar-chart"
            },
            {
                label: "Cài đặt",
                path: "/admin/settings",
                icon: "bi-gear"
            }
        ]
    }
];

function AdminSidebar({ isOpen, onNavigate }) {
    return (
        <aside
            className={`admin-sidebar ${isOpen ? "is-open" : ""}`}
        >
            <div className="admin-sidebar-brand">
                <div className="admin-brand-icon">
                    <i className="bi bi-camera-reels-fill"></i>
                </div>

                <div className="admin-brand-text">
                    <h5>ViewBook</h5>
                    <span>ADMINISTRATION</span>
                </div>
            </div>

            <div className="admin-sidebar-menu">
                {menuGroups.map((group) => (
                    <div
                        className="admin-menu-group"
                        key={group.title}
                    >
                        <p className="admin-menu-title">
                            {group.title}
                        </p>

                        {group.items.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === "/admin"}
                                className={({ isActive }) =>
                                    `admin-menu-item ${
                                        isActive ? "active" : ""
                                    }`
                                }
                                onClick={onNavigate}
                            >
                                <i className={`bi ${item.icon}`}></i>
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                ))}
            </div>

            <div className="admin-sidebar-footer">
                <div className="admin-sidebar-footer-icon">
                    <i className="bi bi-shield-check"></i>
                </div>

                <div>
                    <strong>ViewBookCinemas</strong>
                    <span>Management System</span>
                </div>
            </div>
        </aside>
    );
}

export default AdminSidebar;
