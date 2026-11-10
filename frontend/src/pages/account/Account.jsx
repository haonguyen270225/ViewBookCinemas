
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import Navbar from "../../components/layout/Navbar.jsx";
import Footer from "../../components/layout/Footer.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";

//========================= Import CSS ========================

import "./Account.css";

//========================= Component Account ========================

function Account() {
    const {
        user,
        isAuthenticated,
        updateProfile,
        updatePassword,
        showNotification
    } = useAuth();

    //========================= State thông tin cá nhân ========================

    const [profileData, setProfileData] = useState({
        fullName: "",
        username: "",
        email: "",
        phoneNumber: "",
        dateOfBirth: "",
        gender: ""
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    //========================= State đổi mật khẩu ========================

    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [isChangingPassword, setIsChangingPassword] = useState(false);

    //========================= Đồng bộ thông tin người dùng ========================

    useEffect(() => {
        if (user) {
            setProfileData({
                fullName: user.fullName || "",
                username: user.username || "",
                email: user.email || "",
                phoneNumber: user.phoneNumber || "",
                dateOfBirth: user.dateOfBirth || "",
                gender: user.gender || ""
            });
        }
    }, [user]);

    //========================= Kiểm tra đăng nhập ========================

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    //========================= Xử lý thay đổi thông tin cá nhân ========================

    const handleProfileChange = (event) => {
        const { name, value } = event.target;

        setProfileData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    };

    //========================= Hủy chỉnh sửa thông tin ========================

    const handleCancelEdit = () => {
        setProfileData({
            fullName: user.fullName || "",
            username: user.username || "",
            email: user.email || "",
            phoneNumber: user.phoneNumber || "",
            dateOfBirth: user.dateOfBirth || "",
            gender: user.gender || ""
        });

        setIsEditing(false);
    };

    //========================= Lưu thông tin cá nhân ========================

    const handleSaveProfile = (event) => {
        event.preventDefault();

        if (!profileData.fullName.trim()) {
            showNotification("Vui lòng nhập họ và tên.", "error");
            return;
        }

        if (!profileData.email.trim()) {
            showNotification("Vui lòng nhập email.", "error");
            return;
        }

        try {
            setIsSaving(true);

            updateProfile({
                fullName: profileData.fullName,
                email: profileData.email,
                phoneNumber: profileData.phoneNumber,
                dateOfBirth: profileData.dateOfBirth,
                gender: profileData.gender
            });

            setIsEditing(false);

            showNotification(
                "Cập nhật thông tin cá nhân thành công!",
                "success"
            );
        } catch (error) {
            showNotification(
                error.message || "Không thể cập nhật thông tin.",
                "error"
            );
        } finally {
            setIsSaving(false);
        }
    };

    //========================= Xử lý thay đổi mật khẩu ========================

    const handlePasswordChange = (event) => {
        const { name, value } = event.target;

        setPasswordData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    };

    //========================= Đổi mật khẩu ========================

    const handleChangePassword = (event) => {
        event.preventDefault();

        if (!passwordData.oldPassword) {
            showNotification("Vui lòng nhập mật khẩu hiện tại.", "error");
            return;
        }

        if (passwordData.newPassword.length < 8) {
            showNotification(
                "Mật khẩu mới phải có ít nhất 8 ký tự.",
                "error"
            );
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showNotification(
                "Mật khẩu xác nhận không khớp.",
                "error"
            );
            return;
        }

        try {
            setIsChangingPassword(true);

            updatePassword(
                passwordData.oldPassword,
                passwordData.newPassword
            );

            setPasswordData({
                oldPassword: "",
                newPassword: "",
                confirmPassword: ""
            });

            showNotification("Đổi mật khẩu thành công!", "success");
        } catch (error) {
            showNotification(
                error.message || "Không thể đổi mật khẩu.",
                "error"
            );
        } finally {
            setIsChangingPassword(false);
        }
    };

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

    //========================= Render giao diện ========================

    return (
        <>
            <Navbar />

            <main className="account-page">
                <div className="container py-5">

                    {/*========================= Page Header ========================*/}

                    <div className="account-header mb-4">
                        <div>
                            <span className="account-subtitle">
                                VIEWBOOKCINEMAS
                            </span>

                            <h1>Tài khoản của tôi</h1>

                            <p>
                                Quản lý thông tin cá nhân và bảo mật tài khoản của bạn.
                            </p>
                        </div>
                    </div>

                    {/*========================= Account Overview ========================*/}

                    <section className="account-overview mb-4">
                        <div className="account-avatar">
                            {getInitials(user.fullName)}
                        </div>

                        <div className="account-overview-info">
                            <h2>{user.fullName}</h2>
                            <p>{user.email}</p>

                            <span className="account-status">
                                <i className="bi bi-check-circle-fill"></i>
                                Tài khoản đang hoạt động
                            </span>
                        </div>

                        <div className="account-username">
                            <span>Tên đăng nhập</span>
                            <strong>{user.username}</strong>
                        </div>
                    </section>

                    {/*========================= Profile Information ========================*/}

                    <section className="account-section mb-4">

                        <div className="account-section-header">
                            <div>
                                <h3>
                                    <i className="bi bi-person-circle"></i>
                                    Thông tin cá nhân
                                </h3>

                                <p>
                                    Thông tin cơ bản được sử dụng trong tài khoản của bạn.
                                </p>
                            </div>

                            {!isEditing && (
                                <button
                                    type="button"
                                    className="account-edit-button"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <i className="bi bi-pencil-square"></i>
                                    Chỉnh sửa
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSaveProfile}>
                            <div className="row g-3">

                                {/*========================= Full Name ========================*/}

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Họ và tên
                                    </label>

                                    <input
                                        type="text"
                                        name="fullName"
                                        className="form-control account-input"
                                        value={profileData.fullName}
                                        onChange={handleProfileChange}
                                        disabled={!isEditing}
                                        maxLength={100}
                                        required
                                    />
                                </div>

                                {/*========================= Username ========================*/}

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Tên đăng nhập
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control account-input"
                                        value={profileData.username}
                                        disabled
                                    />

                                    <small className="account-field-note">
                                        Tên đăng nhập không thể thay đổi.
                                    </small>
                                </div>

                                {/*========================= Email ========================*/}

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control account-input"
                                        value={profileData.email}
                                        onChange={handleProfileChange}
                                        disabled={!isEditing}
                                        maxLength={150}
                                        required
                                    />
                                </div>

                                {/*========================= Phone Number ========================*/}

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Số điện thoại
                                    </label>

                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        className="form-control account-input"
                                        value={profileData.phoneNumber}
                                        onChange={handleProfileChange}
                                        disabled={!isEditing}
                                        maxLength={15}
                                        placeholder="Nhập số điện thoại"
                                    />
                                </div>

                                {/*========================= Date Of Birth ========================*/}

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Ngày sinh
                                    </label>

                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        className="form-control account-input"
                                        value={profileData.dateOfBirth}
                                        onChange={handleProfileChange}
                                        disabled={!isEditing}
                                        max={new Date().toISOString().split("T")[0]}
                                    />
                                </div>

                                {/*========================= Gender ========================*/}

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Giới tính
                                    </label>

                                    <select
                                        name="gender"
                                        className="form-select account-input"
                                        value={profileData.gender}
                                        onChange={handleProfileChange}
                                        disabled={!isEditing}
                                    >
                                        <option value="">Chưa cập nhật</option>
                                        <option value="Male">Nam</option>
                                        <option value="Female">Nữ</option>
                                        <option value="Other">Khác</option>
                                    </select>
                                </div>
                            </div>

                            {/*========================= Profile Actions ========================*/}

                            {isEditing && (
                                <div className="account-form-actions">
                                    <button
                                        type="button"
                                        className="account-cancel-button"
                                        onClick={handleCancelEdit}
                                        disabled={isSaving}
                                    >
                                        Hủy
                                    </button>

                                    <button
                                        type="submit"
                                        className="account-save-button"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                                    </button>
                                </div>
                            )}
                        </form>
                    </section>

                    {/*========================= Change Password ========================*/}

                    <section className="account-section">

                        <div className="account-section-header">
                            <div>
                                <h3>
                                    <i className="bi bi-shield-lock"></i>
                                    Bảo mật tài khoản
                                </h3>

                                <p>
                                    Thay đổi mật khẩu để bảo vệ tài khoản của bạn.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleChangePassword}>
                            <div className="row g-3">

                                {/*========================= Current Password ========================*/}

                                <div className="col-md-12">
                                    <label className="form-label">
                                        Mật khẩu hiện tại
                                    </label>

                                    <input
                                        type="password"
                                        name="oldPassword"
                                        className="form-control account-input"
                                        value={passwordData.oldPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Nhập mật khẩu hiện tại"
                                        autoComplete="current-password"
                                        required
                                    />
                                </div>

                                {/*========================= New Password ========================*/}

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Mật khẩu mới
                                    </label>

                                    <input
                                        type="password"
                                        name="newPassword"
                                        className="form-control account-input"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Tối thiểu 8 ký tự"
                                        minLength={8}
                                        autoComplete="new-password"
                                        required
                                    />
                                </div>

                                {/*========================= Confirm Password ========================*/}

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Xác nhận mật khẩu mới
                                    </label>

                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        className="form-control account-input"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Nhập lại mật khẩu mới"
                                        minLength={8}
                                        autoComplete="new-password"
                                        required
                                    />
                                </div>
                            </div>

                            {/*========================= Password Actions ========================*/}

                            <div className="account-form-actions">
                                <button
                                    type="submit"
                                    className="account-save-button"
                                    disabled={isChangingPassword}
                                >
                                    {isChangingPassword
                                        ? "Đang cập nhật..."
                                        : "Đổi mật khẩu"}
                                </button>
                            </div>
                        </form>
                    </section>

                </div>
            </main>

            <Footer />
        </>
    );
}

export default Account;
