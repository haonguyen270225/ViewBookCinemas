
import { ChevronLeft, ChevronRight } from "lucide-react";

import "./TicketPagination.css";

//========================= Ticket Pagination ========================

function TicketPagination({
    currentPage,
    totalPages,
    onPageChange
}) {

    if (totalPages <= 1) return null;

    return (
        <div className="ticket-pagination">

            <button
                type="button"
                className="ticket-pagination-btn"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                aria-label="Trang trước"
            >
                <ChevronLeft size={17} />
            </button>

            <span className="ticket-pagination-info">
                Trang <strong>{currentPage}</strong> / {totalPages}
            </span>

            <button
                type="button"
                className="ticket-pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                aria-label="Trang tiếp theo"
            >
                <ChevronRight size={17} />
            </button>

        </div>
    );
}

export default TicketPagination;
