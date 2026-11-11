
import "./AccountSidebar.css";

//========================= Component AccountSidebar ========================

function AccountSidebar({ user, activeTab, onTabChange }) {

    //========================= Lấy chữ cái đại diện ========================

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

    //========================= Danh sách điều hướng ========================

    const menuItems = [
        {
            id: "overview",
            label: "Tổng quan",
            icon: "bi-grid"
        },
        {
            id: "profile",
            label: "Thông tin cá nhân",
            icon: "bi-person"
        },
        {
            id: "password",
            label: "Bảo mật tài khoản",
            icon: "bi-shield-lock"
        }
    ];

    //========================= Render giao diện ========================

    return (
        <aside className="account-sidebar">

            <div className="account-sidebar-user">
                <div className="account-sidebar-avatar">
                    {getInitials(user?.fullName)}
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

                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        className={`account-sidebar-item ${
                            activeTab === item.id ? "active" : ""
                        }`}
                        onClick={() => onTabChange(item.id)}
                    >
                        <i className={`bi ${item.icon}`}></i>
                        <span>{item.label}</span>

                        {activeTab === item.id && (
                            <i className="bi bi-chevron-right account-sidebar-arrow"></i>
                        )}
                    </button>
                ))}
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
