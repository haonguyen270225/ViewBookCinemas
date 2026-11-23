
function SeatMap({
    seats,
    seatTypes,
    selectedSeatIds,
    unavailableSeatIds,
    onToggleSeat
}) {
    const rows = [...new Set(seats.map((seat) => seat.seatRow))];

    const getSeatType = (seatTypeId) => {
        return seatTypes.find(
            (type) => type.seatTypeId === seatTypeId
        );
    };

    const getSeatClass = (seat) => {
        if (unavailableSeatIds.includes(seat.seatId)) {
            return "unavailable";
        }

        if (selectedSeatIds.includes(seat.seatId)) {
            return "selected";
        }

        const seatType = getSeatType(seat.seatTypeId);

        if (seatType?.seatTypeName === "Ghế VIP") {
            return "vip";
        }

        if (seatType?.seatTypeName === "Ghế đôi") {
            return "couple";
        }

        return "standard";
    };

    return (
        <section className="booking-seat-section">
            <h3>Chọn vị trí ghế</h3>

            <div className="booking-screen">
                <i className="bi bi-display"></i>
                <span>MÀN HÌNH</span>
            </div>

            <div className="booking-seat-container">
                {rows.map((row) => {
                    const rowSeats = seats
                        .filter((seat) => seat.seatRow === row)
                        .sort((a, b) => a.seatNumber - b.seatNumber);

                    return (
                        <div className="booking-seat-row" key={row}>
                            <span className="booking-row-label">{row}</span>

                            <div className="booking-seat-list">
                                {rowSeats.map((seat) => {
                                    const unavailable =
                                        unavailableSeatIds.includes(seat.seatId);

                                    return (
                                        <button
                                            type="button"
                                            key={seat.seatId}
                                            className={`booking-seat ${getSeatClass(seat)}`}
                                            disabled={unavailable}
                                            onClick={() => onToggleSeat(seat)}
                                            title={`${seat.seatCode} - ${
                                                getSeatType(seat.seatTypeId)?.seatTypeName
                                            }`}
                                        >
                                            {seat.seatNumber}
                                        </button>
                                    );
                                })}
                            </div>

                            <span className="booking-row-label">{row}</span>
                        </div>
                    );
                })}
            </div>

            <div className="booking-seat-legend">
                <div>
                    <span className="legend-seat standard"></span>
                    Ghế thường
                </div>

                <div>
                    <span className="legend-seat vip"></span>
                    Ghế VIP
                </div>

                <div>
                    <span className="legend-seat couple"></span>
                    Ghế đôi
                </div>

                <div>
                    <span className="legend-seat selected"></span>
                    Đang chọn
                </div>

                <div>
                    <span className="legend-seat unavailable"></span>
                    Đã đặt
                </div>
            </div>
        </section>
    );
}

export default SeatMap;
