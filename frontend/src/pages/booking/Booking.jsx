
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";

import Navbar from "../../components/layout/Navbar.jsx";
import Footer from "../../components/layout/Footer.jsx";

import BookingProgress from "../../components/booking/BookingProgress.jsx";
import ShowtimeSummary from "../../components/booking/ShowtimeSummary.jsx";
import SeatMap from "../../components/booking/SeatMap.jsx";
import BookingSummary from "../../components/booking/BookingSummary.jsx";
import ProductSelection from "../../components/booking/ProductSelection.jsx";

import movies from "../../data/movies.js";
import { cinemas } from "../../data/cinemas.js";
import { showtimes } from "../../data/showtimes.js";
import { cinemaRooms } from "../../data/cinemaRooms.js";
import { seatTypes } from "../../data/seatTypes.js";
import { seats } from "../../data/seats.js";
import products from "../../data/products.js";
import combos from "../../data/combos.js";

import "./Booking.css";

//=================== Trang Đặt vé ========================

function Booking() {
    const { id } = useParams();

    //=================== Trạng thái đặt vé ========================

    const [activeStep, setActiveStep] = useState(1);
    const [selectedSeatIds, setSelectedSeatIds] = useState([]);
    const [selectedProductQuantities, setSelectedProductQuantities] = useState({});
    const [selectedComboQuantities, setSelectedComboQuantities] = useState({});
    const [isConfirmed, setIsConfirmed] = useState(false);

    //=================== Cuộn lên đầu trang khi chuyển bước ========================

    useLayoutEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }, [id, activeStep]);

    //=================== Lấy thông tin suất chiếu ========================

    const showtime = showtimes.find((item) => item.id === Number(id));

    //=================== Lấy thông tin phim ========================

    const movie = showtime
        ? movies.find((item) => item.id === showtime.movieId)
        : null;

    //=================== Lấy thông tin rạp ========================

    const cinema = showtime
        ? cinemas.find((item) => item.id === showtime.cinemaId)
        : null;

    //=================== Lấy thông tin phòng chiếu ========================

    const room = showtime
        ? cinemaRooms.find(
            (item) =>
                item.cinemaId === showtime.cinemaId &&
                item.roomName === showtime.roomName
        )
        : null;

    //=================== Lấy danh sách ghế của phòng ========================

    const roomSeats = useMemo(() => {
        if (!room) return [];

        return seats
            .filter(
                (seat) =>
                    seat.roomId === room.roomId &&
                    seat.status === "Active"
            )
            .sort((a, b) => {
                if (a.seatRow !== b.seatRow) {
                    return a.seatRow.localeCompare(b.seatRow);
                }

                return a.seatNumber - b.seatNumber;
            });
    }, [room]);

    //=================== Tạo trạng thái ghế mẫu ========================
    // Dữ liệu này chỉ mô phỏng ghế đã đặt theo từng suất chiếu.
    // Khi kết nối Backend sẽ thay bằng dữ liệu ShowtimeSeat.

    const unavailableSeatIds = useMemo(() => {
        if (!showtime) return [];

        return roomSeats
            .filter((seat) => (seat.seatId * 7 + showtime.id * 11) % 23 === 0)
            .map((seat) => seat.seatId);
    }, [roomSeats, showtime]);

    //=================== Reset dữ liệu khi đổi suất chiếu ========================

    useEffect(() => {
        setActiveStep(1);
        setSelectedSeatIds([]);
        setSelectedProductQuantities({});
        setSelectedComboQuantities({});
        setIsConfirmed(false);
    }, [id]);

    //=================== Chọn hoặc bỏ chọn ghế ========================

    const handleToggleSeat = (seat) => {
        setSelectedSeatIds((current) => {
            if (current.includes(seat.seatId)) {
                return current.filter((seatId) => seatId !== seat.seatId);
            }

            return [...current, seat.seatId];
        });
    };

    //=================== Lấy thông tin ghế đã chọn ========================

    const selectedSeats = roomSeats.filter((seat) =>
        selectedSeatIds.includes(seat.seatId)
    );

    //=================== Thay đổi số lượng sản phẩm ========================

    const handleChangeProductQuantity = (productId, change) => {
        setSelectedProductQuantities((current) => {
            const nextQuantity = Math.max(
                0,
                (current[productId] || 0) + change
            );

            return {
                ...current,
                [productId]: nextQuantity
            };
        });

        setIsConfirmed(false);
    };

    //=================== Thay đổi số lượng combo ========================

    const handleChangeComboQuantity = (comboId, change) => {
        setSelectedComboQuantities((current) => {
            const nextQuantity = Math.max(
                0,
                (current[comboId] || 0) + change
            );

            return {
                ...current,
                [comboId]: nextQuantity
            };
        });

        setIsConfirmed(false);
    };

    //=================== Lấy sản phẩm đã chọn ========================

    const selectedProducts = products
        .filter((product) => selectedProductQuantities[product.productId] > 0)
        .map((product) => ({
            ...product,
            quantity: selectedProductQuantities[product.productId]
        }));

    //=================== Lấy combo đã chọn ========================

    const selectedCombos = combos
        .filter((combo) => selectedComboQuantities[combo.comboId] > 0)
        .map((combo) => ({
            ...combo,
            quantity: selectedComboQuantities[combo.comboId]
        }));

    //=================== Chuyển sang bước chọn bắp nước ========================

    const handleConfirmSeats = () => {
        if (selectedSeats.length === 0) return;

        setActiveStep(2);
        setIsConfirmed(false);
    };

    //=================== Quay lại bước chọn ghế ========================

    const handleBackToSeats = () => {
        setActiveStep(1);
        setIsConfirmed(false);
    };

    //=================== Xác nhận bắp nước ========================

    const handleConfirmProducts = () => {
        setIsConfirmed(true);
    };

    //=================== Kiểm tra dữ liệu ========================

    if (!showtime || !movie || !cinema || !room) {
        return (
            <>
                <Navbar />

                <main className="booking-error">
                    <div className="container">
                        <i className="bi bi-exclamation-circle"></i>

                        <h2>Không tìm thấy thông tin đặt vé</h2>

                        <p>
                            Suất chiếu không tồn tại hoặc thông tin phòng chiếu
                            chưa được cấu hình.
                        </p>

                        <Link to="/showtimes">Quay lại lịch chiếu</Link>
                    </div>
                </main>

                <Footer />
            </>
        );
    }

    //=================== Giao diện trang Đặt vé ========================

    return (
        <>
            <Navbar />

            <main className="booking-page">
                <section className="booking-hero">
                    <div className="container">
                        <span>VIEWBOOKCINEMAS</span>
                        <h1>ĐẶT VÉ XEM PHIM</h1>
                        <p>
                            Chọn vị trí ghế ngồi yêu thích và tận hưởng trải
                            nghiệm điện ảnh của bạn.
                        </p>
                    </div>
                </section>

                <div className="container booking-content">
                    {/*=================== Các bước đặt vé ========================*/}

                    <BookingProgress activeStep={activeStep} />

                    {/*=================== Thông tin suất chiếu ========================*/}

                    <ShowtimeSummary
                        movie={movie}
                        cinema={cinema}
                        showtime={showtime}
                        room={room}
                    />

                    {/*=================== Khu vực đặt vé ========================*/}

                    <div className="booking-layout">
                        <div className="booking-main-area">
                            {activeStep === 1 ? (
                                <div className="booking-seat-area">
                                    <SeatMap
                                        seats={roomSeats}
                                        seatTypes={seatTypes}
                                        selectedSeatIds={selectedSeatIds}
                                        unavailableSeatIds={unavailableSeatIds}
                                        onToggleSeat={handleToggleSeat}
                                    />
                                </div>
                            ) : (
                                <div className="booking-product-area">
                                    <button
                                        type="button"
                                        className="booking-back-button booking-mobile-back"
                                        onClick={handleBackToSeats}
                                    >
                                        <i className="bi bi-arrow-left"></i>
                                        Quay lại chọn ghế
                                    </button>

                                    <ProductSelection
                                        selectedProductQuantities={selectedProductQuantities}
                                        selectedComboQuantities={selectedComboQuantities}
                                        onChangeProductQuantity={handleChangeProductQuantity}
                                        onChangeComboQuantity={handleChangeComboQuantity}
                                    />
                                </div>
                            )}
                        </div>

                        {/*=================== Tổng kết đặt vé ========================*/}

                        <div className="booking-summary-area">
                            <BookingSummary
                                selectedSeats={selectedSeats}
                                seatTypes={seatTypes}
                                basePrice={showtime.basePrice}
                                selectedProducts={selectedProducts}
                                selectedCombos={selectedCombos}
                                activeStep={activeStep}
                                onConfirm={
                                    activeStep === 1
                                        ? handleConfirmSeats
                                        : handleConfirmProducts
                                }
                                onBack={handleBackToSeats}
                            />

                            {isConfirmed && activeStep === 2 && (
                                <div className="booking-confirmed">
                                    <i className="bi bi-check-circle-fill"></i>

                                    <div>
                                        <strong>Đã xác nhận bắp nước</strong>
                                        <p>
                                            Lựa chọn của bạn đã được ghi nhận
                                            trong phiên đặt vé này. Chức năng
                                            thanh toán sẽ được triển khai ở bước
                                            tiếp theo.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}

export default Booking;
