
import { useEffect, useMemo, useState } from "react";

import {
    getCinemas,
    createCinema,
    updateCinema,
    deleteCinema
} from "../../../services/cinemaService.js";

import "./AdminCinemas.css";

const STATUS_OPTIONS = [
    { value: "Active", label: "Đang hoạt động" },
    { value: "Inactive", label: "Ngừng hoạt động" }
];

const EMPTY_FORM = {
    name: "",
    address: "",
    province: "",
    district: "",
    ward: "",
    phone: "",
    email: "",
    description: "",
    image: "",
    openingTime: "08:00",
    closingTime: "23:00",
    status: "Active"
};

const getStatusLabel = (status) => {
    return status === "Active"
        ? "Đang hoạt động"
        : "Ngừng hoạt động";
};

function AdminCinemas() {
    const [cinemas, setCinemas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("Tất cả");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCinema, setEditingCinema] = useState(null);
    const [formData, setFormData] = useState({ ...EMPTY_FORM });

    // Tải danh sách rạp từ cinemaService
    const loadCinemas = async () => {
        setIsLoading(true);
        setError("");

        try {
            const data = await getCinemas();
            setCinemas(data);
        } catch (error) {
            console.error("Không thể tải danh sách rạp:", error);
            setError(error.message || "Không thể tải danh sách rạp.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCinemas();
    }, []);

    // Thống kê rạp chiếu
    const statistics = useMemo(() => ({
        total: cinemas.length,
        active: cinemas.filter(
            (cinema) => cinema.status === "Active"
        ).length,
        inactive: cinemas.filter(
            (cinema) => cinema.status !== "Active"
        ).length
    }), [cinemas]);

    // Danh sách rạp sau khi tìm kiếm và lọc
    const filteredCinemas = useMemo(() => {
        const keyword = searchTerm.trim().toLocaleLowerCase("vi");

        return cinemas.filter((cinema) => {
            const matchesSearch =
                !keyword ||
                (cinema.name || "").toLocaleLowerCase("vi").includes(keyword) ||
                (cinema.address || "").toLocaleLowerCase("vi").includes(keyword) ||
                (cinema.province || "").toLocaleLowerCase("vi").includes(keyword) ||
                (cinema.district || "").toLocaleLowerCase("vi").includes(keyword);

            const matchesStatus =
                selectedStatus === "Tất cả" ||
                cinema.status === selectedStatus;

            return matchesSearch && matchesStatus;
        });
    }, [cinemas, searchTerm, selectedStatus]);

    // Mở form thêm rạp
    const handleOpenCreate = () => {
        setEditingCinema(null);
        setFormData({ ...EMPTY_FORM });
        setIsModalOpen(true);
    };

    // Mở form chỉnh sửa rạp
    const handleOpenEdit = (cinema) => {
        setEditingCinema(cinema);

        setFormData({
            name: cinema.name || "",
            address: cinema.address || "",
            province: cinema.province || "",
            district: cinema.district || "",
            ward: cinema.ward || "",
            phone: cinema.phone || "",
            email: cinema.email || "",
            description: cinema.description || "",
            image: cinema.image || "",
            openingTime: cinema.openingTime || "08:00",
            closingTime: cinema.closingTime || "23:00",
            status: cinema.status || "Active"
        });

        setIsModalOpen(true);
    };

    // Đóng modal
    const handleCloseModal = () => {
        if (isSaving) return;

        setIsModalOpen(false);
        setEditingCinema(null);
        setFormData({ ...EMPTY_FORM });
    };

    // Cập nhật dữ liệu form
    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value
        }));
    };

    // Thêm hoặc cập nhật rạp
    const handleSubmit = async (event) => {
        event.preventDefault();

        const cinemaName = formData.name.trim();
        const cinemaAddress = formData.address.trim();
        const cinemaProvince = formData.province.trim();

        if (!cinemaName || !cinemaAddress || !cinemaProvince) {
            alert("Vui lòng nhập tên rạp, địa chỉ và tỉnh/thành phố.");
            return;
        }

        // Kiểm tra tên rạp trùng lặp
        const normalizedName = cinemaName
            .normalize("NFC")
            .toLocaleLowerCase("vi");

        const isDuplicate = cinemas.some((cinema) => {
            const currentName = (cinema.name || "")
                .normalize("NFC")
                .toLocaleLowerCase("vi");

            return (
                currentName === normalizedName &&
                String(cinema.id) !== String(editingCinema?.id)
            );
        });

        if (isDuplicate) {
            alert("Tên rạp này đã tồn tại.");
            return;
        }

        const cinemaData = {
            name: cinemaName,
            address: cinemaAddress,
            province: cinemaProvince,
            district: formData.district.trim(),
            ward: formData.ward.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim(),
            description: formData.description.trim(),
            image: formData.image.trim(),
            openingTime: formData.openingTime,
            closingTime: formData.closingTime,
            status: formData.status
        };

        setIsSaving(true);

        try {
            if (editingCinema) {
                const updatedCinema = await updateCinema(
                    editingCinema.id,
                    cinemaData
                );

                setCinemas((current) =>
                    current.map((cinema) =>
                        String(cinema.id) === String(updatedCinema.id)
                            ? updatedCinema
                            : cinema
                    )
                );
            } else {
                const newCinema = await createCinema(cinemaData);

                setCinemas((current) => [
                    ...current,
                    newCinema
                ]);
            }

            setIsModalOpen(false);
            setEditingCinema(null);
            setFormData({ ...EMPTY_FORM });
        } catch (error) {
            console.error("Không thể lưu thông tin rạp:", error);

            alert(error.message || "Không thể lưu thông tin rạp.");
        } finally {
            setIsSaving(false);
        }
    };

    // Xóa rạp
    const handleDelete = async (cinema) => {
        const confirmed = window.confirm(
            `Bạn có chắc chắn muốn xóa rạp "${cinema.name}" không?`
        );

        if (!confirmed) return;

        try {
            await deleteCinema(cinema.id);

            setCinemas((current) =>
                current.filter(
                    (item) => String(item.id) !== String(cinema.id)
                )
            );
        } catch (error) {
            console.error("Không thể xóa rạp:", error);

            alert(error.message || "Không thể xóa rạp.");
        }
    };

    // Xóa bộ lọc
    const handleClearFilters = () => {
        setSearchTerm("");
        setSelectedStatus("Tất cả");
    };

    // Trạng thái tải dữ liệu
    if (isLoading) {
        return (
            <div className="admin-cinemas">
                <div className="admin-cinemas-empty">
                    <i className="bi bi-hourglass-split"></i>
                    <h5>Đang tải danh sách rạp...</h5>
                </div>
            </div>
        );
    }

    // Trạng thái lỗi
    if (error) {
        return (
            <div className="admin-cinemas">
                <div className="admin-cinemas-empty">
                    <i className="bi bi-exclamation-circle"></i>
                    <h5>Không thể tải danh sách rạp</h5>
                    <p>{error}</p>

                    <button type="button" onClick={loadCinemas}>
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-cinemas">
            {/* Tiêu đề */}
            <div className="admin-page-intro admin-cinemas-intro">
                <div>
                    <h3>Quản lý rạp chiếu</h3>
                    <p>
                        Quản lý thông tin hệ thống rạp chiếu
                        ViewBookCinemas.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-cinemas-add-button"
                    onClick={handleOpenCreate}
                >
                    <i className="bi bi-plus-lg"></i>
                    Thêm rạp chiếu
                </button>
            </div>

            {/* Thống kê */}
            <div className="admin-cinemas-statistics">
                <div className="admin-cinema-stat-card">
                    <div className="admin-cinema-stat-icon blue">
                        <i className="bi bi-building"></i>
                    </div>
                    <div>
                        <span>Tổng số rạp</span>
                        <strong>{statistics.total}</strong>
                    </div>
                </div>

                <div className="admin-cinema-stat-card">
                    <div className="admin-cinema-stat-icon green">
                        <i className="bi bi-check-circle"></i>
                    </div>
                    <div>
                        <span>Đang hoạt động</span>
                        <strong>{statistics.active}</strong>
                    </div>
                </div>

                <div className="admin-cinema-stat-card">
                    <div className="admin-cinema-stat-icon gray">
                        <i className="bi bi-pause-circle"></i>
                    </div>
                    <div>
                        <span>Ngừng hoạt động</span>
                        <strong>{statistics.inactive}</strong>
                    </div>
                </div>
            </div>

            {/* Danh sách rạp */}
            <section className="admin-panel admin-cinemas-panel">
                <div className="admin-cinemas-toolbar">
                    <div className="admin-cinemas-search">
                        <i className="bi bi-search"></i>
                        <input
                            type="search"
                            placeholder="Tìm tên rạp, địa chỉ, tỉnh/thành..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                        />
                    </div>

                    <div className="admin-cinemas-filter">
                        <label htmlFor="cinemaStatus">Trạng thái</label>
                        <select
                            id="cinemaStatus"
                            value={selectedStatus}
                            onChange={(event) => setSelectedStatus(event.target.value)}
                        >
                            <option value="Tất cả">Tất cả trạng thái</option>
                            {STATUS_OPTIONS.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="button"
                        className="admin-cinemas-reset-button"
                        onClick={handleClearFilters}
                        title="Xóa bộ lọc"
                    >
                        <i className="bi bi-arrow-counterclockwise"></i>
                    </button>
                </div>

                <div className="admin-cinemas-list-heading">
                    <div>
                        <h5>Danh sách rạp chiếu</h5>
                        <p>Thông tin các rạp hiện có trong hệ thống</p>
                    </div>

                    <span>
                        Hiển thị <strong>{filteredCinemas.length}</strong> /{" "}
                        {cinemas.length} rạp
                    </span>
                </div>

                <div className="admin-table-wrapper">
                    <table className="admin-table admin-cinemas-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>THÔNG TIN RẠP</th>
                                <th>ĐỊA CHỈ</th>
                                <th>LIÊN HỆ</th>
                                <th>GIỜ HOẠT ĐỘNG</th>
                                <th>TRẠNG THÁI</th>
                                <th>THAO TÁC</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredCinemas.map((cinema, index) => (
                                <tr key={cinema.id}>
                                    <td>{index + 1}</td>

                                    <td>
                                        <div className="admin-cinema-info">
                                            <img
                                                src={
                                                    cinema.image ||
                                                    "https://placehold.co/100x70?text=Cinema"
                                                }
                                                alt={cinema.name}
                                                onError={(event) => {
                                                    event.currentTarget.src =
                                                        "https://placehold.co/100x70?text=Cinema";
                                                }}
                                            />
                                            <div>
                                                <strong>{cinema.name}</strong>
                                                <span>
                                                    {cinema.district || "Chưa cập nhật"},{" "}
                                                    {cinema.province || "Chưa cập nhật"}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="admin-cinema-address">
                                            <span>{cinema.address}</span>
                                            {cinema.ward && (
                                                <small>{cinema.ward}</small>
                                            )}
                                        </div>
                                    </td>

                                    <td>
                                        <div className="admin-cinema-contact">
                                            <span>
                                                <i className="bi bi-telephone"></i>
                                                {cinema.phone || "Chưa cập nhật"}
                                            </span>
                                            <span>
                                                <i className="bi bi-envelope"></i>
                                                {cinema.email || "Chưa cập nhật"}
                                            </span>
                                        </div>
                                    </td>

                                    <td>
                                        <span className="admin-cinema-hours">
                                            {cinema.openingTime || "--:--"}
                                            {" - "}
                                            {cinema.closingTime || "--:--"}
                                        </span>
                                    </td>

                                    <td>
                                        <span
                                            className={`admin-cinema-status ${
                                                cinema.status === "Active"
                                                    ? "active"
                                                    : "inactive"
                                            }`}
                                        >
                                            {getStatusLabel(cinema.status)}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="admin-cinema-actions">
                                            <button
                                                type="button"
                                                className="edit"
                                                title="Chỉnh sửa"
                                                onClick={() => handleOpenEdit(cinema)}
                                            >
                                                <i className="bi bi-pencil-square"></i>
                                            </button>

                                            <button
                                                type="button"
                                                className="delete"
                                                title="Xóa rạp"
                                                onClick={() => handleDelete(cinema)}
                                            >
                                                <i className="bi bi-trash3"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredCinemas.length === 0 && (
                        <div className="admin-cinemas-empty">
                            <i className="bi bi-building"></i>
                            <h5>Không tìm thấy rạp chiếu</h5>
                            <p>
                                Hãy thử thay đổi từ khóa hoặc điều kiện lọc.
                            </p>
                            <button type="button" onClick={handleClearFilters}>
                                Xóa bộ lọc
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Modal thêm / chỉnh sửa */}
            {isModalOpen && (
                <div
                    className="admin-cinema-modal-overlay"
                    onClick={handleCloseModal}
                >
                    <div
                        className="admin-cinema-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="adminCinemaModalTitle"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="admin-cinema-modal-header">
                            <div>
                                <h4 id="adminCinemaModalTitle">
                                    {editingCinema
                                        ? "Chỉnh sửa rạp chiếu"
                                        : "Thêm rạp chiếu mới"}
                                </h4>
                                <p>Nhập thông tin rạp chiếu bên dưới.</p>
                            </div>

                            <button
                                type="button"
                                onClick={handleCloseModal}
                                aria-label="Đóng"
                                disabled={isSaving}
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <form
                            className="admin-cinema-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="admin-cinema-form-grid">
                                <div className="admin-cinema-form-group full">
                                    <label htmlFor="cinemaName">Tên rạp *</label>
                                    <input
                                        id="cinemaName"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Nhập tên rạp..."
                                        required
                                    />
                                </div>

                                <div className="admin-cinema-form-group full">
                                    <label htmlFor="cinemaAddress">Địa chỉ *</label>
                                    <input
                                        id="cinemaAddress"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Nhập địa chỉ..."
                                        required
                                    />
                                </div>

                                <div className="admin-cinema-form-group">
                                    <label htmlFor="cinemaProvince">Tỉnh / Thành phố *</label>
                                    <input
                                        id="cinemaProvince"
                                        name="province"
                                        value={formData.province}
                                        onChange={handleChange}
                                        placeholder="Ví dụ: Cần Thơ"
                                        required
                                    />
                                </div>

                                <div className="admin-cinema-form-group">
                                    <label htmlFor="cinemaDistrict">Quận / Huyện</label>
                                    <input
                                        id="cinemaDistrict"
                                        name="district"
                                        value={formData.district}
                                        onChange={handleChange}
                                        placeholder="Nhập quận / huyện..."
                                    />
                                </div>

                                <div className="admin-cinema-form-group">
                                    <label htmlFor="cinemaWard">Phường / Xã</label>
                                    <input
                                        id="cinemaWard"
                                        name="ward"
                                        value={formData.ward}
                                        onChange={handleChange}
                                        placeholder="Nhập phường / xã..."
                                    />
                                </div>

                                <div className="admin-cinema-form-group">
                                    <label htmlFor="cinemaPhone">Số điện thoại</label>
                                    <input
                                        id="cinemaPhone"
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Nhập số điện thoại..."
                                    />
                                </div>

                                <div className="admin-cinema-form-group">
                                    <label htmlFor="cinemaEmail">Email</label>
                                    <input
                                        id="cinemaEmail"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Nhập email..."
                                    />
                                </div>

                                <div className="admin-cinema-form-group">
                                    <label htmlFor="cinemaImage">URL hình ảnh</label>
                                    <input
                                        id="cinemaImage"
                                        name="image"
                                        type="url"
                                        value={formData.image}
                                        onChange={handleChange}
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="admin-cinema-form-group">
                                    <label htmlFor="cinemaOpeningTime">Giờ mở cửa</label>
                                    <input
                                        id="cinemaOpeningTime"
                                        name="openingTime"
                                        type="time"
                                        value={formData.openingTime}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="admin-cinema-form-group">
                                    <label htmlFor="cinemaClosingTime">Giờ đóng cửa</label>
                                    <input
                                        id="cinemaClosingTime"
                                        name="closingTime"
                                        type="time"
                                        value={formData.closingTime}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="admin-cinema-form-group">
                                    <label htmlFor="cinemaStatusForm">Trạng thái</label>
                                    <select
                                        id="cinemaStatusForm"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        {STATUS_OPTIONS.map((status) => (
                                            <option
                                                key={status.value}
                                                value={status.value}
                                            >
                                                {status.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="admin-cinema-form-group full">
                                    <label htmlFor="cinemaDescription">Mô tả</label>
                                    <textarea
                                        id="cinemaDescription"
                                        name="description"
                                        rows="4"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Nhập mô tả rạp chiếu..."
                                    />
                                </div>
                            </div>

                            <div className="admin-cinema-form-footer">
                                <button
                                    type="button"
                                    className="cancel"
                                    onClick={handleCloseModal}
                                    disabled={isSaving}
                                >
                                    Hủy
                                </button>

                                <button
                                    type="submit"
                                    className="submit"
                                    disabled={isSaving}
                                >
                                    <i className="bi bi-check-lg"></i>
                                    {isSaving
                                        ? "Đang lưu..."
                                        : editingCinema
                                            ? "Lưu thay đổi"
                                            : "Thêm rạp"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminCinemas;
