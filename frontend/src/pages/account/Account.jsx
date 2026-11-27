
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import Navbar from "../../components/layout/Navbar.jsx";
import Footer from "../../components/layout/Footer.jsx";

import AccountSidebar from "../../components/account/AccountSidebar/AccountSidebar.jsx";
import AccountOverview from "../../components/account/AccountOverview/AccountOverview.jsx";
import AccountProfile from "../../components/account/AccountProfile/AccountProfile.jsx";
import AccountPassword from "../../components/account/AccountPassword/AccountPassword.jsx";
import TicketHistory from "../../components/account/TicketHistory/TicketHistory.jsx";

import { useAuth } from "../../contexts/AuthContext.jsx";

import "./Account.css";

const getProfileData = (user) => ({
    fullName: user?.fullName || "",
    username: user?.username || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    dateOfBirth: user?.dateOfBirth || "",
    gender: user?.gender || "",
    avatarUrl: user?.avatarUrl || ""
});

function Account() {
    const {
        user,
        isAuthenticated,
        updateProfile,
        updatePassword,
        showNotification
    } = useAuth();

    const [activeTab, setActiveTab] = useState("overview");

    const [profileData, setProfileData] = useState(
        () => getProfileData(user)
    );

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Đồng bộ thông tin người dùng sau khi cập nhật.
    useEffect(() => {
        if (user) {
            setProfileData(getProfileData(user));
        }
    }, [user]);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const handleProfileChange = (event) => {
        const { name, value } = event.target;

        setProfileData(previous => ({
            ...previous,
            [name]: value
        }));
    };

    const handleCancelEdit = () => {
        setProfileData(getProfileData(user));
        setIsEditing(false);
    };

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
                gender: profileData.gender,
                avatarUrl: profileData.avatarUrl
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

    const handlePasswordChange = (event) => {
        const { name, value } = event.target;

        setPasswordData(previous => ({
            ...previous,
            [name]: value
        }));
    };

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

            case "tickets":
                return <TicketHistory />;

            case "overview":
            default:
                return <AccountOverview user={user} />;
        }
    };

    return (
        <>
            <Navbar />

            <main className="account-page">
                <div className="container account-container">
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

                    <div className="row g-4">
                        <div className="col-lg-3">
                            <AccountSidebar
                                user={user}
                                activeTab={activeTab}
                                onTabChange={(tab) => {
                                    setActiveTab(tab);
                                    setIsEditing(false);
                                    setProfileData(getProfileData(user));
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
