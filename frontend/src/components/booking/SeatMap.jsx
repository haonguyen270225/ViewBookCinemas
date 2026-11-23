
function SeatMap({
    seats,
    seatTypes,
    selectedSeatIds,
    unavailableSeatIds,
    onToggleSeat
}) {
    const rows = [...new Set(seats.map((seat) => seat.seatRow))];

    //=================== Lấy thông tin loại ghế ========================

    const getSeatType = (seatTypeId) => {
        return seatTypes.find(
            (type) => type.seatTypeId === seatTypeId
        );
    };

    //=================== Xác định trạng thái ghế ========================

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

    //=================== Kiểm tra ghế đôi ========================

    const isCoupleSeat = (seat) => {
        return getSeatType(seat.seatTypeId)?.seatTypeName === "Ghế đôi";
    };

    //=================== Hiển thị một ghế ========================

    const renderSeat = (seat) => {
        const unavailable = unavailableSeatIds.includes(seat.seatId);

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
                aria-label={`Ghế ${seat.seatCode}`}
                aria-pressed={selectedSeatIds.includes(seat.seatId)}
            >
                {seat.seatNumber}
            </button>
        );
    };

    //=================== Gom ghế thành từng cặp ========================

    const groupSeats = (rowSeats) => {
        const groups = [];

        let index = 0;

        while (index < rowSeats.length) {
            const currentSeat = rowSeats[index];
            const nextSeat = rowSeats[index + 1];

            // Hai ghế đôi liền kề được gom thành một cặp
            if (
                isCoupleSeat(currentSeat) &&
                nextSeat &&
                isCoupleSeat(nextSeat) &&
                nextSeat.seatNumber === currentSeat.seatNumber + 1
            ) {
                groups.push({
                    type: "couple",
                    seats: [currentSeat, nextSeat]
                });

                index += 2;
            } else {
                groups.push({
                    type: "single",
                    seats: [currentSeat]
                });

                index += 1;
            }
        }

        return groups;
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

                    const seatGroups = groupSeats(rowSeats);

                    return (
                        <div className="booking-seat-row" key={row}>
                            <span className="booking-row-label">{row}</span>

                            <div className="booking-seat-list">
                                {seatGroups.map((group, index) => {
                                    if (group.type === "couple") {
                                        return (
                                            <div
                                                className="booking-couple-pair"
                                                key={`couple-${group.seats[0].seatId}`}
                                            >
                                                {group.seats.map(renderSeat)}
                                            </div>
                                        );
                                    }

                                    return (
                                        <span
                                            className="booking-single-seat"
                                            key={`seat-${group.seats[0].seatId}`}
                                        >
                                            {renderSeat(group.seats[0])}
                                        </span>
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
