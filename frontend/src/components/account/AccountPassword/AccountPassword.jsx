
import "./AccountPassword.css";

//========================= Component AccountPassword ========================

function AccountPassword({
    passwordData,
    isChangingPassword,
    onPasswordChange,
    onChangePassword
}) {

    //========================= Render giao diện ========================

    return (
        <section className="account-password">

            <div className="account-password-header">
                <div className="account-password-icon">
                    <i className="bi bi-shield-lock"></i>
                </div>

                <div>
                    <span className="account-content-label">SECURITY SETTINGS</span>
                    <h2>Bảo mật tài khoản</h2>
                    <p>
                        Thay đổi mật khẩu để bảo vệ tài khoản của bạn.
                    </p>
                </div>
            </div>

            <div className="account-password-notice">
                <i className="bi bi-info-circle"></i>
                <p>
                    Mật khẩu mới cần có ít nhất 8 ký tự.
                    Không sử dụng mật khẩu dễ đoán.
                </p>
            </div>

            <form onSubmit={onChangePassword}>

                <div className="row g-3">

                    <div className="col-12">
                        <label className="form-label">
                            Mật khẩu hiện tại
                        </label>

                        <input
                            type="password"
                            name="oldPassword"
                            className="form-control account-input"
                            value={passwordData.oldPassword}
                            onChange={onPasswordChange}
                            placeholder="Nhập mật khẩu hiện tại"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">
                            Mật khẩu mới
                        </label>

                        <input
                            type="password"
                            name="newPassword"
                            className="form-control account-input"
                            value={passwordData.newPassword}
                            onChange={onPasswordChange}
                            placeholder="Tối thiểu 8 ký tự"
                            minLength={8}
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">
                            Xác nhận mật khẩu mới
                        </label>

                        <input
                            type="password"
                            name="confirmPassword"
                            className="form-control account-input"
                            value={passwordData.confirmPassword}
                            onChange={onPasswordChange}
                            placeholder="Nhập lại mật khẩu mới"
                            minLength={8}
                            autoComplete="new-password"
                            required
                        />
                    </div>

                </div>

                <div className="account-password-actions">
                    <button
                        type="submit"
                        className="account-password-submit"
                        disabled={isChangingPassword}
                    >
                        <i className="bi bi-lock"></i>
                        {isChangingPassword
                            ? "Đang cập nhật..."
                            : "Cập nhật mật khẩu"}
                    </button>
                </div>

            </form>

        </section>
    );
}

export default AccountPassword;
