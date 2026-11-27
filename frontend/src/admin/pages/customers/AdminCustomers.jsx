
import { useEffect, useMemo, useRef, useState } from "react";

import {
    getCustomers,
    getCustomerStatistics,
    updateCustomer,
    updateCustomerStatus,
    resetCustomerLoginName,
    resetCustomerLoginPassword
} from "../../../services/customerService.js";

import "./AdminCustomers.css";

const DEFAULT_AVATAR = "https://placehold.co/120x120?text=User";
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

const EMPTY_FORM = {
    fullName: "",
    username: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    avatarUrl: ""
};

const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("vi-VN").format(date);
};

const getStatusLabel = (status) =>
    status === "Inactive" ? "Đã khóa" : "Đang hoạt động";

const getGenderLabel = (gender) => {
    if (gender === "Male") return "Nam";
    if (gender === "Female") return "Nữ";
    if (gender === "Other") return "Khác";
    return "Chưa cập nhật";
};

const getCustomerName = (customer) =>
    customer?.fullName || "Khách hàng";

function AdminCustomers() {
    const avatarInputRef = useRef(null);

    const [customers, setCustomers] = useState([]);
    const [statistics, setStatistics] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        newToday: 0
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("Tất cả");

    // Modal chỉnh sửa
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [formData, setFormData] = useState({ ...EMPTY_FORM });

    // Modal chi tiết
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Modal xem ảnh
    const [isAvatarPreviewOpen, setIsAvatarPreviewOpen] = useState(false);
    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");

    // Reset mật khẩu
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [temporaryPasswordInfo, setTemporaryPasswordInfo] = useState(null);

    // Reset username
    const [isResettingUsername, setIsResettingUsername] = useState(false);

    //====================================================
    // Tải dữ liệu
    //====================================================

    const loadCustomers = async () => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const [customerData, statisticData] = await Promise.all([
                getCustomers(),
                getCustomerStatistics()
            ]);

            setCustomers(customerData);
            setStatistics(statisticData);
        } catch (error) {
            console.error("Không thể tải khách hàng:", error);
            setErrorMessage(
                error.message || "Không thể tải danh sách khách hàng."
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCustomers();
    }, []);

    //====================================================
    // Tìm kiếm và lọc
    //====================================================

    const filteredCustomers = useMemo(() => {
        const keyword = searchTerm.trim().toLocaleLowerCase("vi");

        return customers.filter((customer) => {
            const matchesSearch =
                !keyword ||
                customer.fullName?.toLocaleLowerCase("vi").includes(keyword) ||
                customer.username?.toLocaleLowerCase("vi").includes(keyword) ||
                customer.email?.toLocaleLowerCase("vi").includes(keyword) ||
                customer.phoneNumber?.toLocaleLowerCase("vi").includes(keyword);

            const matchesStatus =
                selectedStatus === "Tất cả" ||
                (customer.status || "Active") === selectedStatus;

            return matchesSearch && matchesStatus;
        });
    }, [customers, searchTerm, selectedStatus]);

    const handleClearFilters = () => {
        setSearchTerm("");
        setSelectedStatus("Tất cả");
    };

    //====================================================
    // Đồng bộ dữ liệu sau cập nhật
    //====================================================

    const replaceCustomer = (updatedCustomer) => {
        if (!updatedCustomer) return;

        setCustomers((current) =>
            current.map((customer) =>
                String(customer.userId) === String(updatedCustomer.userId)
                    ? updatedCustomer
                    : customer
            )
        );

        setSelectedCustomer((current) =>
            current &&
            String(current.userId) === String(updatedCustomer.userId)
                ? updatedCustomer
                : current
        );

        setEditingCustomer((current) =>
            current &&
            String(current.userId) === String(updatedCustomer.userId)
                ? updatedCustomer
                : current
        );
    };

    const refreshStatistics = async () => {
        try {
            const result = await getCustomerStatistics();
            setStatistics(result);
        } catch (error) {
            console.error("Không thể cập nhật thống kê:", error);
        }
    };

    //====================================================
    // Xem avatar
    //====================================================

    const handleOpenAvatarPreview = (imageUrl) => {
        setAvatarPreviewUrl(imageUrl || DEFAULT_AVATAR);
        setIsAvatarPreviewOpen(true);
    };

    //====================================================
    // Mở form chỉnh sửa
    //====================================================

    const handleOpenEdit = (customer) => {
        setEditingCustomer(customer);

        setFormData({
            fullName: customer.fullName || "",
            username: customer.username || "",
            email: customer.email || "",
            phoneNumber: customer.phoneNumber || "",
            dateOfBirth: customer.dateOfBirth || "",
            gender: customer.gender || "",
            avatarUrl: customer.avatarUrl || ""
        });

        setSelectedCustomer(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        if (isSaving) return;

        setIsModalOpen(false);
        setEditingCustomer(null);
        setFormData({ ...EMPTY_FORM });
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value
        }));
    };

    //====================================================
    // Chọn avatar từ máy
    //====================================================

    const handleSelectAvatar = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            alert("Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.");
            event.target.value = "";
            return;
        }

        if (file.size > MAX_AVATAR_SIZE) {
            alert("Dung lượng ảnh không được vượt quá 2MB.");
            event.target.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            setFormData((current) => ({
                ...current,
                avatarUrl: reader.result
            }));
        };

        reader.onerror = () => {
            alert("Không thể đọc ảnh. Vui lòng thử lại.");
        };

        reader.readAsDataURL(file);
        event.target.value = "";
    };

    const handleRemoveAvatar = () => {
        setFormData((current) => ({
            ...current,
            avatarUrl: ""
        }));

        if (avatarInputRef.current) {
            avatarInputRef.current.value = "";
        }
    };

    //====================================================
    // Cập nhật khách hàng
    //====================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!editingCustomer) return;

        const fullName = formData.fullName.trim();
        const username = formData.username.trim();
        const email = formData.email.trim().toLowerCase();

        if (!fullName) {
            alert("Vui lòng nhập họ và tên.");
            return;
        }

        if (username.length < 4 || username.length > 30) {
            alert("Tên đăng nhập phải có từ 4 đến 30 ký tự.");
            return;
        }

        if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
            alert("Tên đăng nhập chỉ được chứa chữ, số, dấu chấm và dấu gạch dưới.");
            return;
        }

        if (!email) {
            alert("Vui lòng nhập email.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert("Email không đúng định dạng.");
            return;
        }

        setIsSaving(true);

        try {
            const updatedCustomer = await updateCustomer(
                editingCustomer.userId,
                {
                    ...formData,
                    fullName,
                    username,
                    email,
                    phoneNumber: formData.phoneNumber.trim()
                }
            );

            replaceCustomer(updatedCustomer);

            setIsModalOpen(false);
            setEditingCustomer(null);
            setFormData({ ...EMPTY_FORM });

            await refreshStatistics();

            alert("Cập nhật thông tin khách hàng thành công.");
        } catch (error) {
            console.error("Lỗi cập nhật khách hàng:", error);
            alert(error.message || "Không thể cập nhật khách hàng.");
        } finally {
            setIsSaving(false);
        }
    };

    //====================================================
    // Xem chi tiết
    //====================================================

    const handleViewDetail = (customer) => {
        setSelectedCustomer(customer);
    };

    //====================================================
    // Khóa / mở khóa
    //====================================================

    const handleToggleStatus = async (customer) => {
        const currentStatus = customer.status || "Active";
        const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";

        const actionText =
            nextStatus === "Inactive" ? "khóa" : "mở khóa";

        const confirmed = window.confirm(
            `Bạn có chắc muốn ${actionText} tài khoản "${getCustomerName(customer)}" không?`
        );

        if (!confirmed) return;

        setUpdatingId(customer.userId);

        try {
            const updatedCustomer = await updateCustomerStatus(
                customer.userId,
                nextStatus
            );

            replaceCustomer(updatedCustomer);
            await refreshStatistics();
        } catch (error) {
            alert(error.message || "Không thể cập nhật trạng thái tài khoản.");
        } finally {
            setUpdatingId(null);
        }
    };

    //====================================================
    // Reset username
    //====================================================

    const handleResetUsername = async (customer) => {
        const newUsername = window.prompt(
            `Nhập tên đăng nhập mới cho ${getCustomerName(customer)}:`,
            customer.username || ""
        );

        if (newUsername === null) return;

        const username = newUsername.trim();

        if (username.length < 4 || username.length > 30) {
            alert("Tên đăng nhập phải có từ 4 đến 30 ký tự.");
            return;
        }

        if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
            alert("Tên đăng nhập chỉ được chứa chữ, số, dấu chấm và dấu gạch dưới.");
            return;
        }

        setIsResettingUsername(true);

        try {
            const updatedCustomer = await resetCustomerLoginName(
                customer.userId,
                username
            );

            replaceCustomer(updatedCustomer);

            alert(`Đã cập nhật username thành công: ${updatedCustomer.username}`);
        } catch (error) {
            alert(error.message || "Không thể cập nhật username.");
        } finally {
            setIsResettingUsername(false);
        }
    };

    //====================================================
    // Reset mật khẩu
    //====================================================

    const handleResetPassword = async (customer) => {
        const confirmed = window.confirm(
            `Bạn có chắc muốn tạo mật khẩu tạm thời mới cho "${getCustomerName(customer)}"?\n\nMật khẩu hiện tại sẽ không còn sử dụng được.`
        );

        if (!confirmed) return;

        setIsResettingPassword(true);

        try {
            const result = await resetCustomerLoginPassword(customer.userId);

            replaceCustomer(result.customer);

            setTemporaryPasswordInfo({
                customerName: customer.fullName,
                username: result.customer.username,
                password: result.temporaryPassword
            });
        } catch (error) {
            alert(error.message || "Không thể đặt lại mật khẩu.");
        } finally {
            setIsResettingPassword(false);
        }
    };

    const handleCopyTemporaryPassword = async () => {
        if (!temporaryPasswordInfo?.password) return;

        try {
            await navigator.clipboard.writeText(
                temporaryPasswordInfo.password
            );

            alert("Đã sao chép mật khẩu tạm thời.");
        } catch {
            window.prompt(
                "Sao chép mật khẩu tạm thời:",
                temporaryPasswordInfo.password
            );
        }
    };

    //====================================================
    // Loading / Error
    //====================================================

    if (isLoading) {
        return (
            <div className="admin-customers">
                <div className="admin-customers-state">
                    <span className="spinner-border"></span>
                    <p>Đang tải danh sách khách hàng...</p>
                </div>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="admin-customers">
                <div className="admin-customers-state">
                    <i className="bi bi-exclamation-circle"></i>
                    <h5>Không thể tải dữ liệu</h5>
                    <p>{errorMessage}</p>
                    <button type="button" onClick={loadCustomers}>
                        <i className="bi bi-arrow-clockwise"></i>
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    //====================================================
    // Render
    //====================================================

    return (
        <div className="admin-customers">
            <div className="admin-page-intro admin-customers-intro">
                <div>
                    <h3>Quản lý khách hàng</h3>
                    <p>
                        Theo dõi thông tin và quản lý tài khoản khách hàng
                        trong hệ thống ViewBookCinemas.
                    </p>
                </div>
            </div>

            {/* Thống kê */}

            <div className="admin-customers-statistics">
                <div className="admin-customer-stat-card">
                    <div className="admin-customer-stat-icon blue">
                        <i className="bi bi-people"></i>
                    </div>
                    <div>
                        <span>Tổng khách hàng</span>
                        <strong>{statistics.total}</strong>
                    </div>
                </div>

                <div className="admin-customer-stat-card">
                    <div className="admin-customer-stat-icon green">
                        <i className="bi bi-person-check"></i>
                    </div>
                    <div>
                        <span>Đang hoạt động</span>
                        <strong>{statistics.active}</strong>
                    </div>
                </div>

                <div className="admin-customer-stat-card">
                    <div className="admin-customer-stat-icon orange">
                        <i className="bi bi-person-lock"></i>
                    </div>
                    <div>
                        <span>Đã khóa</span>
                        <strong>{statistics.inactive}</strong>
                    </div>
                </div>

                <div className="admin-customer-stat-card">
                    <div className="admin-customer-stat-icon purple">
                        <i className="bi bi-person-plus"></i>
                    </div>
                    <div>
                        <span>Đăng ký hôm nay</span>
                        <strong>{statistics.newToday}</strong>
                    </div>
                </div>
            </div>

            {/* Danh sách */}

            <section className="admin-panel admin-customers-panel">
                <div className="admin-customers-toolbar">
                    <div className="admin-customers-search">
                        <i className="bi bi-search"></i>
                        <input
                            type="search"
                            placeholder="Tìm tên, username, email hoặc số điện thoại..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                        />
                    </div>

                    <div className="admin-customers-filter">
                        <label htmlFor="adminCustomerStatus">
                            Trạng thái tài khoản
                        </label>

                        <select
                            id="adminCustomerStatus"
                            value={selectedStatus}
                            onChange={(event) => setSelectedStatus(event.target.value)}
                        >
                            <option value="Tất cả">Tất cả trạng thái</option>
                            <option value="Active">Đang hoạt động</option>
                            <option value="Inactive">Đã khóa</option>
                        </select>
                    </div>

                    <button
                        type="button"
                        className="admin-customers-reset-button"
                        onClick={handleClearFilters}
                        title="Xóa bộ lọc"
                    >
                        <i className="bi bi-arrow-counterclockwise"></i>
                    </button>
                </div>

                <div className="admin-customers-list-heading">
                    <div>
                        <h5>Danh sách khách hàng</h5>
                        <p>Thông tin tài khoản đã đăng ký</p>
                    </div>

                    <span>
                        Hiển thị <strong>{filteredCustomers.length}</strong> /{" "}
                        {customers.length} khách hàng
                    </span>
                </div>

                <div className="admin-table-wrapper">
                    <table className="admin-table admin-customers-table">
                        <thead>
                            <tr>
                                <th>KHÁCH HÀNG</th>
                                <th>USERNAME</th>
                                <th>EMAIL</th>
                                <th>SỐ ĐIỆN THOẠI</th>
                                <th>NGÀY ĐĂNG KÝ</th>
                                <th>TRẠNG THÁI</th>
                                <th>THAO TÁC</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredCustomers.length > 0 ? (
                                filteredCustomers.map((customer) => {
                                    const status = customer.status || "Active";

                                    return (
                                        <tr key={customer.userId}>
                                            <td>
                                                <div className="admin-customer-info">
                                                    <button
                                                        type="button"
                                                        className="admin-customer-avatar-button"
                                                        onClick={() =>
                                                            handleOpenAvatarPreview(customer.avatarUrl)
                                                        }
                                                        title="Xem ảnh đại diện"
                                                    >
                                                        <img
                                                            src={customer.avatarUrl || DEFAULT_AVATAR}
                                                            alt={customer.fullName}
                                                            onError={(event) => {
                                                                event.currentTarget.src = DEFAULT_AVATAR;
                                                            }}
                                                        />
                                                    </button>

                                                    <div>
                                                        <strong>
                                                            {customer.fullName || "Chưa cập nhật"}
                                                        </strong>
                                                        <span>ID: {customer.userId}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <span className="admin-customer-username">
                                                    {customer.username || "—"}
                                                </span>
                                            </td>

                                            <td>
                                                <span className="admin-customer-email">
                                                    {customer.email || "—"}
                                                </span>
                                            </td>

                                            <td>{customer.phoneNumber || "—"}</td>
                                            <td>{formatDate(customer.createdAt)}</td>

                                            <td>
                                                <span
                                                    className={`admin-customer-status ${
                                                        status === "Active" ? "active" : "inactive"
                                                    }`}
                                                >
                                                    {getStatusLabel(status)}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="admin-customer-actions">
                                                    <button
                                                        type="button"
                                                        className="detail"
                                                        title="Xem chi tiết"
                                                        onClick={() => handleViewDetail(customer)}
                                                    >
                                                        <i className="bi bi-eye"></i>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="edit"
                                                        title="Chỉnh sửa"
                                                        onClick={() => handleOpenEdit(customer)}
                                                    >
                                                        <i className="bi bi-pencil"></i>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={status === "Active" ? "deactivate" : "activate"}
                                                        title={status === "Active" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                                                        disabled={updatingId === customer.userId}
                                                        onClick={() => handleToggleStatus(customer)}
                                                    >
                                                        {updatingId === customer.userId ? (
                                                            <span className="spinner-border spinner-border-sm"></span>
                                                        ) : (
                                                            <i className={status === "Active" ? "bi bi-lock" : "bi bi-unlock"}></i>
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7">
                                        <div className="admin-customers-no-result">
                                            <i className="bi bi-people"></i>
                                            <strong>Không tìm thấy khách hàng</strong>
                                            <span>
                                                Không có khách hàng phù hợp với điều kiện tìm kiếm.
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Modal chi tiết */}

            {selectedCustomer && (
                <div
                    className="admin-customer-detail-overlay"
                    onClick={() => setSelectedCustomer(null)}
                >
                    <div
                        className="admin-customer-detail-modal"
                        role="dialog"
                        aria-modal="true"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="admin-customer-modal-header">
                            <div>
                                <h4>Chi tiết khách hàng</h4>
                                <p>Thông tin tài khoản trong hệ thống</p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedCustomer(null)}
                                aria-label="Đóng"
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <div className="admin-customer-detail-body">
                            <div className="admin-customer-profile">
                                <button
                                    type="button"
                                    className="admin-customer-detail-avatar-button"
                                    onClick={() =>
                                        handleOpenAvatarPreview(selectedCustomer.avatarUrl)
                                    }
                                >
                                    <img
                                        src={selectedCustomer.avatarUrl || DEFAULT_AVATAR}
                                        alt={selectedCustomer.fullName}
                                        onError={(event) => {
                                            event.currentTarget.src = DEFAULT_AVATAR;
                                        }}
                                    />
                                </button>

                                <div>
                                    <h5>{getCustomerName(selectedCustomer)}</h5>
                                    <span>@{selectedCustomer.username || "—"}</span>
                                    <span
                                        className={`admin-customer-status ${
                                            selectedCustomer.status === "Inactive" ? "inactive" : "active"
                                        }`}
                                    >
                                        {getStatusLabel(selectedCustomer.status)}
                                    </span>
                                </div>
                            </div>

                            <div className="admin-customer-detail-section">
                                <h5>Thông tin cá nhân</h5>

                                <div className="admin-customer-detail-grid">
                                    <div>
                                        <span>Họ và tên</span>
                                        <strong>{selectedCustomer.fullName || "—"}</strong>
                                    </div>

                                    <div>
                                        <span>Tên đăng nhập</span>
                                        <strong>{selectedCustomer.username || "—"}</strong>
                                    </div>

                                    <div>
                                        <span>Email</span>
                                        <strong>{selectedCustomer.email || "—"}</strong>
                                    </div>

                                    <div>
                                        <span>Số điện thoại</span>
                                        <strong>{selectedCustomer.phoneNumber || "—"}</strong>
                                    </div>

                                    <div>
                                        <span>Ngày sinh</span>
                                        <strong>{formatDate(selectedCustomer.dateOfBirth)}</strong>
                                    </div>

                                    <div>
                                        <span>Giới tính</span>
                                        <strong>{getGenderLabel(selectedCustomer.gender)}</strong>
                                    </div>

                                    <div>
                                        <span>Ngày đăng ký</span>
                                        <strong>{formatDate(selectedCustomer.createdAt)}</strong>
                                    </div>

                                    <div>
                                        <span>Cập nhật lần cuối</span>
                                        <strong>{formatDate(selectedCustomer.updatedAt)}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="admin-customer-modal-footer">
                            <button
                                type="button"
                                className="reset-username"
                                disabled={isResettingUsername}
                                onClick={() => handleResetUsername(selectedCustomer)}
                            >
                                <i className="bi bi-person-gear"></i>
                                {isResettingUsername ? "Đang cập nhật..." : "Đặt lại username"}
                            </button>

                            <button
                                type="button"
                                className="reset-password"
                                disabled={isResettingPassword}
                                onClick={() => handleResetPassword(selectedCustomer)}
                            >
                                <i className="bi bi-key"></i>
                                {isResettingPassword ? "Đang tạo..." : "Đặt lại mật khẩu"}
                            </button>

                            <button
                                type="button"
                                className="edit"
                                onClick={() => handleOpenEdit(selectedCustomer)}
                            >
                                <i className="bi bi-pencil"></i>
                                Chỉnh sửa
                            </button>

                            <button
                                type="button"
                                className="close"
                                onClick={() => setSelectedCustomer(null)}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal chỉnh sửa */}

            {isModalOpen && editingCustomer && (
                <div
                    className="admin-customer-modal-overlay"
                    onClick={handleCloseModal}
                >
                    <div
                        className="admin-customer-modal"
                        role="dialog"
                        aria-modal="true"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="admin-customer-modal-header">
                            <div>
                                <h4>Chỉnh sửa khách hàng</h4>
                                <p>Cập nhật thông tin tài khoản khách hàng</p>
                            </div>

                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={isSaving}
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <form className="admin-customer-form" onSubmit={handleSubmit}>
                            <div className="admin-customer-form-grid">
                                <div className="admin-customer-form-group full">
                                    <label>Ảnh đại diện</label>

                                    <div className="admin-customer-form-preview">
                                        <button
                                            type="button"
                                            className="admin-customer-avatar-preview-button"
                                            onClick={() =>
                                                handleOpenAvatarPreview(formData.avatarUrl)
                                            }
                                        >
                                            <img
                                                src={formData.avatarUrl || DEFAULT_AVATAR}
                                                alt="Avatar preview"
                                                onError={(event) => {
                                                    event.currentTarget.src = DEFAULT_AVATAR;
                                                }}
                                            />
                                            <span><i className="bi bi-zoom-in"></i></span>
                                        </button>

                                        <div>
                                            <strong>Xem trước ảnh đại diện</strong>
                                            <span>
                                                Chọn ảnh từ máy hoặc nhập đường dẫn ảnh bên dưới.
                                            </span>

                                            <div className="admin-customer-avatar-upload-actions">
                                                <button
                                                    type="button"
                                                    onClick={() => avatarInputRef.current?.click()}
                                                >
                                                    <i className="bi bi-upload"></i>
                                                    Chọn ảnh từ máy
                                                </button>

                                                <button
                                                    type="button"
                                                    className="remove"
                                                    disabled={!formData.avatarUrl}
                                                    onClick={handleRemoveAvatar}
                                                >
                                                    <i className="bi bi-trash3"></i>
                                                    Xóa ảnh
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <input
                                        ref={avatarInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        hidden
                                        onChange={handleSelectAvatar}
                                    />

                                    <input
                                        name="avatarUrl"
                                        type="text"
                                        value={formData.avatarUrl}
                                        onChange={handleChange}
                                        placeholder="Nhập URL ảnh đại diện..."
                                    />

                                    <small>JPG, PNG, WEBP. Tối đa 2MB khi tải từ máy.</small>
                                </div>

                                <div className="admin-customer-form-group">
                                    <label htmlFor="customerFullName">Họ và tên *</label>
                                    <input
                                        id="customerFullName"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        maxLength={100}
                                        required
                                    />
                                </div>

                                <div className="admin-customer-form-group">
                                    <label htmlFor="customerUsername">Tên đăng nhập *</label>
                                    <input
                                        id="customerUsername"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        minLength={4}
                                        maxLength={30}
                                        required
                                    />
                                    <small>4–30 ký tự; chữ, số, dấu chấm và gạch dưới.</small>
                                </div>

                                <div className="admin-customer-form-group">
                                    <label htmlFor="customerEmail">Email *</label>
                                    <input
                                        id="customerEmail"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        maxLength={150}
                                        required
                                    />
                                </div>

                                <div className="admin-customer-form-group">
                                    <label htmlFor="customerPhone">Số điện thoại</label>
                                    <input
                                        id="customerPhone"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        maxLength={15}
                                    />
                                </div>

                                <div className="admin-customer-form-group">
                                    <label htmlFor="customerBirth">Ngày sinh</label>
                                    <input
                                        id="customerBirth"
                                        name="dateOfBirth"
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="admin-customer-form-group">
                                    <label htmlFor="customerGender">Giới tính</label>
                                    <select
                                        id="customerGender"
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                    >
                                        <option value="">Chưa cập nhật</option>
                                        <option value="Male">Nam</option>
                                        <option value="Female">Nữ</option>
                                        <option value="Other">Khác</option>
                                    </select>
                                </div>
                            </div>

                            <div className="admin-customer-form-footer">
                                <button
                                    type="button"
                                    className="cancel"
                                    onClick={handleCloseModal}
                                    disabled={isSaving}
                                >
                                    Hủy
                                </button>

                                <button type="submit" disabled={isSaving}>
                                    {isSaving ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm"></span>
                                            Đang lưu...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-lg"></i>
                                            Lưu thay đổi
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal xem ảnh lớn */}

            {isAvatarPreviewOpen && (
                <div
                    className="admin-customer-avatar-overlay"
                    onClick={() => setIsAvatarPreviewOpen(false)}
                >
                    <div
                        className="admin-customer-avatar-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="admin-customer-avatar-close"
                            onClick={() => setIsAvatarPreviewOpen(false)}
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>

                        <img
                            src={avatarPreviewUrl || DEFAULT_AVATAR}
                            alt="Ảnh đại diện kích thước lớn"
                            onError={(event) => {
                                event.currentTarget.src = DEFAULT_AVATAR;
                            }}
                        />

                        <span>Ảnh đại diện khách hàng</span>
                    </div>
                </div>
            )}

            {/* Modal mật khẩu tạm thời */}

            {temporaryPasswordInfo && (
                <div
                    className="admin-customer-avatar-overlay"
                    onClick={() => setTemporaryPasswordInfo(null)}
                >
                    <div
                        className="admin-customer-password-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="admin-customer-password-icon">
                            <i className="bi bi-shield-lock"></i>
                        </div>

                        <h4>Đặt lại mật khẩu thành công</h4>

                        <p>
                            Mật khẩu tạm thời dành cho{" "}
                            <strong>{temporaryPasswordInfo.customerName}</strong>
                        </p>

                        <div className="admin-customer-password-field">
                            <span>Tên đăng nhập</span>
                            <strong>{temporaryPasswordInfo.username}</strong>
                        </div>

                        <div className="admin-customer-password-field">
                            <span>Mật khẩu tạm thời</span>
                            <div>
                                <strong>{temporaryPasswordInfo.password}</strong>
                                <button
                                    type="button"
                                    onClick={handleCopyTemporaryPassword}
                                    title="Sao chép mật khẩu"
                                >
                                    <i className="bi bi-copy"></i>
                                </button>
                            </div>
                        </div>

                        <div className="admin-customer-password-warning">
                            <i className="bi bi-exclamation-triangle"></i>
                            <span>
                                Hãy sao chép và cung cấp mật khẩu này cho khách hàng.
                                Mật khẩu sẽ không được hiển thị lại sau khi đóng cửa sổ.
                            </span>
                        </div>

                        <button
                            type="button"
                            className="admin-customer-password-confirm"
                            onClick={() => setTemporaryPasswordInfo(null)}
                        >
                            Đã hiểu
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminCustomers;
