
import { useMemo, useState } from "react";

//=================== Import Components ========================
import "./Promotions.css";
import Navbar from "../../components/layout/Navbar.jsx";
import Footer from "../../components/layout/Footer.jsx";

//=================== Import dữ liệu ========================

import { promotions } from "../../data/promotions.js";

//=================== Hàm định dạng dữ liệu ========================

const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
    }).format(value);
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN");
};

//=================== Xác định trạng thái khuyến mãi ========================

const getPromotionStatus = (promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);

    if (promotion.status !== "Active") {
        return "inactive";
    }

    if (now < startDate) {
        return "upcoming";
    }

    if (now > endDate) {
        return "expired";
    }

    return "active";
};

//=================== Component Promotions ========================

function Promotions() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");

    //=================== Lọc khuyến mãi ========================

    const filteredPromotions = useMemo(() => {
        return promotions.filter((promotion) => {
            const keyword = searchTerm.toLowerCase().trim();

            const matchesSearch =
                promotion.name.toLowerCase().includes(keyword) ||
                promotion.code.toLowerCase().includes(keyword) ||
                promotion.description.toLowerCase().includes(keyword);

            const status = getPromotionStatus(promotion);

            const matchesStatus =
                selectedStatus === "all" ||
                status === selectedStatus;

            return matchesSearch && matchesStatus;
        });
    }, [searchTerm, selectedStatus]);

    //=================== Sao chép mã khuyến mãi ========================

    const handleCopyCode = async (code) => {
        try {
            await navigator.clipboard.writeText(code);
            alert(`Đã sao chép mã ${code}`);
        } catch (error) {
            console.error("Không thể sao chép mã:", error);
            alert("Không thể sao chép mã khuyến mãi.");
        }
    };

    //=================== Hiển thị mức giảm giá ========================

    const getDiscountLabel = (promotion) => {
        if (promotion.discountType === "Percentage") {
            return `-${promotion.discountValue}%`;
        }

        return `-${formatCurrency(promotion.discountValue)}`;
    };

    //=================== Hiển thị trạng thái ========================

    const getStatusLabel = (status) => {
        const labels = {
            active: "Đang diễn ra",
            upcoming: "Sắp diễn ra",
            expired: "Đã kết thúc",
            inactive: "Ngừng hoạt động"
        };

        return labels[status];
    };

    //=================== Giao diện ========================

    return (
        <>
            <Navbar />

            <main className="promotions-page">

                {/*=================== Hero Banner ========================*/}

                <section className="promotions-hero">
                    <div className="container">
                        <div className="promotions-hero-content">
                            <span className="promotions-hero-label">
                                <i className="bi bi-stars"></i>
                                ƯU ĐÃI ĐẶC BIỆT
                            </span>

                            <h1>
                                ƯU ĐÃI ĐIỆN ẢNH
                                <span> CHỜ BẠN KHÁM PHÁ</span>
                            </h1>

                            <p>
                                Săn mã giảm giá hấp dẫn và tận hưởng
                                những khoảnh khắc điện ảnh tuyệt vời
                                cùng ViewBookCinemas.
                            </p>

                            <a href="#promotion-list" className="promotions-hero-button">
                                Khám phá ưu đãi
                                <i className="bi bi-arrow-down"></i>
                            </a>
                        </div>

                        <div className="promotions-hero-decoration">
                            <i className="bi bi-ticket-perforated-fill"></i>
                        </div>
                    </div>
                </section>

                {/*=================== Danh sách khuyến mãi ========================*/}

                <section className="promotions-content" id="promotion-list">
                    <div className="container">

                        <div className="promotions-heading">
                            <div>
                                <span className="promotions-subtitle">
                                    VIEWBOOKCINEMAS
                                </span>

                                <h2>Chương trình khuyến mãi</h2>

                                <p>
                                    Những ưu đãi hấp dẫn dành riêng cho bạn.
                                </p>
                            </div>

                            <div className="promotions-total">
                                <i className="bi bi-gift"></i>
                                {filteredPromotions.length} ưu đãi
                            </div>
                        </div>

                        {/*=================== Thanh tìm kiếm và bộ lọc ========================*/}

                        <div className="promotions-toolbar">
                            <div className="promotions-search">
                                <i className="bi bi-search"></i>

                                <input
                                    type="text"
                                    placeholder="Tìm tên hoặc mã khuyến mãi..."
                                    value={searchTerm}
                                    onChange={(event) =>
                                        setSearchTerm(event.target.value)
                                    }
                                />

                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchTerm("")}
                                        title="Xóa tìm kiếm"
                                    >
                                        <i className="bi bi-x-lg"></i>
                                    </button>
                                )}
                            </div>

                            <div className="promotions-filters">
                                {[
                                    { id: "all", label: "Tất cả" },
                                    { id: "active", label: "Đang diễn ra" },
                                    { id: "upcoming", label: "Sắp diễn ra" },
                                    { id: "expired", label: "Đã kết thúc" }
                                ].map((filter) => (
                                    <button
                                        key={filter.id}
                                        type="button"
                                        className={
                                            selectedStatus === filter.id
                                                ? "promotion-filter active"
                                                : "promotion-filter"
                                        }
                                        onClick={() =>
                                            setSelectedStatus(filter.id)
                                        }
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/*=================== Promotion Cards ========================*/}

                        {filteredPromotions.length > 0 ? (
                            <div className="promotions-grid">
                                {filteredPromotions.map((promotion) => {
                                    const status = getPromotionStatus(promotion);

                                    return (
                                        <article
                                            className="promotion-card"
                                            key={promotion.id}
                                        >
                                            <div className="promotion-image">
                                                <img
                                                    src={promotion.image}
                                                    alt={promotion.name}
                                                />

                                                <span
                                                    className={`promotion-status ${status}`}
                                                >
                                                    {getStatusLabel(status)}
                                                </span>

                                                <div className="promotion-discount">
                                                    {getDiscountLabel(promotion)}
                                                </div>
                                            </div>

                                            <div className="promotion-body">
                                                <h3>{promotion.name}</h3>

                                                <p className="promotion-description">
                                                    {promotion.description}
                                                </p>

                                                <div className="promotion-details">
                                                    <div>
                                                        <i className="bi bi-cart-check"></i>
                                                        <span>
                                                            Đơn tối thiểu:{" "}
                                                            <strong>
                                                                {formatCurrency(
                                                                    promotion.minOrderAmount
                                                                )}
                                                            </strong>
                                                        </span>
                                                    </div>

                                                    {promotion.maxDiscountAmount && (
                                                        <div>
                                                            <i className="bi bi-cash-stack"></i>
                                                            <span>
                                                                Giảm tối đa:{" "}
                                                                <strong>
                                                                    {formatCurrency(
                                                                        promotion.maxDiscountAmount
                                                                    )}
                                                                </strong>
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <i className="bi bi-calendar-event"></i>
                                                        <span>
                                                            Hạn dùng:{" "}
                                                            <strong>
                                                                {formatDate(
                                                                    promotion.endDate
                                                                )}
                                                            </strong>
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="promotion-code-area">
                                                    <div className="promotion-code">
                                                        <span>MÃ ƯU ĐÃI</span>
                                                        <strong>
                                                            {promotion.code}
                                                        </strong>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="promotion-copy-button"
                                                        onClick={() =>
                                                            handleCopyCode(
                                                                promotion.code
                                                            )
                                                        }
                                                        disabled={status !== "active"}
                                                        title="Sao chép mã"
                                                    >
                                                        <i className="bi bi-copy"></i>
                                                        Sao chép
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="promotions-empty">
                                <i className="bi bi-gift"></i>
                                <h3>Không tìm thấy khuyến mãi</h3>
                                <p>
                                    Hãy thử thay đổi từ khóa hoặc bộ lọc của bạn.
                                </p>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setSelectedStatus("all");
                                    }}
                                >
                                    Xóa bộ lọc
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}

export default Promotions;
