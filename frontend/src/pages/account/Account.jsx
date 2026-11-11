
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

//========================= Import Layout ========================

import Navbar from "../../components/layout/Navbar.jsx";
import Footer from "../../components/layout/Footer.jsx";

//========================= Import Account Components ========================

import AccountSidebar from "../../components/account/AccountSidebar/AccountSidebar.jsx";
import AccountOverview from "../../components/account/AccountOverview/AccountOverview.jsx";
import AccountProfile from "../../components/account/AccountProfile/AccountProfile.jsx";
import AccountPassword from "../../components/account/AccountPassword/AccountPassword.jsx";

//========================= Import Context ========================

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

    //========================= State điều hướng ========================

    const [activeTab, setActiveTab] = useState("overview");

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

    //========================= Nội dung theo tab ========================

    const renderAccountContent = () => {
        switch (activeTab) {
            case "profile":
                return (
                    <AccountProfile
                        profileData={profileData}
                        isEditing={isEditing}
                        isSaving={isSaving}
                        onProfileChange={handleProfileChange}
                        onEdit={() => setIsEditing(true)}
                        onCancel={handleCancelEdit}
                        onSave={handleSaveProfile}
                    />
                );

            case "password":
                return (
                    <AccountPassword
                        passwordData={passwordData}
                        isChangingPassword={isChangingPassword}
                        onPasswordChange={handlePasswordChange}
                        onChangePassword={handleChangePassword}
                    />
                );

            case "overview":
            default:
                return <AccountOverview user={user} />;
        }
    };

    //========================= Render giao diện ========================

    return (
        <>
            <Navbar />

            <main className="account-page">

                <div className="container account-container">

                    {/*========================= Page Header ========================*/}

                    <div className="account-header">
                        <div>
                            <span className="account-subtitle">
                                VIEWBOOKCINEMAS
                            </span>

                            <h1>Tài khoản của tôi</h1>

                            <p>
                                Quản lý thông tin cá nhân và bảo mật
                                tài khoản của bạn.
                            </p>
                        </div>
                    </div>

                    {/*========================= Account Layout ========================*/}

                    <div className="row g-4">

                        <div className="col-lg-3">

                            <AccountSidebar
                                user={user}
                                activeTab={activeTab}
                                onTabChange={(tab) => {
                                    setActiveTab(tab);
                                    setIsEditing(false);
                                }}
                            />

                        </div>

                        <div className="col-lg-9">

                            <div className="account-content">
                                {renderAccountContent()}
                            </div>

                        </div>

                    </div>

                </div>

            </main>

            <Footer />
        </>
    );
}

export default Account;
