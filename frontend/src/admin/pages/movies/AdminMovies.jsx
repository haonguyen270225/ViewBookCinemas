
import { useMemo, useState } from "react";

import moviesData from "../../../data/movies.js";

import "./AdminMovies.css";

const STORAGE_KEY = "viewbook-admin-movies";

const STATUS_OPTIONS = [
    "Đang chiếu",
    "Sắp chiếu",
    "Ngừng chiếu"
];

const GENRE_OPTIONS = [
    "Hành động",
    "Phiêu lưu",
    "Hoạt hình",
    "Hài",
    "Tội phạm",
    "Tài liệu",
    "Chính kịch",
    "Gia đình",
    "Giả tưởng",
    "Kinh dị",
    "Bí ẩn",
    "Lãng mạn",
    "Khoa học viễn tưởng",
    "Thể thao",
    "Giật gân",
    "Chiến tranh",
    "Tâm lý",
    "Âm nhạc"
];

const COUNTRY_OPTIONS = [
    "Việt Nam",
    "Mỹ",
    "Hàn Quốc",
    "Nhật Bản",
    "Trung Quốc",
    "Thái Lan",
    "Ấn Độ",
    "Anh",
    "Pháp",
    "Đức",
    "Canada",
    "Úc"
];

const EMPTY_FORM = {
    title: "",
    posterUrl: "",
    trailerUrl: "",
    genres: "",
    duration: 120,
    rating: 8,
    ageRating: "T13",
    country: "Việt Nam",
    status: "Đang chiếu",
    releaseDate: "",
    description: "",
    isFeatured: false
};

// Đọc dữ liệu phim từ localStorage
const getInitialMovies = () => {
    try {
        const savedMovies = localStorage.getItem(STORAGE_KEY);

        if (savedMovies) {
            const parsedMovies = JSON.parse(savedMovies);

            if (Array.isArray(parsedMovies)) {
                return parsedMovies;
            }
        }
    } catch (error) {
        console.error("Không thể đọc dữ liệu phim:", error);
    }

    return moviesData;
};

// Chuyển tên phim thành slug
const createSlug = (value) => {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
};

// Định dạng ngày
const formatDate = (value) => {
    if (!value) return "Chưa cập nhật";

    const [year, month, day] = value.split("-");

    return new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
    ).toLocaleDateString("vi-VN");
};

// Phân loại màu trạng thái
const getStatusClass = (status) => {
    if (status === "Đang chiếu") return "showing";
    if (status === "Sắp chiếu") return "upcoming";

    return "stopped";
};

function AdminMovies() {
    const [movies, setMovies] = useState(getInitialMovies);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("Tất cả");
    const [selectedGenre, setSelectedGenre] = useState("Tất cả");
    const [selectedCountry, setSelectedCountry] = useState("Tất cả");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMovie, setEditingMovie] = useState(null);

    const [formData, setFormData] = useState(EMPTY_FORM);

    // Lưu dữ liệu vào state và localStorage
    const updateMovies = (newMovies) => {
        setMovies(newMovies);

        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(newMovies)
            );
        } catch (error) {
            console.error("Không thể lưu dữ liệu phim:", error);
            alert("Không thể lưu dữ liệu trên trình duyệt.");
        }
    };

    // Danh sách thể loại từ dữ liệu phim và danh sách gợi ý
    const genres = useMemo(() => {
        const allGenres = [
            ...GENRE_OPTIONS,
            ...movies.flatMap((movie) => movie.genres || [])
        ];

        return [...new Set(allGenres)].sort((a, b) =>
            a.localeCompare(b, "vi")
        );
    }, [movies]);

    // Danh sách quốc gia từ dữ liệu phim và danh sách gợi ý
    const countries = useMemo(() => {
        const allCountries = [
            ...COUNTRY_OPTIONS,
            ...movies.map((movie) => movie.country).filter(Boolean)
        ];

        return [...new Set(allCountries)].sort((a, b) =>
            a.localeCompare(b, "vi")
        );
    }, [movies]);

    // Thống kê phim
    const statistics = useMemo(() => {
        return {
            total: movies.length,

            showing: movies.filter(
                (movie) => movie.status === "Đang chiếu"
            ).length,

            upcoming: movies.filter(
                (movie) => movie.status === "Sắp chiếu"
            ).length,

            stopped: movies.filter(
                (movie) => movie.status === "Ngừng chiếu"
            ).length
        };
    }, [movies]);

    // Tìm kiếm và lọc phim
    const filteredMovies = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        return movies.filter((movie) => {
            // Tìm kiếm theo tên phim hoặc quốc gia
            const matchesSearch =
                !keyword ||
                movie.title?.toLowerCase().includes(keyword) ||
                movie.country?.toLowerCase().includes(keyword);

            // Lọc theo trạng thái
            const matchesStatus =
                selectedStatus === "Tất cả" ||
                movie.status === selectedStatus;

            // Lọc theo thể loại
            const matchesGenre =
                selectedGenre === "Tất cả" ||
                movie.genres?.includes(selectedGenre);

            // Lọc theo quốc gia
            const matchesCountry =
                selectedCountry === "Tất cả" ||
                movie.country === selectedCountry;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesGenre &&
                matchesCountry
            );
        });
    }, [
        movies,
        searchTerm,
        selectedStatus,
        selectedGenre,
        selectedCountry
    ]);

    // Mở form thêm phim
    const handleOpenCreate = () => {
        setEditingMovie(null);
        setFormData({ ...EMPTY_FORM });
        setIsModalOpen(true);
    };

    // Mở form chỉnh sửa phim
    const handleOpenEdit = (movie) => {
        setEditingMovie(movie);

        setFormData({
            title: movie.title || "",
            posterUrl: "",
            trailerUrl: movie.trailerUrl || movie.trailerPageUrl || "",
            genres: (movie.genres || []).join(", "),
            duration: movie.duration || 120,
            rating: movie.rating ?? 0,
            ageRating: movie.ageRating || "T13",
            country: movie.country || "",
            status: movie.status || "Đang chiếu",
            releaseDate: movie.releaseDate || "",
            description: movie.description || "",
            isFeatured: Boolean(movie.isFeatured)
        });

        setIsModalOpen(true);
    };

    // Đóng form
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingMovie(null);
        setFormData({ ...EMPTY_FORM });
    };

    // Cập nhật dữ liệu form
    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    // Thêm hoặc cập nhật phim
    const handleSubmit = (event) => {
        event.preventDefault();

        const title = formData.title.trim();

        const movieGenres = formData.genres
            .split(",")
            .map((genre) => genre.trim())
            .filter(Boolean);

        if (!title || movieGenres.length === 0) {
            alert("Vui lòng nhập tên phim và ít nhất một thể loại.");
            return;
        }

        const currentPoster =
            formData.posterUrl.trim() ||
            editingMovie?.poster ||
            "https://placehold.co/300x450?text=No+Poster";

        const movieData = {
            ...(editingMovie || {}),

            id: editingMovie
                ? editingMovie.id
                : Math.max(0, ...movies.map((movie) => Number(movie.id) || 0)) + 1,

            title,

            poster: currentPoster,

            backdropUrl:
                editingMovie?.backdropUrl || currentPoster,

            genres: movieGenres,

            duration: Number(formData.duration),

            rating: Number(formData.rating),

            ageRating: formData.ageRating,

            country: formData.country.trim(),

            status: formData.status,

            releaseDate: formData.releaseDate || null,

            description: formData.description.trim(),

            isFeatured: formData.isFeatured,

            slug: createSlug(title),

            displayOrder:
                editingMovie?.displayOrder ??
                movies.length + 1,

            trailerUrl: formData.trailerUrl.trim(),

            trailerPageUrl: editingMovie?.trailerPageUrl || ""
        };

        let updatedMovies;

        if (editingMovie) {
            updatedMovies = movies.map((movie) =>
                movie.id === editingMovie.id
                    ? movieData
                    : movie
            );
        } else {
            updatedMovies = [...movies, movieData];
        }

        updateMovies(updatedMovies);
        handleCloseModal();
    };

    // Xóa phim
    const handleDelete = (movie) => {
        const confirmed = window.confirm(
            `Bạn có chắc chắn muốn xóa phim "${movie.title}" không?`
        );

        if (!confirmed) return;

        const updatedMovies = movies.filter(
            (item) => item.id !== movie.id
        );

        updateMovies(updatedMovies);
    };

    // Xóa bộ lọc
    const handleClearFilters = () => {
        setSearchTerm("");
        setSelectedStatus("Tất cả");
        setSelectedGenre("Tất cả");
        setSelectedCountry("Tất cả");
    };

    return (
        <div className="admin-movies">

            {/* Tiêu đề trang */}
            <div className="admin-page-intro admin-movies-intro">
                <div>
                    <h3>Quản lý phim</h3>

                    <p>
                        Quản lý danh sách phim và thông tin phim trong hệ thống
                        ViewBookCinemas.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-movies-add-button"
                    onClick={handleOpenCreate}
                >
                    <i className="bi bi-plus-lg"></i>
                    Thêm phim mới
                </button>
            </div>

            {/* Thống kê */}
            <div className="admin-movies-statistics">
                <div className="admin-movie-stat-card">
                    <div className="admin-movie-stat-icon blue">
                        <i className="bi bi-film"></i>
                    </div>

                    <div>
                        <span>Tổng số phim</span>
                        <strong>{statistics.total}</strong>
                    </div>
                </div>

                <div className="admin-movie-stat-card">
                    <div className="admin-movie-stat-icon green">
                        <i className="bi bi-play-circle"></i>
                    </div>

                    <div>
                        <span>Đang chiếu</span>
                        <strong>{statistics.showing}</strong>
                    </div>
                </div>

                <div className="admin-movie-stat-card">
                    <div className="admin-movie-stat-icon orange">
                        <i className="bi bi-calendar-event"></i>
                    </div>

                    <div>
                        <span>Sắp chiếu</span>
                        <strong>{statistics.upcoming}</strong>
                    </div>
                </div>

                <div className="admin-movie-stat-card">
                    <div className="admin-movie-stat-icon gray">
                        <i className="bi bi-pause-circle"></i>
                    </div>

                    <div>
                        <span>Ngừng chiếu</span>
                        <strong>{statistics.stopped}</strong>
                    </div>
                </div>
            </div>

            {/* Bộ lọc */}
            <section className="admin-panel admin-movies-panel">
                <div className="admin-movies-toolbar">

                    {/* Tìm kiếm */}
                    <div className="admin-movies-search">
                        <i className="bi bi-search"></i>

                        <input
                            type="search"
                            placeholder="Tìm kiếm tên phim hoặc quốc gia..."
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                        />
                    </div>

                    {/* Lọc trạng thái */}
                    <div className="admin-movies-filter">
                        <label htmlFor="adminMovieStatus">
                            Trạng thái
                        </label>

                        <select
                            id="adminMovieStatus"
                            value={selectedStatus}
                            onChange={(event) =>
                                setSelectedStatus(event.target.value)
                            }
                        >
                            <option value="Tất cả">Tất cả</option>

                            {STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Lọc thể loại */}
                    <div className="admin-movies-filter">
                        <label htmlFor="adminMovieGenre">
                            Thể loại
                        </label>

                        <select
                            id="adminMovieGenre"
                            value={selectedGenre}
                            onChange={(event) =>
                                setSelectedGenre(event.target.value)
                            }
                        >
                            <option value="Tất cả">Tất cả thể loại</option>

                            {genres.map((genre) => (
                                <option key={genre} value={genre}>
                                    {genre}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Lọc quốc gia */}
                    <div className="admin-movies-filter">
                        <label htmlFor="adminMovieCountry">
                            Quốc gia
                        </label>

                        <select
                            id="adminMovieCountry"
                            value={selectedCountry}
                            onChange={(event) =>
                                setSelectedCountry(event.target.value)
                            }
                        >
                            <option value="Tất cả">Tất cả quốc gia</option>

                            {countries.map((country) => (
                                <option key={country} value={country}>
                                    {country}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Xóa bộ lọc */}
                    <button
                        type="button"
                        className="admin-movies-reset-button"
                        onClick={handleClearFilters}
                        title="Xóa bộ lọc"
                    >
                        <i className="bi bi-arrow-counterclockwise"></i>
                    </button>
                </div>

                {/* Tiêu đề danh sách */}
                <div className="admin-movies-list-heading">
                    <div>
                        <h5>Danh sách phim</h5>
                        <p>Thông tin các phim trong hệ thống</p>
                    </div>

                    <span>
                        Hiển thị <strong>{filteredMovies.length}</strong> /{" "}
                        {movies.length} phim
                    </span>
                </div>

                {/* Bảng phim */}
                <div className="admin-table-wrapper">
                    <table className="admin-table admin-movies-table">
                        <thead>
                            <tr>
                                <th>PHIM</th>
                                <th>THỂ LOẠI</th>
                                <th>THỜI LƯỢNG</th>
                                <th>NGÀY KHỞI CHIẾU</th>
                                <th>ĐÁNH GIÁ</th>
                                <th>TRẠNG THÁI</th>
                                <th>THAO TÁC</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredMovies.map((movie) => (
                                <tr key={movie.id}>
                                    <td>
                                        <div className="admin-movie-info">
                                            <img
                                                src={movie.poster}
                                                alt={movie.title}
                                                onError={(event) => {
                                                    event.currentTarget.src =
                                                        "https://placehold.co/80x120?text=No+Image";
                                                }}
                                            />

                                            <div>
                                                <strong>{movie.title}</strong>

                                                <span>
                                                    {movie.country} · {movie.ageRating}
                                                </span>

                                                {movie.isFeatured && (
                                                    <small>
                                                        <i className="bi bi-star-fill"></i>
                                                        Phim nổi bật
                                                    </small>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="admin-movie-genres">
                                            {(movie.genres || []).map((genre) => (
                                                <span key={genre}>{genre}</span>
                                            ))}
                                        </div>
                                    </td>

                                    <td>{movie.duration} phút</td>

                                    <td>{formatDate(movie.releaseDate)}</td>

                                    <td>
                                        <span className="admin-movie-rating">
                                            <i className="bi bi-star-fill"></i>
                                            {Number(movie.rating).toFixed(1)}
                                        </span>
                                    </td>

                                    <td>
                                        <span
                                            className={`admin-movie-status ${getStatusClass(movie.status)}`}
                                        >
                                            {movie.status}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="admin-movie-actions">
                                            <button
                                                type="button"
                                                className="edit"
                                                title="Chỉnh sửa"
                                                onClick={() => handleOpenEdit(movie)}
                                            >
                                                <i className="bi bi-pencil-square"></i>
                                            </button>

                                            <button
                                                type="button"
                                                className="delete"
                                                title="Xóa phim"
                                                onClick={() => handleDelete(movie)}
                                            >
                                                <i className="bi bi-trash3"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredMovies.length === 0 && (
                        <div className="admin-movies-empty">
                            <i className="bi bi-film"></i>

                            <h5>Không tìm thấy phim</h5>

                            <p>
                                Hãy thử thay đổi từ khóa hoặc điều kiện lọc.
                            </p>

                            <button
                                type="button"
                                onClick={handleClearFilters}
                            >
                                Xóa bộ lọc
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Modal thêm / chỉnh sửa phim */}
            {isModalOpen && (
                <div
                    className="admin-movie-modal-overlay"
                    onClick={handleCloseModal}
                >
                    <div
                        className="admin-movie-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="adminMovieModalTitle"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="admin-movie-modal-header">
                            <div>
                                <h4 id="adminMovieModalTitle">
                                    {editingMovie
                                        ? "Chỉnh sửa phim"
                                        : "Thêm phim mới"}
                                </h4>

                                <p>Nhập thông tin phim bên dưới.</p>
                            </div>

                            <button
                                type="button"
                                onClick={handleCloseModal}
                                aria-label="Đóng"
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <form
                            className="admin-movie-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="admin-movie-form-grid">

                                {/* Tên phim */}
                                <div className="admin-movie-form-group full">
                                    <label htmlFor="movieTitle">
                                        Tên phim *
                                    </label>

                                    <input
                                        id="movieTitle"
                                        name="title"
                                        type="text"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="Nhập tên phim..."
                                        required
                                    />
                                </div>

                                {/* Poster */}
                                <div className="admin-movie-form-group full">
                                    <label htmlFor="moviePoster">
                                        Đường dẫn Poster
                                    </label>

                                    <input
                                        id="moviePoster"
                                        name="posterUrl"
                                        type="url"
                                        value={formData.posterUrl}
                                        onChange={handleChange}
                                        placeholder={
                                            editingMovie
                                                ? "Để trống nếu muốn giữ poster hiện tại"
                                                : "Nhập URL hình ảnh poster..."
                                        }
                                    />
                                </div>

                                {/* Trailer */}
                                <div className="admin-movie-form-group full">
                                    <label htmlFor="movieTrailer">
                                        Đường dẫn Trailer
                                    </label>

                                    <input
                                        id="movieTrailer"
                                        name="trailerUrl"
                                        type="url"
                                        value={formData.trailerUrl}
                                        onChange={handleChange}
                                        placeholder="Nhập URL video trailer..."
                                    />

                                    <small>
                                        Có thể sử dụng đường dẫn video YouTube.
                                    </small>
                                </div>

                                {/* Thể loại */}
                                <div className="admin-movie-form-group full">
                                    <label htmlFor="movieGenres">
                                        Thể loại *
                                    </label>

                                    <input
                                        id="movieGenres"
                                        name="genres"
                                        type="text"
                                        list="movieGenreOptions"
                                        value={formData.genres}
                                        onChange={handleChange}
                                        placeholder="Ví dụ: Hành động, Phiêu lưu"
                                        required
                                    />

                                    <datalist id="movieGenreOptions">
                                        {genres.map((genre) => (
                                            <option
                                                key={genre}
                                                value={genre}
                                            />
                                        ))}
                                    </datalist>

                                    <small>
                                        Chọn thể loại gợi ý hoặc nhập thể loại mới.
                                        Nếu có nhiều thể loại, phân cách bằng dấu phẩy.
                                    </small>
                                </div>

                                {/* Thời lượng */}
                                <div className="admin-movie-form-group">
                                    <label htmlFor="movieDuration">
                                        Thời lượng (phút) *
                                    </label>

                                    <input
                                        id="movieDuration"
                                        name="duration"
                                        type="number"
                                        min="1"
                                        value={formData.duration}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                {/* Điểm đánh giá */}
                                <div className="admin-movie-form-group">
                                    <label htmlFor="movieRating">
                                        Điểm đánh giá
                                    </label>

                                    <input
                                        id="movieRating"
                                        name="rating"
                                        type="number"
                                        min="0"
                                        max="10"
                                        step="0.1"
                                        value={formData.rating}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Độ tuổi */}
                                <div className="admin-movie-form-group">
                                    <label htmlFor="movieAge">
                                        Độ tuổi
                                    </label>

                                    <select
                                        id="movieAge"
                                        name="ageRating"
                                        value={formData.ageRating}
                                        onChange={handleChange}
                                    >
                                        {["P", "K", "T13", "T16", "T18"].map(
                                            (age) => (
                                                <option key={age} value={age}>
                                                    {age}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                {/* Quốc gia */}
                                <div className="admin-movie-form-group">
                                    <label htmlFor="movieCountry">
                                        Quốc gia
                                    </label>

                                    <input
                                        id="movieCountry"
                                        name="country"
                                        type="text"
                                        list="movieCountryOptions"
                                        value={formData.country}
                                        onChange={handleChange}
                                        placeholder="Chọn hoặc nhập quốc gia..."
                                    />

                                    <datalist id="movieCountryOptions">
                                        {countries.map((country) => (
                                            <option
                                                key={country}
                                                value={country}
                                            />
                                        ))}
                                    </datalist>
                                </div>

                                {/* Trạng thái */}
                                <div className="admin-movie-form-group">
                                    <label htmlFor="movieStatus">
                                        Trạng thái
                                    </label>

                                    <select
                                        id="movieStatus"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        {STATUS_OPTIONS.map((status) => (
                                            <option
                                                key={status}
                                                value={status}
                                            >
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Ngày khởi chiếu */}
                                <div className="admin-movie-form-group">
                                    <label htmlFor="movieReleaseDate">
                                        Ngày khởi chiếu
                                    </label>

                                    <input
                                        id="movieReleaseDate"
                                        name="releaseDate"
                                        type="date"
                                        value={formData.releaseDate}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Mô tả */}
                                <div className="admin-movie-form-group full">
                                    <label htmlFor="movieDescription">
                                        Mô tả phim
                                    </label>

                                    <textarea
                                        id="movieDescription"
                                        name="description"
                                        rows="4"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Nhập nội dung giới thiệu phim..."
                                    />
                                </div>

                                {/* Phim nổi bật */}
                                <div className="admin-movie-form-group full">
                                    <label className="admin-movie-featured">
                                        <input
                                            type="checkbox"
                                            name="isFeatured"
                                            checked={formData.isFeatured}
                                            onChange={handleChange}
                                        />

                                        <span>Đánh dấu phim nổi bật</span>
                                    </label>
                                </div>
                            </div>

                            {/* Nút thao tác */}
                            <div className="admin-movie-form-footer">
                                <button
                                    type="button"
                                    className="cancel"
                                    onClick={handleCloseModal}
                                >
                                    Hủy
                                </button>

                                <button
                                    type="submit"
                                    className="submit"
                                >
                                    <i className="bi bi-check-lg"></i>

                                    {editingMovie
                                        ? "Lưu thay đổi"
                                        : "Thêm phim"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminMovies;
