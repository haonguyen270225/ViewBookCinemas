
import { QRCodeSVG } from "qrcode.react";
import { X, Ticket } from "lucide-react";
import { createPortal } from "react-dom";

import "./TicketQrModal.css";

//========================= Ticket QR Modal ========================

function TicketQrModal({ isOpen, onClose, qrValue, ticketCode }) {
    if (!isOpen) return null;

    return createPortal(
        <div
            className="ticket-qr-modal-overlay"
            onClick={onClose}
        >
            <div
                className="ticket-qr-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="ticket-qr-modal-title"
                onClick={(event) => event.stopPropagation()}
            >
                {/*========================= Header ========================*/}

                <div className="ticket-qr-modal-header">
                    <div>
                        <span className="ticket-qr-modal-subtitle">
                            VIEWBOOKCINEMAS
                        </span>

                        <h2 id="ticket-qr-modal-title">
                            Mã QR vé xem phim
                        </h2>
                    </div>

                    <button
                        type="button"
                        className="ticket-qr-modal-close"
                        onClick={onClose}
                        aria-label="Đóng mã QR"
                    >
                        <X size={21} />
                    </button>
                </div>

                {/*========================= QR Code ========================*/}

                <div className="ticket-qr-modal-content">
                    <div className="ticket-qr-modal-icon">
                        <Ticket size={22} />
                    </div>

                    <div className="ticket-qr-modal-code">
                        <QRCodeSVG
                            value={qrValue || ticketCode || ""}
                            size={260}
                            level="M"
                            includeMargin
                        />
                    </div>

                    <span className="ticket-qr-modal-label">
                        MÃ VÉ CỦA BẠN
                    </span>

                    <strong className="ticket-qr-modal-ticket-code">
                        {ticketCode}
                    </strong>

                    <p>
                        Vui lòng xuất trình mã QR này tại quầy
                        hoặc cổng soát vé của rạp.
                    </p>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default TicketQrModal;
