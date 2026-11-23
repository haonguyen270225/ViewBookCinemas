
function BookingSummary({
    selectedSeats,
    seatTypes,
    basePrice,
    onConfirm
}) {
    const getSeatPrice = (seat) => {
        const seatType = seatTypes.find(
            (type) => type.seatTypeId === seat.seatTypeId
        );

        return basePrice + (seatType?.additionalPrice || 0);
    };

    const totalPrice = selectedSeats.reduce(
        (total, seat) => total + getSeatPrice(seat),
        0
    );

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN").format(price) + "đ";
    };

    return (
        <aside className="booking-summary">
            <h3>Thông tin đặt vé</h3>

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

            <div className="booking-summary-total">
                <span>Tổng thanh toán</span>
                <strong>{formatPrice(totalPrice)}</strong>
            </div>

            <button
                type="button"
                className="booking-confirm-button"
                disabled={selectedSeats.length === 0}
                onClick={onConfirm}
            >
                Xác nhận ghế
                <i className="bi bi-arrow-right"></i>
            </button>

            <p className="booking-summary-note">
                Giá vé được tính theo giá suất chiếu và phụ thu của từng loại ghế.
            </p>
        </aside>
    );
}

export default BookingSummary;
