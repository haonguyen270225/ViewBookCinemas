
import { useMemo, useState } from "react";

import productCategories from "../../data/productCategories.js";

import "./ProductSelection.css";

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
            (product) => product.categoryId === selectedCategoryId
        );
    }, [products, selectedCategoryId]);

    //=================== Danh sách combo khả dụng ========================

    // Combo được truyền từ Booking.jsx thông qua comboService.js.
    // Không đọc trực tiếp dữ liệu combo tĩnh từ combos.js.

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
                            category.categoryId === selectedCategoryId
                    )?.categoryName || ""
                );

    const isHotFood = currentIcon === categoryIcons.hotFood;

    //=================== Lấy số lượng sản phẩm ========================

    const getProductQuantity = (productId) => {
        return selectedProductQuantities[productId] || 0;
    };

    const getComboQuantity = (comboId) => {
        return selectedComboQuantities[comboId] || 0;
    };

    return (
        <section className="booking-product-section">
            {/*=================== Tiêu đề ========================*/}

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

            {/*=================== Danh mục ========================*/}

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
                                selectedCategoryId === category.categoryId
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

            {/*=================== Danh sách sản phẩm ========================*/}

            {selectedCategoryId !== "combos" && (
                <div className="booking-product-grid">
                    {filteredProducts.map((product) => {
                        const quantity = getProductQuantity(product.productId);

                        return (
                            <article
                                className="booking-product-card"
                                key={product.productId}
                            >
                                <div className="booking-product-image">
                                    <img
                                        src={product.imageUrl}
                                        alt={product.productName}
                                        loading="lazy"
                                    />
                                </div>

                                <div className="booking-product-info">
                                    <h3>{product.productName}</h3>

                                    <p>{product.description}</p>

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

            {/*=================== Danh sách combo ========================*/}

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
                                    Kết hợp bắp rang và nước uống với mức giá
                                    ưu đãi.
                                </p>
                            </div>

                            <i className="bi bi-gift-fill"></i>
                        </div>
                    )}

                    <div className="booking-product-grid">
                        {activeCombos.map((combo) => {
                            const quantity = getComboQuantity(combo.comboId);

                            return (
                                <article
                                    className="booking-product-card booking-combo-card"
                                    key={combo.comboId}
                                >
                                    <div className="booking-product-image">
                                        <img
                                            src={combo.imageUrl}
                                            alt={combo.comboName}
                                            loading="lazy"
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
    );
}

export default ProductSelection;
