
import "./AccountOverview.css";

const DEFAULT_AVATAR = "https://placehold.co/120x120?text=User";

function AccountOverview({ user }) {
    return (
        <div className="account-overview-content">
            <div className="account-overview-welcome">
                <div>
                    <span>WELCOME BACK</span>

                    <h2>
                        Xin chào, {user?.fullName || "bạn"}!
                    </h2>

                    <p>
                        Chào mừng bạn quay trở lại ViewBookCinemas.
                        Quản lý tài khoản của bạn tại đây.
                    </p>
                </div>

                <div className="account-overview-welcome-icon">
                    <i className="bi bi-camera-reels"></i>
                </div>
            </div>

            <div className="account-overview-card">
                <div className="account-overview-card-header">
                    <div>
                        <h3>Thông tin tài khoản</h3>
                        <p>Thông tin cơ bản của bạn tại VBC.</p>
                    </div>

                    <span className="account-overview-status">
                        <i className="bi bi-check-circle-fill"></i>
                        Đang hoạt động
                    </span>
                </div>

                <div className="account-overview-user">
                    <div className="account-overview-avatar">
                        <img
                            src={user?.avatarUrl || DEFAULT_AVATAR}
                            alt="Ảnh đại diện"
                            onError={(event) => {
                                event.currentTarget.src = DEFAULT_AVATAR;
                            }}
                        />
                    </div>

                    <div>
                        <h4>{user?.fullName || "Người dùng"}</h4>
                        <p>@{user?.username || "username"}</p>
                    </div>
                </div>

                <div className="account-overview-information">
                    <div className="account-overview-information-item">
                        <span>Email</span>
                        <strong>{user?.email || "Chưa cập nhật"}</strong>
                    </div>

                    <div className="account-overview-information-item">
                        <span>Số điện thoại</span>
                        <strong>
                            {user?.phoneNumber || "Chưa cập nhật"}
                        </strong>
                    </div>

                    <div className="account-overview-information-item">
                        <span>Tên đăng nhập</span>
                        <strong>
                            {user?.username || "Chưa cập nhật"}
                        </strong>
                    </div>

                    <div className="account-overview-information-item">
                        <span>Ngày sinh</span>
                        <strong>
                            {user?.dateOfBirth || "Chưa cập nhật"}
                        </strong>
                    </div>
                </div>
            </div>

            <div className="account-overview-tips">
                <div className="account-overview-tips-icon">
                    <i className="bi bi-lightbulb"></i>
                </div>

                <div>
                    <h4>Mẹo dành cho bạn</h4>

                    <p>
                        Hãy cập nhật thông tin cá nhân và sử dụng
                        mật khẩu mạnh để bảo vệ tài khoản của bạn.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AccountOverview;
