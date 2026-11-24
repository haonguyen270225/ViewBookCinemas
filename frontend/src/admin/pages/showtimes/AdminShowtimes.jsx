
import { useEffect, useMemo, useState } from "react";

import {
    getShowtimes,
    createShowtime,
    updateShowtime,
    deleteShowtime
} from "../../../services/showtimeService.js";

import { getMovies } from "../../../services/movieService.js";
import { getCinemas } from "../../../services/cinemaService.js";
import { getRooms } from "../../../services/roomService.js";

import "./AdminShowtimes.css";

const STATUS_OPTIONS = [
    { value: "Scheduled", label: "Đang lên lịch" },
    { value: "Completed", label: "Đã hoàn thành" },
    { value: "Cancelled", label: "Đã hủy" }
];

const MOVIE_VERSION_OPTIONS = [
    "2D - Phụ đề Việt",
    "2D - Lồng tiếng Việt",
    "3D - Phụ đề Việt",
    "3D - Lồng tiếng Việt",
    "IMAX - Phụ đề Việt",
    "IMAX - Lồng tiếng Việt"
];

const EMPTY_FORM = {
    movieId: "",
    cinemaId: "",
    roomId: "",
    movieVersion: "2D - Phụ đề Việt",
    startTime: "",
    endTime: "",
    basePrice: 75000,
    status: "Scheduled"
};

//=================== Hàm hỗ trợ ========================

// Chuyển Date thành định dạng datetime-local.
const getLocalDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Tạo thời gian bắt đầu mặc định sau 1 giờ.
const getDefaultStartTime = () => {
    const date = new Date();

    date.setHours(date.getHours() + 1, 0, 0, 0);

    return getLocalDateTime(date);
};

// Tính thời gian kết thúc dựa trên thời lượng phim.
const calculateEndTime = (startTime, duration) => {
    if (!startTime || !Number.isFinite(Number(duration)) || Number(duration) <= 0) {
        return "";
    }

    const start = new Date(startTime);

    if (Number.isNaN(start.getTime())) {
        return "";
    }

    const end = new Date(
        start.getTime() + Number(duration) * 60 * 1000
    );

    return getLocalDateTime(end);
};

// Lấy thời lượng phim.
// Dữ liệu mẫu cần có thuộc tính duration tính bằng phút.
const getMovieDuration = (movie) => {
    if (!movie) return 0;

    const duration = Number(movie.duration);

    return Number.isFinite(duration) && duration > 0
        ? duration
        : 0;
};

// Lấy thời điểm hiện tại theo định dạng datetime-local.
const getCurrentDateTime = () => {
    return getLocalDateTime(new Date());
};

// Chuyển datetime-local thành timestamp.
const getTimeValue = (value) => {
    if (!value) return NaN;

    return new Date(value).getTime();
};

const formatDateTime = (value) => {
    if (!value) return "Chưa cập nhật";

    return new Date(value).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
};

const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
};

const getStatusLabel = (status) => {
    return STATUS_OPTIONS.find(
        (item) => item.value === status
    )?.label || status;
};

const getStatusClass = (status) => {
    if (status === "Scheduled") return "scheduled";
    if (status === "Completed") return "completed";

    return "cancelled";
};

//=================== Component AdminShowtimes ========================

function AdminShowtimes() {
    const [showtimes, setShowtimes] = useState([]);
    const [movies, setMovies] = useState([]);
    const [cinemas, setCinemas] = useState([]);
    const [rooms, setRooms] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCinema, setSelectedCinema] = useState("Tất cả");
    const [selectedStatus, setSelectedStatus] = useState("Tất cả");
    const [selectedDate, setSelectedDate] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingShowtime, setEditingShowtime] = useState(null);
    const [formData, setFormData] = useState({ ...EMPTY_FORM });

    //=================== Tải dữ liệu ========================

    const loadData = async () => {
        try {
            setIsLoading(true);
            setError("");

            const [
                showtimesData,
                moviesData,
                cinemasData,
                roomsData
            ] = await Promise.all([
                getShowtimes(),
                getMovies(),
                getCinemas(),
                getRooms()
            ]);

            setShowtimes(showtimesData);
            setMovies(moviesData);
            setCinemas(cinemasData);
            setRooms(roomsData);
        } catch (error) {
            console.error("Không thể tải dữ liệu lịch chiếu:", error);

            setError(
                error.message || "Không thể tải dữ liệu lịch chiếu."
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    //=================== Dữ liệu liên quan ========================

    const activeCinemas = useMemo(() => {
        return cinemas.filter(
            (cinema) => cinema.status === "Active"
        );
    }, [cinemas]);

    const selectedMovie = useMemo(() => {
        return movies.find(
            (movie) => String(movie.id) === String(formData.movieId)
        ) || null;
    }, [movies, formData.movieId]);

    const movieDuration = getMovieDuration(selectedMovie);

    const availableRooms = useMemo(() => {
        return rooms.filter(
            (room) =>
                String(room.cinemaId) === String(formData.cinemaId) &&
                (
                    room.status === "Active" ||
                    String(room.roomId) === String(editingShowtime?.roomId)
                )
        );
    }, [rooms, formData.cinemaId, editingShowtime]);

    //=================== Thống kê ========================

    const statistics = useMemo(() => ({
        total: showtimes.length,

        scheduled: showtimes.filter(
            (item) => item.status === "Scheduled"
        ).length,

        completed: showtimes.filter(
            (item) => item.status === "Completed"
        ).length,

        cancelled: showtimes.filter(
            (item) => item.status === "Cancelled"
        ).length
    }), [showtimes]);

    //=================== Tìm kiếm và lọc ========================

    const filteredShowtimes = useMemo(() => {
        const keyword = searchTerm.trim().toLocaleLowerCase("vi");

        return showtimes
            .filter((showtime) => {
                const movie = movies.find(
                    (item) => String(item.id) === String(showtime.movieId)
                );

                const cinema = cinemas.find(
                    (item) => String(item.id) === String(showtime.cinemaId)
                );

                const room = rooms.find(
                    (item) => String(item.roomId) === String(showtime.roomId)
                );

                const matchesSearch =
                    !keyword ||
                    (movie?.title || "").toLocaleLowerCase("vi").includes(keyword) ||
                    (cinema?.name || "").toLocaleLowerCase("vi").includes(keyword) ||
                    (room?.roomName || "").toLocaleLowerCase("vi").includes(keyword);

                const matchesCinema =
                    selectedCinema === "Tất cả" ||
                    String(showtime.cinemaId) === selectedCinema;

                const matchesStatus =
                    selectedStatus === "Tất cả" ||
                    showtime.status === selectedStatus;

                const matchesDate =
                    !selectedDate ||
                    showtime.startTime?.substring(0, 10) === selectedDate;

                return (
                    matchesSearch &&
                    matchesCinema &&
                    matchesStatus &&
                    matchesDate
                );
            })
            .sort((a, b) =>
                a.startTime.localeCompare(b.startTime)
            );
    }, [
        showtimes,
        movies,
        cinemas,
        rooms,
        searchTerm,
        selectedCinema,
        selectedStatus,
        selectedDate
    ]);

    //=================== Mở form thêm ========================

    const handleOpenCreate = () => {
        const firstCinema = activeCinemas[0];

        const firstRoom = rooms.find(
            (room) =>
                String(room.cinemaId) === String(firstCinema?.id) &&
                room.status === "Active"
        );

        const firstMovie = movies[0];
        const startTime = getDefaultStartTime();

        setEditingShowtime(null);

        setFormData({
            ...EMPTY_FORM,
            movieId: firstMovie ? String(firstMovie.id) : "",
            cinemaId: firstCinema ? String(firstCinema.id) : "",
            roomId: firstRoom ? String(firstRoom.roomId) : "",
            startTime,
            endTime: calculateEndTime(
                startTime,
                getMovieDuration(firstMovie)
            )
        });

        setIsModalOpen(true);
    };

    //=================== Mở form chỉnh sửa ========================

    const handleOpenEdit = (showtime) => {
        setEditingShowtime(showtime);

        setFormData({
            movieId: String(showtime.movieId),
            cinemaId: String(showtime.cinemaId),
            roomId: String(showtime.roomId),
            movieVersion: showtime.movieVersion,
            startTime: showtime.startTime?.slice(0, 16) || "",
            endTime: showtime.endTime?.slice(0, 16) || "",
            basePrice: showtime.basePrice,
            status: showtime.status
        });

        setIsModalOpen(true);
    };

    //=================== Đóng form ========================

    const handleCloseModal = () => {
        if (isSaving) return;

        setIsModalOpen(false);
        setEditingShowtime(null);
        setFormData({ ...EMPTY_FORM });
    };

    //=================== Thay đổi dữ liệu form ========================

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((current) => {
            // Khi đổi rạp, chọn phòng hoạt động đầu tiên của rạp.
            if (name === "cinemaId") {
                const firstRoom = rooms.find(
                    (room) =>
                        String(room.cinemaId) === String(value) &&
                        room.status === "Active"
                );

                return {
                    ...current,
                    cinemaId: value,
                    roomId: firstRoom ? String(firstRoom.roomId) : ""
                };
            }

            // Khi đổi phim, tự tính lại thời gian kết thúc.
            if (name === "movieId") {
                const movie = movies.find(
                    (item) => String(item.id) === String(value)
                );

                return {
                    ...current,
                    movieId: value,
                    endTime: calculateEndTime(
                        current.startTime,
                        getMovieDuration(movie)
                    )
                };
            }

            // Khi đổi thời gian bắt đầu, tự tính lại thời gian kết thúc.
            if (name === "startTime") {
                return {
                    ...current,
                    startTime: value,
                    endTime: calculateEndTime(
                        value,
                        movieDuration
                    )
                };
            }

            return {
                ...current,
                [name]: value
            };
        });
    };

    //=================== Thêm hoặc cập nhật ========================

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (
            !formData.movieId ||
            !formData.cinemaId ||
            !formData.roomId ||
            !formData.startTime ||
            !formData.endTime
        ) {
            alert("Vui lòng nhập đầy đủ thông tin suất chiếu.");
            return;
        }

        const startTimestamp = getTimeValue(formData.startTime);
        const endTimestamp = getTimeValue(formData.endTime);
        const nowTimestamp = Date.now();

        if (
            Number.isNaN(startTimestamp) ||
            Number.isNaN(endTimestamp)
        ) {
            alert("Thời gian bắt đầu hoặc kết thúc không hợp lệ.");
            return;
        }

        // Chỉ kiểm tra thời gian bắt đầu khi thêm mới.
        // Khi chỉnh sửa, cho phép cập nhật suất chiếu cũ.
        if (!editingShowtime && startTimestamp < nowTimestamp) {
            alert("Thời gian bắt đầu không được nhỏ hơn thời điểm hiện tại.");
            return;
        }

        if (endTimestamp <= startTimestamp) {
            alert("Thời gian kết thúc phải sau thời gian bắt đầu.");
            return;
        }

        const price = Number(formData.basePrice);

        if (
            !Number.isInteger(price) ||
            price <= 0
        ) {
            alert("Giá vé phải là số nguyên dương.");
            return;
        }

        const showtimeData = {
            ...formData,
            movieId: Number(formData.movieId),
            cinemaId: Number(formData.cinemaId),
            roomId: Number(formData.roomId),
            basePrice: price,
            startTime: formData.startTime.length === 16
                ? `${formData.startTime}:00`
                : formData.startTime,
            endTime: formData.endTime.length === 16
                ? `${formData.endTime}:00`
                : formData.endTime
        };

        setIsSaving(true);

        try {
            if (editingShowtime) {
                const updatedShowtime = await updateShowtime(
                    editingShowtime.id,
                    showtimeData
                );

                setShowtimes((current) =>
                    current.map((item) =>
                        String(item.id) === String(updatedShowtime.id)
                            ? updatedShowtime
                            : item
                    )
                );
            } else {
                const newShowtime = await createShowtime(showtimeData);

                setShowtimes((current) => [
                    ...current,
                    newShowtime
                ]);
            }

            setIsModalOpen(false);
            setEditingShowtime(null);
            setFormData({ ...EMPTY_FORM });
        } catch (error) {
            console.error("Không thể lưu suất chiếu:", error);

            alert(
                error.message || "Không thể lưu thông tin suất chiếu."
            );
        } finally {
            setIsSaving(false);
        }
    };

    //=================== Xóa suất chiếu ========================

    const handleDelete = async (showtime) => {
        const movie = movies.find(
            (item) => String(item.id) === String(showtime.movieId)
        );

        const confirmed = window.confirm(
            `Bạn có chắc chắn muốn xóa suất chiếu "${movie?.title || "Không xác định"}" không?`
        );

        if (!confirmed) return;

        try {
            await deleteShowtime(showtime.id);

            setShowtimes((current) =>
                current.filter(
                    (item) => String(item.id) !== String(showtime.id)
                )
            );
        } catch (error) {
            console.error("Không thể xóa suất chiếu:", error);

            alert(
                error.message || "Không thể xóa suất chiếu."
            );
        }
    };

    //=================== Xóa bộ lọc ========================

    const handleClearFilters = () => {
        setSearchTerm("");
        setSelectedCinema("Tất cả");
        setSelectedStatus("Tất cả");
        setSelectedDate("");
    };

    //=================== Trạng thái tải dữ liệu ========================

    if (isLoading) {
        return (
            <div className="admin-showtimes">
                <div className="admin-showtimes-empty">
                    <i className="bi bi-hourglass-split"></i>
                    <h5>Đang tải danh sách suất chiếu...</h5>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-showtimes">
                <div className="admin-showtimes-empty">
                    <i className="bi bi-exclamation-circle"></i>
                    <h5>Không thể tải dữ liệu</h5>
                    <p>{error}</p>
                    <button type="button" onClick={loadData}>
                        Thử tải lại
                    </button>
                </div>
            </div>
        );
    }

    //=================== Giao diện ========================

    return (
        <div className="admin-showtimes">

            {/* Tiêu đề trang */}

            <div className="admin-page-intro admin-showtimes-intro">
                <div>
                    <h3>Quản lý lịch chiếu</h3>
                    <p>
                        Quản lý các suất chiếu, phòng chiếu và thời gian chiếu phim.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-showtimes-add-button"
                    onClick={handleOpenCreate}
                    disabled={movies.length === 0 || activeCinemas.length === 0}
                >
                    <i className="bi bi-plus-lg"></i>
                    Thêm suất chiếu
                </button>
            </div>

            {/* Thống kê */}

            <div className="admin-showtimes-statistics">
                <div className="admin-showtime-stat-card">
                    <div className="admin-showtime-stat-icon blue">
                        <i className="bi bi-calendar-event"></i>
                    </div>
                    <div>
                        <span>Tổng suất chiếu</span>
                        <strong>{statistics.total}</strong>
                    </div>
                </div>

                <div className="admin-showtime-stat-card">
                    <div className="admin-showtime-stat-icon green">
                        <i className="bi bi-clock"></i>
                    </div>
                    <div>
                        <span>Đang lên lịch</span>
                        <strong>{statistics.scheduled}</strong>
                    </div>
                </div>

                <div className="admin-showtime-stat-card">
                    <div className="admin-showtime-stat-icon purple">
                        <i className="bi bi-check-circle"></i>
                    </div>
                    <div>
                        <span>Đã hoàn thành</span>
                        <strong>{statistics.completed}</strong>
                    </div>
                </div>

                <div className="admin-showtime-stat-card">
                    <div className="admin-showtime-stat-icon gray">
                        <i className="bi bi-x-circle"></i>
                    </div>
                    <div>
                        <span>Đã hủy</span>
                        <strong>{statistics.cancelled}</strong>
                    </div>
                </div>
            </div>

            {/* Bộ lọc và danh sách */}

            <section className="admin-panel admin-showtimes-panel">
                <div className="admin-showtimes-toolbar">
                    <div className="admin-showtimes-search">
                        <i className="bi bi-search"></i>
                        <input
                            type="search"
                            placeholder="Tìm phim, rạp hoặc phòng chiếu..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                        />
                    </div>

                    <select
                        value={selectedCinema}
                        onChange={(event) => setSelectedCinema(event.target.value)}
                        aria-label="Lọc theo rạp"
                    >
                        <option value="Tất cả">Tất cả rạp</option>
                        {cinemas.map((cinema) => (
                            <option key={cinema.id} value={String(cinema.id)}>
                                {cinema.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedStatus}
                        onChange={(event) => setSelectedStatus(event.target.value)}
                        aria-label="Lọc theo trạng thái"
                    >
                        <option value="Tất cả">Tất cả trạng thái</option>
                        {STATUS_OPTIONS.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </select>

                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(event) => setSelectedDate(event.target.value)}
                        aria-label="Lọc theo ngày chiếu"
                    />

                    <button
                        type="button"
                        className="admin-showtimes-reset-button"
                        onClick={handleClearFilters}
                        title="Xóa bộ lọc"
                    >
                        <i className="bi bi-arrow-counterclockwise"></i>
                    </button>
                </div>

                <div className="admin-showtimes-list-heading">
                    <div>
                        <h5>Danh sách suất chiếu</h5>
                        <p>Thông tin lịch chiếu trong hệ thống</p>
                    </div>

                    <span>
                        Hiển thị <strong>{filteredShowtimes.length}</strong> / {showtimes.length} suất
                    </span>
                </div>

                <div className="admin-table-wrapper">
                    <table className="admin-table admin-showtimes-table">
                        <thead>
                            <tr>
                                <th>PHIM</th>
                                <th>RẠP / PHÒNG</th>
                                <th>THỜI GIAN</th>
                                <th>PHIÊN BẢN</th>
                                <th>GIÁ VÉ</th>
                                <th>TRẠNG THÁI</th>
                                <th>THAO TÁC</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredShowtimes.map((showtime) => {
                                const movie = movies.find(
                                    (item) => String(item.id) === String(showtime.movieId)
                                );

                                const cinema = cinemas.find(
                                    (item) => String(item.id) === String(showtime.cinemaId)
                                );

                                const room = rooms.find(
                                    (item) => String(item.roomId) === String(showtime.roomId)
                                );

                                return (
                                    <tr key={showtime.id}>
                                        <td>
                                            <div className="admin-showtime-movie">
                                                <img
                                                    src={movie?.poster || "https://placehold.co/60x85?text=Movie"}
                                                    alt={movie?.title || "Phim"}
                                                />
                                                <strong>{movie?.title || "Phim không tồn tại"}</strong>
                                            </div>
                                        </td>

                                        <td>
                                            <div className="admin-showtime-location">
                                                <strong>{cinema?.name || "Không xác định"}</strong>
                                                <span>{room?.roomName || "Không xác định"}</span>
                                            </div>
                                        </td>

                                        <td>
                                            <div className="admin-showtime-time">
                                                <strong>{formatDateTime(showtime.startTime)}</strong>
                                                <span>
                                                    đến {new Date(showtime.endTime).toLocaleTimeString("vi-VN", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        hour12: false
                                                    })}
                                                </span>
                                            </div>
                                        </td>

                                        <td>{showtime.movieVersion}</td>

                                        <td>
                                            <strong className="admin-showtime-price">
                                                {formatPrice(showtime.basePrice)}
                                            </strong>
                                        </td>

                                        <td>
                                            <span className={`admin-showtime-status ${getStatusClass(showtime.status)}`}>
                                                {getStatusLabel(showtime.status)}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="admin-showtime-actions">
                                                <button
                                                    type="button"
                                                    className="edit"
                                                    title="Chỉnh sửa"
                                                    onClick={() => handleOpenEdit(showtime)}
                                                >
                                                    <i className="bi bi-pencil-square"></i>
                                                </button>

                                                <button
                                                    type="button"
                                                    className="delete"
                                                    title="Xóa"
                                                    onClick={() => handleDelete(showtime)}
                                                >
                                                    <i className="bi bi-trash3"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {filteredShowtimes.length === 0 && (
                        <div className="admin-showtimes-empty">
                            <i className="bi bi-calendar-x"></i>
                            <h5>Không tìm thấy suất chiếu</h5>
                            <p>Thử thay đổi từ khóa hoặc bộ lọc của bạn.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Modal thêm / chỉnh sửa */}

            {isModalOpen && (
                <div
                    className="admin-showtime-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            handleCloseModal();
                        }
                    }}
                >
                    <div className="admin-showtime-modal">
                        <div className="admin-showtime-modal-header">
                            <div>
                                <h4>
                                    {editingShowtime ? "Cập nhật suất chiếu" : "Thêm suất chiếu"}
                                </h4>
                                <p>Nhập thông tin lịch chiếu phim</p>
                            </div>

                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={isSaving}
                                aria-label="Đóng"
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <form className="admin-showtime-form" onSubmit={handleSubmit}>
                            <div className="admin-showtime-form-grid">

                                <div className="admin-showtime-form-group full">
                                    <label htmlFor="showtimeMovie">Phim</label>
                                    <select
                                        id="showtimeMovie"
                                        name="movieId"
                                        value={formData.movieId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Chọn phim</option>
                                        {movies.map((movie) => (
                                            <option key={movie.id} value={String(movie.id)}>
                                                {movie.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="admin-showtime-form-group">
                                    <label htmlFor="showtimeCinema">Rạp chiếu</label>
                                    <select
                                        id="showtimeCinema"
                                        name="cinemaId"
                                        value={formData.cinemaId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Chọn rạp</option>
                                        {activeCinemas.map((cinema) => (
                                            <option key={cinema.id} value={String(cinema.id)}>
                                                {cinema.name}
                                            </option>
                                        ))}

                                        {editingShowtime && !activeCinemas.some(
                                            (item) => String(item.id) === String(editingShowtime.cinemaId)
                                        ) && (
                                            <option value={String(editingShowtime.cinemaId)}>
                                                Rạp hiện tại (ngừng hoạt động)
                                            </option>
                                        )}
                                    </select>
                                </div>

                                <div className="admin-showtime-form-group">
                                    <label htmlFor="showtimeRoom">Phòng chiếu</label>
                                    <select
                                        id="showtimeRoom"
                                        name="roomId"
                                        value={formData.roomId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Chọn phòng</option>
                                        {availableRooms.map((room) => (
                                            <option key={room.roomId} value={String(room.roomId)}>
                                                {room.roomName} - {room.roomType}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="admin-showtime-form-group full">
                                    <label htmlFor="showtimeVersion">Phiên bản phim</label>
                                    <select
                                        id="showtimeVersion"
                                        name="movieVersion"
                                        value={formData.movieVersion}
                                        onChange={handleChange}
                                        required
                                    >
                                        {MOVIE_VERSION_OPTIONS.map((version) => (
                                            <option key={version} value={version}>
                                                {version}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="admin-showtime-form-group">
                                    <label htmlFor="showtimeStart">Thời gian bắt đầu</label>
                                    <input
                                        id="showtimeStart"
                                        type="datetime-local"
                                        name="startTime"
                                        value={formData.startTime}
                                        min={!editingShowtime ? getCurrentDateTime() : undefined}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="admin-showtime-form-group">
                                    <label htmlFor="showtimeEnd">Thời gian kết thúc</label>
                                    <input
                                        id="showtimeEnd"
                                        type="datetime-local"
                                        name="endTime"
                                        value={formData.endTime}
                                        min={formData.startTime || undefined}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="admin-showtime-form-group full">
                                    <p className="admin-showtime-duration-note">
                                        {movieDuration > 0
                                            ? `Thời lượng phim: ${movieDuration} phút. Thời gian kết thúc được tự động tính theo thời lượng phim. Bạn vẫn có thể điều chỉnh thủ công nếu cần.`
                                            : "Phim chưa có thông tin thời lượng hợp lệ. Vui lòng nhập thời gian kết thúc thủ công."
                                        }
                                    </p>
                                </div>

                                <div className="admin-showtime-form-group">
                                    <label htmlFor="showtimePrice">Giá vé (VNĐ)</label>
                                    <input
                                        id="showtimePrice"
                                        type="number"
                                        name="basePrice"
                                        min="1000"
                                        step="1000"
                                        value={formData.basePrice}
                                        onChange={handleChange}
                                        required
                                    />
                                    <small>Nhập giá vé theo bội số 1.000đ, ví dụ: 75.000đ hoặc 95.000đ.</small>
                                </div>

                                <div className="admin-showtime-form-group">
                                    <label htmlFor="showtimeStatus">Trạng thái</label>
                                    <select
                                        id="showtimeStatus"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        {STATUS_OPTIONS.map((item) => (
                                            <option key={item.value} value={item.value}>
                                                {item.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="admin-showtime-form-footer">
                                <button
                                    type="button"
                                    className="cancel"
                                    onClick={handleCloseModal}
                                    disabled={isSaving}
                                >
                                    Hủy
                                </button>

                                <button
                                    type="submit"
                                    className="submit"
                                    disabled={isSaving}
                                >
                                    <i className="bi bi-check-lg"></i>
                                    {isSaving
                                        ? "Đang lưu..."
                                        : editingShowtime
                                            ? "Lưu thay đổi"
                                            : "Thêm suất chiếu"
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminShowtimes;
