
import { useEffect, useMemo, useState } from "react";

import {
    getCombos,
    createCombo,
    updateCombo,
    updateComboStatus,
    deleteCombo
} from "../../../services/comboService.js";

import "./AdminCombos.css";
import "../products/AdminProducts.css";

const DEFAULT_COMBO_IMAGE =
    "https://placehold.co/600x600?text=Combo";

const INITIAL_FORM = {
    comboName: "",
    description: "",
    price: "",
    stockQuantity: "20",
    imageUrl: "",
    status: "Active",
    startDate: "",
    endDate: ""
};

const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
    }).format(Number(value) || 0);

const formatNumber = (value) =>
    new Intl.NumberFormat("vi-VN").format(
        Number(value) || 0
    );

const formatDate = (value) => {
    if (!value) return "Không giới hạn";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Không hợp lệ";
    }

    return date.toLocaleDateString("vi-VN");
};

const toDateInputValue = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

function AdminCombos() {
    const [combos, setCombos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const [showModal, setShowModal] = useState(false);
    const [editingCombo, setEditingCombo] = useState(null);
    const [formData, setFormData] = useState(INITIAL_FORM);

    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailCombo, setDetailCombo] = useState(null);
    const [isImageZoomOpen, setIsImageZoomOpen] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // =========================================
    // LOAD COMBOS
    // =========================================

    const loadCombos = async () => {
        try {
            setIsLoading(true);

            const data = await getCombos();

            setCombos(data);
        } catch (error) {
            console.error(
                "Không thể tải danh sách combo:",
                error
            );

            setErrorMessage(
                error.message || "Không thể tải danh sách combo."
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCombos();
    }, []);

    // =========================================
    // FILTER AND STATISTICS
    // =========================================

    const filteredCombos = useMemo(() => {
        const keyword = searchTerm
            .trim()
            .toLocaleLowerCase("vi");

        return combos.filter((combo) => {
            const matchesSearch =
                !keyword ||
                combo.comboName
                    ?.toLocaleLowerCase("vi")
                    .includes(keyword) ||
                combo.description
                    ?.toLocaleLowerCase("vi")
                    .includes(keyword) ||
                String(combo.comboId).includes(keyword);

            const matchesStatus =
                statusFilter === "All" ||
                combo.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [combos, searchTerm, statusFilter]);

    const statistics = useMemo(() => ({
        total: combos.length,

        active: combos.filter(
            (combo) => combo.status === "Active"
        ).length,

        inactive: combos.filter(
            (combo) => combo.status === "Inactive"
        ).length,

        outOfStock: combos.filter(
            (combo) =>
                Number(combo.stockQuantity ?? 0) === 0
        ).length,

        totalStock: combos.reduce(
            (total, combo) =>
                total + (Number(combo.stockQuantity) || 0),
            0
        )
    }), [combos]);

    // =========================================
    // COMMON
    // =========================================

    const resetMessages = () => {
        setErrorMessage("");
        setSuccessMessage("");
    };

    const handleImageError = (event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = DEFAULT_COMBO_IMAGE;
    };

    // =========================================
    // CREATE / EDIT MODAL
    // =========================================

    const openCreateModal = () => {
        resetMessages();

        setEditingCombo(null);
        setFormData({ ...INITIAL_FORM });
        setShowModal(true);
    };

    const openEditModal = (combo) => {
        resetMessages();

        setEditingCombo(combo);

        setFormData({
            comboName: combo.comboName || "",
            description: combo.description || "",
            price: String(combo.price ?? ""),
            stockQuantity: String(
                combo.stockQuantity ?? 0
            ),
            imageUrl: combo.imageUrl || "",
            status: combo.status || "Active",
            startDate: toDateInputValue(combo.startDate),
            endDate: toDateInputValue(combo.endDate)
        });

        setShowModal(true);
    };

    const closeModal = () => {
        if (isSaving) return;

        setShowModal(false);
        setEditingCombo(null);
        setFormData({ ...INITIAL_FORM });
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // =========================================
    // FORM VALIDATION
    // =========================================

    const validateForm = () => {
        if (!formData.comboName.trim()) {
            return "Vui lòng nhập tên combo.";
        }

        if (formData.comboName.trim().length > 100) {
            return "Tên combo không được vượt quá 100 ký tự.";
        }

        if (!formData.description.trim()) {
            return "Vui lòng nhập mô tả combo.";
        }

        if (formData.description.trim().length > 500) {
            return "Mô tả combo không được vượt quá 500 ký tự.";
        }

        const price = Number(formData.price);

        if (
            !Number.isSafeInteger(price) ||
            price < 1000 ||
            price % 1000 !== 0
        ) {
            return "Giá combo phải là số nguyên dương và chia hết cho 1.000 VNĐ.";
        }

        const stockQuantity = Number(
            formData.stockQuantity
        );

        if (
            !Number.isSafeInteger(stockQuantity) ||
            stockQuantity < 0
        ) {
            return "Số lượng tồn kho phải là số nguyên không âm.";
        }

        if (
            formData.startDate &&
            formData.endDate &&
            formData.endDate < formData.startDate
        ) {
            return "Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.";
        }

        return "";
    };

    // =========================================
    // SAVE COMBO
    // =========================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        resetMessages();

        const validationError = validateForm();

        if (validationError) {
            setErrorMessage(validationError);
            return;
        }

        try {
            setIsSaving(true);

            const payload = {
                ...formData,
                comboName: formData.comboName.trim(),
                description: formData.description.trim(),
                price: Number(formData.price),
                stockQuantity: Number(formData.stockQuantity),
                imageUrl: formData.imageUrl.trim(),
                startDate: formData.startDate || null,
                endDate: formData.endDate || null
            };

            if (editingCombo) {
                await updateCombo(
                    editingCombo.comboId,
                    payload
                );

                setSuccessMessage(
                    "Cập nhật combo thành công."
                );
            } else {
                await createCombo(payload);

                setSuccessMessage(
                    "Thêm combo mới thành công."
                );
            }

            const data = await getCombos();

            setCombos(data);

            setShowModal(false);
            setEditingCombo(null);
            setFormData({ ...INITIAL_FORM });
        } catch (error) {
            console.error("Lỗi khi lưu combo:", error);

            setErrorMessage(
                error.message ||
                "Không thể lưu thông tin combo."
            );
        } finally {
            setIsSaving(false);
        }
    };

    // =========================================
    // TOGGLE STATUS
    // =========================================

    const handleToggleStatus = async (combo) => {
        const nextStatus =
            combo.status === "Active"
                ? "Inactive"
                : "Active";

        const confirmed = window.confirm(
            `Bạn có chắc muốn chuyển combo "${combo.comboName}" sang trạng thái ${
                nextStatus === "Active"
                    ? "Hoạt động"
                    : "Ngừng hoạt động"
            }?`
        );

        if (!confirmed) return;

        resetMessages();

        try {
            await updateComboStatus(
                combo.comboId,
                nextStatus
            );

            const data = await getCombos();

            setCombos(data);

            setSuccessMessage(
                "Cập nhật trạng thái combo thành công."
            );
        } catch (error) {
            console.error(
                "Lỗi cập nhật trạng thái:",
                error
            );

            setErrorMessage(
                error.message ||
                "Không thể cập nhật trạng thái combo."
            );
        }
    };

    // =========================================
    // DELETE COMBO
    // =========================================

    const handleDelete = async (combo) => {
        const confirmed = window.confirm(
            `Bạn có chắc muốn xóa combo "${combo.comboName}"?\nThao tác này không thể hoàn tác.`
        );

        if (!confirmed) return;

        resetMessages();

        try {
            await deleteCombo(combo.comboId);

            const data = await getCombos();

            setCombos(data);

            setSuccessMessage("Xóa combo thành công.");
        } catch (error) {
            console.error("Lỗi xóa combo:", error);

            setErrorMessage(
                error.message || "Không thể xóa combo."
            );
        }
    };

    // =========================================
    // COMBO DETAIL
    // =========================================

    const handleOpenDetail = (combo) => {
        resetMessages();

        setDetailCombo(combo);
        setIsDetailOpen(true);
        setIsImageZoomOpen(false);
    };

    const handleCloseDetail = () => {
        setIsDetailOpen(false);
        setIsImageZoomOpen(false);
        setDetailCombo(null);
    };

    // =========================================
    // IMAGE ZOOM
    // =========================================

    const handleOpenImageZoom = () => {
        if (detailCombo?.imageUrl) {
            setIsImageZoomOpen(true);
        }
    };

    const handleCloseImageZoom = () => {
        setIsImageZoomOpen(false);
    };

    // =========================================
    // EDIT FROM DETAIL
    // =========================================

    const handleEditFromDetail = () => {
        if (!detailCombo) return;

        const combo = detailCombo;

        handleCloseDetail();
        openEditModal(combo);
    };

    // =========================================
    // RENDER
    // =========================================

    return (
        <div className="admin-combos-page">

            {/* PAGE HEADER */}

            <div className="admin-combos-header">
                <div>
                    <h1>Quản lý Combo</h1>

                    <p>
                        Quản lý các combo đồ ăn và thức uống
                        của rạp chiếu phim.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-combo-add-btn"
                    onClick={openCreateModal}
                >
                    <i className="bi bi-plus-lg"></i>
                    Thêm combo
                </button>
            </div>

            {/* ALERT */}

            {errorMessage && (
                <div
                    className="admin-combo-alert error"
                    role="alert"
                >
                    {errorMessage}

                    <button
                        type="button"
                        onClick={() => setErrorMessage("")}
                        aria-label="Đóng thông báo"
                    >
                        ×
                    </button>
                </div>
            )}

            {successMessage && (
                <div
                    className="admin-combo-alert success"
                    role="status"
                >
                    {successMessage}

                    <button
                        type="button"
                        onClick={() => setSuccessMessage("")}
                        aria-label="Đóng thông báo"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* STATISTICS */}

            <div className="admin-combo-statistics">

                <div className="admin-combo-stat-card">
                    <div className="admin-combo-stat-icon total">
                        <i className="bi bi-box-seam"></i>
                    </div>

                    <div>
                        <span>Tổng số combo</span>
                        <strong>{statistics.total}</strong>
                    </div>
                </div>

                <div className="admin-combo-stat-card">
                    <div className="admin-combo-stat-icon active">
                        <i className="bi bi-check-circle"></i>
                    </div>

                    <div>
                        <span>Đang hoạt động</span>
                        <strong>{statistics.active}</strong>
                    </div>
                </div>

                <div className="admin-combo-stat-card">
                    <div className="admin-combo-stat-icon inactive">
                        <i className="bi bi-pause-circle"></i>
                    </div>

                    <div>
                        <span>Ngừng hoạt động</span>
                        <strong>{statistics.inactive}</strong>
                    </div>
                </div>

                <div className="admin-combo-stat-card">
                    <div className="admin-combo-stat-icon inactive">
                        <i className="bi bi-exclamation-triangle"></i>
                    </div>

                    <div>
                        <span>Combo hết hàng</span>
                        <strong>{statistics.outOfStock}</strong>
                    </div>
                </div>

            </div>

            {/* TOOLBAR */}

            <div className="admin-combo-toolbar">

                <div className="admin-combo-search">
                    <i className="bi bi-search"></i>

                    <input
                        type="text"
                        placeholder="Tìm theo tên, mô tả hoặc mã combo..."
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(event.target.value)
                        }
                    />
                </div>

                <select
                    className="admin-combo-filter"
                    value={statusFilter}
                    onChange={(event) =>
                        setStatusFilter(event.target.value)
                    }
                    aria-label="Lọc theo trạng thái"
                >
                    <option value="All">
                        Tất cả trạng thái
                    </option>

                    <option value="Active">
                        Đang hoạt động
                    </option>

                    <option value="Inactive">
                        Ngừng hoạt động
                    </option>
                </select>

            </div>

            {/* COMBO TABLE */}

            <div className="admin-combo-table-wrapper">
                <table className="admin-combo-table">

                    <thead>
                        <tr>
                            <th>Mã</th>
                            <th>Hình ảnh</th>
                            <th>Thông tin combo</th>
                            <th>Giá bán</th>
                            <th>Tồn kho</th>
                            <th>Thời gian áp dụng</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>

                    <tbody>

                        {isLoading ? (
                            <tr>
                                <td
                                    colSpan="8"
                                    className="admin-combo-empty"
                                >
                                    <div className="admin-combo-loading">
                                        <span className="spinner-border spinner-border-sm"></span>
                                        Đang tải dữ liệu...
                                    </div>
                                </td>
                            </tr>
                        ) : filteredCombos.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="8"
                                    className="admin-combo-empty"
                                >
                                    {combos.length === 0
                                        ? "Chưa có combo nào."
                                        : "Không tìm thấy combo phù hợp."}
                                </td>
                            </tr>
                        ) : (
                            filteredCombos.map((combo) => (
                                <tr key={combo.comboId}>

                                    <td>
                                        <span className="admin-combo-id">
                                            #{combo.comboId}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="admin-combo-image">
                                            <img
                                                src={
                                                    combo.imageUrl ||
                                                    DEFAULT_COMBO_IMAGE
                                                }
                                                alt={combo.comboName}
                                                onError={handleImageError}
                                            />
                                        </div>
                                    </td>

                                    <td>
                                        <div className="admin-combo-info">
                                            <strong>
                                                {combo.comboName}
                                            </strong>

                                            <span>
                                                {combo.description}
                                            </span>
                                        </div>
                                    </td>

                                    <td>
                                        <strong className="admin-combo-price">
                                            {formatCurrency(combo.price)}
                                        </strong>
                                    </td>

                                    <td>
                                        <strong>
                                            {formatNumber(
                                                combo.stockQuantity ?? 0
                                            )}
                                        </strong>

                                        <span> phần</span>

                                        {Number(combo.stockQuantity ?? 0) === 0 && (
                                            <small className="d-block text-danger">
                                                Hết hàng
                                            </small>
                                        )}
                                    </td>

                                    <td>
                                        <div className="admin-combo-dates">
                                            <span>
                                                <small>Từ:</small>{" "}
                                                {formatDate(combo.startDate)}
                                            </span>

                                            <span>
                                                <small>Đến:</small>{" "}
                                                {formatDate(combo.endDate)}
                                            </span>
                                        </div>
                                    </td>

                                    <td>
                                        <span
                                            className={`admin-combo-status ${
                                                combo.status === "Active"
                                                    ? "active"
                                                    : "inactive"
                                            }`}
                                        >
                                            {combo.status === "Active"
                                                ? "Hoạt động"
                                                : "Ngừng hoạt động"}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="admin-combo-actions">

                                            <button
                                                type="button"
                                                className="detail"
                                                title="Chi tiết combo"
                                                onClick={() =>
                                                    handleOpenDetail(combo)
                                                }
                                            >
                                                <i className="bi bi-eye"></i>
                                            </button>

                                            <button
                                                type="button"
                                                className="edit"
                                                title="Chỉnh sửa"
                                                onClick={() =>
                                                    openEditModal(combo)
                                                }
                                            >
                                                <i className="bi bi-pencil-square"></i>
                                            </button>

                                            <button
                                                type="button"
                                                className="toggle"
                                                title="Đổi trạng thái"
                                                onClick={() =>
                                                    handleToggleStatus(combo)
                                                }
                                            >
                                                <i className="bi bi-arrow-repeat"></i>
                                            </button>

                                            <button
                                                type="button"
                                                className="delete"
                                                title="Xóa combo"
                                                onClick={() =>
                                                    handleDelete(combo)
                                                }
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>

                                        </div>
                                    </td>

                                </tr>
                            ))
                        )}

                    </tbody>

                </table>
            </div>

            {/* RESULT COUNT */}

            <div className="admin-combo-result-count">
                Hiển thị {filteredCombos.length} / {combos.length} combo
            </div>

            {/* =========================================
                CREATE / EDIT MODAL
            ========================================= */}

            {showModal && (
                <div
                    className="admin-combo-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeModal();
                        }
                    }}
                >
                    <div
                        className="admin-combo-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="admin-combo-modal-title"
                    >

                        <div className="admin-combo-modal-header">
                            <div>
                                <h2 id="admin-combo-modal-title">
                                    {editingCombo
                                        ? "Cập nhật combo"
                                        : "Thêm combo mới"}
                                </h2>

                                <p>
                                    {editingCombo
                                        ? "Chỉnh sửa thông tin combo hiện tại."
                                        : "Nhập thông tin để tạo combo mới."}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={isSaving}
                                aria-label="Đóng"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>

                            <div className="admin-combo-modal-body">

                                {errorMessage && (
                                    <div className="admin-combo-alert error">
                                        {errorMessage}
                                    </div>
                                )}

                                {/* COMBO NAME */}

                                <div className="admin-combo-form-group">
                                    <label htmlFor="comboName">
                                        Tên combo <span>*</span>
                                    </label>

                                    <input
                                        id="comboName"
                                        name="comboName"
                                        type="text"
                                        value={formData.comboName}
                                        onChange={handleChange}
                                        placeholder="Ví dụ: Combo Couple"
                                        maxLength="100"
                                        required
                                    />
                                </div>

                                {/* DESCRIPTION */}

                                <div className="admin-combo-form-group">
                                    <label htmlFor="description">
                                        Mô tả <span>*</span>
                                    </label>

                                    <textarea
                                        id="description"
                                        name="description"
                                        rows="3"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Mô tả các sản phẩm có trong combo..."
                                        maxLength="500"
                                        required
                                    />
                                </div>

                                {/* PRICE, STOCK AND STATUS */}

                                <div className="admin-combo-form-row">

                                    <div className="admin-combo-form-group">
                                        <label htmlFor="price">
                                            Giá bán (VNĐ) <span>*</span>
                                        </label>

                                        <input
                                            id="price"
                                            name="price"
                                            type="number"
                                            min="1000"
                                            step="1000"
                                            value={formData.price}
                                            onChange={handleChange}
                                            placeholder="45000"
                                            required
                                        />

                                        <small>
                                            Giá combo phải chia hết cho 1.000 VNĐ.
                                        </small>
                                    </div>

                                    <div className="admin-combo-form-group">
                                        <label htmlFor="stockQuantity">
                                            Số lượng tồn kho <span>*</span>
                                        </label>

                                        <input
                                            id="stockQuantity"
                                            name="stockQuantity"
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={formData.stockQuantity}
                                            onChange={handleChange}
                                            placeholder="20"
                                            required
                                        />

                                        <small>
                                            Số lượng combo hiện có trong kho.
                                        </small>
                                    </div>

                                </div>

                                <div className="admin-combo-form-group">
                                    <label htmlFor="status">
                                        Trạng thái
                                    </label>

                                    <select
                                        id="status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        <option value="Active">
                                            Hoạt động
                                        </option>

                                        <option value="Inactive">
                                            Ngừng hoạt động
                                        </option>
                                    </select>
                                </div>

                                {/* IMAGE URL */}

                                <div className="admin-combo-form-group">
                                    <label htmlFor="imageUrl">
                                        URL hình ảnh
                                    </label>

                                    <input
                                        id="imageUrl"
                                        name="imageUrl"
                                        type="url"
                                        value={formData.imageUrl}
                                        onChange={handleChange}
                                        placeholder="https://example.com/combo.jpg"
                                    />
                                </div>

                                {/* IMAGE PREVIEW */}

                                <div className="admin-combo-image-preview">
                                    <img
                                        src={
                                            formData.imageUrl ||
                                            DEFAULT_COMBO_IMAGE
                                        }
                                        alt="Xem trước combo"
                                        onError={handleImageError}
                                    />
                                </div>

                                {/* DATE RANGE */}

                                <div className="admin-combo-form-row">

                                    <div className="admin-combo-form-group">
                                        <label htmlFor="startDate">
                                            Ngày bắt đầu
                                        </label>

                                        <input
                                            id="startDate"
                                            name="startDate"
                                            type="date"
                                            value={formData.startDate}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="admin-combo-form-group">
                                        <label htmlFor="endDate">
                                            Ngày kết thúc
                                        </label>

                                        <input
                                            id="endDate"
                                            name="endDate"
                                            type="date"
                                            min={formData.startDate || undefined}
                                            value={formData.endDate}
                                            onChange={handleChange}
                                        />
                                    </div>

                                </div>

                                <p className="admin-combo-form-note">
                                    Để trống ngày bắt đầu hoặc kết thúc nếu
                                    combo không giới hạn thời gian.
                                </p>

                            </div>

                            {/* MODAL FOOTER */}

                            <div className="admin-combo-modal-footer">

                                <button
                                    type="button"
                                    className="cancel"
                                    onClick={closeModal}
                                    disabled={isSaving}
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

                                            {editingCombo
                                                ? "Lưu thay đổi"
                                                : "Tạo combo"}
                                        </>
                                    )}
                                </button>

                            </div>

                        </form>

                    </div>
                </div>
            )}

            {/* =========================================
                COMBO DETAIL MODAL
            ========================================= */}

            {isDetailOpen && detailCombo && (
                <div
                    className="admin-product-detail-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            handleCloseDetail();
                        }
                    }}
                >
                    <div
                        className="admin-product-detail-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="adminComboDetailTitle"
                    >

                        <div className="admin-product-detail-header">
                            <div>
                                <h4 id="adminComboDetailTitle">
                                    Chi tiết combo
                                </h4>

                                <p>
                                    Thông tin chi tiết combo trong hệ thống
                                    ViewBookCinemas.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleCloseDetail}
                                aria-label="Đóng"
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <div className="admin-product-detail-body">

                            {/* COMBO IMAGE */}

                            <div className="admin-product-detail-image-section">
                                <div className="admin-product-detail-image-wrapper">
                                    <img
                                        src={
                                            detailCombo.imageUrl ||
                                            DEFAULT_COMBO_IMAGE
                                        }
                                        alt={detailCombo.comboName}
                                        onError={handleImageError}
                                        onClick={handleOpenImageZoom}
                                        title="Nhấn để phóng to ảnh"
                                    />
                                </div>

                                <span>
                                    <i className="bi bi-zoom-in"></i>
                                    Nhấn vào ảnh để phóng to
                                </span>
                            </div>

                            {/* COMBO INFORMATION */}

                            <div className="admin-product-detail-info">

                                <div className="admin-product-detail-title">
                                    <h5>
                                        {detailCombo.comboName}
                                    </h5>

                                    <span
                                        className={`admin-combo-status ${
                                            detailCombo.status === "Active"
                                                ? "active"
                                                : "inactive"
                                        }`}
                                    >
                                        {detailCombo.status === "Active"
                                            ? "Hoạt động"
                                            : "Ngừng hoạt động"}
                                    </span>
                                </div>

                                <div className="admin-product-detail-grid">

                                    <div>
                                        <span>Mã combo</span>

                                        <strong>
                                            #{detailCombo.comboId}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Giá bán</span>

                                        <strong className="price">
                                            {formatCurrency(detailCombo.price)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Tồn kho hiện tại</span>

                                        <strong>
                                            {formatNumber(
                                                detailCombo.stockQuantity ?? 0
                                            )} phần
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Ngày bắt đầu</span>

                                        <strong>
                                            {formatDate(detailCombo.startDate)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Ngày kết thúc</span>

                                        <strong>
                                            {formatDate(detailCombo.endDate)}
                                        </strong>
                                    </div>

                                </div>

                                <div className="admin-product-detail-description">
                                    <span>Mô tả combo</span>

                                    <p>
                                        {detailCombo.description ||
                                            "Chưa có mô tả combo."}
                                    </p>
                                </div>

                                <div className="admin-product-detail-url">
                                    <span>Đường dẫn hình ảnh</span>

                                    <p>
                                        {detailCombo.imageUrl ||
                                            "Chưa có hình ảnh"}
                                    </p>
                                </div>

                            </div>

                        </div>

                        {/* DETAIL FOOTER */}

                        <div className="admin-product-detail-footer">

                            <button
                                type="button"
                                className="cancel"
                                onClick={handleCloseDetail}
                            >
                                Đóng
                            </button>

                            <button
                                type="button"
                                className="edit"
                                onClick={handleEditFromDetail}
                            >
                                <i className="bi bi-pencil-square"></i>
                                Chỉnh sửa combo
                            </button>

                        </div>

                    </div>
                </div>
            )}

            {/* =========================================
                IMAGE ZOOM
            ========================================= */}

            {isImageZoomOpen && detailCombo && (
                <div
                    className="admin-product-image-zoom"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            handleCloseImageZoom();
                        }
                    }}
                >
                    <button
                        type="button"
                        className="admin-product-image-zoom-close"
                        onClick={handleCloseImageZoom}
                        aria-label="Đóng ảnh phóng to"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>

                    <img
                        src={
                            detailCombo.imageUrl ||
                            DEFAULT_COMBO_IMAGE
                        }
                        alt={detailCombo.comboName}
                        onError={handleImageError}
                    />
                </div>
            )}

        </div>
    );
}

export default AdminCombos;
