
import { useEffect, useState } from "react";

import PaymentModal from "./PaymentModal.jsx";

import "./PaymentSelection.css";

function PaymentSelection({
    totalPrice,
    originalPrice = totalPrice,
    discountAmount = 0,
    promotionCode = "",
    promotionError = "",
    isApplyingPromotion = false,
    isSavingBooking = false,
    onPromotionCodeChange,
    onApplyPromotion,
    onRemovePromotion,
    selectedMethod,
    onChangeMethod,
    onBack,
    onConfirm
}) {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    // State riêng cho ô nhập, không phụ thuộc trực tiếp vào mã đã áp dụng.
    const [inputPromotionCode, setInputPromotionCode] = useState(
        promotionCode
    );

    // Đồng bộ khi mã được áp dụng thành công hoặc bị gỡ.
    useEffect(() => {
        setInputPromotionCode(promotionCode || "");
    }, [promotionCode]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN").format(
            Number(price) || 0
        ) + "đ";
    };

    const handleOpenPayment = () => {
        if (isSavingBooking || totalPrice <= 0 || isApplyingPromotion) {
            return;
        }

        setIsPaymentModalOpen(true);
    };

    const handlePaymentSuccess = (result) => {
        setIsPaymentModalOpen(false);
        onConfirm(result);
    };

    const handleClosePayment = () => {
        setIsPaymentModalOpen(false);
    };

    const handlePromotionInputChange = (event) => {
        const value = event.target.value.toUpperCase();

        setInputPromotionCode(value);
        onPromotionCodeChange?.(value);
    };

    const handleRemovePromotion = () => {
        setInputPromotionCode("");
        onRemovePromotion?.();
    };

    const hasAppliedPromotion =
        Boolean(promotionCode) && Number(discountAmount) > 0;

    return (
        <>
            <section className="payment-section">
                <div className="payment-heading">
                    <span className="payment-eyebrow">
                        VIEWBOOKCINEMAS
                    </span>

                    <h2>Thanh toán đơn hàng</h2>

                    <p>
                        Chọn phương thức thanh toán để hoàn tất đặt vé xem phim.
                    </p>
                </div>

                {/* Phương thức thanh toán */}
                <div className="payment-method-list">
                    <button
                        type="button"
                        className={`payment-method ${
                            selectedMethod === "momo" ? "active" : ""
                        }`}
                        onClick={() => onChangeMethod("momo")}
                        disabled={isSavingBooking}
                    >
                        <span className="payment-method-icon momo-icon">
                            M
                        </span>

                        <span className="payment-method-info">
                            <strong>Ví điện tử MoMo</strong>
                            <small>
                                Thanh toán mô phỏng bằng ví MoMo
                            </small>
                        </span>

                        <span className="payment-radio">
                            {selectedMethod === "momo" && (
                                <i className="bi bi-check"></i>
                            )}
                        </span>
                    </button>

                    <button
                        type="button"
                        className={`payment-method ${
                            selectedMethod === "card" ? "active" : ""
                        }`}
                        onClick={() => onChangeMethod("card")}
                        disabled={isSavingBooking}
                    >
                        <span className="payment-method-icon card-icon">
                            <i className="bi bi-credit-card-2-front-fill"></i>
                        </span>

                        <span className="payment-method-info">
                            <strong>Thẻ ngân hàng (Card)</strong>
                            <small>
                                Thanh toán mô phỏng bằng thẻ
                            </small>
                        </span>

                        <span className="payment-radio">
                            {selectedMethod === "card" && (
                                <i className="bi bi-check"></i>
                            )}
                        </span>
                    </button>
                </div>

                {/* Xem trước phương thức thanh toán */}
                <div className="payment-preview">
                    {selectedMethod === "momo" ? (
                        <div className="payment-momo-preview">
                            <div className="payment-momo-logo">
                                MoMo
                            </div>

                            <div className="payment-demo-qr">
                                <div className="payment-qr-pattern">
                                    <span className="qr-corner top-left"></span>
                                    <span className="qr-corner top-right"></span>
                                    <span className="qr-corner bottom-left"></span>
                                    <span className="qr-center"></span>
                                </div>
                            </div>

                            <strong>
                                Mã QR thanh toán mô phỏng
                            </strong>

                            <p>
                                Mã QR minh họa. Nhấn xác nhận để mở cửa sổ
                                thanh toán mô phỏng.
                            </p>
                        </div>
                    ) : (
                        <div className="payment-card-preview">
                            <div className="payment-card-visual">
                                <div className="payment-card-top">
                                    <i className="bi bi-sim"></i>
                                    <span>VIEWBOOK CARD</span>
                                </div>

                                <div className="payment-card-number">
                                    •••• •••• •••• 0000
                                </div>

                                <div className="payment-card-bottom">
                                    <span>DEMO CARD</span>
                                    <i className="bi bi-credit-card"></i>
                                </div>
                            </div>

                            <strong>
                                Thanh toán bằng thẻ mô phỏng
                            </strong>

                            <p>
                                Nhấn xác nhận để mở biểu mẫu nhập thông tin
                                thẻ giả lập.
                            </p>
                        </div>
                    )}
                </div>

                {/* Mã khuyến mãi */}
                <div className="payment-promotion">
                    <div className="payment-promotion-heading">
                        <h3>
                            <i className="bi bi-ticket-perforated"></i>
                            Mã khuyến mãi
                        </h3>

                        <span>
                            Nhập mã ưu đãi nếu bạn có
                        </span>
                    </div>

                    <div className="payment-promotion-input">
                        <input
                            type="text"
                            value={inputPromotionCode}
                            onChange={handlePromotionInputChange}
                            placeholder="Nhập mã khuyến mãi"
                            maxLength={20}
                            autoComplete="off"
                            spellCheck={false}
                            disabled={
                                hasAppliedPromotion ||
                                isApplyingPromotion ||
                                isSavingBooking
                            }
                        />

                        {hasAppliedPromotion ? (
                            <button
                                type="button"
                                className="payment-promotion-remove"
                                onClick={handleRemovePromotion}
                                disabled={isSavingBooking}
                            >
                                <i className="bi bi-x-circle"></i>
                                Gỡ mã
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={onApplyPromotion}
                                disabled={
                                    isApplyingPromotion ||
                                    isSavingBooking ||
                                    !inputPromotionCode.trim()
                                }
                            >
                                {isApplyingPromotion ? (
                                    <>
                                        <span
                                            className="spinner-border spinner-border-sm"
                                            aria-hidden="true"
                                        ></span>
                                        Đang kiểm tra
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check2-circle"></i>
                                        Áp dụng
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {promotionError && (
                        <p className="payment-promotion-error">
                            <i className="bi bi-exclamation-circle"></i>
                            {promotionError}
                        </p>
                    )}

                    {hasAppliedPromotion && (
                        <p className="payment-promotion-success">
                            <i className="bi bi-check-circle-fill"></i>
                            Đã áp dụng mã {promotionCode} thành công.
                        </p>
                    )}
                </div>

                {/* Chi tiết thanh toán */}
                <div className="payment-total">
                    <div className="payment-total-row">
                        <span>Tạm tính</span>
                        <strong>{formatPrice(originalPrice)}</strong>
                    </div>

                    {hasAppliedPromotion && (
                        <div className="payment-total-row payment-discount">
                            <span>
                                Khuyến mãi ({promotionCode})
                            </span>

                            <strong>
                                -{formatPrice(discountAmount)}
                            </strong>
                        </div>
                    )}

                    <div className="payment-total-row payment-final-total">
                        <span>Tổng tiền cần thanh toán</span>
                        <strong>{formatPrice(totalPrice)}</strong>
                    </div>
                </div>

                {/* Nút thao tác */}
                <div className="payment-actions">
                    <button
                        type="button"
                        className="payment-back-button"
                        onClick={onBack}
                        disabled={isSavingBooking}
                    >
                        <i className="bi bi-arrow-left"></i>
                        Quay lại bắp nước
                    </button>

                    <button
                        type="button"
                        className="payment-confirm-button"
                        onClick={handleOpenPayment}
                        disabled={
                            isSavingBooking ||
                            isApplyingPromotion ||
                            totalPrice <= 0
                        }
                    >
                        {isSavingBooking ? (
                            <>
                                <span
                                    className="spinner-border spinner-border-sm"
                                    aria-hidden="true"
                                ></span>
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                Xác nhận thanh toán
                                <i className="bi bi-shield-check"></i>
                            </>
                        )}
                    </button>
                </div>

                <p className="payment-demo-note">
                    <i className="bi bi-info-circle"></i>
                    Chế độ demo: chưa kết nối cổng thanh toán và không phát sinh
                    giao dịch thật.
                </p>
            </section>

            {isPaymentModalOpen && (
                <PaymentModal
                    method={selectedMethod}
                    totalPrice={totalPrice}
                    onSuccess={handlePaymentSuccess}
                    onClose={handleClosePayment}
                />
            )}
        </>
    );
}

export default PaymentSelection;
