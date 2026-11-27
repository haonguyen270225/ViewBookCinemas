
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";

import Navbar from "../../components/layout/Navbar.jsx";
import Footer from "../../components/layout/Footer.jsx";

import BookingProgress from "../../components/booking/BookingProgress.jsx";
import ShowtimeSummary from "../../components/booking/ShowtimeSummary.jsx";
import SeatMap from "../../components/booking/SeatMap.jsx";
import BookingSummary from "../../components/booking/BookingSummary.jsx";
import ProductSelection from "../../components/booking/ProductSelection.jsx";
import PaymentSelection from "../../components/booking/PaymentSelection.jsx";

import { seatTypes } from "../../data/seatTypes.js";

import { getShowtimeById } from "../../services/showtimeService.js";
import { getMovieById } from "../../services/movieService.js";
import { getCinemaById } from "../../services/cinemaService.js";
import { getRoomById } from "../../services/roomService.js";
import { getSeatsByRoomId } from "../../services/seatService.js";
import { getActiveCombos } from "../../services/comboService.js";
import { getActiveProducts } from "../../services/productService.js";

import {
    createBooking,
    getBookedSeatIdsByShowtimeId
} from "../../services/bookingService.js";

import "./Booking.css";

//=================== Trang Đặt vé ========================

function Booking() {
    const { id } = useParams();

    //=================== Trạng thái đặt vé ========================

    const [activeStep, setActiveStep] = useState(1);

    const [selectedSeatIds, setSelectedSeatIds] = useState([]);

    const [selectedProductQuantities, setSelectedProductQuantities] =
        useState({});

    const [selectedComboQuantities, setSelectedComboQuantities] =
        useState({});

    //=================== Trạng thái thanh toán ========================

    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("momo");

    const [paymentResult, setPaymentResult] = useState(null);

    const [savedBooking, setSavedBooking] = useState(null);

    const [isPaymentCompleted, setIsPaymentCompleted] = useState(false);

    const [isSavingBooking, setIsSavingBooking] = useState(false);

    const [bookingSaveError, setBookingSaveError] = useState("");

    //=================== Dữ liệu đặt vé ========================

    const [bookingData, setBookingData] = useState(null);

    const [activeProducts, setActiveProducts] = useState([]);

    const [activeCombos, setActiveCombos] = useState([]);

    const [roomSeats, setRoomSeats] = useState([]);

    const [bookedSeatIds, setBookedSeatIds] = useState([]);

    const [isLoading, setIsLoading] = useState(true);

    const [bookingError, setBookingError] = useState("");

    const showtime = bookingData?.showtime ?? null;
    const movie = bookingData?.movie ?? null;
    const cinema = bookingData?.cinema ?? null;
    const room = bookingData?.room ?? null;

    //=================== Cuộn lên đầu trang khi chuyển bước ========================

    useLayoutEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }, [id, activeStep]);

    //=================== Tải dữ liệu đặt vé từ Services ========================

    useEffect(() => {
        let isMounted = true;

        const loadBookingData = async () => {
            setIsLoading(true);
            setBookingError("");

            setBookingData(null);
            setActiveProducts([]);
            setActiveCombos([]);
            setRoomSeats([]);
            setBookedSeatIds([]);

            try {
                // 1. Lấy thông tin suất chiếu

                const selectedShowtime = await getShowtimeById(id);

                if (!selectedShowtime) {
                    throw new Error("Không tìm thấy suất chiếu.");
                }

                if (selectedShowtime.status !== "Scheduled") {
                    throw new Error(
                        "Suất chiếu này hiện không khả dụng để đặt vé."
                    );
                }

                // 2. Lấy thông tin phim, rạp và phòng

                const [
                    selectedMovie,
                    selectedCinema,
                    selectedRoom
                ] = await Promise.all([
                    getMovieById(selectedShowtime.movieId),
                    getCinemaById(selectedShowtime.cinemaId),
                    getRoomById(selectedShowtime.roomId)
                ]);

                if (!selectedMovie) {
                    throw new Error("Không tìm thấy thông tin phim.");
                }

                if (
                    !selectedCinema ||
                    selectedCinema.status !== "Active"
                ) {
                    throw new Error(
                        "Rạp chiếu không tồn tại hoặc đang ngừng hoạt động."
                    );
                }

                if (!selectedRoom) {
                    throw new Error("Không tìm thấy phòng chiếu.");
                }

                if (
                    String(selectedRoom.cinemaId) !==
                    String(selectedShowtime.cinemaId)
                ) {
                    throw new Error(
                        "Phòng chiếu không thuộc rạp của suất chiếu."
                    );
                }

                if (selectedRoom.status !== "Active") {
                    throw new Error(
                        "Phòng chiếu hiện không hoạt động."
                    );
                }

                // 3. Tải ghế, ghế đã đặt, Combo và sản phẩm đang kinh doanh

                const [
                    seatsData,
                    bookedIds,
                    availableCombos,
                    availableProducts
                ] = await Promise.all([
                    getSeatsByRoomId(selectedShowtime.roomId),
                    getBookedSeatIdsByShowtimeId(selectedShowtime.id),
                    getActiveCombos(),
                    getActiveProducts()
                ]);

                if (!isMounted) return;

                // 4. Chỉ lấy ghế đang hoạt động

                const activeSeats = seatsData
                    .filter((seat) => seat.status === "Active")
                    .sort((a, b) => {
                        if (a.seatRow !== b.seatRow) {
                            return a.seatRow.localeCompare(b.seatRow);
                        }

                        return a.seatNumber - b.seatNumber;
                    });

                // 5. Lưu dữ liệu đặt vé

                setBookingData({
                    showtime: selectedShowtime,
                    movie: selectedMovie,
                    cinema: selectedCinema,
                    room: selectedRoom
                });

                setRoomSeats(activeSeats);

                setBookedSeatIds(
                    Array.isArray(bookedIds) ? bookedIds : []
                );

                setActiveCombos(
                    Array.isArray(availableCombos)
                        ? availableCombos
                        : []
                );

                setActiveProducts(
                    Array.isArray(availableProducts)
                        ? availableProducts
                        : []
                );
            } catch (error) {
                console.error(
                    "Không thể tải dữ liệu đặt vé:",
                    error
                );

                if (isMounted) {
                    setBookingError(
                        error.message ||
                        "Không thể tải thông tin đặt vé. Vui lòng thử lại."
                    );
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadBookingData();

        return () => {
            isMounted = false;
        };
    }, [id]);

    //=================== Reset dữ liệu khi đổi suất chiếu ========================

    useEffect(() => {
        setActiveStep(1);

        setSelectedSeatIds([]);
        setSelectedProductQuantities({});
        setSelectedComboQuantities({});

        setSelectedPaymentMethod("momo");

        setPaymentResult(null);
        setSavedBooking(null);

        setIsPaymentCompleted(false);
        setIsSavingBooking(false);

        setBookingSaveError("");
    }, [id]);

    //=================== Lấy danh sách ghế không khả dụng ========================

    const unavailableSeatIds = useMemo(() => {
        return bookedSeatIds;
    }, [bookedSeatIds]);

    //=================== Chọn hoặc bỏ chọn ghế ========================

    const handleToggleSeat = (seat) => {
        if (
            !seat ||
            seat.status !== "Active" ||
            unavailableSeatIds.some(
                (seatId) => String(seatId) === String(seat.seatId)
            )
        ) {
            return;
        }

        setSelectedSeatIds((current) => {
            const isSelected = current.some(
                (seatId) => String(seatId) === String(seat.seatId)
            );

            if (isSelected) {
                return current.filter(
                    (seatId) => String(seatId) !== String(seat.seatId)
                );
            }

            return [...current, seat.seatId];
        });
    };

    //=================== Lấy thông tin ghế đã chọn ========================

    const selectedSeats = useMemo(() => {
        return roomSeats.filter((seat) =>
            selectedSeatIds.some(
                (seatId) => String(seatId) === String(seat.seatId)
            )
        );
    }, [roomSeats, selectedSeatIds]);

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

        setBookingSaveError("");
    };

    //=================== Thay đổi số lượng Combo ========================

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

        setBookingSaveError("");
    };

    //=================== Lấy sản phẩm đã chọn ========================

    const selectedProducts = useMemo(() => {
        return activeProducts
            .filter(
                (product) =>
                    selectedProductQuantities[product.productId] > 0
            )
            .map((product) => ({
                ...product,
                quantity: selectedProductQuantities[product.productId]
            }));
    }, [activeProducts, selectedProductQuantities]);

    //=================== Lấy Combo đã chọn ========================

    const selectedCombos = useMemo(() => {
        return activeCombos
            .filter(
                (combo) =>
                    selectedComboQuantities[combo.comboId] > 0
            )
            .map((combo) => ({
                ...combo,
                quantity: selectedComboQuantities[combo.comboId]
            }));
    }, [activeCombos, selectedComboQuantities]);

    //=================== Tính giá ghế ========================

    const getSeatPrice = (seat) => {
        const seatType = seatTypes.find(
            (type) =>
                Number(type.seatTypeId) === Number(seat.seatTypeId)
        );

        return (
            (showtime?.basePrice || 0) +
            (seatType?.additionalPrice || 0)
        );
    };

    //=================== Tính tổng tiền ========================

    const seatTotal = selectedSeats.reduce(
        (total, seat) => total + getSeatPrice(seat),
        0
    );

    const productTotal = selectedProducts.reduce(
        (total, product) =>
            total + product.price * product.quantity,
        0
    );

    const comboTotal = selectedCombos.reduce(
        (total, combo) =>
            total + combo.price * combo.quantity,
        0
    );

    const totalPrice = seatTotal + productTotal + comboTotal;

    //=================== Chuyển sang bước chọn bắp nước ========================

    const handleConfirmSeats = () => {
        if (selectedSeats.length === 0) {
            return;
        }

        setBookingSaveError("");
        setActiveStep(2);
    };

    //=================== Quay lại bước chọn ghế ========================

    const handleBackToSeats = () => {
        setActiveStep(1);
        setBookingSaveError("");
    };

    //=================== Chuyển sang bước thanh toán ========================

    const handleConfirmProducts = () => {
        if (selectedSeats.length === 0) {
            setActiveStep(1);
            return;
        }

        setBookingSaveError("");
        setActiveStep(3);
    };

    //=================== Quay lại bước bắp nước ========================

    const handleBackToProducts = () => {
        setActiveStep(2);
        setBookingSaveError("");
    };

    //=================== Xác nhận thanh toán và tạo đơn đặt vé ========================

    const handleConfirmPayment = async (result) => {
        if (
            result?.paymentStatus !== "Success" ||
            !showtime ||
            selectedSeats.length === 0
        ) {
            return;
        }

        setIsSavingBooking(true);
        setBookingSaveError("");

        try {
            // 1. Tạo đơn đặt vé và lưu thông tin vào Booking Service

            const booking = await createBooking({
                showtimeId: showtime.id,

                seatIds: selectedSeatIds,

                selectedProductQuantities,

                selectedComboQuantities,

                paymentResult: result
            });

            if (!booking) {
                throw new Error(
                    "Không nhận được thông tin đơn đặt vé sau khi lưu."
                );
            }

            // 2. Cập nhật giao diện sau khi lưu thành công

            setSavedBooking(booking);

            setPaymentResult(result);

            setIsPaymentCompleted(true);

            setActiveStep(4);

            // 3. Cập nhật ghế đã đặt trong trạng thái hiện tại

            const updatedBookedSeatIds =
                await getBookedSeatIdsByShowtimeId(showtime.id);

            setBookedSeatIds(
                Array.isArray(updatedBookedSeatIds)
                    ? updatedBookedSeatIds
                    : []
            );
        } catch (error) {
            console.error(
                "Không thể tạo đơn đặt vé:",
                error
            );

            setBookingSaveError(
                error.message ||
                "Không thể lưu đơn đặt vé. Vui lòng thử lại."
            );
        } finally {
            setIsSavingBooking(false);
        }
    };

    //=================== Trạng thái tải dữ liệu ========================

    if (isLoading) {
        return (
            <>
                <Navbar />

                <main className="booking-error">
                    <div className="container">
                        <i className="bi bi-hourglass-split"></i>

                        <h2>Đang tải thông tin đặt vé...</h2>

                        <p>Vui lòng chờ trong giây lát.</p>
                    </div>
                </main>

                <Footer />
            </>
        );
    }

    //=================== Xử lý lỗi dữ liệu đặt vé ========================

    if (bookingError || !showtime || !movie || !cinema || !room) {
        return (
            <>
                <Navbar />

                <main className="booking-error">
                    <div className="container">
                        <i className="bi bi-exclamation-circle"></i>

                        <h2>Không thể tiếp tục đặt vé</h2>

                        <p>
                            {bookingError ||
                                "Thông tin suất chiếu không tồn tại hoặc chưa được cấu hình."}
                        </p>

                        <Link to="/showtimes">
                            Quay lại lịch chiếu
                        </Link>
                    </div>
                </main>

                <Footer />
            </>
        );
    }

    //=================== Kiểm tra sơ đồ ghế ========================

    if (roomSeats.length === 0) {
        return (
            <>
                <Navbar />

                <main className="booking-error">
                    <div className="container">
                        <i className="bi bi-exclamation-circle"></i>

                        <h2>Không có ghế khả dụng</h2>

                        <p>
                            Phòng chiếu hiện chưa có ghế hoạt động.
                            Vui lòng liên hệ quản trị viên.
                        </p>

                        <Link to="/showtimes">
                            Quay lại lịch chiếu
                        </Link>
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
                            Chọn vị trí ghế ngồi yêu thích và tận hưởng
                            trải nghiệm điện ảnh của bạn.
                        </p>
                    </div>
                </section>

                <div className="container booking-content">
                    <BookingProgress activeStep={activeStep} />

                    <ShowtimeSummary
                        movie={movie}
                        cinema={cinema}
                        showtime={showtime}
                        room={room}
                    />

                    <div
                        className={`booking-layout ${
                            activeStep >= 3
                                ? "booking-layout-full"
                                : ""
                        }`}
                    >
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
                            ) : activeStep === 2 ? (
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
                                        selectedProductQuantities={
                                            selectedProductQuantities
                                        }
                                        selectedComboQuantities={
                                            selectedComboQuantities
                                        }
                                        onChangeProductQuantity={
                                            handleChangeProductQuantity
                                        }
                                        onChangeComboQuantity={
                                            handleChangeComboQuantity
                                        }
                                        products={activeProducts}
                                        combos={activeCombos}
                                    />
                                </div>
                            ) : activeStep === 3 ? (
                                <>
                                    {bookingSaveError && (
                                        <div
                                            className="alert alert-danger"
                                            role="alert"
                                        >
                                            <i className="bi bi-exclamation-circle me-2"></i>
                                            {bookingSaveError}
                                        </div>
                                    )}

                                    {isSavingBooking && (
                                        <div
                                            className="alert alert-info"
                                            role="status"
                                        >
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                aria-hidden="true"
                                            ></span>

                                            Đang lưu đơn đặt vé. Vui lòng chờ...
                                        </div>
                                    )}

                                    <PaymentSelection
                                        totalPrice={totalPrice}
                                        selectedMethod={selectedPaymentMethod}
                                        onChangeMethod={setSelectedPaymentMethod}
                                        onBack={handleBackToProducts}
                                        onConfirm={handleConfirmPayment}
                                    />
                                </>
                            ) : (
                                <div className="booking-payment-success">
                                    <i className="bi bi-check-circle-fill"></i>

                                    <h2>Đặt vé thành công!</h2>

                                    <p>
                                        Bạn đã hoàn tất quy trình thanh toán
                                        mô phỏng. Thông tin đặt vé đã được lưu.
                                    </p>

                                    {savedBooking && (
                                        <>
                                            <p>
                                                Mã đặt vé:{" "}
                                                <strong>
                                                    {savedBooking.bookingCode}
                                                </strong>
                                            </p>

                                            <p>
                                                Phương thức thanh toán:{" "}
                                                <strong>
                                                    {savedBooking.paymentMethod === "MoMo"
                                                        ? "Ví điện tử MoMo"
                                                        : "Thẻ ngân hàng (Card)"}
                                                </strong>
                                            </p>

                                            <h3>
                                                {new Intl.NumberFormat("vi-VN").format(
                                                    savedBooking.totalPrice
                                                )}
                                                đ
                                            </h3>
                                        </>
                                    )}

                                    <Link
                                        to="/showtimes"
                                        className="booking-success-link"
                                    >
                                        Quay lại lịch chiếu
                                    </Link>
                                </div>
                            )}
                        </div>

                        {activeStep <= 2 && (
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
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}

export default Booking;
