import { QRCodeSVG } from "qrcode.react";

import {
    CalendarDays,
    Clock3,
    MapPin,
    Armchair,
    Ticket,
    CheckCircle2,
    CircleX,
    ClockAlert,
    Ban,
    CreditCard
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import TicketQrModal from "./TicketQrModal";

import "./TicketCard.css";

//====================================================
// Ticket Card
//====================================================

function TicketCard({ ticket }) {
    const navigate = useNavigate();

    const [isQrModalOpen, setIsQrModalOpen] = useState(false);

    //====================================================
    // Điều hướng đánh giá phim
    //====================================================

    const handleReviewMovie = () => {
        if (
            ticket.status !== "used" ||
            !ticket.movieId
        ) {
            return;
        }

        navigate(`/movies/${ticket.movieId}#reviews`);
    };

    //====================================================
    // Trạng thái vé
    //====================================================

    const statusConfig = {
        valid: {
            label: "Còn hiệu lực",
            className: "valid",
            icon: <CheckCircle2 size={16} />
        },

        used: {
            label: "Đã sử dụng",
            className: "used",
            icon: <CheckCircle2 size={16} />
        },

        expired: {
            label: "Đã hết hạn",
            className: "expired",
            icon: <ClockAlert size={16} />
        },

        cancelled: {
            label: "Đã hủy",
            className: "cancelled",
            icon: <Ban size={16} />
        }
    };

    const status =
        statusConfig[ticket.status] ||
        statusConfig.expired;

    //====================================================
    // Định dạng tiền tệ
    //====================================================

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND"
        }).format(Number(value) || 0);
    };

    const originalPrice = Number(
        ticket.originalPrice ??
        ticket.price ??
        0
    );

    const discountAmount = Number(
        ticket.discountAmount || 0
    );

    const paidAmount = Number(
        ticket.paidAmount ??
        originalPrice - discountAmount
    );

    //====================================================
    // Render
    //====================================================

    return (
        <article
            className={`ticket-card ticket-${status.className} ${
                ticket.status === "used"
                    ? "ticket-clickable"
                    : ""
            }`}
            onClick={
                ticket.status === "used"
                    ? handleReviewMovie
                    : undefined
            }
            role={
                ticket.status === "used"
                    ? "link"
                    : undefined
            }
            tabIndex={
                ticket.status === "used"
                    ? 0
                    : undefined
            }
            onKeyDown={(event) => {
                if (
                    ticket.status === "used" &&
                    (
                        event.key === "Enter" ||
                        event.key === " "
                    )
                ) {
                    event.preventDefault();
                    handleReviewMovie();
                }
            }}
        >

            {/* Movie Information */}

            <div className="ticket-main">

                <div className="ticket-movie-poster">

                    {ticket.posterUrl ? (

                        <img
                            src={ticket.posterUrl}
                            alt={ticket.movieTitle}
                        />

                    ) : (

                        <div className="ticket-poster-placeholder">
                            <Ticket size={34} />
                            <span>VBC CINEMA</span>
                        </div>

                    )}

                </div>

                <div className="ticket-movie-info">

                    <div className="ticket-heading">

                        <div>
                            <span className="ticket-label">
                                PHIM
                            </span>

                            <h3>{ticket.movieTitle}</h3>

                            <p className="ticket-movie-meta">
                                {ticket.genre}
                                {ticket.duration > 0
                                    ? ` · ${ticket.duration} phút`
                                    : ""}
                            </p>
                        </div>

                        <span
                            className={`ticket-status ${status.className}`}
                        >
                            {status.icon}
                            {status.label}
                        </span>

                    </div>

                    {/* Ticket Details */}

                    <div className="ticket-details-grid">

                        <div className="ticket-detail">
                            <CalendarDays size={17} />

                            <div>
                                <span>Ngày chiếu</span>
                                <strong>{ticket.showDate}</strong>
                            </div>
                        </div>

                        <div className="ticket-detail">
                            <Clock3 size={17} />

                            <div>
                                <span>Suất chiếu</span>
                                <strong>{ticket.showTime}</strong>
                            </div>
                        </div>

                        <div className="ticket-detail">
                            <MapPin size={17} />

                            <div>
                                <span>Rạp / Phòng</span>

                                <strong>
                                    {ticket.cinema}
                                    {" · "}
                                    {ticket.room}
                                </strong>
                            </div>
                        </div>

                        <div className="ticket-detail">
                            <Armchair size={17} />

                            <div>
                                <span>Ghế</span>
                                <strong>{ticket.seat}</strong>
                            </div>
                        </div>

                    </div>

                    {/* Payment Summary */}

                    <div className="ticket-price-row">

                        <span>Số tiền thực trả</span>

                        <strong>
                            {formatCurrency(paidAmount)}
                        </strong>

                    </div>

                    {/* Payment Breakdown */}

                    <div className="ticket-payment-breakdown">

                        <div className="ticket-payment-row">
                            <span>Giá trị ban đầu</span>

                            <strong>
                                {formatCurrency(originalPrice)}
                            </strong>
                        </div>

                        <div className="ticket-payment-row">
                            <span>Mã khuyến mãi</span>

                            <strong>
                                {ticket.promotionCode || "Không sử dụng"}
                            </strong>
                        </div>

                        <div className="ticket-payment-row">
                            <span>Số tiền giảm</span>

                            <strong className="ticket-discount-value">
                                -{formatCurrency(discountAmount)}
                            </strong>
                        </div>

                        <div className="ticket-payment-row total">
                            <span>Thực thanh toán</span>

                            <strong>
                                {formatCurrency(paidAmount)}
                            </strong>
                        </div>

                        <div className="ticket-payment-method">
                            <CreditCard size={13} />

                            <span>
                                Thanh toán: {ticket.paymentMethod || "--"}
                            </span>
                        </div>

                    </div>

                    {ticket.status === "used" && (
                        <div className="ticket-review-hint">
                            <span>★</span>
                            Nhấn để đánh giá phim
                        </div>
                    )}

                </div>

            </div>

            {/* QR Section */}

            <div className="ticket-qr-section">

                {ticket.status === "valid" ? (

                    <>
                        <button
                            type="button"
                            className="ticket-qr-code ticket-qr-button"
                            onClick={(event) => {
                                event.stopPropagation();
                                setIsQrModalOpen(true);
                            }}
                            aria-label="Xem mã QR vé lớn hơn"
                        >
                            <QRCodeSVG
                                value={
                                    ticket.qrCode ||
                                    ticket.ticketCode
                                }
                                size={116}
                                level="M"
                                includeMargin
                            />
                        </button>

                        <span className="ticket-qr-caption">
                            Quét mã tại rạp
                        </span>
                    </>

                ) : (

                    <div
                        className={`ticket-qr-disabled ${status.className}`}
                    >

                        {ticket.status === "used" ? (
                            <CheckCircle2 size={34} />
                        ) : ticket.status === "cancelled" ? (
                            <Ban size={34} />
                        ) : (
                            <ClockAlert size={34} />
                        )}

                        <strong>
                            {ticket.status === "used"
                                ? "Vé đã dùng"
                                : ticket.status === "cancelled"
                                    ? "Vé đã hủy"
                                    : "Vé hết hạn"}
                        </strong>

                        <span>QR không còn hiệu lực</span>

                    </div>

                )}

            </div>

            {/* Ticket Footer */}

            <div className="ticket-footer">

                <div className="ticket-code-group">
                    <span>Mã đặt vé</span>
                    <strong>{ticket.ticketCode}</strong>
                </div>

                <div className="ticket-code-group">
                    <span>ID vé</span>
                    <strong>#{ticket.ticketId}</strong>
                </div>

                <div className="ticket-code-group">
                    <span>Ngày mua</span>
                    <strong>{ticket.purchaseDate}</strong>
                </div>

            </div>

            {/* QR Modal */}

            <TicketQrModal
                isOpen={isQrModalOpen}
                onClose={() => setIsQrModalOpen(false)}
                qrValue={
                    ticket.qrCode ||
                    ticket.ticketCode
                }
                ticketCode={ticket.ticketCode}
            />

        </article>
    );
}

export default TicketCard;