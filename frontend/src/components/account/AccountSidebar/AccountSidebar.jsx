
import "./AccountSidebar.css";

import {
    LayoutDashboard,
    UserRound,
    ShieldCheck,
    Ticket
} from "lucide-react";

const DEFAULT_AVATAR = "https://placehold.co/120x120?text=User";

function AccountSidebar({ user, activeTab, onTabChange }) {
    const getInitials = (fullName) => {
        if (!fullName) return "U";

        const words = fullName.trim().split(/\s+/);

        if (words.length === 1) {
            return words[0].charAt(0).toUpperCase();
        }

        return (
            words[0].charAt(0) +
            words[words.length - 1].charAt(0)
        ).toUpperCase();
    };

    const menuItems = [
        {
            id: "overview",
            label: "Tổng quan",
            icon: LayoutDashboard
        },
        {
            id: "profile",
            label: "Thông tin cá nhân",
            icon: UserRound
        },
        {
            id: "password",
            label: "Bảo mật tài khoản",
            icon: ShieldCheck
        },
        {
            id: "tickets",
            label: "Lịch sử đặt vé",
            icon: Ticket
        }
    ];

    return (
        <aside className="account-sidebar">
            <div className="account-sidebar-user">
                <div className="account-sidebar-avatar">
                    <img
                        src={user?.avatarUrl || DEFAULT_AVATAR}
                        alt="Ảnh đại diện"
                        onError={(event) => {
                            event.currentTarget.style.display = "none";
                            event.currentTarget.parentElement.classList.add(
                                "account-sidebar-avatar-fallback"
                            );
                            event.currentTarget.parentElement.textContent =
                                getInitials(user?.fullName);
                        }}
                    />
                </div>

                <h3>{user?.fullName || "Người dùng"}</h3>

                <p>{user?.email}</p>

                <span className="account-sidebar-badge">
                    <i className="bi bi-patch-check-fill"></i>
                    Thành viên VBC
                </span>
            </div>

            <div className="account-sidebar-divider"></div>

            <nav className="account-sidebar-menu">
                <span className="account-sidebar-heading">
                    QUẢN LÝ TÀI KHOẢN
                </span>

                {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            type="button"
                            className={`account-sidebar-item ${
                                activeTab === item.id ? "active" : ""
                            }`}
                            onClick={() => onTabChange(item.id)}
                        >
                            <Icon size={18} strokeWidth={2} />

                            <span>{item.label}</span>

                            {activeTab === item.id && (
                                <i className="bi bi-chevron-right account-sidebar-arrow"></i>
                            )}
                        </button>
                    );
                })}
            </nav>

            <div className="account-sidebar-note">
                <i className="bi bi-info-circle"></i>

                <p>
                    Quản lý thông tin và bảo mật tài khoản
                    để có trải nghiệm tốt hơn tại VBC.
                </p>
            </div>
        </aside>
    );
}

export default AccountSidebar;
