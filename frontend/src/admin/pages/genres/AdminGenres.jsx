
import { useMemo, useState } from "react";

import moviesData from "../../../data/movies.js";

import {
    getGenres,
    saveGenres
} from "../../../services/genreService.js";

import "./AdminGenres.css";

const MOVIE_STORAGE_KEY = "viewbook-admin-movies";

const STATUS_OPTIONS = [
    "Đang sử dụng",
    "Ngừng sử dụng"
];

const EMPTY_FORM = {
    name: "",
    description: "",
    status: "Đang sử dụng"
};

// Chuẩn hóa tên để kiểm tra trùng lặp
const normalizeName = (value) => {
    return value
        .trim()
        .normalize("NFC")
        .toLocaleLowerCase("vi");
};

// Tạo slug
const createSlug = (value) => {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
};

// Đọc danh sách phim hiện tại
const getInitialMovies = () => {
    try {
        const savedMovies = localStorage.getItem(MOVIE_STORAGE_KEY);

        if (savedMovies) {
            const parsed = JSON.parse(savedMovies);

            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
    } catch (error) {
        console.error("Không thể đọc dữ liệu phim:", error);
    }

    return moviesData;
};

function AdminGenres() {
    const [genres, setGenres] = useState(getGenres);
    const [movies] = useState(getInitialMovies);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("Tất cả");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGenre, setEditingGenre] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);

    // Đếm số phim thuộc thể loại
    const getMovieCount = (genreName) => {
        const key = normalizeName(genreName);

        return movies.filter((movie) =>
            (movie.genres || []).some(
                (genre) => normalizeName(genre) === key
            )
        ).length;
    };

    // Thống kê
    const statistics = useMemo(() => ({
        total: genres.length,

        active: genres.filter(
            (genre) => genre.status === "Đang sử dụng"
        ).length,

        inactive: genres.filter(
            (genre) => genre.status === "Ngừng sử dụng"
        ).length
    }), [genres]);

    // Tìm kiếm và lọc
    const filteredGenres = useMemo(() => {
        const keyword = searchTerm.trim().toLocaleLowerCase("vi");

        return genres.filter((genre) => {
            const matchesSearch =
                !keyword ||
                genre.name.toLocaleLowerCase("vi").includes(keyword) ||
                genre.description?.toLocaleLowerCase("vi").includes(keyword);

            const matchesStatus =
                selectedStatus === "Tất cả" ||
                genre.status === selectedStatus;

            return matchesSearch && matchesStatus;
        }).sort((a, b) => a.name.localeCompare(b.name, "vi"));
    }, [genres, searchTerm, selectedStatus]);

    // Lưu dữ liệu thông qua genreService
    const updateGenres = (newGenres) => {
        const isSaved = saveGenres(newGenres);

        if (!isSaved) {
            alert("Không thể lưu dữ liệu trên trình duyệt.");
            return false;
        }

        setGenres(newGenres);
        return true;
    };

    // Mở form thêm
    const handleOpenCreate = () => {
        setEditingGenre(null);
        setFormData({ ...EMPTY_FORM });
        setIsModalOpen(true);
    };

    // Mở form chỉnh sửa
    const handleOpenEdit = (genre) => {
        setEditingGenre(genre);

        setFormData({
            name: genre.name || "",
            description: genre.description || "",
            status: genre.status || "Đang sử dụng"
        });

        setIsModalOpen(true);
    };

    // Đóng form
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingGenre(null);
        setFormData({ ...EMPTY_FORM });
    };

    // Cập nhật form
    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value
        }));
    };

    // Thêm hoặc cập nhật thể loại
    const handleSubmit = (event) => {
        event.preventDefault();

        const name = formData.name.trim();

        if (!name) {
            alert("Vui lòng nhập tên thể loại.");
            return;
        }

        const duplicate = genres.some((genre) =>
            normalizeName(genre.name) === normalizeName(name) &&
            genre.id !== editingGenre?.id
        );

        if (duplicate) {
            alert("Thể loại này đã tồn tại.");
            return;
        }

        const genreData = {
            ...(editingGenre || {}),

            id: editingGenre?.id || `genre-${Date.now()}`,
            name,
            slug: createSlug(name),
            description: formData.description.trim(),
            status: formData.status
        };

        const updatedGenres = editingGenre
            ? genres.map((genre) =>
                genre.id === editingGenre.id
                    ? genreData
                    : genre
            )
            : [...genres, genreData];

        const isSaved = updateGenres(updatedGenres);

        if (isSaved) {
            handleCloseModal();
        }
    };

    // Xóa thể loại
    const handleDelete = (genre) => {
        const movieCount = getMovieCount(genre.name);

        if (movieCount > 0) {
            alert(
                `Không thể xóa thể loại "${genre.name}" vì đang được sử dụng bởi ${movieCount} phim.`
            );
            return;
        }

        const confirmed = window.confirm(
            `Bạn có chắc chắn muốn xóa thể loại "${genre.name}" không?`
        );

        if (!confirmed) return;

        updateGenres(
            genres.filter((item) => item.id !== genre.id)
        );
    };

    // Xóa bộ lọc
    const handleClearFilters = () => {
        setSearchTerm("");
        setSelectedStatus("Tất cả");
    };

    return (
        <div className="admin-genres">

            {/* Tiêu đề */}
            <div className="admin-page-intro admin-genres-intro">
                <div>
                    <h3>Quản lý thể loại</h3>

                    <p>
                        Quản lý danh sách thể loại phim trong hệ thống
                        ViewBookCinemas.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-genres-add-button"
                    onClick={handleOpenCreate}
                >
                    <i className="bi bi-plus-lg"></i>
                    Thêm thể loại
                </button>
            </div>

            {/* Thống kê */}
            <div className="admin-genres-statistics">

                <div className="admin-genre-stat-card">
                    <div className="admin-genre-stat-icon blue">
                        <i className="bi bi-tags"></i>
                    </div>

                    <div>
                        <span>Tổng thể loại</span>
                        <strong>{statistics.total}</strong>
                    </div>
                </div>

                <div className="admin-genre-stat-card">
                    <div className="admin-genre-stat-icon green">
                        <i className="bi bi-check-circle"></i>
                    </div>

                    <div>
                        <span>Đang sử dụng</span>
                        <strong>{statistics.active}</strong>
                    </div>
                </div>

                <div className="admin-genre-stat-card">
                    <div className="admin-genre-stat-icon gray">
                        <i className="bi bi-pause-circle"></i>
                    </div>

                    <div>
                        <span>Ngừng sử dụng</span>
                        <strong>{statistics.inactive}</strong>
                    </div>
                </div>

            </div>

            {/* Danh sách */}
            <section className="admin-panel admin-genres-panel">

                {/* Bộ lọc */}
                <div className="admin-genres-toolbar">

                    <div className="admin-genres-search">
                        <i className="bi bi-search"></i>

                        <input
                            type="search"
                            placeholder="Tìm kiếm tên thể loại..."
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                        />
                    </div>

                    <div className="admin-genres-filter">
                        <label htmlFor="genreStatus">
                            Trạng thái
                        </label>

                        <select
                            id="genreStatus"
                            value={selectedStatus}
                            onChange={(event) =>
                                setSelectedStatus(event.target.value)
                            }
                        >
                            <option value="Tất cả">Tất cả trạng thái</option>

                            {STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="button"
                        className="admin-genres-reset-button"
                        onClick={handleClearFilters}
                        title="Xóa bộ lọc"
                    >
                        <i className="bi bi-arrow-counterclockwise"></i>
                    </button>

                </div>

                {/* Tiêu đề danh sách */}
                <div className="admin-genres-list-heading">
                    <div>
                        <h5>Danh sách thể loại</h5>
                        <p>Thông tin các thể loại phim hiện có</p>
                    </div>

                    <span>
                        Hiển thị <strong>{filteredGenres.length}</strong> /{" "}
                        {genres.length} thể loại
                    </span>
                </div>

                {/* Bảng */}
                <div className="admin-table-wrapper">
                    <table className="admin-table admin-genres-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>TÊN THỂ LOẠI</th>
                                <th>SLUG</th>
                                <th>SỐ PHIM</th>
                                <th>TRẠNG THÁI</th>
                                <th>THAO TÁC</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredGenres.map((genre, index) => (
                                <tr key={genre.id}>
                                    <td>{index + 1}</td>

                                    <td>
                                        <div className="admin-genre-info">
                                            <div className="admin-genre-avatar">
                                                <i className="bi bi-tag-fill"></i>
                                            </div>

                                            <div>
                                                <strong>{genre.name}</strong>

                                                <span>
                                                    {genre.description ||
                                                        "Chưa có mô tả"}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    <td>
                                        <span className="admin-genre-slug">
                                            {genre.slug}
                                        </span>
                                    </td>

                                    <td>
                                        <span className="admin-genre-count">
                                            {getMovieCount(genre.name)} phim
                                        </span>
                                    </td>

                                    <td>
                                        <span
                                            className={`admin-genre-status ${
                                                genre.status === "Đang sử dụng"
                                                    ? "active"
                                                    : "inactive"
                                            }`}
                                        >
                                            {genre.status}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="admin-genre-actions">
                                            <button
                                                type="button"
                                                className="edit"
                                                title="Chỉnh sửa"
                                                onClick={() =>
                                                    handleOpenEdit(genre)
                                                }
                                            >
                                                <i className="bi bi-pencil-square"></i>
                                            </button>

                                            <button
                                                type="button"
                                                className="delete"
                                                title="Xóa thể loại"
                                                onClick={() =>
                                                    handleDelete(genre)
                                                }
                                            >
                                                <i className="bi bi-trash3"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredGenres.length === 0 && (
                        <div className="admin-genres-empty">
                            <i className="bi bi-tags"></i>

                            <h5>Không tìm thấy thể loại</h5>

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

            {/* Modal */}
            {isModalOpen && (
                <div
                    className="admin-genre-modal-overlay"
                    onClick={handleCloseModal}
                >
                    <div
                        className="admin-genre-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="adminGenreModalTitle"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="admin-genre-modal-header">
                            <div>
                                <h4 id="adminGenreModalTitle">
                                    {editingGenre
                                        ? "Chỉnh sửa thể loại"
                                        : "Thêm thể loại mới"}
                                </h4>

                                <p>
                                    Nhập thông tin thể loại bên dưới.
                                </p>
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
                            className="admin-genre-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="admin-genre-form-group">
                                <label htmlFor="genreName">
                                    Tên thể loại *
                                </label>

                                <input
                                    id="genreName"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Ví dụ: Hành động..."
                                    required
                                />
                            </div>

                            <div className="admin-genre-form-group">
                                <label htmlFor="genreDescription">
                                    Mô tả
                                </label>

                                <textarea
                                    id="genreDescription"
                                    name="description"
                                    rows="4"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Nhập mô tả thể loại..."
                                />
                            </div>

                            <div className="admin-genre-form-group">
                                <label htmlFor="genreStatusForm">
                                    Trạng thái
                                </label>

                                <select
                                    id="genreStatusForm"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    {STATUS_OPTIONS.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="admin-genre-form-footer">
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

                                    {editingGenre
                                        ? "Lưu thay đổi"
                                        : "Thêm thể loại"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default AdminGenres;
