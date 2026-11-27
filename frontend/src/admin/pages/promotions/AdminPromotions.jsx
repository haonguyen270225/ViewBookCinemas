
import { useEffect, useMemo, useState } from "react";

import {
    getPromotions,
    createPromotion,
    updatePromotion,
    updatePromotionStatus,
    deletePromotion
} from "../../../services/promotionService.js";

import "./AdminPromotions.css";

const INITIAL_FORM = {
    promotionCode: "",
    promotionName: "",
    description: "",
    discountType: "Percentage",
    discountValue: "",
    maxDiscountAmount: "",
    minOrderValue: "0",
    startDate: "",
    endDate: "",
    usageLimit: "",
    status: "Active"
};

const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
    }).format(Number(value) || 0);

const formatDate = (value) => {
    if (!value) return "Không giới hạn";

    const [year, month, day] = value.split("-").map(Number);

    if (!year || !month || !day) return "Không hợp lệ";

    return new Date(year, month - 1, day).toLocaleDateString("vi-VN");
};

const formatDiscount = (promotion) => {
    if (promotion.discountType === "Percentage") {
        return `Giảm ${promotion.discountValue}%`;
    }

    return `Giảm ${formatCurrency(promotion.discountValue)}`;
};

const getUsageText = (promotion) => {
    if (promotion.usageLimit === null || promotion.usageLimit === undefined) {
        return `${promotion.usedCount || 0} / Không giới hạn`;
    }

    return `${promotion.usedCount || 0} / ${promotion.usageLimit}`;
};

function AdminPromotions() {
    const [promotions, setPromotions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All");

    const [showModal, setShowModal] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState(null);
    const [formData, setFormData] = useState(INITIAL_FORM);

    const [detailPromotion, setDetailPromotion] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // =========================================
    // LOAD DATA
    // =========================================

    const loadPromotions = async () => {
        try {
            setIsLoading(true);

            const data = await getPromotions();

            setPromotions(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Không thể tải danh sách khuyến mãi:", error);
            setErrorMessage(
                error.message || "Không thể tải danh sách khuyến mãi."
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPromotions();
    }, []);

    // =========================================
    // FILTER AND STATISTICS
    // =========================================

    const filteredPromotions = useMemo(() => {
        const keyword = searchTerm.trim().toLocaleLowerCase("vi");

        return promotions.filter((promotion) => {
            const matchesSearch =
                !keyword ||
                promotion.promotionCode?.toLocaleLowerCase("vi").includes(keyword) ||
                promotion.promotionName?.toLocaleLowerCase("vi").includes(keyword) ||
                promotion.description?.toLocaleLowerCase("vi").includes(keyword) ||
                String(promotion.promotionId).includes(keyword);

            const matchesStatus =
                statusFilter === "All" ||
                promotion.status === statusFilter;

            const matchesType =
                typeFilter === "All" ||
                promotion.discountType === typeFilter;

            return matchesSearch && matchesStatus && matchesType;
        });
    }, [promotions, searchTerm, statusFilter, typeFilter]);

    const statistics = useMemo(() => {
        const totalUsed = promotions.reduce(
            (total, item) => total + (Number(item.usedCount) || 0),
            0
        );

        return {
            total: promotions.length,
            active: promotions.filter(
                (item) => item.status === "Active"
            ).length,
            inactive: promotions.filter(
                (item) => item.status === "Inactive"
            ).length,
            totalUsed
        };
    }, [promotions]);

    // =========================================
    // COMMON
    // =========================================

    const resetMessages = () => {
        setErrorMessage("");
        setSuccessMessage("");
    };

    const openCreateModal = () => {
        resetMessages();
        setEditingPromotion(null);
        setFormData({ ...INITIAL_FORM });
        setShowModal(true);
    };

    const openEditModal = (promotion) => {
        resetMessages();
        setEditingPromotion(promotion);

        setFormData({
            promotionCode: promotion.promotionCode || "",
            promotionName: promotion.promotionName || "",
            description: promotion.description || "",
            discountType: promotion.discountType || "Percentage",
            discountValue: String(promotion.discountValue ?? ""),
            maxDiscountAmount:
                promotion.maxDiscountAmount === null ||
                promotion.maxDiscountAmount === undefined
                    ? ""
                    : String(promotion.maxDiscountAmount),
            minOrderValue: String(promotion.minOrderValue ?? 0),
            startDate: promotion.startDate || "",
            endDate: promotion.endDate || "",
            usageLimit:
                promotion.usageLimit === null ||
                promotion.usageLimit === undefined
                    ? ""
                    : String(promotion.usageLimit),
            status: promotion.status || "Active"
        });

        setShowModal(true);
    };

    const closeModal = () => {
        if (isSaving) return;

        setShowModal(false);
        setEditingPromotion(null);
        setFormData({ ...INITIAL_FORM });
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: name === "promotionCode"
                ? value.toUpperCase().replace(/\s/g, "")
                : value
        }));
    };

    // =========================================
    // FORM VALIDATION
    // =========================================

    const validateForm = () => {
        if (!formData.promotionCode.trim()) {
            return "Vui lòng nhập mã khuyến mãi.";
        }

        if (!/^[A-Z0-9_-]+$/.test(formData.promotionCode)) {
            return "Mã chỉ được chứa chữ in hoa, số, dấu gạch ngang hoặc gạch dưới.";
        }

        if (!formData.promotionName.trim()) {
            return "Vui lòng nhập tên chương trình khuyến mãi.";
        }

        if (!formData.description.trim()) {
            return "Vui lòng nhập mô tả khuyến mãi.";
        }

        const discountValue = Number(formData.discountValue);
        const minOrderValue = Number(formData.minOrderValue);

        if (!Number.isSafeInteger(discountValue) || discountValue <= 0) {
            return "Giá trị giảm phải là số nguyên dương.";
        }

        if (formData.discountType === "Percentage") {
            if (discountValue > 100) {
                return "Mức giảm phần trăm không được vượt quá 100%.";
            }
        } else if (discountValue % 1000 !== 0) {
            return "Số tiền giảm cố định phải chia hết cho 1.000 VNĐ.";
        }

        if (
            !Number.isSafeInteger(minOrderValue) ||
            minOrderValue < 0 ||
            minOrderValue % 1000 !== 0
        ) {
            return "Giá trị đơn hàng tối thiểu phải là số nguyên không âm và chia hết cho 1.000 VNĐ.";
        }

        if (formData.discountType === "Percentage" && formData.maxDiscountAmount) {
            const maxDiscount = Number(formData.maxDiscountAmount);

            if (
                !Number.isSafeInteger(maxDiscount) ||
                maxDiscount <= 0 ||
                maxDiscount % 1000 !== 0
            ) {
                return "Mức giảm tối đa phải là số nguyên dương và chia hết cho 1.000 VNĐ.";
            }
        }

        if (
            formData.startDate &&
            formData.endDate &&
            formData.endDate < formData.startDate
        ) {
            return "Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.";
        }

        if (formData.usageLimit !== "") {
            const usageLimit = Number(formData.usageLimit);

            if (!Number.isSafeInteger(usageLimit) || usageLimit <= 0) {
                return "Giới hạn lượt sử dụng phải là số nguyên dương.";
            }

            if (
                editingPromotion &&
                usageLimit < Number(editingPromotion.usedCount || 0)
            ) {
                return "Giới hạn lượt sử dụng không được nhỏ hơn số lượt đã sử dụng.";
            }
        }

        return "";
    };

    // =========================================
    // CREATE / UPDATE
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
                promotionCode: formData.promotionCode.trim().toUpperCase(),
                promotionName: formData.promotionName.trim(),
                description: formData.description.trim(),
                discountValue: Number(formData.discountValue),
                maxDiscountAmount:
                    formData.discountType === "Percentage" &&
                    formData.maxDiscountAmount !== ""
                        ? Number(formData.maxDiscountAmount)
                        : null,
                minOrderValue: Number(formData.minOrderValue),
                startDate: formData.startDate || null,
                endDate: formData.endDate || null,
                usageLimit:
                    formData.usageLimit === ""
                        ? null
                        : Number(formData.usageLimit)
            };

            if (editingPromotion) {
                await updatePromotion(
                    editingPromotion.promotionId,
                    payload
                );

                setSuccessMessage("Cập nhật khuyến mãi thành công.");
            } else {
                await createPromotion(payload);
                setSuccessMessage("Thêm khuyến mãi mới thành công.");
            }

            await loadPromotions();

            setShowModal(false);
            setEditingPromotion(null);
            setFormData({ ...INITIAL_FORM });
        } catch (error) {
            console.error("Lỗi khi lưu khuyến mãi:", error);
            setErrorMessage(
                error.message || "Không thể lưu thông tin khuyến mãi."
            );
        } finally {
            setIsSaving(false);
        }
    };

    // =========================================
    // TOGGLE STATUS
    // =========================================

    const handleToggleStatus = async (promotion) => {
        const nextStatus =
            promotion.status === "Active" ? "Inactive" : "Active";

        const confirmed = window.confirm(
            `Bạn có chắc muốn chuyển mã "${promotion.promotionCode}" sang trạng thái ${
                nextStatus === "Active" ? "Hoạt động" : "Ngừng hoạt động"
            }?`
        );

        if (!confirmed) return;

        resetMessages();

        try {
            await updatePromotionStatus(
                promotion.promotionId,
                nextStatus
            );

            await loadPromotions();

            setSuccessMessage("Cập nhật trạng thái khuyến mãi thành công.");
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái:", error);
            setErrorMessage(
                error.message || "Không thể cập nhật trạng thái khuyến mãi."
            );
        }
    };

    // =========================================
    // DELETE
    // =========================================

    const handleDelete = async (promotion) => {
        if (Number(promotion.usedCount) > 0) {
            setErrorMessage(
                "Mã khuyến mãi đã phát sinh lượt sử dụng. Bạn nên chuyển sang Ngừng hoạt động thay vì xóa."
            );
            return;
        }

        const confirmed = window.confirm(
            `Bạn có chắc muốn xóa mã "${promotion.promotionCode}"?\nThao tác này không thể hoàn tác.`
        );

        if (!confirmed) return;

        resetMessages();

        try {
            await deletePromotion(promotion.promotionId);
            await loadPromotions();

            setSuccessMessage("Xóa khuyến mãi thành công.");
        } catch (error) {
            console.error("Lỗi xóa khuyến mãi:", error);
            setErrorMessage(
                error.message || "Không thể xóa khuyến mãi."
            );
        }
    };

    // =========================================
    // DETAIL
    // =========================================

    const handleOpenDetail = (promotion) => {
        resetMessages();
        setDetailPromotion(promotion);
        setIsDetailOpen(true);
    };

    const handleCloseDetail = () => {
        setIsDetailOpen(false);
        setDetailPromotion(null);
    };

    const handleEditFromDetail = () => {
        if (!detailPromotion) return;

        const selectedPromotion = detailPromotion;

        handleCloseDetail();
        openEditModal(selectedPromotion);
    };

    // =========================================
    // RENDER
    // =========================================

    return (
        <div className="admin-promotions-page">
            <div className="admin-promotions-header">
                <div>
                    <h1>Quản lý khuyến mãi</h1>
                    <p>
                        Tạo và quản lý mã giảm giá áp dụng cho đơn đặt vé,
                        sản phẩm và combo.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-promotion-add-btn"
                    onClick={openCreateModal}
                >
                    <i className="bi bi-plus-lg"></i>
                    Thêm khuyến mãi
                </button>
            </div>

            {errorMessage && (
                <div className="admin-promotion-alert error" role="alert">
                    <span>{errorMessage}</span>
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
                <div className="admin-promotion-alert success" role="status">
                    <span>{successMessage}</span>
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
            <div className="admin-promotion-statistics">
                <div className="admin-promotion-stat-card">
                    <div className="admin-promotion-stat-icon total">
                        <i className="bi bi-ticket-perforated"></i>
                    </div>
                    <div>
                        <span>Tổng mã khuyến mãi</span>
                        <strong>{statistics.total}</strong>
                    </div>
                </div>

                <div className="admin-promotion-stat-card">
                    <div className="admin-promotion-stat-icon active">
                        <i className="bi bi-check-circle"></i>
                    </div>
                    <div>
                        <span>Đang hoạt động</span>
                        <strong>{statistics.active}</strong>
                    </div>
                </div>

                <div className="admin-promotion-stat-card">
                    <div className="admin-promotion-stat-icon inactive">
                        <i className="bi bi-pause-circle"></i>
                    </div>
                    <div>
                        <span>Ngừng hoạt động</span>
                        <strong>{statistics.inactive}</strong>
                    </div>
                </div>

                <div className="admin-promotion-stat-card">
                    <div className="admin-promotion-stat-icon used">
                        <i className="bi bi-graph-up-arrow"></i>
                    </div>
                    <div>
                        <span>Lượt sử dụng</span>
                        <strong>{statistics.totalUsed}</strong>
                    </div>
                </div>
            </div>

            {/* FILTERS */}
            <div className="admin-promotion-toolbar">
                <div className="admin-promotion-search">
                    <i className="bi bi-search"></i>
                    <input
                        type="text"
                        placeholder="Tìm theo mã, tên hoặc mô tả..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                    />
                </div>

                <select
                    className="admin-promotion-filter"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    aria-label="Lọc trạng thái"
                >
                    <option value="All">Tất cả trạng thái</option>
                    <option value="Active">Đang hoạt động</option>
                    <option value="Inactive">Ngừng hoạt động</option>
                </select>

                <select
                    className="admin-promotion-filter"
                    value={typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value)}
                    aria-label="Lọc loại giảm giá"
                >
                    <option value="All">Tất cả loại giảm</option>
                    <option value="Percentage">Giảm theo phần trăm</option>
                    <option value="Fixed">Giảm số tiền cố định</option>
                </select>
            </div>

            {/* TABLE */}
            <div className="admin-promotion-table-wrapper">
                <table className="admin-promotion-table">
                    <thead>
                        <tr>
                            <th>Mã</th>
                            <th>Thông tin khuyến mãi</th>
                            <th>Mức giảm</th>
                            <th>Đơn tối thiểu</th>
                            <th>Lượt sử dụng</th>
                            <th>Thời gian</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>

                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="8" className="admin-promotion-empty">
                                    <div className="admin-promotion-loading">
                                        <span className="spinner-border spinner-border-sm"></span>
                                        Đang tải dữ liệu...
                                    </div>
                                </td>
                            </tr>
                        ) : filteredPromotions.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="admin-promotion-empty">
                                    {promotions.length === 0
                                        ? "Chưa có mã khuyến mãi nào."
                                        : "Không tìm thấy khuyến mãi phù hợp."}
                                </td>
                            </tr>
                        ) : (
                            filteredPromotions.map((promotion) => (
                                <tr key={promotion.promotionId}>
                                    <td>
                                        <span className="admin-promotion-code">
                                            {promotion.promotionCode}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="admin-promotion-info">
                                            <strong>{promotion.promotionName}</strong>
                                            <span>{promotion.description}</span>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="admin-promotion-discount">
                                            <strong>{formatDiscount(promotion)}</strong>
                                            {promotion.discountType === "Percentage" &&
                                                promotion.maxDiscountAmount && (
                                                    <span>
                                                        Tối đa{" "}
                                                        {formatCurrency(
                                                            promotion.maxDiscountAmount
                                                        )}
                                                    </span>
                                                )}
                                        </div>
                                    </td>

                                    <td>
                                        <strong className="admin-promotion-minimum">
                                            {formatCurrency(promotion.minOrderValue)}
                                        </strong>
                                    </td>

                                    <td>
                                        <span className="admin-promotion-usage">
                                            {getUsageText(promotion)}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="admin-promotion-dates">
                                            <span>
                                                <small>Từ:</small>{" "}
                                                {formatDate(promotion.startDate)}
                                            </span>
                                            <span>
                                                <small>Đến:</small>{" "}
                                                {formatDate(promotion.endDate)}
                                            </span>
                                        </div>
                                    </td>

                                    <td>
                                        <span
                                            className={`admin-promotion-status ${
                                                promotion.status === "Active"
                                                    ? "active"
                                                    : "inactive"
                                            }`}
                                        >
                                            {promotion.status === "Active"
                                                ? "Hoạt động"
                                                : "Ngừng hoạt động"}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="admin-promotion-actions">
                                            <button
                                                type="button"
                                                className="detail"
                                                title="Xem chi tiết"
                                                onClick={() =>
                                                    handleOpenDetail(promotion)
                                                }
                                            >
                                                <i className="bi bi-eye"></i>
                                            </button>

                                            <button
                                                type="button"
                                                className="edit"
                                                title="Chỉnh sửa"
                                                onClick={() =>
                                                    openEditModal(promotion)
                                                }
                                            >
                                                <i className="bi bi-pencil-square"></i>
                                            </button>

                                            <button
                                                type="button"
                                                className="toggle"
                                                title={
                                                    promotion.status === "Active"
                                                        ? "Ngừng hoạt động"
                                                        : "Kích hoạt"
                                                }
                                                onClick={() =>
                                                    handleToggleStatus(promotion)
                                                }
                                            >
                                                <i
                                                    className={`bi ${
                                                        promotion.status === "Active"
                                                            ? "bi-pause-circle"
                                                            : "bi-play-circle"
                                                    }`}
                                                ></i>
                                            </button>

                                            <button
                                                type="button"
                                                className="delete"
                                                title={
                                                    Number(promotion.usedCount) > 0
                                                        ? "Không thể xóa mã đã sử dụng"
                                                        : "Xóa khuyến mãi"
                                                }
                                                disabled={Number(promotion.usedCount) > 0}
                                                onClick={() =>
                                                    handleDelete(promotion)
                                                }
                                            >
                                                <i className="bi bi-trash3"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="admin-promotion-result-count">
                Hiển thị {filteredPromotions.length} / {promotions.length} khuyến mãi
            </div>

            {/* CREATE / EDIT MODAL */}
            {showModal && (
                <div
                    className="admin-promotion-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) closeModal();
                    }}
                >
                    <div className="admin-promotion-modal">
                        <div className="admin-promotion-modal-header">
                            <div>
                                <h2>
                                    {editingPromotion
                                        ? "Chỉnh sửa khuyến mãi"
                                        : "Thêm khuyến mãi mới"}
                                </h2>
                                <p>
                                    Thiết lập mã giảm giá và điều kiện áp dụng.
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
                            <div className="admin-promotion-modal-body">
                                <div className="admin-promotion-form-group">
                                    <label>
                                        Mã khuyến mãi <span>*</span>
                                    </label>
                                    <input
                                        name="promotionCode"
                                        value={formData.promotionCode}
                                        onChange={handleChange}
                                        placeholder="Ví dụ: WELCOME10"
                                        maxLength={30}
                                        required
                                    />
                                    <small>
                                        Tự động chuyển thành chữ in hoa, không có khoảng trắng.
                                    </small>
                                </div>

                                <div className="admin-promotion-form-group">
                                    <label>
                                        Tên chương trình <span>*</span>
                                    </label>
                                    <input
                                        name="promotionName"
                                        value={formData.promotionName}
                                        onChange={handleChange}
                                        placeholder="Nhập tên chương trình"
                                        maxLength={100}
                                        required
                                    />
                                </div>

                                <div className="admin-promotion-form-group">
                                    <label>
                                        Mô tả <span>*</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Mô tả điều kiện hoặc nội dung ưu đãi..."
                                        rows="3"
                                        required
                                    />
                                </div>

                                <div className="admin-promotion-form-row">
                                    <div className="admin-promotion-form-group">
                                        <label>Loại giảm giá <span>*</span></label>
                                        <select
                                            name="discountType"
                                            value={formData.discountType}
                                            onChange={(event) => {
                                                const value = event.target.value;

                                                setFormData((previous) => ({
                                                    ...previous,
                                                    discountType: value,
                                                    discountValue: "",
                                                    maxDiscountAmount: ""
                                                }));
                                            }}
                                        >
                                            <option value="Percentage">
                                                Theo phần trăm (%)
                                            </option>
                                            <option value="Fixed">
                                                Số tiền cố định (VNĐ)
                                            </option>
                                        </select>
                                    </div>

                                    <div className="admin-promotion-form-group">
                                        <label>
                                            Giá trị giảm <span>*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="discountValue"
                                            value={formData.discountValue}
                                            onChange={handleChange}
                                            min="1"
                                            max={
                                                formData.discountType === "Percentage"
                                                    ? "100"
                                                    : undefined
                                            }
                                            step={
                                                formData.discountType === "Percentage"
                                                    ? "1"
                                                    : "1000"
                                            }
                                            placeholder={
                                                formData.discountType === "Percentage"
                                                    ? "Ví dụ: 10"
                                                    : "Ví dụ: 20000"
                                            }
                                            required
                                        />
                                        <small>
                                            {formData.discountType === "Percentage"
                                                ? "Nhập số nguyên từ 1 đến 100."
                                                : "Số tiền phải chia hết cho 1.000 VNĐ."}
                                        </small>
                                    </div>
                                </div>

                                {formData.discountType === "Percentage" && (
                                    <div className="admin-promotion-form-group">
                                        <label>Mức giảm tối đa (VNĐ)</label>
                                        <input
                                            type="number"
                                            name="maxDiscountAmount"
                                            value={formData.maxDiscountAmount}
                                            onChange={handleChange}
                                            min="1000"
                                            step="1000"
                                            placeholder="Để trống nếu không giới hạn"
                                        />
                                        <small>
                                            Chỉ áp dụng khi chọn giảm theo phần trăm.
                                        </small>
                                    </div>
                                )}

                                <div className="admin-promotion-form-group">
                                    <label>Giá trị đơn hàng tối thiểu (VNĐ)</label>
                                    <input
                                        type="number"
                                        name="minOrderValue"
                                        value={formData.minOrderValue}
                                        onChange={handleChange}
                                        min="0"
                                        step="1000"
                                        required
                                    />
                                </div>

                                <div className="admin-promotion-form-row">
                                    <div className="admin-promotion-form-group">
                                        <label>Ngày bắt đầu</label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="admin-promotion-form-group">
                                        <label>Ngày kết thúc</label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleChange}
                                            min={formData.startDate || undefined}
                                        />
                                    </div>
                                </div>

                                <div className="admin-promotion-form-group">
                                    <label>Giới hạn lượt sử dụng</label>
                                    <input
                                        type="number"
                                        name="usageLimit"
                                        value={formData.usageLimit}
                                        onChange={handleChange}
                                        min="1"
                                        step="1"
                                        placeholder="Để trống nếu không giới hạn"
                                    />
                                    <small>
                                        Số lượt đã dùng:{" "}
                                        {editingPromotion?.usedCount || 0}. Không được đặt
                                        giới hạn thấp hơn số lượt đã dùng.
                                    </small>
                                </div>

                                <div className="admin-promotion-form-group">
                                    <label>Trạng thái</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        <option value="Active">Hoạt động</option>
                                        <option value="Inactive">Ngừng hoạt động</option>
                                    </select>
                                </div>
                            </div>

                            <div className="admin-promotion-modal-footer">
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
                                            {editingPromotion
                                                ? "Lưu thay đổi"
                                                : "Tạo khuyến mãi"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DETAIL MODAL */}
            {isDetailOpen && detailPromotion && (
                <div
                    className="admin-promotion-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            handleCloseDetail();
                        }
                    }}
                >
                    <div className="admin-promotion-detail-modal">
                        <div className="admin-promotion-modal-header">
                            <div>
                                <h2>Chi tiết khuyến mãi</h2>
                                <p>Thông tin và điều kiện sử dụng mã.</p>
                            </div>

                            <button
                                type="button"
                                onClick={handleCloseDetail}
                                aria-label="Đóng"
                            >
                                ×
                            </button>
                        </div>

                        <div className="admin-promotion-detail-body">
                            <div className="admin-promotion-detail-code">
                                <span>MÃ KHUYẾN MÃI</span>
                                <strong>{detailPromotion.promotionCode}</strong>
                                <b>{formatDiscount(detailPromotion)}</b>
                            </div>

                            <div className="admin-promotion-detail-title">
                                <h3>{detailPromotion.promotionName}</h3>
                                <span
                                    className={`admin-promotion-status ${
                                        detailPromotion.status === "Active"
                                            ? "active"
                                            : "inactive"
                                    }`}
                                >
                                    {detailPromotion.status === "Active"
                                        ? "Hoạt động"
                                        : "Ngừng hoạt động"}
                                </span>
                            </div>

                            <div className="admin-promotion-detail-grid">
                                <div>
                                    <span>Giá trị đơn tối thiểu</span>
                                    <strong>
                                        {formatCurrency(detailPromotion.minOrderValue)}
                                    </strong>
                                </div>

                                <div>
                                    <span>Mức giảm tối đa</span>
                                    <strong>
                                        {detailPromotion.maxDiscountAmount
                                            ? formatCurrency(
                                                detailPromotion.maxDiscountAmount
                                            )
                                            : "Không giới hạn"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Lượt đã sử dụng</span>
                                    <strong>
                                        {detailPromotion.usedCount || 0}
                                    </strong>
                                </div>

                                <div>
                                    <span>Giới hạn sử dụng</span>
                                    <strong>
                                        {detailPromotion.usageLimit ?? "Không giới hạn"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Ngày bắt đầu</span>
                                    <strong>{formatDate(detailPromotion.startDate)}</strong>
                                </div>

                                <div>
                                    <span>Ngày kết thúc</span>
                                    <strong>{formatDate(detailPromotion.endDate)}</strong>
                                </div>
                            </div>

                            <div className="admin-promotion-detail-description">
                                <span>Mô tả chương trình</span>
                                <p>{detailPromotion.description || "Chưa có mô tả."}</p>
                            </div>
                        </div>

                        <div className="admin-promotion-detail-footer">
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
                                Chỉnh sửa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminPromotions;
