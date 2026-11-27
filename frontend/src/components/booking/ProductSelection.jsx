
import { useMemo, useState } from "react";

import productCategories from "../../data/productCategories.js";

import "./ProductSelection.css";

const DEFAULT_PRODUCT_IMAGE =
    "https://placehold.co/600x600?text=Product";

//=================== Định dạng giá tiền ========================

const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
};

//=================== Cấu hình icon theo danh mục ========================

const categoryIcons = {
    all: "bi-basket2-fill",
    popcorn: "bi-basket2-fill",
    drinks: "bi-cup-straw",
    snacks: "bi-cookie",
    hotFood: "bi-cup-hot-fill",
    combos: "bi-gift-fill"
};

const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();

    if (name.includes("bắp")) return categoryIcons.popcorn;
    if (name.includes("nước")) return categoryIcons.drinks;
    if (name.includes("nhẹ")) return categoryIcons.snacks;
    if (name.includes("nóng")) return categoryIcons.hotFood;

    return categoryIcons.all;
};

//=================== Giao diện chọn bắp nước và combo ========================

function ProductSelection({
    selectedProductQuantities,
    selectedComboQuantities,
    onChangeProductQuantity,
    onChangeComboQuantity,
    products = [],
    combos = []
}) {
    const [selectedCategoryId, setSelectedCategoryId] = useState("all");
    const [previewImage, setPreviewImage] = useState(null);

    //=================== Lọc sản phẩm theo danh mục ========================

    const filteredProducts = useMemo(() => {
        const activeProducts = Array.isArray(products)
            ? products.filter(
                (product) => product.status === "Active"
            )
            : [];

        if (
            selectedCategoryId === "all" ||
            selectedCategoryId === "combos"
        ) {
            return selectedCategoryId === "all" ? activeProducts : [];
        }

        return activeProducts.filter(
            (product) =>
                Number(product.categoryId) === Number(selectedCategoryId)
        );
    }, [products, selectedCategoryId]);

    //=================== Danh sách combo khả dụng ========================

    const activeCombos = useMemo(() => {
        return Array.isArray(combos)
            ? combos.filter((combo) => combo.status === "Active")
            : [];
    }, [combos]);

    const shouldShowCombos =
        selectedCategoryId === "all" ||
        selectedCategoryId === "combos";

    //=================== Lấy icon hiện tại ========================

    const currentIcon =
        selectedCategoryId === "all"
            ? categoryIcons.all
            : selectedCategoryId === "combos"
                ? categoryIcons.combos
                : getCategoryIcon(
                    productCategories.find(
                        (category) =>
                            Number(category.categoryId) ===
                            Number(selectedCategoryId)
                    )?.categoryName || ""
                );

    const isHotFood = currentIcon === categoryIcons.hotFood;

    //=================== Lấy số lượng đã chọn ========================

    const getProductQuantity = (productId) => {
        return Number(selectedProductQuantities[productId]) || 0;
    };

    const getComboQuantity = (comboId) => {
        return Number(selectedComboQuantities[comboId]) || 0;
    };

    //=================== Mở ảnh sản phẩm ========================

    const handlePreviewImage = (product) => {
        setPreviewImage({
            imageUrl: product.imageUrl || DEFAULT_PRODUCT_IMAGE,
            productName: product.productName
        });
    };

    const handleClosePreview = () => {
        setPreviewImage(null);
    };

    return (
        <>
            <section className="booking-product-section">

                {/* Tiêu đề */}

                <div className="booking-product-heading">
                    <div>
                        <span className="booking-product-label">
                            FOOD & DRINK
                        </span>

                        <h2>
                            {selectedCategoryId === "combos"
                                ? "Combo ưu đãi"
                                : "Chọn bắp nước và dịch vụ"}
                        </h2>

                        <p>
                            {selectedCategoryId === "combos"
                                ? "Khám phá các combo tiết kiệm dành cho bạn."
                                : "Thưởng thức bắp rang, nước uống và các món ăn trong suốt bộ phim."}
                        </p>
                    </div>

                    <div
                        className={`booking-product-heading-icon ${
                            isHotFood ? "hot-food-icon" : ""
                        }`}
                    >
                        <i className={`bi ${currentIcon}`}></i>

                        {isHotFood && (
                            <span className="booking-icon-steam">
                                <span></span>
                                <span></span>
                                <span></span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Danh mục */}

                <div className="booking-product-categories">
                    <button
                        type="button"
                        className={selectedCategoryId === "all" ? "active" : ""}
                        onClick={() => setSelectedCategoryId("all")}
                    >
                        Tất cả
                    </button>

                    {productCategories
                        .filter((category) => category.status)
                        .map((category) => (
                            <button
                                type="button"
                                key={category.categoryId}
                                className={
                                    Number(selectedCategoryId) ===
                                    Number(category.categoryId)
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setSelectedCategoryId(category.categoryId)
                                }
                            >
                                {category.categoryName}
                            </button>
                        ))}

                    <button
                        type="button"
                        className={
                            selectedCategoryId === "combos" ? "active" : ""
                        }
                        onClick={() => setSelectedCategoryId("combos")}
                    >
                        <i className="bi bi-gift"></i>
                        Combo
                    </button>
                </div>

                {/* Danh sách sản phẩm */}

                {selectedCategoryId !== "combos" && (
                    <div className="booking-product-grid">
                        {filteredProducts.map((product) => {
                            const quantity = getProductQuantity(
                                product.productId
                            );

                            const stockQuantity = Number.isSafeInteger(
                                Number(product.stockQuantity)
                            )
                                ? Math.max(0, Number(product.stockQuantity))
                                : 0;

                            const isOutOfStock = stockQuantity <= 0;
                            const isAtStockLimit = quantity >= stockQuantity;

                            return (
                                <article
                                    className={`booking-product-card ${
                                        isOutOfStock ? "out-of-stock" : ""
                                    }`}
                                    key={product.productId}
                                >
                                    {/* Ảnh sản phẩm */}

                                    <div className="booking-product-image">
                                        <button
                                            type="button"
                                            className="booking-product-image-button"
                                            onClick={() =>
                                                handlePreviewImage(product)
                                            }
                                            title="Xem ảnh sản phẩm"
                                        >
                                            <img
                                                src={
                                                    product.imageUrl ||
                                                    DEFAULT_PRODUCT_IMAGE
                                                }
                                                alt={product.productName}
                                                loading="lazy"
                                                onError={(event) => {
                                                    event.currentTarget.src =
                                                        DEFAULT_PRODUCT_IMAGE;
                                                }}
                                            />

                                            <span className="booking-product-image-zoom">
                                                <i className="bi bi-zoom-in"></i>
                                            </span>
                                        </button>

                                        {isOutOfStock && (
                                            <span className="booking-product-out-badge">
                                                HẾT HÀNG
                                            </span>
                                        )}
                                    </div>

                                    {/* Thông tin sản phẩm */}

                                    <div className="booking-product-info">
                                        <h3>{product.productName}</h3>

                                        <p>{product.description}</p>

                                        <div className="booking-product-stock">
                                            <i
                                                className={`bi ${
                                                    isOutOfStock
                                                        ? "bi-x-circle-fill"
                                                        : "bi-box-seam"
                                                }`}
                                            ></i>

                                            {isOutOfStock
                                                ? "Hết hàng"
                                                : `Còn ${stockQuantity.toLocaleString("vi-VN")} sản phẩm`}
                                        </div>

                                        <div className="booking-product-card-bottom">
                                            <strong>
                                                {formatPrice(product.price)}
                                            </strong>

                                            <div className="booking-quantity-control">
                                                {quantity > 0 && (
                                                    <button
                                                        type="button"
                                                        aria-label={`Giảm ${product.productName}`}
                                                        onClick={() =>
                                                            onChangeProductQuantity(
                                                                product.productId,
                                                                -1
                                                            )
                                                        }
                                                    >
                                                        <i className="bi bi-dash"></i>
                                                    </button>
                                                )}

                                                {quantity > 0 && (
                                                    <span>{quantity}</span>
                                                )}

                                                <button
                                                    type="button"
                                                    aria-label={`Thêm ${product.productName}`}
                                                    disabled={
                                                        isOutOfStock ||
                                                        isAtStockLimit
                                                    }
                                                    onClick={() =>
                                                        onChangeProductQuantity(
                                                            product.productId,
                                                            1
                                                        )
                                                    }
                                                >
                                                    <i className="bi bi-plus"></i>
                                                </button>
                                            </div>
                                        </div>

                                        {isAtStockLimit && !isOutOfStock && (
                                            <small className="booking-product-limit-note">
                                                Đã chọn tối đa số lượng còn hàng.
                                            </small>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                {selectedCategoryId !== "combos" &&
                    filteredProducts.length === 0 && (
                        <div className="booking-product-empty">
                            Không có sản phẩm trong danh mục này.
                        </div>
                    )}

                {/* Danh sách combo */}

                {shouldShowCombos && (
                    <div className="booking-combo-section">
                        {selectedCategoryId === "all" && (
                            <div className="booking-combo-heading">
                                <div>
                                    <span className="booking-product-label">
                                        COMBO ƯU ĐÃI
                                    </span>

                                    <h2>Combo tiết kiệm</h2>

                                    <p>
                                        Kết hợp bắp rang và nước uống với mức
                                        giá ưu đãi.
                                    </p>
                                </div>

                                <i className="bi bi-gift-fill"></i>
                            </div>
                        )}

                        <div className="booking-product-grid">
                            {activeCombos.map((combo) => {
                                const quantity = getComboQuantity(
                                    combo.comboId
                                );

                                return (
                                    <article
                                        className="booking-product-card booking-combo-card"
                                        key={combo.comboId}
                                    >
                                        <div className="booking-product-image">
                                            <img
                                                src={
                                                    combo.imageUrl ||
                                                    DEFAULT_PRODUCT_IMAGE
                                                }
                                                alt={combo.comboName}
                                                loading="lazy"
                                                onError={(event) => {
                                                    event.currentTarget.src =
                                                        DEFAULT_PRODUCT_IMAGE;
                                                }}
                                            />

                                            <span className="booking-combo-badge">
                                                COMBO
                                            </span>
                                        </div>

                                        <div className="booking-product-info">
                                            <h3>{combo.comboName}</h3>

                                            <p>{combo.description}</p>

                                            <div className="booking-product-card-bottom">
                                                <strong>
                                                    {formatPrice(combo.price)}
                                                </strong>

                                                <div className="booking-quantity-control">
                                                    {quantity > 0 && (
                                                        <button
                                                            type="button"
                                                            aria-label={`Giảm ${combo.comboName}`}
                                                            onClick={() =>
                                                                onChangeComboQuantity(
                                                                    combo.comboId,
                                                                    -1
                                                                )
                                                            }
                                                        >
                                                            <i className="bi bi-dash"></i>
                                                        </button>
                                                    )}

                                                    {quantity > 0 && (
                                                        <span>{quantity}</span>
                                                    )}

                                                    <button
                                                        type="button"
                                                        aria-label={`Thêm ${combo.comboName}`}
                                                        onClick={() =>
                                                            onChangeComboQuantity(
                                                                combo.comboId,
                                                                1
                                                            )
                                                        }
                                                    >
                                                        <i className="bi bi-plus"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        {activeCombos.length === 0 && (
                            <div className="booking-product-empty">
                                Hiện chưa có combo khả dụng.
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Modal xem ảnh sản phẩm */}

            {previewImage && (
                <div
                    className="booking-product-image-modal"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            handleClosePreview();
                        }
                    }}
                >
                    <button
                        type="button"
                        className="booking-product-image-modal-close"
                        onClick={handleClosePreview}
                        aria-label="Đóng ảnh"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>

                    <div className="booking-product-image-modal-content">
                        <img
                            src={previewImage.imageUrl}
                            alt={previewImage.productName}
                            onError={(event) => {
                                event.currentTarget.src =
                                    DEFAULT_PRODUCT_IMAGE;
                            }}
                        />

                        <strong>{previewImage.productName}</strong>
                    </div>
                </div>
            )}
        </>
    );
}

export default ProductSelection;
