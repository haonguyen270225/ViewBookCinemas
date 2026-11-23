
import "./PaymentSelection.css";

function PaymentSelection({
    totalPrice,
    selectedMethod,
    onChangeMethod,
    onBack,
    onConfirm
}) {
    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN").format(price) + "đ";
    };

    return (
      <section className="payment-section">
        <div className="payment-heading">
          <span className="payment-eyebrow">VIEWBOOKCINEMAS</span>

          <h2>Thanh toán đơn hàng</h2>

          <p>Chọn phương thức thanh toán để hoàn tất đặt vé xem phim.</p>
        </div>
        <div className="payment-method-list">
          <button
            type="button"
            className={`payment-method ${
              selectedMethod === "momo" ? "active" : ""
            }`}
            onClick={() => onChangeMethod("momo")}
          >
            <span className="payment-method-icon momo-icon">M</span>

            <span className="payment-method-info">
              <strong>Ví điện tử MoMo</strong>
              <small>Thanh toán mô phỏng bằng ví MoMo</small>
            </span>

            <span className="payment-radio">
              {selectedMethod === "momo" && <i className="bi bi-check"></i>}
            </span>
          </button>

          <button
            type="button"
            className={`payment-method ${
              selectedMethod === "card" ? "active" : ""
            }`}
            onClick={() => onChangeMethod("card")}
          >
            <span className="payment-method-icon card-icon">
              <i className="bi bi-credit-card-2-front-fill"></i>
            </span>

            <span className="payment-method-info">
              <strong>Thẻ ngân hàng (Card)</strong>
              <small>Thanh toán mô phỏng bằng thẻ</small>
            </span>

            <span className="payment-radio">
              {selectedMethod === "card" && <i className="bi bi-check"></i>}
            </span>
          </button>
        </div>

        <div className="payment-preview">
          {selectedMethod === "momo" ? (
            <div className="payment-momo-preview">
              <div className="payment-momo-logo">MoMo</div>

              <div className="payment-demo-qr">
                <div className="payment-qr-pattern">
                  <span className="qr-corner top-left"></span>
                  <span className="qr-corner top-right"></span>
                  <span className="qr-corner bottom-left"></span>
                  <span className="qr-center"></span>
                </div>
              </div>

              <strong>Mã QR thanh toán mô phỏng</strong>
              <p>
                Đây là mã minh họa giao diện, chưa kết nối hệ thống thanh toán
                MoMo thật.
              </p>
            </div>
          ) : (
            <div className="payment-card-preview">
              <div className="payment-card-visual">
                <div className="payment-card-top">
                  <i className="bi bi-sim"></i>
                  <span>VIEWBOOK CARD</span>
                </div>

                <div className="payment-card-number">•••• •••• •••• 0000</div>

                <div className="payment-card-bottom">
                  <span>DEMO CARD</span>
                  <i className="bi bi-credit-card"></i>
                </div>
              </div>

              <strong>Thanh toán bằng thẻ mô phỏng</strong>
              <p>
                Không nhập thông tin thẻ thật. Chức năng này chỉ mô phỏng quy
                trình thanh toán trên giao diện.
              </p>
            </div>
          )}
        </div>

        <div className="payment-total">
          <span>Tổng tiền cần thanh toán</span>
          <strong>{formatPrice(totalPrice)}</strong>
        </div>

        <div className="payment-actions">
          <button
            type="button"
            className="payment-back-button"
            onClick={onBack}
          >
            <i className="bi bi-arrow-left"></i>
            Quay lại bắp nước
          </button>

          <button
            type="button"
            className="payment-confirm-button"
            onClick={onConfirm}
          >
            Xác nhận thanh toán
            <i className="bi bi-shield-check"></i>
          </button>
        </div>

        <p className="payment-demo-note">
          <i className="bi bi-info-circle"></i>
          Chế độ demo: thao tác xác nhận không phát sinh giao dịch hoặc trừ tiền
          thật.
        </p>
      </section>
    );
}

export default PaymentSelection;
