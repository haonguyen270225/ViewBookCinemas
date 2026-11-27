
import { useRef, useState } from "react";
import "./AccountProfile.css";

const DEFAULT_AVATAR = "https://placehold.co/300x300?text=User";
const MAX_FILE_SIZE = 2 * 1024 * 1024;

function AccountProfile({
    profileData,
    isEditing,
    isSaving,
    onProfileChange,
    onEdit,
    onCancel,
    onSave
}) {
    const fileInputRef = useRef(null);
    const [isAvatarPreviewOpen, setIsAvatarPreviewOpen] = useState(false);

    const handleSelectAvatar = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Vui lòng chọn một tệp hình ảnh hợp lệ.");
            event.target.value = "";
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            alert("Ảnh đại diện không được vượt quá 2MB.");
            event.target.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            onProfileChange({
                target: {
                    name: "avatarUrl",
                    value: reader.result
                }
            });
        };

        reader.onerror = () => {
            alert("Không thể đọc tệp ảnh. Vui lòng thử lại.");
        };

        reader.readAsDataURL(file);
        event.target.value = "";
    };

    const handleRemoveAvatar = () => {
        onProfileChange({
            target: {
                name: "avatarUrl",
                value: ""
            }
        });

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const avatarSrc = profileData.avatarUrl || DEFAULT_AVATAR;

    return (
        <section className="account-profile">
            <div className="account-profile-header">
                <div>
                    <span className="account-content-label">
                        PERSONAL INFORMATION
                    </span>

                    <h2>Thông tin cá nhân</h2>

                    <p>
                        Quản lý và cập nhật thông tin cá nhân của bạn.
                    </p>
                </div>

                {!isEditing && (
                    <button
                        type="button"
                        className="account-profile-edit"
                        onClick={onEdit}
                    >
                        <i className="bi bi-pencil-square"></i>
                        Chỉnh sửa
                    </button>
                )}
            </div>

            <form onSubmit={onSave}>
                {/* Avatar */}

                <div className="account-profile-avatar-section">
                    <div className="account-profile-avatar-wrapper">
                        <button
                            type="button"
                            className="account-profile-avatar-button"
                            onClick={() => setIsAvatarPreviewOpen(true)}
                            title="Xem ảnh đại diện"
                        >
                            <img
                                src={avatarSrc}
                                alt="Ảnh đại diện"
                                onError={(event) => {
                                    event.currentTarget.src = DEFAULT_AVATAR;
                                }}
                            />

                            <span className="account-profile-avatar-zoom">
                                <i className="bi bi-zoom-in"></i>
                            </span>
                        </button>
                    </div>

                    <div className="account-profile-avatar-info">
                        <strong>Ảnh đại diện</strong>

                        <span>
                            Ảnh JPG, PNG hoặc WEBP. Dung lượng tối đa 2MB.
                        </span>

                        {isEditing && (
                            <div className="account-profile-avatar-actions">
                                <button
                                    type="button"
                                    className="account-avatar-upload"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                >
                                    <i className="bi bi-upload"></i>
                                    Chọn ảnh từ máy
                                </button>

                                <button
                                    type="button"
                                    className="account-avatar-remove"
                                    onClick={handleRemoveAvatar}
                                    disabled={!profileData.avatarUrl}
                                >
                                    <i className="bi bi-trash3"></i>
                                    Xóa ảnh
                                </button>
                            </div>
                        )}
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        hidden
                        onChange={handleSelectAvatar}
                    />
                </div>

                {/* Thông tin cơ bản */}

                <div className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label">
                            Họ và tên
                        </label>

                        <input
                            type="text"
                            name="fullName"
                            className="form-control account-input"
                            value={profileData.fullName}
                            onChange={onProfileChange}
                            disabled={!isEditing}
                            maxLength={100}
                            required
                        />
                    </div>

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

                        <small className="account-profile-note">
                            Tên đăng nhập không thể thay đổi.
                        </small>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Email</label>

                        <input
                            type="email"
                            name="email"
                            className="form-control account-input"
                            value={profileData.email}
                            onChange={onProfileChange}
                            disabled={!isEditing}
                            maxLength={150}
                            required
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">
                            Số điện thoại
                        </label>

                        <input
                            type="tel"
                            name="phoneNumber"
                            className="form-control account-input"
                            value={profileData.phoneNumber}
                            onChange={onProfileChange}
                            disabled={!isEditing}
                            maxLength={15}
                            placeholder="Nhập số điện thoại"
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">
                            Ngày sinh
                        </label>

                        <input
                            type="date"
                            name="dateOfBirth"
                            className="form-control account-input"
                            value={profileData.dateOfBirth}
                            onChange={onProfileChange}
                            disabled={!isEditing}
                            max={new Date().toISOString().split("T")[0]}
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">
                            Giới tính
                        </label>

                        <select
                            name="gender"
                            className="form-select account-input"
                            value={profileData.gender}
                            onChange={onProfileChange}
                            disabled={!isEditing}
                        >
                            <option value="">Chưa cập nhật</option>
                            <option value="Male">Nam</option>
                            <option value="Female">Nữ</option>
                            <option value="Other">Khác</option>
                        </select>
                    </div>
                </div>

                {isEditing && (
                    <div className="account-profile-actions">
                        <button
                            type="button"
                            className="account-profile-cancel"
                            onClick={onCancel}
                            disabled={isSaving}
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            className="account-profile-save"
                            disabled={isSaving}
                        >
                            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                    </div>
                )}
            </form>

            {/* Modal xem ảnh lớn */}

            {isAvatarPreviewOpen && (
                <div
                    className="account-avatar-preview-overlay"
                    onClick={() => setIsAvatarPreviewOpen(false)}
                >
                    <div
                        className="account-avatar-preview-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="account-avatar-preview-close"
                            onClick={() => setIsAvatarPreviewOpen(false)}
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>

                        <img
                            src={avatarSrc}
                            alt="Ảnh đại diện kích thước lớn"
                            onError={(event) => {
                                event.currentTarget.src = DEFAULT_AVATAR;
                            }}
                        />

                        <span>Ảnh đại diện</span>
                    </div>
                </div>
            )}
        </section>
    );
}

export default AccountProfile;
