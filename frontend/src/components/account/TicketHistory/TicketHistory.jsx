import { useMemo, useState } from "react";
import { Ticket, Film } from "lucide-react";

import TicketCard from "./TicketCard";
import "./TicketHistory.css";
import TicketPagination from "./TicketPagination";

//========================= Temporary Ticket Data ========================//
// Dữ liệu mẫu để kiểm tra giao diện.
// Sau này sẽ thay bằng dữ liệu lấy từ Backend API.

const sampleTickets = [
  {
    ticketId: 1001,
    movieId: 1,
    ticketCode: "VBC-20261110-A001",
    qrCode: "VBC-20261110-A001",
    status: "valid",
    movieTitle: "Avengers: Secret Wars",
    genre: "Hành động, Khoa học viễn tưởng",
    duration: 150,
    showDate: "15/11/2026",
    showTime: "19:30",
    cinema: "VBC Cinema - Cần Thơ",
    room: "Phòng 03",
    seat: "G05",
    price: 95000,
    purchaseDate: "10/11/2026",
    posterUrl: "",
  },
  {
    ticketId: 1002,
    movieId: 2,
    ticketCode: "VBC-20261105-B002",
    qrCode: "VBC-20261105-B002",
    status: "used",
    movieTitle: "Doraemon: Nobita và cuộc phiêu lưu",
    genre: "Hoạt hình, Phiêu lưu",
    duration: 105,
    showDate: "07/11/2026",
    showTime: "14:00",
    cinema: "VBC Cinema - Cần Thơ",
    room: "Phòng 02",
    seat: "F06",
    price: 75000,
    purchaseDate: "05/11/2026",
    checkedInAt: "07/11/2026 - 13:42",
    posterUrl: "",
  },
  {
    ticketId: 1003,
    movieId: 3,
    ticketCode: "VBC-20261028-C003",
    qrCode: "VBC-20261028-C003",
    status: "expired",
    movieTitle: "The Conjuring: Last Rites",
    genre: "Kinh dị, Bí ẩn",
    duration: 112,
    showDate: "30/10/2026",
    showTime: "20:00",
    cinema: "VBC Cinema - Cần Thơ",
    room: "Phòng 01",
    seat: "H08",
    price: 90000,
    purchaseDate: "28/10/2026",
    posterUrl: "",
  },
];

//========================= Ticket History ========================


function TicketHistory() {

    const [activeFilter, setActiveFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    //========================= Pagination Configuration ========================

    const ITEMS_PER_PAGE = 5;

    //========================= Filters ========================

    const filters = [
        { value: "all", label: "Tất cả" },
        { value: "valid", label: "Còn hiệu lực" },
        { value: "used", label: "Đã sử dụng" },
        { value: "expired", label: "Đã hết hạn" }
    ];

    //========================= Filter Tickets ========================

    const filteredTickets = useMemo(() => {

        if (activeFilter === "all") {
            return sampleTickets;
        }

        return sampleTickets.filter(
            (ticket) => ticket.status === activeFilter
        );

    }, [activeFilter]);

    //========================= Pagination ========================

    const totalPages = Math.ceil(
        filteredTickets.length / ITEMS_PER_PAGE
    );

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    const currentTickets = filteredTickets.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
    );

    //========================= Change Filter ========================

    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
        setCurrentPage(1);
    };

    //========================= Change Page ========================

    const handlePageChange = (page) => {
        setCurrentPage(page);

        document.querySelector(".ticket-history-section")
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
    };

    //========================= Render ========================

    return (
        <section className="ticket-history-section">

            {/*========================= Header ========================*/}

            <div className="ticket-history-header">

                <div className="ticket-history-title">

                    <div className="ticket-history-icon">
                        <Ticket size={22} />
                    </div>

                    <div>
                        <h2>Lịch sử đặt vé</h2>

                        <p>
                            Quản lý và xem lại các vé xem phim của bạn.
                        </p>
                    </div>

                </div>

                <span className="ticket-total">
                    {filteredTickets.length} vé
                </span>

            </div>

            {/*========================= Filters ========================*/}

            <div className="ticket-history-filters">

                {filters.map((filter) => (

                    <button
                        key={filter.value}
                        type="button"
                        className={`ticket-filter-btn ${
                            activeFilter === filter.value ? "active" : ""
                        }`}
                        onClick={() => handleFilterChange(filter.value)}
                    >
                        {filter.label}
                    </button>

                ))}

            </div>

            {/*========================= Ticket List ========================*/}

            <div className="ticket-history-list">

                {currentTickets.length > 0 ? (

                    currentTickets.map((ticket) => (

                        <TicketCard
                            key={ticket.ticketId}
                            ticket={ticket}
                        />

                    ))

                ) : (

                    <div className="ticket-history-empty">

                        <Film size={42} />

                        <h3>Chưa có vé nào</h3>

                        <p>
                            Không tìm thấy vé trong danh mục bạn đang chọn.
                        </p>

                    </div>

                )}

            </div>

            {/*========================= Pagination ========================*/}

            <TicketPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />

        </section>
    );
}


export default TicketHistory;