
import { useEffect, useMemo, useState } from "react";

import {
    getProducts,
    createProduct,
    updateProduct,
    updateProductStatus
} from "../../../services/productService.js";

import {
    getCategories,
    getActiveCategories
} from "../../../services/productCategoryService.js";

import "./AdminProducts.css";

const EMPTY_FORM = {
    productName: "",
    categoryId: "",
    description: "",
    price: "",
    imageUrl: "",
    stockQuantity: 0,
    status: "Active"
};

const DEFAULT_PRODUCT_IMAGE =
    "https://placehold.co/600x600?text=Product";

const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
    }).format(Number(value) || 0);
};

// Lấy tên danh mục từ danh sách danh mục hiện tại
const getCategoryName = (categoryId, categories = []) => {
    const category = categories.find(
        (item) => Number(item.categoryId) === Number(categoryId)
    );

    return category?.categoryName || "Chưa phân loại";
};

//=================== Trang quản lý sản phẩm ========================

function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Tất cả");
    const [selectedStatus, setSelectedStatus] = useState("Tất cả");

    // Modal thêm / chỉnh sửa
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({ ...EMPTY_FORM });

    // Modal chi tiết sản phẩm
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailProduct, setDetailProduct] = useState(null);

    // Modal phóng to hình ảnh
    const [isImageZoomOpen, setIsImageZoomOpen] = useState(false);

    //=================== Tải dữ liệu ========================

    const loadProducts = async () => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const [productData, categoryData] = await Promise.all([
                getProducts(),
                Promise.resolve(getCategories())
            ]);

            setProducts(productData);
            setCategories(categoryData);
        } catch (error) {
            console.error("Không thể tải dữ liệu sản phẩm:", error);

            setErrorMessage(
                error.message || "Không thể tải danh sách sản phẩm."
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    //=================== Thống kê ========================

    const statistics = useMemo(() => ({
        total: products.length,

        active: products.filter(
            (product) => product.status === "Active"
        ).length,

        inactive: products.filter(
            (product) => product.status === "Inactive"
        ).length,

        stock: products.reduce(
            (total, product) =>
                total + (Number(product.stockQuantity) || 0),
            0
        )
    }), [products]);

    //=================== Tìm kiếm và lọc ========================

    const filteredProducts = useMemo(() => {
        const keyword = searchTerm.trim().toLocaleLowerCase("vi");

        return products.filter((product) => {
            const matchesSearch =
                !keyword ||
                product.productName
                    ?.toLocaleLowerCase("vi")
                    .includes(keyword) ||
                product.description
                    ?.toLocaleLowerCase("vi")
                    .includes(keyword);

            const matchesCategory =
                selectedCategory === "Tất cả" ||
                String(product.categoryId) === selectedCategory;

            const matchesStatus =
                selectedStatus === "Tất cả" ||
                product.status === selectedStatus;

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [products, searchTerm, selectedCategory, selectedStatus]);

    //=================== Mở form thêm ========================

    const handleOpenCreate = () => {
        const activeCategories = getActiveCategories();

        setEditingProduct(null);

        setFormData({
            ...EMPTY_FORM,
            categoryId: String(
                activeCategories[0]?.categoryId || ""
            )
        });

        setIsModalOpen(true);
    };

    //=================== Mở form chỉnh sửa ========================

    const handleOpenEdit = (product) => {
        setEditingProduct(product);

        setFormData({
            productName: product.productName || "",
            categoryId: String(product.categoryId || ""),
            description: product.description || "",
            price: String(product.price ?? ""),
            imageUrl: product.imageUrl || "",
            stockQuantity: String(product.stockQuantity ?? 0),
            status: product.status || "Active"
        });

        setIsModalOpen(true);
    };

    //=================== Đóng form ========================

    const handleCloseModal = () => {
        if (isSaving) return;

        setIsModalOpen(false);
        setEditingProduct(null);
        setFormData({ ...EMPTY_FORM });
    };

    //=================== Thay đổi dữ liệu form ========================

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value
        }));
    };

    //=================== Xem chi tiết sản phẩm ========================

    const handleOpenDetail = (product) => {
        setDetailProduct(product);
        setIsDetailOpen(true);
        setIsImageZoomOpen(false);
    };

    const handleCloseDetail = () => {
        setIsDetailOpen(false);
        setIsImageZoomOpen(false);
        setDetailProduct(null);
    };

    //=================== Phóng to hình ảnh ========================

    const handleOpenImageZoom = () => {
        if (detailProduct?.imageUrl) {
            setIsImageZoomOpen(true);
        }
    };

    const handleCloseImageZoom = () => {
        setIsImageZoomOpen(false);
    };

    //=================== Chỉnh sửa từ chi tiết ========================

    const handleEditFromDetail = () => {
        if (!detailProduct) return;

        const product = detailProduct;

        handleCloseDetail();
        handleOpenEdit(product);
    };

    //=================== Thêm hoặc cập nhật ========================

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.productName.trim()) {
            alert("Vui lòng nhập tên sản phẩm.");
            return;
        }

        if (!formData.categoryId) {
            alert("Vui lòng chọn danh mục sản phẩm.");
            return;
        }

        if (!formData.description.trim()) {
            alert("Vui lòng nhập mô tả sản phẩm.");
            return;
        }

        const numericPrice = Number(formData.price);

        if (
            !Number.isSafeInteger(numericPrice) ||
            numericPrice < 1000 ||
            numericPrice % 1000 !== 0
        ) {
            alert(
                "Giá sản phẩm phải là số nguyên dương và chia hết cho 1.000 VNĐ. Ví dụ: 45000, 46000, 47000."
            );
            return;
        }

        if (
            !Number.isInteger(Number(formData.stockQuantity)) ||
            Number(formData.stockQuantity) < 0
        ) {
            alert("Số lượng tồn kho phải là số nguyên không âm.");
            return;
        }

        const productData = {
            ...formData,
            productName: formData.productName.trim(),
            categoryId: Number(formData.categoryId),
            description: formData.description.trim(),
            price: numericPrice,
            stockQuantity: Number(formData.stockQuantity),
            imageUrl: formData.imageUrl.trim()
        };

        setIsSaving(true);

        try {
            if (editingProduct) {
                const updatedProduct = await updateProduct(
                    editingProduct.productId,
                    productData
                );

                setProducts((current) =>
                    current.map((product) =>
                        String(product.productId) ===
                        String(updatedProduct.productId)
                            ? updatedProduct
                            : product
                    )
                );

                // Đồng bộ dữ liệu nếu đang xem chi tiết sản phẩm

                setDetailProduct((current) =>
                    current &&
                    String(current.productId) ===
                    String(updatedProduct.productId)
                        ? updatedProduct
                        : current
                );
            } else {
                const newProduct = await createProduct(productData);

                setProducts((current) => [...current, newProduct]);
            }

            setIsModalOpen(false);
            setEditingProduct(null);
            setFormData({ ...EMPTY_FORM });
        } catch (error) {
            console.error("Không thể lưu sản phẩm:", error);

            alert(
                error.message || "Không thể lưu thông tin sản phẩm."
            );
        } finally {
            setIsSaving(false);
        }
    };

    //=================== Bật / tắt kinh doanh ========================

    const handleToggleStatus = async (product) => {
        const nextStatus =
            product.status === "Active" ? "Inactive" : "Active";

        const actionText =
            nextStatus === "Active"
                ? "kích hoạt"
                : "ngừng kinh doanh";

        const confirmed = window.confirm(
            `Bạn có chắc chắn muốn ${actionText} sản phẩm "${product.productName}" không?`
        );

        if (!confirmed) return;

        try {
            const updatedProduct = await updateProductStatus(
                product.productId,
                nextStatus
            );

            setProducts((current) =>
                current.map((item) =>
                    String(item.productId) ===
                    String(updatedProduct.productId)
                        ? updatedProduct
                        : item
                )
            );

            // Đồng bộ dữ liệu chi tiết nếu đang mở sản phẩm đó

            setDetailProduct((current) =>
                current &&
                String(current.productId) ===
                String(updatedProduct.productId)
                    ? updatedProduct
                    : current
            );
        } catch (error) {
            console.error("Không thể cập nhật trạng thái:", error);

            alert(
                error.message || "Không thể cập nhật trạng thái sản phẩm."
            );
        }
    };

    //=================== Xóa bộ lọc ========================

    const handleClearFilters = () => {
        setSearchTerm("");
        setSelectedCategory("Tất cả");
        setSelectedStatus("Tất cả");
    };

    //=================== Trạng thái tải ========================

    if (isLoading) {
        return (
            <div className="admin-products">
                <div className="admin-products-empty">
                    <i className="bi bi-hourglass-split"></i>
                    <h5>Đang tải danh sách sản phẩm...</h5>
                </div>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="admin-products">
                <div className="admin-products-empty">
                    <i className="bi bi-exclamation-circle"></i>
                    <h5>Không thể tải dữ liệu</h5>
                    <p>{errorMessage}</p>

                    <button type="button" onClick={loadProducts}>
                        <i className="bi bi-arrow-clockwise"></i>
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-products">

            {/* Tiêu đề */}

            <div className="admin-page-intro admin-products-intro">
                <div>
                    <h3>Quản lý sản phẩm</h3>

                    <p>
                        Quản lý sản phẩm và số lượng tồn kho tại
                        hệ thống ViewBookCinemas.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-products-add-button"
                    onClick={handleOpenCreate}
                >
                    <i className="bi bi-plus-lg"></i>
                    Thêm sản phẩm
                </button>
            </div>

            {/* Thống kê */}

            <div className="admin-products-statistics">

                <div className="admin-product-stat-card">
                    <div className="admin-product-stat-icon blue">
                        <i className="bi bi-box-seam"></i>
                    </div>

                    <div>
                        <span>Tổng sản phẩm</span>
                        <strong>{statistics.total}</strong>
                    </div>
                </div>

                <div className="admin-product-stat-card">
                    <div className="admin-product-stat-icon green">
                        <i className="bi bi-check-circle"></i>
                    </div>

                    <div>
                        <span>Đang kinh doanh</span>
                        <strong>{statistics.active}</strong>
                    </div>
                </div>

                <div className="admin-product-stat-card">
                    <div className="admin-product-stat-icon gray">
                        <i className="bi bi-pause-circle"></i>
                    </div>

                    <div>
                        <span>Ngừng kinh doanh</span>
                        <strong>{statistics.inactive}</strong>
                    </div>
                </div>

                <div className="admin-product-stat-card">
                    <div className="admin-product-stat-icon orange">
                        <i className="bi bi-boxes"></i>
                    </div>

                    <div>
                        <span>Tổng tồn kho</span>
                        <strong>
                            {statistics.stock.toLocaleString("vi-VN")}
                        </strong>
                    </div>
                </div>

            </div>

            {/* Nội dung danh sách */}

            <section className="admin-panel admin-products-panel">

                {/* Bộ lọc */}

                <div className="admin-products-toolbar">

                    <div className="admin-products-search">
                        <i className="bi bi-search"></i>

                        <input
                            type="search"
                            placeholder="Tìm tên sản phẩm hoặc mô tả..."
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                        />
                    </div>

                    <div className="admin-products-filter">
                        <label htmlFor="adminProductCategory">
                            Danh mục
                        </label>

                        <select
                            id="adminProductCategory"
                            value={selectedCategory}
                            onChange={(event) =>
                                setSelectedCategory(event.target.value)
                            }
                        >
                            <option value="Tất cả">Tất cả danh mục</option>

                            {categories.map((category) => (
                                <option
                                    key={category.categoryId}
                                    value={String(category.categoryId)}
                                >
                                    {category.categoryName}
                                    {!category.status
                                        ? " (Ngừng sử dụng)"
                                        : ""}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="admin-products-filter">
                        <label htmlFor="adminProductStatus">
                            Trạng thái
                        </label>

                        <select
                            id="adminProductStatus"
                            value={selectedStatus}
                            onChange={(event) =>
                                setSelectedStatus(event.target.value)
                            }
                        >
                            <option value="Tất cả">Tất cả trạng thái</option>
                            <option value="Active">Đang kinh doanh</option>
                            <option value="Inactive">Ngừng kinh doanh</option>
                        </select>
                    </div>

                    <button
                        type="button"
                        className="admin-products-reset-button"
                        onClick={handleClearFilters}
                        title="Xóa bộ lọc"
                    >
                        <i className="bi bi-arrow-counterclockwise"></i>
                    </button>

                </div>

                {/* Tiêu đề danh sách */}

                <div className="admin-products-list-heading">
                    <div>
                        <h5>Danh sách sản phẩm</h5>
                        <p>Thông tin sản phẩm đang được quản lý</p>
                    </div>

                    <span>
                        Hiển thị <strong>{filteredProducts.length}</strong> /{" "}
                        {products.length} sản phẩm
                    </span>
                </div>

                {/* Bảng sản phẩm */}

                <div className="admin-table-wrapper">
                    <table className="admin-table admin-products-table">
                        <thead>
                            <tr>
                                <th>SẢN PHẨM</th>
                                <th>DANH MỤC</th>
                                <th>GIÁ BÁN</th>
                                <th>TỒN KHO</th>
                                <th>TRẠNG THÁI</th>
                                <th>THAO TÁC</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <tr key={product.productId}>
                                        <td>
                                            <div className="admin-product-info">
                                                <img
                                                    src={
                                                        product.imageUrl ||
                                                        DEFAULT_PRODUCT_IMAGE
                                                    }
                                                    alt={product.productName}
                                                    onError={(event) => {
                                                        event.currentTarget.src =
                                                            DEFAULT_PRODUCT_IMAGE;
                                                    }}
                                                />

                                                <div>
                                                    <strong>
                                                        {product.productName}
                                                    </strong>

                                                    <span>
                                                        {product.description}
                                                    </span>

                                                    <small>
                                                        ID: {product.productId}
                                                    </small>
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            <span className="admin-product-category">
                                                {getCategoryName(
                                                    product.categoryId,
                                                    categories
                                                )}
                                            </span>
                                        </td>

                                        <td>
                                            <strong className="admin-product-price">
                                                {formatCurrency(product.price)}
                                            </strong>
                                        </td>

                                        <td>
                                            <span
                                                className={`admin-product-stock ${
                                                    Number(product.stockQuantity) <= 10
                                                        ? "low"
                                                        : "normal"
                                                }`}
                                            >
                                                {Number(
                                                    product.stockQuantity
                                                ).toLocaleString("vi-VN")}
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                className={`admin-product-status ${
                                                    product.status === "Active"
                                                        ? "active"
                                                        : "inactive"
                                                }`}
                                            >
                                                {product.status === "Active"
                                                    ? "Đang kinh doanh"
                                                    : "Ngừng kinh doanh"}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="admin-product-actions">

                                                <button
                                                    type="button"
                                                    className="detail"
                                                    title="Chi tiết sản phẩm"
                                                    onClick={() =>
                                                        handleOpenDetail(product)
                                                    }
                                                >
                                                    <i className="bi bi-eye"></i>
                                                </button>

                                                <button
                                                    type="button"
                                                    className="edit"
                                                    title="Chỉnh sửa"
                                                    onClick={() =>
                                                        handleOpenEdit(product)
                                                    }
                                                >
                                                    <i className="bi bi-pencil-square"></i>
                                                </button>

                                                <button
                                                    type="button"
                                                    className={
                                                        product.status === "Active"
                                                            ? "deactivate"
                                                            : "activate"
                                                    }
                                                    title={
                                                        product.status === "Active"
                                                            ? "Ngừng kinh doanh"
                                                            : "Kích hoạt"
                                                    }
                                                    onClick={() =>
                                                        handleToggleStatus(product)
                                                    }
                                                >
                                                    <i
                                                        className={`bi ${
                                                            product.status === "Active"
                                                                ? "bi-pause-circle"
                                                                : "bi-play-circle"
                                                        }`}
                                                    ></i>
                                                </button>

                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6">
                                        <div className="admin-products-no-result">
                                            <i className="bi bi-inbox"></i>
                                            <strong>Không tìm thấy sản phẩm</strong>
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
                    className="admin-product-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            handleCloseModal();
                        }
                    }}
                >
                    <div
                        className="admin-product-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="adminProductModalTitle"
                    >
                        <div className="admin-product-modal-header">
                            <div>
                                <h4 id="adminProductModalTitle">
                                    {editingProduct
                                        ? "Chỉnh sửa sản phẩm"
                                        : "Thêm sản phẩm mới"}
                                </h4>

                                <p>
                                    Nhập thông tin sản phẩm trong hệ thống.
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
                            className="admin-product-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="admin-product-form-grid">

                                <div className="admin-product-form-group full">
                                    <label htmlFor="productName">
                                        Tên sản phẩm *
                                    </label>

                                    <input
                                        id="productName"
                                        name="productName"
                                        type="text"
                                        value={formData.productName}
                                        onChange={handleChange}
                                        placeholder="Ví dụ: Bắp rang bơ lớn"
                                        maxLength={100}
                                        required
                                    />
                                </div>

                                <div className="admin-product-form-group">
                                    <label htmlFor="productCategory">
                                        Danh mục *
                                    </label>

                                    <select
                                        id="productCategory"
                                        name="categoryId"
                                        value={formData.categoryId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">
                                            Chọn danh mục
                                        </option>

                                        {categories
                                            .filter(
                                                (category) =>
                                                    category.status ||
                                                    String(category.categoryId) ===
                                                    String(formData.categoryId)
                                            )
                                            .map((category) => (
                                                <option
                                                    key={category.categoryId}
                                                    value={category.categoryId}
                                                >
                                                    {category.categoryName}
                                                    {!category.status
                                                        ? " (Ngừng sử dụng)"
                                                        : ""}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div className="admin-product-form-group">
                                    <label htmlFor="productStatus">
                                        Trạng thái
                                    </label>

                                    <select
                                        id="productStatus"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        <option value="Active">
                                            Đang kinh doanh
                                        </option>
                                        <option value="Inactive">
                                            Ngừng kinh doanh
                                        </option>
                                    </select>
                                </div>

                                <div className="admin-product-form-group">
                                    <label htmlFor="productPrice">
                                        Giá bán (VNĐ) *
                                    </label>

                                    <input
                                        id="productPrice"
                                        name="price"
                                        type="number"
                                        min="1000"
                                        step="1000"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="Ví dụ: 45000"
                                        required
                                    />

                                    <small>
                                        Giá phải chia hết cho 1.000 VNĐ.
                                    </small>
                                </div>

                                <div className="admin-product-form-group">
                                    <label htmlFor="productStock">
                                        Số lượng tồn kho *
                                    </label>

                                    <input
                                        id="productStock"
                                        name="stockQuantity"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={formData.stockQuantity}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                {/* URL và xem trước hình ảnh */}

                                <div className="admin-product-form-group full">
                                    <label htmlFor="productImage">
                                        Đường dẫn hình ảnh
                                    </label>

                                    <input
                                        id="productImage"
                                        name="imageUrl"
                                        type="url"
                                        value={formData.imageUrl}
                                        onChange={handleChange}
                                        placeholder="https://example.com/product.jpg"
                                    />

                                    <small>
                                        Nhập URL hình ảnh để xem trước trước khi lưu sản phẩm.
                                    </small>

                                    <div className="admin-product-form-image-preview">
                                        <img
                                            src={
                                                formData.imageUrl.trim() ||
                                                DEFAULT_PRODUCT_IMAGE
                                            }
                                            alt="Xem trước sản phẩm"
                                            onError={(event) => {
                                                event.currentTarget.src =
                                                    DEFAULT_PRODUCT_IMAGE;
                                            }}
                                        />

                                        <div>
                                            <strong>Xem trước hình ảnh</strong>

                                            <span>
                                                {formData.imageUrl.trim()
                                                    ? "Hình ảnh sẽ được sử dụng cho sản phẩm."
                                                    : "Chưa nhập URL hình ảnh."}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="admin-product-form-group full">
                                    <label htmlFor="productDescription">
                                        Mô tả sản phẩm *
                                    </label>

                                    <textarea
                                        id="productDescription"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Nhập mô tả sản phẩm..."
                                        rows="4"
                                        required
                                    />
                                </div>

                            </div>

                            <div className="admin-product-form-footer">
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
                                    {isSaving ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm"></span>
                                            Đang lưu...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-lg"></i>
                                            {editingProduct
                                                ? "Lưu thay đổi"
                                                : "Thêm sản phẩm"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal chi tiết sản phẩm */}

            {isDetailOpen && detailProduct && (
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
                        aria-labelledby="adminProductDetailTitle"
                    >
                        <div className="admin-product-detail-header">
                            <div>
                                <h4 id="adminProductDetailTitle">
                                    Chi tiết sản phẩm
                                </h4>

                                <p>
                                    Thông tin chi tiết sản phẩm trong hệ thống
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

                            {/* Hình ảnh sản phẩm */}

                            <div className="admin-product-detail-image-section">
                                <div className="admin-product-detail-image-wrapper">
                                    <img
                                        src={
                                            detailProduct.imageUrl ||
                                            DEFAULT_PRODUCT_IMAGE
                                        }
                                        alt={detailProduct.productName}
                                        onError={(event) => {
                                            event.currentTarget.src =
                                                DEFAULT_PRODUCT_IMAGE;
                                        }}
                                        onClick={handleOpenImageZoom}
                                        title="Nhấn để phóng to ảnh"
                                    />
                                </div>

                                <span>
                                    <i className="bi bi-zoom-in"></i>
                                    Nhấn vào ảnh để phóng to
                                </span>
                            </div>

                            {/* Thông tin sản phẩm */}

                            <div className="admin-product-detail-info">

                                <div className="admin-product-detail-title">
                                    <h5>
                                        {detailProduct.productName}
                                    </h5>

                                    <span
                                        className={`admin-product-status ${
                                            detailProduct.status === "Active"
                                                ? "active"
                                                : "inactive"
                                        }`}
                                    >
                                        {detailProduct.status === "Active"
                                            ? "Đang kinh doanh"
                                            : "Ngừng kinh doanh"}
                                    </span>
                                </div>

                                <div className="admin-product-detail-grid">
                                    <div>
                                        <span>Mã sản phẩm</span>
                                        <strong>
                                            #{detailProduct.productId}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Danh mục</span>
                                        <strong>
                                            {getCategoryName(
                                                detailProduct.categoryId,
                                                categories
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Giá bán</span>
                                        <strong className="price">
                                            {formatCurrency(detailProduct.price)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Số lượng tồn kho</span>
                                        <strong>
                                            {Number(
                                                detailProduct.stockQuantity
                                            ).toLocaleString("vi-VN")}
                                        </strong>
                                    </div>
                                </div>

                                <div className="admin-product-detail-description">
                                    <span>Mô tả sản phẩm</span>

                                    <p>
                                        {detailProduct.description ||
                                            "Chưa có mô tả sản phẩm."}
                                    </p>
                                </div>

                                <div className="admin-product-detail-url">
                                    <span>Đường dẫn hình ảnh</span>

                                    <p>
                                        {detailProduct.imageUrl ||
                                            "Chưa có hình ảnh"}
                                    </p>
                                </div>

                            </div>
                        </div>

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
                                Chỉnh sửa sản phẩm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Ảnh sản phẩm phóng to */}

            {isImageZoomOpen && detailProduct && (
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
                            detailProduct.imageUrl ||
                            DEFAULT_PRODUCT_IMAGE
                        }
                        alt={detailProduct.productName}
                        onError={(event) => {
                            event.currentTarget.src =
                                DEFAULT_PRODUCT_IMAGE;
                        }}
                    />
                </div>
            )}

        </div>
    );
}

export default AdminProducts;
