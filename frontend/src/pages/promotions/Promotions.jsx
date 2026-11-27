
import { useEffect, useMemo, useState } from "react";

import "./Promotions.css";

import Navbar from "../../components/layout/Navbar.jsx";
import Footer from "../../components/layout/Footer.jsx";

import { getPromotions } from "../../services/promotionService.js";

//=================== Định dạng dữ liệu ========================

const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
    }).format(Number(value) || 0);
};

const formatDate = (date) => {
    if (!date) {
        return "Không giới hạn";
    }

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Không xác định";
    }

    return parsedDate.toLocaleDateString("vi-VN");
};

const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

//=================== Xác định trạng thái khuyến mãi ========================

const getPromotionStatus = (promotion) => {
    if (promotion.status !== "Active") {
        return "inactive";
    }

    const today = getTodayDate();

    if (promotion.startDate && today < promotion.startDate) {
        return "upcoming";
    }

    if (promotion.endDate && today > promotion.endDate) {
        return "expired";
    }

    const usageLimit =
        promotion.usageLimit === null ||
        promotion.usageLimit === undefined ||
        promotion.usageLimit === ""
            ? null
            : Number(promotion.usageLimit);

    const usedCount = Number(promotion.usedCount) || 0;

    if (
        usageLimit !== null &&
        Number.isFinite(usageLimit) &&
        usedCount >= usageLimit
    ) {
        return "exhausted";
    }

    return "active";
};

//=================== Nhãn trạng thái ========================

const getStatusLabel = (status) => {
    const labels = {
        active: "Đang diễn ra",
        upcoming: "Sắp diễn ra",
        expired: "Đã kết thúc",
        exhausted: "Đã hết lượt",
        inactive: "Ngừng hoạt động"
    };

    return labels[status] || "Không xác định";
};

//=================== Nhãn mức giảm giá ========================

const getDiscountLabel = (promotion) => {
    if (promotion.discountType === "Percentage") {
        return `-${Number(promotion.discountValue) || 0}%`;
    }

    return `-${formatCurrency(promotion.discountValue)}`;
};

//=================== Component Promotions ========================

function Promotions() {
    const [promotions, setPromotions] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");

    const [selectedStatus, setSelectedStatus] = useState("all");

    const [isLoading, setIsLoading] = useState(true);

    const [loadError, setLoadError] = useState("");

    //=================== Tải dữ liệu từ Promotion Service ========================

    useEffect(() => {
        let isMounted = true;

        const loadPromotions = async () => {
            setIsLoading(true);
            setLoadError("");

            try {
                const data = await getPromotions();

                if (!isMounted) return;

                setPromotions(
                    Array.isArray(data) ? data : []
                );
            } catch (error) {
                console.error(
                    "Không thể tải danh sách khuyến mãi:",
                    error
                );

                if (isMounted) {
                    setLoadError(
                        error.message ||
                        "Không thể tải danh sách khuyến mãi. Vui lòng thử lại."
                    );
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadPromotions();

        return () => {
            isMounted = false;
        };
    }, []);

    //=================== Lọc khuyến mãi ========================

    const filteredPromotions = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        return promotions.filter((promotion) => {
            const promotionName = String(
                promotion.promotionName || ""
            ).toLowerCase();

            const promotionCode = String(
                promotion.promotionCode || ""
            ).toLowerCase();

            const description = String(
                promotion.description || ""
            ).toLowerCase();

            const matchesSearch =
                !keyword ||
                promotionName.includes(keyword) ||
                promotionCode.includes(keyword) ||
                description.includes(keyword);

            const status = getPromotionStatus(promotion);

            const matchesStatus =
                selectedStatus === "all" ||
                status === selectedStatus ||
                (
                    selectedStatus === "expired" &&
                    status === "exhausted"
                );

            return matchesSearch && matchesStatus;
        });
    }, [promotions, searchTerm, selectedStatus]);

    //=================== Sao chép mã khuyến mãi ========================

    const handleCopyCode = async (code) => {
        try {
            if (!navigator.clipboard?.writeText) {
                throw new Error(
                    "Trình duyệt không hỗ trợ sao chép tự động."
                );
            }

            await navigator.clipboard.writeText(code);

            alert(`Đã sao chép mã ${code}`);
        } catch (error) {
            console.error("Không thể sao chép mã:", error);

            alert(
                "Không thể sao chép mã. Bạn có thể chọn và sao chép mã thủ công."
            );
        }
    };

    //=================== Xóa bộ lọc ========================

    const handleClearFilters = () => {
        setSearchTerm("");
        setSelectedStatus("all");
    };

    //=================== Giao diện ========================

    return (
        <>
            <Navbar />

            <main className="promotions-page">
                {/* Hero Banner */}
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

                            <a
                                href="#promotion-list"
                                className="promotions-hero-button"
                            >
                                Khám phá ưu đãi
                                <i className="bi bi-arrow-down"></i>
                            </a>
                        </div>

                        <div className="promotions-hero-decoration">
                            <i className="bi bi-ticket-perforated-fill"></i>
                        </div>
                    </div>
                </section>

                {/* Danh sách khuyến mãi */}
                <section
                    className="promotions-content"
                    id="promotion-list"
                >
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

                        {/* Tìm kiếm và bộ lọc */}
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
                                    { id: "expired", label: "Đã kết thúc / hết lượt" },
                                    { id: "inactive", label: "Ngừng hoạt động" }
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

                        {/* Trạng thái tải */}
                        {isLoading && (
                            <div className="promotions-empty">
                                <span
                                    className="spinner-border text-danger"
                                    role="status"
                                    aria-hidden="true"
                                ></span>

                                <h3>Đang tải khuyến mãi...</h3>

                                <p>
                                    Vui lòng chờ trong giây lát.
                                </p>
                            </div>
                        )}

                        {/* Lỗi tải dữ liệu */}
                        {!isLoading && loadError && (
                            <div className="promotions-empty">
                                <i className="bi bi-exclamation-circle"></i>

                                <h3>Không thể tải khuyến mãi</h3>

                                <p>{loadError}</p>

                                <button
                                    type="button"
                                    onClick={() => window.location.reload()}
                                >
                                    Thử tải lại
                                </button>
                            </div>
                        )}

                        {/* Danh sách */}
                        {!isLoading &&
                            !loadError &&
                            filteredPromotions.length > 0 && (
                                <div className="promotions-grid">
                                    {filteredPromotions.map((promotion) => {
                                        const status =
                                            getPromotionStatus(promotion);

                                        const promotionCode =
                                            promotion.promotionCode || "";

                                        const promotionName =
                                            promotion.promotionName ||
                                            "Chương trình khuyến mãi";

                                        return (
                                            <article
                                                className="promotion-card"
                                                key={promotion.promotionId}
                                            >
                                                <div className="promotion-image">
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            width: "100%",
                                                            height: "100%",
                                                            color: "#ffffff",
                                                            background:
                                                                "radial-gradient(circle at 75% 20%, rgba(255,255,255,0.18), transparent 35%), linear-gradient(135deg, #252525, #681f2a)",
                                                            fontSize: "76px"
                                                        }}
                                                    >
                                                        <i className="bi bi-ticket-perforated-fill"></i>
                                                    </div>

                                                    <span
                                                        className={`promotion-status ${status === "exhausted" ? "expired" : status}`}
                                                    >
                                                        {getStatusLabel(status)}
                                                    </span>

                                                    <div className="promotion-discount">
                                                        {getDiscountLabel(promotion)}
                                                    </div>
                                                </div>

                                                <div className="promotion-body">
                                                    <h3>{promotionName}</h3>

                                                    <p className="promotion-description">
                                                        {promotion.description ||
                                                            "Ưu đãi dành cho khách hàng ViewBookCinemas."}
                                                    </p>

                                                    <div className="promotion-details">
                                                        <div>
                                                            <i className="bi bi-cart-check"></i>

                                                            <span>
                                                                Đơn tối thiểu:{" "}
                                                                <strong>
                                                                    {formatCurrency(
                                                                        promotion.minOrderValue
                                                                    )}
                                                                </strong>
                                                            </span>
                                                        </div>

                                                        {promotion.discountType === "Percentage" &&
                                                            promotion.maxDiscountAmount !== null &&
                                                            promotion.maxDiscountAmount !== undefined && (
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

                                                        {promotion.usageLimit !== null &&
                                                            promotion.usageLimit !== undefined && (
                                                                <div>
                                                                    <i className="bi bi-people"></i>

                                                                    <span>
                                                                        Lượt sử dụng:{" "}
                                                                        <strong>
                                                                            {Number(promotion.usedCount) || 0}
                                                                            {" / "}
                                                                            {promotion.usageLimit}
                                                                        </strong>
                                                                    </span>
                                                                </div>
                                                            )}
                                                    </div>

                                                    <div className="promotion-code-area">
                                                        <div className="promotion-code">
                                                            <span>MÃ ƯU ĐÃI</span>

                                                            <strong>
                                                                {promotionCode || "Chưa có mã"}
                                                            </strong>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            className="promotion-copy-button"
                                                            onClick={() =>
                                                                handleCopyCode(
                                                                    promotionCode
                                                                )
                                                            }
                                                            disabled={
                                                                status !== "active" ||
                                                                !promotionCode
                                                            }
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
                            )}

                        {/* Không có dữ liệu phù hợp */}
                        {!isLoading &&
                            !loadError &&
                            filteredPromotions.length === 0 && (
                                <div className="promotions-empty">
                                    <i className="bi bi-gift"></i>

                                    <h3>
                                        {promotions.length === 0
                                            ? "Chưa có chương trình khuyến mãi"
                                            : "Không tìm thấy khuyến mãi"}
                                    </h3>

                                    <p>
                                        Hãy thử thay đổi từ khóa hoặc bộ lọc của bạn.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={handleClearFilters}
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
