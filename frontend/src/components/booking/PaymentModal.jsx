
import { useEffect, useState } from "react";
import "./PaymentModal.css";

const PAYMENT_TIMEOUT = 150;

function PaymentModal({
    method,
    totalPrice,
    onSuccess,
    onClose
}) {
    const [timeLeft, setTimeLeft] = useState(PAYMENT_TIMEOUT);
    const [paymentStatus, setPaymentStatus] = useState("pending");

    const [cardInfo, setCardInfo] = useState({
        cardholder: "",
        cardNumber: "",
        expiry: "",
        cvv: ""
    });

    const [cardError, setCardError] = useState("");

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN").format(price) + "đ";
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${String(minutes).padStart(2, "0")}:${String(
            remainingSeconds
        ).padStart(2, "0")}`;
    };

    // Đếm ngược 02:30 đối với MoMo
    useEffect(() => {
        if (method !== "momo" || paymentStatus !== "pending") {
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((current) => {
                if (current <= 1) {
                    clearInterval(timer);
                    setPaymentStatus("failed");
                    return 0;
                }

                return current - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [method, paymentStatus]);

    // Định dạng số thẻ
    const handleCardNumberChange = (value) => {
        const numbers = value.replace(/\D/g, "").slice(0, 19);

        const formatted = numbers.replace(/(.{4})/g, "$1 ").trim();

        setCardInfo((current) => ({
            ...current,
            cardNumber: formatted
        }));
    };

    // Định dạng ngày hết hạn MM/YY
    const handleExpiryChange = (value) => {
        const numbers = value.replace(/\D/g, "").slice(0, 4);

        const formatted =
            numbers.length > 2
                ? `${numbers.slice(0, 2)}/${numbers.slice(2)}`
                : numbers;

        setCardInfo((current) => ({
            ...current,
            expiry: formatted
        }));
    };

    // Mô phỏng thanh toán Card
    const handleCardPayment = (event) => {
        event.preventDefault();
        setCardError("");

        const cardNumber = cardInfo.cardNumber.replace(/\s/g, "");

        if (!cardInfo.cardholder.trim()) {
            setCardError("Vui lòng nhập tên chủ thẻ.");
            return;
        }

        if (!/^\d{16,19}$/.test(cardNumber)) {
            setCardError("Số thẻ phải có từ 16 đến 19 chữ số.");
            return;
        }

        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardInfo.expiry)) {
            setCardError("Ngày hết hạn không hợp lệ. Ví dụ: 12/28.");
            return;
        }

        const [month, year] = cardInfo.expiry.split("/").map(Number);
        const expiryDate = new Date(2000 + year, month);
        const currentDate = new Date();

        if (expiryDate <= currentDate) {
            setCardError("Thẻ đã hết hạn.");
            return;
        }

        if (!/^\d{3,4}$/.test(cardInfo.cvv)) {
            setCardError("CVV phải có 3 hoặc 4 chữ số.");
            return;
        }

        // Đây chỉ là kết quả giả lập ở Frontend.
        // Sau này thay bằng API thanh toán từ Backend.
        onSuccess({
            paymentMethod: "Card",
            paymentStatus: "Success",
            amount: totalPrice
        });
    };

    const handleMomoSuccess = () => {
        if (paymentStatus !== "pending") return;

        // Chỉ mô phỏng kết quả thành công.
        // Không xác nhận giao dịch MoMo thật.
        setPaymentStatus("success");
    };

    const handleReturn = () => {
        if (paymentStatus === "success") {
            onSuccess({
                paymentMethod: "MoMo",
                paymentStatus: "Success",
                amount: totalPrice
            });
            return;
        }

        onClose();
    };

    return (
        <div className="payment-modal-overlay">
            <div className="payment-modal">
                <button
                    type="button"
                    className="payment-modal-close"
                    onClick={onClose}
                    aria-label="Đóng cửa sổ thanh toán"
                >
                    <i className="bi bi-x-lg"></i>
                </button>

                {paymentStatus === "failed" ? (
                    <div className="payment-result payment-result-failed">
                        <i className="bi bi-x-circle-fill"></i>

                        <h3>Thanh toán không thành công!</h3>

                        <p>
                            Đã hết thời gian thanh toán. Vui lòng quay lại
                            và thực hiện lại giao dịch.
                        </p>

                        <button
                            type="button"
                            className="payment-modal-primary"
                            onClick={onClose}
                        >
                            Quay lại bước thanh toán
                        </button>
                    </div>
                ) : paymentStatus === "success" ? (
                    <div className="payment-result payment-result-success">
                        <i className="bi bi-check-circle-fill"></i>

                        <h3>Mô phỏng thanh toán thành công!</h3>

                        <p>
                            Giao diện đã ghi nhận kết quả thanh toán mô phỏng.
                        </p>

                        <button
                            type="button"
                            className="payment-modal-primary"
                            onClick={handleReturn}
                        >
                            Hoàn tất
                        </button>
                    </div>
                ) : method === "momo" ? (
                    <div className="payment-momo-modal">
                        <div className="payment-modal-heading">
                            <span className="payment-modal-brand">
                                <span>M</span> MoMo
                            </span>

                            <h3>Quét mã QR để thanh toán</h3>

                            <p>
                                Sử dụng ứng dụng MoMo để quét mã QR mô phỏng.
                            </p>
                        </div>

                        <div className="payment-modal-amount">
                            <span>Số tiền cần thanh toán</span>
                            <strong>{formatPrice(totalPrice)}</strong>
                        </div>

                        <div className="payment-modal-qr">
                            <div className="payment-qr-demo">
                                <div className="payment-qr-grid">
                                    <span className="qr-box qr-top-left"></span>
                                    <span className="qr-box qr-top-right"></span>
                                    <span className="qr-box qr-bottom-left"></span>
                                    <span className="qr-box qr-middle"></span>
                                </div>
                            </div>

                            <span className="payment-qr-label">
                                QR DEMO – KHÔNG DÙNG ĐỂ THANH TOÁN THẬT
                            </span>
                        </div>

                        <div className="payment-countdown">
                            <i className="bi bi-clock"></i>
                            <span>Thời gian còn lại</span>
                            <strong>{formatTime(timeLeft)}</strong>
                        </div>

                        <p className="payment-modal-note">
                            Đây là giao diện mô phỏng. Mã QR chưa kết nối
                            với hệ thống thanh toán MoMo.
                        </p>

                        <button
                            type="button"
                            className="payment-modal-primary"
                            onClick={handleMomoSuccess}
                        >
                            Tôi đã thanh toán (Mô phỏng)
                        </button>
                    </div>
                ) : (
                    <div className="payment-card-modal">
                        <div className="payment-modal-heading">
                            <span className="payment-card-brand">
                                <i className="bi bi-credit-card-2-front-fill"></i>
                                CARD PAYMENT
                            </span>

                            <h3>Thông tin thẻ thanh toán</h3>

                            <p>
                                Nhập thông tin thẻ giả lập để kiểm thử giao diện.
                            </p>
                        </div>

                        <div className="payment-modal-amount">
                            <span>Số tiền cần thanh toán</span>
                            <strong>{formatPrice(totalPrice)}</strong>
                        </div>

                        <form
                            className="payment-card-form"
                            onSubmit={handleCardPayment}
                        >
                            <div className="payment-form-group">
                                <label htmlFor="cardholder">
                                    Tên chủ thẻ
                                </label>

                                <input
                                    id="cardholder"
                                    type="text"
                                    placeholder="NGUYEN VAN A"
                                    autoComplete="off"
                                    value={cardInfo.cardholder}
                                    onChange={(event) =>
                                        setCardInfo((current) => ({
                                            ...current,
                                            cardholder: event.target.value
                                        }))
                                    }
                                />
                            </div>

                            <div className="payment-form-group">
                                <label htmlFor="cardNumber">
                                    Số thẻ
                                </label>

                                <input
                                    id="cardNumber"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="1234 5678 9012 3456"
                                    autoComplete="off"
                                    value={cardInfo.cardNumber}
                                    onChange={(event) =>
                                        handleCardNumberChange(
                                            event.target.value
                                        )
                                    }
                                />
                            </div>

                            <div className="payment-card-form-row">
                                <div className="payment-form-group">
                                    <label htmlFor="expiry">
                                        Ngày hết hạn
                                    </label>

                                    <input
                                        id="expiry"
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="MM/YY"
                                        autoComplete="off"
                                        value={cardInfo.expiry}
                                        onChange={(event) =>
                                            handleExpiryChange(
                                                event.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div className="payment-form-group">
                                    <label htmlFor="cvv">
                                        CVV
                                    </label>

                                    <input
                                        id="cvv"
                                        type="password"
                                        inputMode="numeric"
                                        maxLength={4}
                                        placeholder="•••"
                                        autoComplete="off"
                                        value={cardInfo.cvv}
                                        onChange={(event) =>
                                            setCardInfo((current) => ({
                                                ...current,
                                                cvv: event.target.value
                                                    .replace(/\D/g, "")
                                                    .slice(0, 4)
                                            }))
                                        }
                                    />
                                </div>
                            </div>

                            {cardError && (
                                <p className="payment-card-error">
                                    <i className="bi bi-exclamation-circle"></i>
                                    {cardError}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="payment-modal-primary"
                            >
                                Xác nhận thanh toán
                                <i className="bi bi-shield-check"></i>
                            </button>
                        </form>

                        <p className="payment-modal-note">
                            Không nhập thông tin thẻ thật. Dữ liệu chỉ dùng
                            tạm thời để mô phỏng và không được lưu lại.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PaymentModal;
