
function BookingSummary({
    selectedSeats,
    seatTypes,
    basePrice,
    selectedProducts = [],
    selectedCombos = [],
    activeStep = 1,
    onConfirm,
    onBack
}) {
    //=================== Định dạng giá tiền ========================

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN").format(price) + "đ";
    };

    //=================== Tính giá vé ========================

    const getSeatPrice = (seat) => {
        const seatType = seatTypes.find(
            (type) => type.seatTypeId === seat.seatTypeId
        );

        return basePrice + (seatType?.additionalPrice || 0);
    };

    const seatTotal = selectedSeats.reduce(
        (total, seat) => total + getSeatPrice(seat),
        0
    );

    //=================== Tính giá sản phẩm ========================

    const productTotal = selectedProducts.reduce(
        (total, product) => total + product.price * product.quantity,
        0
    );

    //=================== Tính giá combo ========================

    const comboTotal = selectedCombos.reduce(
        (total, combo) => total + combo.price * combo.quantity,
        0
    );

    //=================== Tổng thanh toán ========================

    const totalPrice = seatTotal + productTotal + comboTotal;

    return (
        <aside className="booking-summary">
            <h3>Thông tin đặt vé</h3>

            {/*=================== Thông tin ghế ========================*/}

            <div className="booking-summary-seats">
                <span>Ghế đã chọn</span>

                <strong>
                    {selectedSeats.length > 0
                        ? selectedSeats.map((seat) => seat.seatCode).join(", ")
                        : "Chưa chọn ghế"}
                </strong>
            </div>

            <div className="booking-summary-list">
                {selectedSeats.map((seat) => {
                    const seatType = seatTypes.find(
                        (type) => type.seatTypeId === seat.seatTypeId
                    );

                    return (
                        <div className="booking-summary-item" key={seat.seatId}>
                            <div>
                                <strong>{seat.seatCode}</strong>
                                <small>{seatType?.seatTypeName}</small>
                            </div>

                            <span>{formatPrice(getSeatPrice(seat))}</span>
                        </div>
                    );
                })}
            </div>

            {/*=================== Thông tin sản phẩm ========================*/}

            {selectedProducts.length > 0 && (
                <div className="booking-summary-extra">
                    <strong className="booking-summary-section-title">
                        Bắp nước
                    </strong>

                    {selectedProducts.map((product) => (
                        <div
                            className="booking-summary-item"
                            key={product.productId}
                        >
                            <div>
                                <strong>{product.productName}</strong>
                                <small>Số lượng: {product.quantity}</small>
                            </div>

                            <span>
                                {formatPrice(product.price * product.quantity)}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/*=================== Thông tin combo ========================*/}

            {selectedCombos.length > 0 && (
                <div className="booking-summary-extra">
                    <strong className="booking-summary-section-title">
                        Combo ưu đãi
                    </strong>

                    {selectedCombos.map((combo) => (
                        <div
                            className="booking-summary-item"
                            key={combo.comboId}
                        >
                            <div>
                                <strong>{combo.comboName}</strong>
                                <small>Số lượng: {combo.quantity}</small>
                            </div>

                            <span>
                                {formatPrice(combo.price * combo.quantity)}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/*=================== Tổng tiền ========================*/}

            <div className="booking-summary-breakdown">
                <div>
                    <span>Tiền vé</span>
                    <strong>{formatPrice(seatTotal)}</strong>
                </div>

                <div>
                    <span>Bắp nước</span>
                    <strong>{formatPrice(productTotal + comboTotal)}</strong>
                </div>
            </div>

            <div className="booking-summary-total">
                <span>Tổng thanh toán</span>
                <strong>{formatPrice(totalPrice)}</strong>
            </div>

            {/*=================== Nút thao tác ========================*/}

            {activeStep === 2 && (
                <button
                    type="button"
                    className="booking-back-button"
                    onClick={onBack}
                >
                    <i className="bi bi-arrow-left"></i>
                    Quay lại chọn ghế
                </button>
            )}

            <button
                type="button"
                className="booking-confirm-button"
                disabled={activeStep === 1 && selectedSeats.length === 0}
                onClick={onConfirm}
            >
                {activeStep === 1
                    ? "Tiếp tục chọn bắp nước"
                    : "Xác nhận bắp nước"}

                <i className="bi bi-arrow-right"></i>
            </button>

            <p className="booking-summary-note">
                Giá vé được tính theo giá suất chiếu và phụ thu của từng loại ghế.
                Sản phẩm và combo được tính theo số lượng đã chọn.
            </p>
        </aside>
    );
}

export default BookingSummary;
