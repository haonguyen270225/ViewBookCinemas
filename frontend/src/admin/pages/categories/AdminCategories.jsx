
import { useEffect, useMemo, useState } from "react";

import {
    getCategories,
    createCategory,
    updateCategory,
    updateCategoryStatus,
    deleteCategory
} from "../../../services/productCategoryService.js";

import { getProducts } from "../../../services/productService.js";

import "./AdminCategories.css";

const EMPTY_FORM = {
    categoryName: "",
    description: "",
    status: true
};

const normalizeName = (value) => {
    return String(value || "")
        .trim()
        .normalize("NFC")
        .toLocaleLowerCase("vi");
};

function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("Tất cả");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ ...EMPTY_FORM });

    const [isSaving, setIsSaving] = useState(false);

    // Tải dữ liệu
    const loadData = () => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            setCategories(getCategories());
        } catch (error) {
            setErrorMessage(
                error.message || "Không thể tải danh sách danh mục."
            );
        }

        getProducts()
            .then(setProducts)
            .catch((error) => {
                console.error("Không thể tải sản phẩm:", error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        loadData();
    }, []);

    // Đếm số sản phẩm thuộc danh mục
    const getProductCount = (categoryId) => {
        return products.filter(
            (product) => Number(product.categoryId) === Number(categoryId)
        ).length;
    };

    // Thống kê
    const statistics = useMemo(() => ({
        total: categories.length,

        active: categories.filter(
            (category) => category.status === true
        ).length,

        inactive: categories.filter(
            (category) => category.status === false
        ).length,

        products: products.length
    }), [categories, products]);

    // Tìm kiếm và lọc
    const filteredCategories = useMemo(() => {
        const keyword = searchTerm.trim().toLocaleLowerCase("vi");

        return categories
            .filter((category) => {
                const matchesSearch =
                    !keyword ||
                    category.categoryName
                        ?.toLocaleLowerCase("vi")
                        .includes(keyword) ||
                    category.description
                        ?.toLocaleLowerCase("vi")
                        .includes(keyword);

                const matchesStatus =
                    selectedStatus === "Tất cả" ||
                    (selectedStatus === "Đang sử dụng"
                        ? category.status === true
                        : category.status === false);

                return matchesSearch && matchesStatus;
            })
            .sort((a, b) =>
                a.categoryName.localeCompare(b.categoryName, "vi")
            );
    }, [categories, searchTerm, selectedStatus]);

    // Mở form thêm
    const handleOpenCreate = () => {
        setEditingCategory(null);
        setFormData({ ...EMPTY_FORM });
        setIsModalOpen(true);
    };

    // Mở form chỉnh sửa
    const handleOpenEdit = (category) => {
        setEditingCategory(category);

        setFormData({
            categoryName: category.categoryName || "",
            description: category.description || "",
            status: category.status !== false
        });

        setIsModalOpen(true);
    };

    // Đóng form
    const handleCloseModal = () => {
        if (isSaving) return;

        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({ ...EMPTY_FORM });
    };

    // Thay đổi form
    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value
        }));
    };

    // Thêm hoặc cập nhật
    const handleSubmit = (event) => {
        event.preventDefault();

        const categoryName = formData.categoryName.trim();

        if (!categoryName) {
            alert("Vui lòng nhập tên danh mục.");
            return;
        }

        const duplicated = categories.some(
            (category) =>
                normalizeName(category.categoryName) ===
                    normalizeName(categoryName) &&
                String(category.categoryId) !==
                    String(editingCategory?.categoryId)
        );

        if (duplicated) {
            alert("Tên danh mục đã tồn tại.");
            return;
        }

        setIsSaving(true);

        try {
            if (editingCategory) {
                const updatedCategory = updateCategory(
                    editingCategory.categoryId,
                    {
                        ...formData,
                        categoryName
                    }
                );

                setCategories((current) =>
                    current.map((category) =>
                        String(category.categoryId) ===
                        String(updatedCategory.categoryId)
                            ? updatedCategory
                            : category
                    )
                );
            } else {
                const newCategory = createCategory({
                    ...formData,
                    categoryName
                });

                setCategories((current) => [...current, newCategory]);
            }

            handleCloseModal();
        } catch (error) {
            alert(error.message || "Không thể lưu danh mục.");
        } finally {
            setIsSaving(false);
        }
    };

    // Bật / tắt trạng thái
    const handleToggleStatus = (category) => {
        const nextStatus = !category.status;

        const action = nextStatus
            ? "kích hoạt"
            : "ngừng sử dụng";

        const confirmed = window.confirm(
            `Bạn có chắc chắn muốn ${action} danh mục "${category.categoryName}" không?`
        );

        if (!confirmed) return;

        try {
            const updatedCategory = updateCategoryStatus(
                category.categoryId,
                nextStatus
            );

            setCategories((current) =>
                current.map((item) =>
                    String(item.categoryId) ===
                    String(updatedCategory.categoryId)
                        ? updatedCategory
                        : item
                )
            );
        } catch (error) {
            alert(error.message || "Không thể cập nhật trạng thái.");
        }
    };

    // Xóa danh mục
    const handleDelete = (category) => {
        const productCount = getProductCount(category.categoryId);

        if (productCount > 0) {
            alert(
                `Không thể xóa danh mục "${category.categoryName}" vì đang có ${productCount} sản phẩm sử dụng. Hãy chuyển các sản phẩm sang danh mục khác trước.`
            );
            return;
        }

        const confirmed = window.confirm(
            `Bạn có chắc chắn muốn xóa danh mục "${category.categoryName}" không?`
        );

        if (!confirmed) return;

        try {
            deleteCategory(category.categoryId, products);

            setCategories((current) =>
                current.filter(
                    (item) =>
                        String(item.categoryId) !==
                        String(category.categoryId)
                )
            );
        } catch (error) {
            alert(error.message || "Không thể xóa danh mục.");
        }
    };

    // Xóa bộ lọc
    const handleClearFilters = () => {
        setSearchTerm("");
        setSelectedStatus("Tất cả");
    };

    if (isLoading) {
        return (
            <div className="admin-categories">
                <div className="admin-categories-empty">
                    <i className="bi bi-hourglass-split"></i>
                    <h5>Đang tải danh sách danh mục...</h5>
                </div>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="admin-categories">
                <div className="admin-categories-empty">
                    <i className="bi bi-exclamation-circle"></i>
                    <h5>Không thể tải dữ liệu</h5>
                    <p>{errorMessage}</p>

                    <button type="button" onClick={loadData}>
                        <i className="bi bi-arrow-clockwise"></i>
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-categories">
            {/* Tiêu đề */}
            <div className="admin-page-intro admin-categories-intro">
                <div>
                    <h3>Quản lý danh mục</h3>
                    <p>
                        Quản lý các nhóm sản phẩm được phục vụ tại
                        hệ thống ViewBookCinemas.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-categories-add-button"
                    onClick={handleOpenCreate}
                >
                    <i className="bi bi-plus-lg"></i>
                    Thêm danh mục
                </button>
            </div>

            {/* Thống kê */}
            <div className="admin-categories-statistics">
                <div className="admin-category-stat-card">
                    <div className="admin-category-stat-icon blue">
                        <i className="bi bi-collection"></i>
                    </div>
                    <div>
                        <span>Tổng danh mục</span>
                        <strong>{statistics.total}</strong>
                    </div>
                </div>

                <div className="admin-category-stat-card">
                    <div className="admin-category-stat-icon green">
                        <i className="bi bi-check-circle"></i>
                    </div>
                    <div>
                        <span>Đang sử dụng</span>
                        <strong>{statistics.active}</strong>
                    </div>
                </div>

                <div className="admin-category-stat-card">
                    <div className="admin-category-stat-icon gray">
                        <i className="bi bi-pause-circle"></i>
                    </div>
                    <div>
                        <span>Ngừng sử dụng</span>
                        <strong>{statistics.inactive}</strong>
                    </div>
                </div>

                <div className="admin-category-stat-card">
                    <div className="admin-category-stat-icon orange">
                        <i className="bi bi-box-seam"></i>
                    </div>
                    <div>
                        <span>Tổng sản phẩm</span>
                        <strong>{statistics.products}</strong>
                    </div>
                </div>
            </div>

            {/* Danh sách */}
            <section className="admin-panel admin-categories-panel">
                <div className="admin-categories-toolbar">
                    <div className="admin-categories-search">
                        <i className="bi bi-search"></i>
                        <input
                            type="search"
                            placeholder="Tìm tên hoặc mô tả danh mục..."
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                        />
                    </div>

                    <div className="admin-categories-filter">
                        <label htmlFor="categoryStatusFilter">
                            Trạng thái
                        </label>
                        <select
                            id="categoryStatusFilter"
                            value={selectedStatus}
                            onChange={(event) =>
                                setSelectedStatus(event.target.value)
                            }
                        >
                            <option value="Tất cả">Tất cả trạng thái</option>
                            <option value="Đang sử dụng">Đang sử dụng</option>
                            <option value="Ngừng sử dụng">Ngừng sử dụng</option>
                        </select>
                    </div>

                    <button
                        type="button"
                        className="admin-categories-reset-button"
                        onClick={handleClearFilters}
                        title="Xóa bộ lọc"
                    >
                        <i className="bi bi-arrow-counterclockwise"></i>
                    </button>
                </div>

                <div className="admin-categories-list-heading">
                    <div>
                        <h5>Danh sách danh mục</h5>
                        <p>Thông tin các danh mục sản phẩm</p>
                    </div>

                    <span>
                        Hiển thị <strong>{filteredCategories.length}</strong>
                        {" / "}{categories.length} danh mục
                    </span>
                </div>

                <div className="admin-table-wrapper">
                    <table className="admin-table admin-categories-table">
                        <thead>
                            <tr>
                                <th>DANH MỤC</th>
                                <th>MÔ TẢ</th>
                                <th>SẢN PHẨM</th>
                                <th>TRẠNG THÁI</th>
                                <th>THAO TÁC</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredCategories.length > 0 ? (
                                filteredCategories.map((category) => (
                                    <tr key={category.categoryId}>
                                        <td>
                                            <div className="admin-category-info">
                                                <div className="admin-category-avatar">
                                                    <i className="bi bi-collection"></i>
                                                </div>

                                                <div>
                                                    <strong>
                                                        {category.categoryName}
                                                    </strong>
                                                    <span>
                                                        ID: {category.categoryId}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            <span className="admin-category-description">
                                                {category.description ||
                                                    "Chưa có mô tả"}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="admin-category-count">
                                                {getProductCount(category.categoryId)}
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                className={`admin-category-status ${
                                                    category.status
                                                        ? "active"
                                                        : "inactive"
                                                }`}
                                            >
                                                {category.status
                                                    ? "Đang sử dụng"
                                                    : "Ngừng sử dụng"}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="admin-category-actions">
                                                <button
                                                    type="button"
                                                    className="edit"
                                                    title="Chỉnh sửa"
                                                    onClick={() =>
                                                        handleOpenEdit(category)
                                                    }
                                                >
                                                    <i className="bi bi-pencil-square"></i>
                                                </button>

                                                <button
                                                    type="button"
                                                    className={
                                                        category.status
                                                            ? "deactivate"
                                                            : "activate"
                                                    }
                                                    title={
                                                        category.status
                                                            ? "Ngừng sử dụng"
                                                            : "Kích hoạt"
                                                    }
                                                    onClick={() =>
                                                        handleToggleStatus(category)
                                                    }
                                                >
                                                    <i
                                                        className={`bi ${
                                                            category.status
                                                                ? "bi-pause-circle"
                                                                : "bi-play-circle"
                                                        }`}
                                                    ></i>
                                                </button>

                                                <button
                                                    type="button"
                                                    className="delete"
                                                    title="Xóa danh mục"
                                                    onClick={() =>
                                                        handleDelete(category)
                                                    }
                                                >
                                                    <i className="bi bi-trash3"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5">
                                        <div className="admin-categories-no-result">
                                            <i className="bi bi-inbox"></i>
                                            <strong>
                                                Không tìm thấy danh mục
                                            </strong>
                                            <span>
                                                Hãy thử thay đổi từ khóa hoặc bộ lọc.
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Modal thêm / chỉnh sửa */}
            {isModalOpen && (
                <div
                    className="admin-category-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            handleCloseModal();
                        }
                    }}
                >
                    <div
                        className="admin-category-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="adminCategoryModalTitle"
                    >
                        <div className="admin-category-modal-header">
                            <div>
                                <h4 id="adminCategoryModalTitle">
                                    {editingCategory
                                        ? "Chỉnh sửa danh mục"
                                        : "Thêm danh mục mới"}
                                </h4>
                                <p>
                                    Nhập thông tin danh mục sản phẩm.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={isSaving}
                                aria-label="Đóng"
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <form
                            className="admin-category-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="admin-category-form-group">
                                <label htmlFor="categoryName">
                                    Tên danh mục *
                                </label>
                                <input
                                    id="categoryName"
                                    name="categoryName"
                                    type="text"
                                    value={formData.categoryName}
                                    onChange={handleChange}
                                    placeholder="Ví dụ: Bắp rang"
                                    maxLength={100}
                                    required
                                />
                            </div>

                            <div className="admin-category-form-group">
                                <label htmlFor="categoryDescription">
                                    Mô tả
                                </label>
                                <textarea
                                    id="categoryDescription"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Nhập mô tả danh mục..."
                                    rows={4}
                                />
                            </div>

                            <div className="admin-category-form-group">
                                <label htmlFor="categoryStatus">
                                    Trạng thái
                                </label>
                                <select
                                    id="categoryStatus"
                                    name="status"
                                    value={String(formData.status)}
                                    onChange={(event) =>
                                        setFormData((current) => ({
                                            ...current,
                                            status: event.target.value === "true"
                                        }))
                                    }
                                >
                                    <option value="true">Đang sử dụng</option>
                                    <option value="false">Ngừng sử dụng</option>
                                </select>
                            </div>

                            <div className="admin-category-form-footer">
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
                                    {isSaving ? "Đang lưu..." : "Lưu danh mục"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminCategories;
