
import { useState } from "react";
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
    // Tất cả nhóm menu mặc định đóng khi vào Admin hoặc tải lại trang
    const [openGroups, setOpenGroups] = useState(() => {
        return Object.fromEntries(
            menuGroups.map((group) => [group.title, false])
        );
    });

    const handleToggleGroup = (groupTitle) => {
        setOpenGroups((current) => ({
            ...current,
            [groupTitle]: !current[groupTitle]
        }));
    };

    return (
        <aside className={`admin-sidebar ${isOpen ? "is-open" : ""}`}>
            {/* Logo */}
            <div className="admin-sidebar-brand">
                <div className="admin-brand-icon">
                    <i className="bi bi-camera-reels-fill"></i>
                </div>

                <div className="admin-brand-text">
                    <h5>ViewBook</h5>
                    <span>ADMINISTRATION</span>
                </div>
            </div>

            {/* Menu */}
            <div className="admin-sidebar-menu">
                {menuGroups.map((group, index) => {
                    const isExpanded = openGroups[group.title];
                    const menuId = `admin-menu-group-${index}`;

                    return (
                        <div
                            className={`admin-menu-group ${
                                isExpanded ? "expanded" : "collapsed"
                            }`}
                            key={group.title}
                        >
                            <button
                                type="button"
                                className="admin-menu-title admin-menu-group-toggle"
                                onClick={() => handleToggleGroup(group.title)}
                                aria-expanded={isExpanded}
                                aria-controls={menuId}
                            >
                                <span>{group.title}</span>

                                <i
                                    className={`bi ${
                                        isExpanded
                                            ? "bi-chevron-down"
                                            : "bi-chevron-right"
                                    }`}
                                ></i>
                            </button>

                            {/* Wrapper luôn tồn tại để tạo hiệu ứng đóng/mở */}
                            <div
                                id={menuId}
                                className={`admin-menu-items-wrapper ${
                                    isExpanded ? "expanded" : ""
                                }`}
                                aria-hidden={!isExpanded}
                            >
                                <div className="admin-menu-items">
                                    {group.items.map((item) => (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            end={item.path === "/admin"}
                                            tabIndex={isExpanded ? 0 : -1}
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
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
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
