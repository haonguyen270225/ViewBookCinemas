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
} from "lucide-react";
import { useState } from "react";
import TicketQrModal from "./TicketQrModal";
import "./TicketCard.css";
import { useNavigate } from "react-router-dom";
//========================= Ticket Card ========================

function TicketCard({ ticket }) {
  const navigate = useNavigate();
  //========================= QR Modal State ========================

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const handleReviewMovie = () => {
    if (ticket.status !== "used" || !ticket.movieId) {
      return;
    }

    navigate(`/movies/${ticket.movieId}#reviews`);
  };

  const statusConfig = {
    valid: {
      label: "Còn hiệu lực",
      className: "valid",
      icon: <CheckCircle2 size={16} />,
    },
    used: {
      label: "Đã sử dụng",
      className: "used",
      icon: <CheckCircle2 size={16} />,
    },
    expired: {
      label: "Đã hết hạn",
      className: "expired",
      icon: <CircleX size={16} />,
    },
  };

  const status = statusConfig[ticket.status] || statusConfig.expired;

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  return (
    <article
      className={`ticket-card ticket-${status.className} ${
        ticket.status === "used" ? "ticket-clickable" : ""
      }`}
      onClick={ticket.status === "used" ? handleReviewMovie : undefined}
      role={ticket.status === "used" ? "link" : undefined}
      tabIndex={ticket.status === "used" ? 0 : undefined}
      onKeyDown={(event) => {
        if (
          ticket.status === "used" &&
          (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault();
          handleReviewMovie();
        }
      }}
    >
      {/*========================= Movie Information ========================*/}
      <div className="ticket-main">
        <div className="ticket-movie-poster">
          {ticket.posterUrl ? (
            <img src={ticket.posterUrl} alt={ticket.movieTitle} />
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
              <span className="ticket-label">PHIM</span>
              <h3>{ticket.movieTitle}</h3>
              <p className="ticket-movie-meta">
                {ticket.genre} · {ticket.duration} phút
              </p>
            </div>

            <span className={`ticket-status ${status.className}`}>
              {status.icon}
              {status.label}
            </span>
          </div>

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
                  {ticket.cinema} · {ticket.room}
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

          <div className="ticket-price-row">
            <span>Giá vé</span>
            <strong>{formatCurrency(ticket.price)}</strong>
          </div>
          {ticket.status === "used" && (
            <div className="ticket-review-hint">
              <span>★</span>
              Nhấn để đánh giá phim
            </div>
          )}
        </div>
      </div>

      {/*========================= Ticket QR ========================*/}
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
                value={ticket.qrCode || ticket.ticketCode}
                size={116}
                level="M"
                includeMargin
              />
            </button>
            <span className="ticket-qr-caption">Quét mã tại rạp</span>
          </>
        ) : (
          <div className={`ticket-qr-disabled ${status.className}`}>
            {ticket.status === "used" ? (
              <CheckCircle2 size={34} />
            ) : (
              <ClockAlert size={34} />
            )}

            <strong>
              {ticket.status === "used" ? "Vé đã dùng" : "Vé hết hạn"}
            </strong>

            <span>QR không còn hiệu lực</span>
          </div>
        )}
      </div>

      {/*========================= Ticket Footer ========================*/}
      <div className="ticket-footer">
        <div className="ticket-code-group">
          <span>Mã vé</span>
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

        {ticket.status === "used" && ticket.checkedInAt && (
          <div className="ticket-code-group ticket-extra-status">
            <span>Thời gian sử dụng</span>
            <strong>{ticket.checkedInAt}</strong>
          </div>
        )}

        {ticket.status === "expired" && (
          <div className="ticket-code-group ticket-extra-status">
            <span>Trạng thái</span>
            <strong>Suất chiếu đã kết thúc</strong>
          </div>
        )}
      </div>
      {/*========================= QR Code Modal ========================*/}

      <TicketQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        qrValue={ticket.qrCode || ticket.ticketCode}
        ticketCode={ticket.ticketCode}
      />
    </article>
  );
}

export default TicketCard;