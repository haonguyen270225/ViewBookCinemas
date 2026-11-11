
import "./AccountProfile.css";

//========================= Component AccountProfile ========================

function AccountProfile({
    profileData,
    isEditing,
    isSaving,
    onProfileChange,
    onEdit,
    onCancel,
    onSave
}) {

    //========================= Render giao diện ========================

    return (
        <section className="account-profile">

            <div className="account-profile-header">
                <div>
                    <span className="account-content-label">PERSONAL INFORMATION</span>
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

                <div className="row g-3">

                    <div className="col-md-6">
                        <label className="form-label">Họ và tên</label>
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
                        <label className="form-label">Tên đăng nhập</label>
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
                        <label className="form-label">Số điện thoại</label>
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
                        <label className="form-label">Ngày sinh</label>
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
                        <label className="form-label">Giới tính</label>
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

        </section>
    );
}

export default AccountProfile;
