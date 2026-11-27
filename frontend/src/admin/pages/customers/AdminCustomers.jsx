
import { useEffect, useMemo, useState } from "react";

import {
    getCustomers,
    getCustomerStatistics,
    updateCustomer,
    updateCustomerStatus
} from "../../../services/customerService.js";

import "./AdminCustomers.css";

const EMPTY_FORM = {
    fullName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    avatarUrl: ""
};

const DEFAULT_AVATAR =
    "https://placehold.co/120x120?text=User";

const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("vi-VN").format(date);
};

const formatDateTime = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).format(date);
};

const getStatusLabel = (status) =>
    status === "Inactive" ? "Đã khóa" : "Đang hoạt động";

const getGenderLabel = (gender) => {
    if (gender === "Male") return "Nam";
    if (gender === "Female") return "Nữ";
    if (gender === "Other") return "Khác";
    return "Chưa cập nhật";
};

//=================== Trang quản lý khách hàng ========================

function AdminCustomers() {
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

    //=================== Tải dữ liệu ========================

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
            console.error("Không thể tải danh sách khách hàng:", error);

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

    //=================== Tìm kiếm và lọc ========================

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

    //=================== Xóa bộ lọc ========================

    const handleClearFilters = () => {
        setSearchTerm("");
        setSelectedStatus("Tất cả");
    };

    //=================== Mở form chỉnh sửa ========================

    const handleOpenEdit = (customer) => {
        setEditingCustomer(customer);

        setFormData({
            fullName: customer.fullName || "",
            email: customer.email || "",
            phoneNumber: customer.phoneNumber || "",
            dateOfBirth: customer.dateOfBirth || "",
            gender: customer.gender || "",
            avatarUrl: customer.avatarUrl || ""
        });

        setIsModalOpen(true);
        setSelectedCustomer(null);
    };

    //=================== Đóng form ========================

    const handleCloseModal = () => {
        if (isSaving) return;

        setIsModalOpen(false);
        setEditingCustomer(null);
        setFormData({ ...EMPTY_FORM });
    };

    //=================== Thay đổi form ========================

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value
        }));
    };

    //=================== Cập nhật khách hàng ========================

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!editingCustomer) return;

        if (!formData.fullName.trim()) {
            alert("Vui lòng nhập họ và tên khách hàng.");
            return;
        }

        if (!formData.email.trim()) {
            alert("Vui lòng nhập email khách hàng.");
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(formData.email.trim())) {
            alert("Email không đúng định dạng.");
            return;
        }

        setIsSaving(true);

        try {
            const updatedCustomer = await updateCustomer(
                editingCustomer.userId,
                {
                    ...formData,
                    fullName: formData.fullName.trim(),
                    email: formData.email.trim().toLowerCase(),
                    phoneNumber: formData.phoneNumber.trim(),
                    avatarUrl: formData.avatarUrl.trim()
                }
            );

            setCustomers((current) =>
                current.map((customer) =>
                    String(customer.userId) ===
                    String(updatedCustomer.userId)
                        ? updatedCustomer
                        : customer
                )
            );

            setSelectedCustomer(updatedCustomer);

            setIsModalOpen(false);
            setEditingCustomer(null);
            setFormData({ ...EMPTY_FORM });

            alert("Cập nhật thông tin khách hàng thành công.");
        } catch (error) {
            console.error("Không thể cập nhật khách hàng:", error);

            alert(
                error.message || "Không thể cập nhật thông tin khách hàng."
            );
        } finally {
            setIsSaving(false);
        }
    };

    //=================== Xem chi tiết ========================

    const handleViewDetail = (customer) => {
        setSelectedCustomer(customer);
    };

    //=================== Khóa / mở khóa tài khoản ========================

    const handleToggleStatus = async (customer) => {
        const currentStatus = customer.status || "Active";

        const nextStatus =
            currentStatus === "Active" ? "Inactive" : "Active";

        const actionText =
            nextStatus === "Inactive" ? "khóa" : "mở khóa";

        const confirmed = window.confirm(
            `Bạn có chắc chắn muốn ${actionText} tài khoản của "${customer.fullName}" không?`
        );

        if (!confirmed) return;

        setUpdatingId(customer.userId);

        try {
            const updatedCustomer = await updateCustomerStatus(
                customer.userId,
                nextStatus
            );

            setCustomers((current) =>
                current.map((item) =>
                    String(item.userId) ===
                    String(updatedCustomer.userId)
                        ? updatedCustomer
                        : item
                )
            );

            setSelectedCustomer((current) =>
                current &&
                String(current.userId) ===
                String(updatedCustomer.userId)
                    ? updatedCustomer
                    : current
            );

            const updatedCustomers = customers.map((item) =>
                String(item.userId) === String(updatedCustomer.userId)
                    ? updatedCustomer
                    : item
            );

            setStatistics({
                total: updatedCustomers.length,
                active: updatedCustomers.filter(
                    (item) => (item.status || "Active") === "Active"
                ).length,
                inactive: updatedCustomers.filter(
                    (item) => item.status === "Inactive"
                ).length,
                newToday: statistics.newToday
            });
        } catch (error) {
            console.error("Không thể cập nhật trạng thái:", error);

            alert(
                error.message || "Không thể cập nhật trạng thái tài khoản."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    //=================== Trạng thái tải ========================

    if (isLoading) {
        return (
            <div className="admin-customers">
                <div className="admin-customers-empty">
                    <i className="bi bi-hourglass-split"></i>
                    <h5>Đang tải danh sách khách hàng...</h5>
                </div>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="admin-customers">
                <div className="admin-customers-empty">
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

    return (
        <div className="admin-customers">

            {/* Tiêu đề */}

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

            {/* Danh sách khách hàng */}

            <section className="admin-panel admin-customers-panel">

                {/* Bộ lọc */}

                <div className="admin-customers-toolbar">

                    <div className="admin-customers-search">
                        <i className="bi bi-search"></i>

                        <input
                            type="search"
                            placeholder="Tìm tên, username, email hoặc số điện thoại..."
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                        />
                    </div>

                    <div className="admin-customers-filter">
                        <label htmlFor="adminCustomerStatus">
                            Trạng thái tài khoản
                        </label>

                        <select
                            id="adminCustomerStatus"
                            value={selectedStatus}
                            onChange={(event) =>
                                setSelectedStatus(event.target.value)
                            }
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

                {/* Tiêu đề danh sách */}

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

                {/* Bảng khách hàng */}

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
                                    const status =
                                        customer.status || "Active";

                                    return (
                                        <tr key={customer.userId}>
                                            <td>
                                                <div className="admin-customer-info">
                                                    <img
                                                        src={
                                                            customer.avatarUrl ||
                                                            DEFAULT_AVATAR
                                                        }
                                                        alt={customer.fullName}
                                                        onError={(event) => {
                                                            event.currentTarget.src =
                                                                DEFAULT_AVATAR;
                                                        }}
                                                    />

                                                    <div>
                                                        <strong>
                                                            {customer.fullName ||
                                                                "Chưa cập nhật"}
                                                        </strong>

                                                        <span>
                                                            ID: {customer.userId}
                                                        </span>
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

                                            <td>
                                                {customer.phoneNumber || "—"}
                                            </td>

                                            <td>
                                                {formatDate(customer.createdAt)}
                                            </td>

                                            <td>
                                                <span
                                                    className={`admin-customer-status ${
                                                        status === "Active"
                                                            ? "active"
                                                            : "inactive"
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
                                                        onClick={() =>
                                                            handleViewDetail(customer)
                                                        }
                                                    >
                                                        <i className="bi bi-eye"></i>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="edit"
                                                        title="Chỉnh sửa"
                                                        onClick={() =>
                                                            handleOpenEdit(customer)
                                                        }
                                                    >
                                                        <i className="bi bi-pencil"></i>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={
                                                            status === "Active"
                                                                ? "deactivate"
                                                                : "activate"
                                                        }
                                                        title={
                                                            status === "Active"
                                                                ? "Khóa tài khoản"
                                                                : "Mở khóa tài khoản"
                                                        }
                                                        disabled={
                                                            updatingId === customer.userId
                                                        }
                                                        onClick={() =>
                                                            handleToggleStatus(customer)
                                                        }
                                                    >
                                                        {updatingId === customer.userId ? (
                                                            <span className="spinner-border spinner-border-sm"></span>
                                                        ) : (
                                                            <i
                                                                className={
                                                                    status === "Active"
                                                                        ? "bi bi-lock"
                                                                        : "bi bi-unlock"
                                                                }
                                                            ></i>
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
                                            <strong>
                                                Không tìm thấy khách hàng
                                            </strong>
                                            <span>
                                                Không có khách hàng phù hợp với
                                                điều kiện tìm kiếm hiện tại.
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Modal chi tiết khách hàng */}

            {selectedCustomer && (
                <div
                    className="admin-customer-detail-overlay"
                    onClick={() => setSelectedCustomer(null)}
                >
                    <div
                        className="admin-customer-detail-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="adminCustomerDetailTitle"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="admin-customer-modal-header">
                            <div>
                                <h4 id="adminCustomerDetailTitle">
                                    Chi tiết khách hàng
                                </h4>
                                <p>
                                    Thông tin tài khoản khách hàng trong hệ thống
                                </p>
                            </div>

                            <button
                                type="button"
                                aria-label="Đóng"
                                onClick={() => setSelectedCustomer(null)}
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <div className="admin-customer-detail-body">
                            <div className="admin-customer-profile">
                                <img
                                    src={
                                        selectedCustomer.avatarUrl ||
                                        DEFAULT_AVATAR
                                    }
                                    alt={selectedCustomer.fullName}
                                    onError={(event) => {
                                        event.currentTarget.src = DEFAULT_AVATAR;
                                    }}
                                />

                                <div>
                                    <h5>
                                        {selectedCustomer.fullName ||
                                            "Chưa cập nhật"}
                                    </h5>

                                    <span>
                                        @{selectedCustomer.username || "unknown"}
                                    </span>

                                    <span
                                        className={`admin-customer-status ${
                                            (selectedCustomer.status || "Active") ===
                                            "Active"
                                                ? "active"
                                                : "inactive"
                                        }`}
                                    >
                                        {getStatusLabel(
                                            selectedCustomer.status || "Active"
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="admin-customer-detail-section">
                                <h5>Thông tin cá nhân</h5>

                                <div className="admin-customer-detail-grid">
                                    <div>
                                        <span>Mã khách hàng</span>
                                        <strong>{selectedCustomer.userId}</strong>
                                    </div>

                                    <div>
                                        <span>Email</span>
                                        <strong>
                                            {selectedCustomer.email || "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Số điện thoại</span>
                                        <strong>
                                            {selectedCustomer.phoneNumber || "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Ngày sinh</span>
                                        <strong>
                                            {formatDate(
                                                selectedCustomer.dateOfBirth
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Giới tính</span>
                                        <strong>
                                            {getGenderLabel(
                                                selectedCustomer.gender
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Ngày đăng ký</span>
                                        <strong>
                                            {formatDateTime(
                                                selectedCustomer.createdAt
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Cập nhật gần nhất</span>
                                        <strong>
                                            {formatDateTime(
                                                selectedCustomer.updatedAt
                                            )}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="admin-customer-modal-footer">
                            <button
                                type="button"
                                className="close"
                                onClick={() => setSelectedCustomer(null)}
                            >
                                Đóng
                            </button>

                            <button
                                type="button"
                                className="edit"
                                onClick={() =>
                                    handleOpenEdit(selectedCustomer)
                                }
                            >
                                <i className="bi bi-pencil"></i>
                                Chỉnh sửa
                            </button>

                            <button
                                type="button"
                                className={
                                    (selectedCustomer.status || "Active") ===
                                    "Active"
                                        ? "danger"
                                        : "success"
                                }
                                disabled={
                                    updatingId === selectedCustomer.userId
                                }
                                onClick={() =>
                                    handleToggleStatus(selectedCustomer)
                                }
                            >
                                <i
                                    className={
                                        (selectedCustomer.status || "Active") ===
                                        "Active"
                                            ? "bi bi-lock"
                                            : "bi bi-unlock"
                                    }
                                ></i>

                                {(selectedCustomer.status || "Active") ===
                                "Active"
                                    ? "Khóa tài khoản"
                                    : "Mở khóa"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal chỉnh sửa khách hàng */}

            {isModalOpen && editingCustomer && (
                <div
                    className="admin-customer-modal-overlay"
                    onClick={handleCloseModal}
                >
                    <div
                        className="admin-customer-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="adminCustomerFormTitle"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="admin-customer-modal-header">
                            <div>
                                <h4 id="adminCustomerFormTitle">
                                    Chỉnh sửa khách hàng
                                </h4>

                                <p>
                                    Cập nhật thông tin tài khoản khách hàng
                                </p>
                            </div>

                            <button
                                type="button"
                                aria-label="Đóng"
                                disabled={isSaving}
                                onClick={handleCloseModal}
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <form
                            className="admin-customer-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="admin-customer-form-grid">

                                <div className="admin-customer-form-group full">
                                    <label htmlFor="customerFullName">
                                        Họ và tên <span>*</span>
                                    </label>

                                    <input
                                        id="customerFullName"
                                        name="fullName"
                                        type="text"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="Nhập họ và tên"
                                        maxLength="100"
                                        required
                                    />
                                </div>

                                <div className="admin-customer-form-group">
                                    <label htmlFor="customerUsername">
                                        Username
                                    </label>

                                    <input
                                        id="customerUsername"
                                        type="text"
                                        value={editingCustomer.username || ""}
                                        disabled
                                    />

                                    <small>
                                        Username không thể thay đổi.
                                    </small>
                                </div>

                                <div className="admin-customer-form-group">
                                    <label htmlFor="customerEmail">
                                        Email <span>*</span>
                                    </label>

                                    <input
                                        id="customerEmail"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="example@email.com"
                                        maxLength="150"
                                        required
                                    />
                                </div>

                                <div className="admin-customer-form-group">
                                    <label htmlFor="customerPhone">
                                        Số điện thoại
                                    </label>

                                    <input
                                        id="customerPhone"
                                        name="phoneNumber"
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        placeholder="Nhập số điện thoại"
                                        maxLength="20"
                                    />
                                </div>

                                <div className="admin-customer-form-group">
                                    <label htmlFor="customerDateOfBirth">
                                        Ngày sinh
                                    </label>

                                    <input
                                        id="customerDateOfBirth"
                                        name="dateOfBirth"
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="admin-customer-form-group">
                                    <label htmlFor="customerGender">
                                        Giới tính
                                    </label>

                                    <select
                                        id="customerGender"
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                    >
                                        <option value="">
                                            Chưa cập nhật
                                        </option>
                                        <option value="Male">Nam</option>
                                        <option value="Female">Nữ</option>
                                        <option value="Other">Khác</option>
                                    </select>
                                </div>

                                <div className="admin-customer-form-group full">
                                    <label htmlFor="customerAvatar">
                                        Đường dẫn ảnh đại diện
                                    </label>

                                    <input
                                        id="customerAvatar"
                                        name="avatarUrl"
                                        type="url"
                                        value={formData.avatarUrl}
                                        onChange={handleChange}
                                        placeholder="https://example.com/avatar.jpg"
                                    />

                                    <small>
                                        Có thể để trống nếu khách hàng chưa có ảnh.
                                    </small>
                                </div>

                                <div className="admin-customer-form-group full">
                                    <div className="admin-customer-form-preview">
                                        <img
                                            src={
                                                formData.avatarUrl ||
                                                DEFAULT_AVATAR
                                            }
                                            alt="Ảnh đại diện xem trước"
                                            onError={(event) => {
                                                event.currentTarget.src =
                                                    DEFAULT_AVATAR;
                                            }}
                                        />

                                        <div>
                                            <strong>Xem trước ảnh đại diện</strong>
                                            <span>
                                                Ảnh sẽ được cập nhật sau khi lưu
                                                thông tin.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="admin-customer-form-footer">
                                <button
                                    type="button"
                                    className="cancel"
                                    disabled={isSaving}
                                    onClick={handleCloseModal}
                                >
                                    Hủy
                                </button>

                                <button
                                    type="submit"
                                    className="submit"
                                    disabled={isSaving}
                                >
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

        </div>
    );
}

export default AdminCustomers;
