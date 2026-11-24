
import { useEffect, useMemo, useState } from "react";

import {
    getRooms,
    createRoom,
    updateRoom,
    deleteRoom
} from "../../../services/roomService.js";

import { getCinemas } from "../../../services/cinemaService.js";

import "./AdminRooms.css";

const ROOM_TYPE_OPTIONS = [
    { value: "Standard", label: "Phòng thường", capacity: 100 },
    { value: "VIP", label: "Phòng VIP", capacity: 80 },
    { value: "IMAX", label: "Phòng IMAX", capacity: 150 }
];

const STATUS_OPTIONS = [
    { value: "Active", label: "Đang hoạt động" },
    { value: "Inactive", label: "Ngừng hoạt động" }
];

const EMPTY_FORM = {
    cinemaId: "",
    roomName: "",
    roomType: "Standard",
    capacity: 100,
    status: "Active"
};

const getRoomTypeLabel = (roomType) => {
    const option = ROOM_TYPE_OPTIONS.find(
        (item) => item.value === roomType
    );

    return option?.label || roomType;
};

const getRoomCapacity = (roomType) => {
    const option = ROOM_TYPE_OPTIONS.find(
        (item) => item.value === roomType
    );

    return option?.capacity || 100;
};

const getStatusLabel = (status) => {
    return status === "Active"
        ? "Đang hoạt động"
        : "Ngừng hoạt động";
};

function AdminRooms() {
    const [rooms, setRooms] = useState([]);
    const [cinemas, setCinemas] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingRoomId, setDeletingRoomId] = useState(null);

    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCinema, setSelectedCinema] = useState("Tất cả");
    const [selectedType, setSelectedType] = useState("Tất cả");
    const [selectedStatus, setSelectedStatus] = useState("Tất cả");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [formData, setFormData] = useState({ ...EMPTY_FORM });

    // Tải dữ liệu phòng và rạp
    const loadData = async () => {
        setIsLoading(true);
        setError("");

        try {
            const [roomsData, cinemasData] = await Promise.all([
                getRooms(),
                getCinemas()
            ]);

            setRooms(roomsData);
            setCinemas(cinemasData);
        } catch (error) {
            console.error("Không thể tải dữ liệu phòng chiếu:", error);

            setError(
                error.message || "Không thể tải dữ liệu phòng chiếu."
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Chỉ hiển thị những rạp đang hoạt động trong form
    const activeCinemas = useMemo(() => {
        return cinemas.filter(
            (cinema) => cinema.status === "Active"
        );
    }, [cinemas]);

    // Thống kê phòng chiếu
    const statistics = useMemo(() => ({
        total: rooms.length,

        active: rooms.filter(
            (room) => room.status === "Active"
        ).length,

        inactive: rooms.filter(
            (room) => room.status !== "Active"
        ).length,

        capacity: rooms.reduce(
            (total, room) => total + (Number(room.capacity) || 0),
            0
        )
    }), [rooms]);

    // Tìm kiếm và lọc phòng chiếu
    const filteredRooms = useMemo(() => {
        const keyword = searchTerm.trim().toLocaleLowerCase("vi");

        return rooms.filter((room) => {
            const cinema = cinemas.find(
                (item) => String(item.id) === String(room.cinemaId)
            );

            const matchesSearch =
                !keyword ||
                (room.roomName || "")
                    .toLocaleLowerCase("vi")
                    .includes(keyword) ||
                (cinema?.name || "")
                    .toLocaleLowerCase("vi")
                    .includes(keyword);

            const matchesCinema =
                selectedCinema === "Tất cả" ||
                String(room.cinemaId) === selectedCinema;

            const matchesType =
                selectedType === "Tất cả" ||
                room.roomType === selectedType;

            const matchesStatus =
                selectedStatus === "Tất cả" ||
                room.status === selectedStatus;

            return (
                matchesSearch &&
                matchesCinema &&
                matchesType &&
                matchesStatus
            );
        });
    }, [
        rooms,
        cinemas,
        searchTerm,
        selectedCinema,
        selectedType,
        selectedStatus
    ]);

    // Mở form thêm phòng
    const handleOpenCreate = () => {
        setEditingRoom(null);

        setFormData({
            ...EMPTY_FORM,
            cinemaId: activeCinemas.length > 0
                ? String(activeCinemas[0].id)
                : ""
        });

        setIsModalOpen(true);
    };

    // Mở form chỉnh sửa phòng
    const handleOpenEdit = (room) => {
        setEditingRoom(room);

        setFormData({
            cinemaId: String(room.cinemaId),
            roomName: room.roomName || "",
            roomType: room.roomType || "Standard",
            capacity: getRoomCapacity(room.roomType || "Standard"),
            status: room.status || "Active"
        });

        setIsModalOpen(true);
    };

    // Đóng form
    const handleCloseModal = () => {
        if (isSaving) return;

        setIsModalOpen(false);
        setEditingRoom(null);
        setFormData({ ...EMPTY_FORM });
    };

    // Cập nhật form
    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((current) => {
            if (name === "roomType") {
                return {
                    ...current,
                    roomType: value,
                    capacity: getRoomCapacity(value)
                };
            }

            return {
                ...current,
                [name]: value
            };
        });
    };

    // Thêm hoặc cập nhật phòng
    const handleSubmit = async (event) => {
        event.preventDefault();

        const roomName = formData.roomName.trim();
        const cinemaId = Number(formData.cinemaId);
        const capacity = getRoomCapacity(formData.roomType);

        if (!roomName || !Number.isInteger(cinemaId) || cinemaId <= 0) {
            alert("Vui lòng chọn rạp và nhập tên phòng.");
            return;
        }

        const selectedRoomType = ROOM_TYPE_OPTIONS.some(
            (item) => item.value === formData.roomType
        );

        if (!selectedRoomType) {
            alert("Loại phòng chiếu không hợp lệ.");
            return;
        }

        // Kiểm tra rạp được chọn
        const selectedCinemaExists = activeCinemas.some(
            (cinema) => Number(cinema.id) === cinemaId
        );

        // Cho phép giữ nguyên rạp hiện tại nếu rạp đã ngừng hoạt động
        const currentCinemaExists =
            editingRoom &&
            String(editingRoom.cinemaId) === String(cinemaId) &&
            cinemas.some(
                (cinema) => String(cinema.id) === String(cinemaId)
            );

        if (!selectedCinemaExists && !currentCinemaExists) {
            alert("Vui lòng chọn một rạp đang hoạt động.");
            return;
        }

        // Kiểm tra tên phòng trùng trong cùng một rạp
        const normalizedName = roomName
            .normalize("NFC")
            .toLocaleLowerCase("vi");

        const isDuplicate = rooms.some((room) => {
            const currentName = (room.roomName || "")
                .normalize("NFC")
                .toLocaleLowerCase("vi");

            return (
                Number(room.cinemaId) === cinemaId &&
                currentName === normalizedName &&
                String(room.roomId) !== String(editingRoom?.roomId)
            );
        });

        if (isDuplicate) {
            alert("Tên phòng đã tồn tại trong rạp này.");
            return;
        }

        const roomData = {
            cinemaId,
            roomName,
            roomType: formData.roomType,
            capacity,
            status: formData.status
        };

        setIsSaving(true);

        try {
            if (editingRoom) {
                const updatedRoom = await updateRoom(
                    editingRoom.roomId,
                    roomData
                );

                setRooms((current) =>
                    current.map((room) =>
                        String(room.roomId) === String(updatedRoom.roomId)
                            ? updatedRoom
                            : room
                    )
                );
            } else {
                const newRoom = await createRoom(roomData);

                setRooms((current) => [...current, newRoom]);
            }

            setIsModalOpen(false);
            setEditingRoom(null);
            setFormData({ ...EMPTY_FORM });
        } catch (error) {
            console.error("Không thể lưu phòng chiếu:", error);

            alert(error.message || "Không thể lưu phòng chiếu.");
        } finally {
            setIsSaving(false);
        }
    };

    // Xóa phòng
    const handleDelete = async (room) => {
        if (isSaving || deletingRoomId !== null) return;

        const confirmed = window.confirm(
            `Bạn có chắc chắn muốn xóa "${room.roomName}" không?`
        );

        if (!confirmed) return;

        setDeletingRoomId(room.roomId);

        try {
            await deleteRoom(room.roomId);

            setRooms((current) =>
                current.filter(
                    (item) => String(item.roomId) !== String(room.roomId)
                )
            );
        } catch (error) {
            console.error("Không thể xóa phòng chiếu:", error);

            alert(error.message || "Không thể xóa phòng chiếu.");
        } finally {
            setDeletingRoomId(null);
        }
    };

    // Xóa bộ lọc
    const handleClearFilters = () => {
        setSearchTerm("");
        setSelectedCinema("Tất cả");
        setSelectedType("Tất cả");
        setSelectedStatus("Tất cả");
    };

    // Trạng thái tải dữ liệu
    if (isLoading) {
        return (
            <div className="admin-rooms">
                <div className="admin-rooms-empty">
                    <i className="bi bi-hourglass-split"></i>
                    <h5>Đang tải danh sách phòng chiếu...</h5>
                </div>
            </div>
        );
    }

    // Trạng thái lỗi
    if (error) {
        return (
            <div className="admin-rooms">
                <div className="admin-rooms-empty">
                    <i className="bi bi-exclamation-circle"></i>
                    <h5>Không thể tải danh sách phòng</h5>
                    <p>{error}</p>

                    <button type="button" onClick={loadData}>
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-rooms">
            {/* Tiêu đề */}
            <div className="admin-page-intro admin-rooms-intro">
                <div>
                    <h3>Quản lý phòng chiếu</h3>
                    <p>
                        Quản lý phòng chiếu và sức chứa tại các rạp
                        ViewBookCinemas.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-rooms-add-button"
                    onClick={handleOpenCreate}
                    disabled={activeCinemas.length === 0}
                >
                    <i className="bi bi-plus-lg"></i>
                    Thêm phòng mới
                </button>
            </div>

            {/* Thống kê */}
            <div className="admin-rooms-statistics">
                <div className="admin-room-stat-card">
                    <div className="admin-room-stat-icon blue">
                        <i className="bi bi-display"></i>
                    </div>
                    <div>
                        <span>Tổng số phòng</span>
                        <strong>{statistics.total}</strong>
                    </div>
                </div>

                <div className="admin-room-stat-card">
                    <div className="admin-room-stat-icon green">
                        <i className="bi bi-check-circle"></i>
                    </div>
                    <div>
                        <span>Đang hoạt động</span>
                        <strong>{statistics.active}</strong>
                    </div>
                </div>

                <div className="admin-room-stat-card">
                    <div className="admin-room-stat-icon gray">
                        <i className="bi bi-pause-circle"></i>
                    </div>
                    <div>
                        <span>Ngừng hoạt động</span>
                        <strong>{statistics.inactive}</strong>
                    </div>
                </div>

                <div className="admin-room-stat-card">
                    <div className="admin-room-stat-icon orange">
                        <i className="bi bi-people"></i>
                    </div>
                    <div>
                        <span>Tổng sức chứa</span>
                        <strong>
                            {statistics.capacity.toLocaleString("vi-VN")}
                        </strong>
                    </div>
                </div>
            </div>

            {/* Danh sách phòng */}
            <section className="admin-panel admin-rooms-panel">
                <div className="admin-rooms-toolbar">
                    <div className="admin-rooms-search">
                        <i className="bi bi-search"></i>
                        <input
                            type="search"
                            placeholder="Tìm tên phòng hoặc tên rạp..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                        />
                    </div>

                    <select
                        aria-label="Lọc theo rạp"
                        value={selectedCinema}
                        onChange={(event) => setSelectedCinema(event.target.value)}
                    >
                        <option value="Tất cả">Tất cả rạp</option>
                        {cinemas.map((cinema) => (
                            <option key={cinema.id} value={String(cinema.id)}>
                                {cinema.name}
                            </option>
                        ))}
                    </select>

                    <select
                        aria-label="Lọc theo loại phòng"
                        value={selectedType}
                        onChange={(event) => setSelectedType(event.target.value)}
                    >
                        <option value="Tất cả">Tất cả loại phòng</option>
                        {ROOM_TYPE_OPTIONS.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>

                    <select
                        aria-label="Lọc theo trạng thái"
                        value={selectedStatus}
                        onChange={(event) => setSelectedStatus(event.target.value)}
                    >
                        <option value="Tất cả">Tất cả trạng thái</option>
                        {STATUS_OPTIONS.map((status) => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        className="admin-rooms-reset-button"
                        onClick={handleClearFilters}
                        title="Xóa bộ lọc"
                    >
                        <i className="bi bi-arrow-counterclockwise"></i>
                    </button>
                </div>

                <div className="admin-rooms-list-heading">
                    <div>
                        <h5>Danh sách phòng chiếu</h5>
                        <p>Thông tin phòng chiếu theo từng rạp</p>
                    </div>

                    <span>
                        Hiển thị <strong>{filteredRooms.length}</strong> /{" "}
                        {rooms.length} phòng
                    </span>
                </div>

                <div className="admin-table-wrapper">
                    <table className="admin-table admin-rooms-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>TÊN PHÒNG</th>
                                <th>RẠP CHIẾU</th>
                                <th>LOẠI PHÒNG</th>
                                <th>SỨC CHỨA</th>
                                <th>TRẠNG THÁI</th>
                                <th>THAO TÁC</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredRooms.map((room, index) => {
                                const cinema = cinemas.find(
                                    (item) =>
                                        String(item.id) === String(room.cinemaId)
                                );

                                return (
                                    <tr key={room.roomId}>
                                        <td>{index + 1}</td>

                                        <td>
                                            <div className="admin-room-name">
                                                <div className="admin-room-name-icon">
                                                    <i className="bi bi-display"></i>
                                                </div>
                                                <strong>{room.roomName}</strong>
                                            </div>
                                        </td>

                                        <td>
                                            <div className="admin-room-cinema">
                                                <strong>
                                                    {cinema?.name || "Không xác định"}
                                                </strong>
                                                <span>
                                                    {cinema?.province || ""}
                                                </span>
                                            </div>
                                        </td>

                                        <td>
                                            <span
                                                className={`admin-room-type ${room.roomType?.toLowerCase()}`}
                                            >
                                                {getRoomTypeLabel(room.roomType)}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="admin-room-capacity">
                                                <i className="bi bi-people"></i>
                                                {room.capacity} ghế
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                className={`admin-room-status ${
                                                    room.status === "Active"
                                                        ? "active"
                                                        : "inactive"
                                                }`}
                                            >
                                                {getStatusLabel(room.status)}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="admin-room-actions">
                                                <button
                                                    type="button"
                                                    className="edit"
                                                    title="Chỉnh sửa"
                                                    onClick={() => handleOpenEdit(room)}
                                                    disabled={deletingRoomId !== null}
                                                >
                                                    <i className="bi bi-pencil-square"></i>
                                                </button>

                                                <button
                                                    type="button"
                                                    className="delete"
                                                    title="Xóa phòng"
                                                    onClick={() => handleDelete(room)}
                                                    disabled={
                                                        deletingRoomId !== null ||
                                                        isSaving
                                                    }
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

                    {filteredRooms.length === 0 && (
                        <div className="admin-rooms-empty">
                            <i className="bi bi-display"></i>
                            <h5>Không tìm thấy phòng chiếu</h5>
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

            {/* Modal thêm / chỉnh sửa */}
            {isModalOpen && (
                <div
                    className="admin-room-modal-overlay"
                    onClick={handleCloseModal}
                >
                    <div
                        className="admin-room-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="adminRoomModalTitle"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="admin-room-modal-header">
                            <div>
                                <h4 id="adminRoomModalTitle">
                                    {editingRoom
                                        ? "Chỉnh sửa phòng chiếu"
                                        : "Thêm phòng chiếu mới"}
                                </h4>
                                <p>Nhập thông tin phòng chiếu bên dưới.</p>
                            </div>

                            <button
                                type="button"
                                onClick={handleCloseModal}
                                aria-label="Đóng"
                                disabled={isSaving}
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <form
                            className="admin-room-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="admin-room-form-grid">
                                <div className="admin-room-form-group full">
                                    <label htmlFor="roomCinema">
                                        Rạp chiếu *
                                    </label>
                                    <select
                                        id="roomCinema"
                                        name="cinemaId"
                                        value={formData.cinemaId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Chọn rạp chiếu</option>

                                        {activeCinemas.map((cinema) => (
                                            <option
                                                key={cinema.id}
                                                value={String(cinema.id)}
                                            >
                                                {cinema.name} - {cinema.province}
                                            </option>
                                        ))}

                                        {editingRoom &&
                                            !activeCinemas.some(
                                                (cinema) =>
                                                    String(cinema.id) ===
                                                    String(editingRoom.cinemaId)
                                            ) && (
                                                <option
                                                    value={String(editingRoom.cinemaId)}
                                                >
                                                    Rạp hiện tại (đã ngừng hoạt động)
                                                </option>
                                            )}
                                    </select>
                                </div>

                                <div className="admin-room-form-group">
                                    <label htmlFor="roomName">Tên phòng *</label>
                                    <input
                                        id="roomName"
                                        name="roomName"
                                        value={formData.roomName}
                                        onChange={handleChange}
                                        placeholder="Ví dụ: Phòng 01"
                                        required
                                    />
                                </div>

                                <div className="admin-room-form-group">
                                    <label htmlFor="roomType">
                                        Loại phòng *
                                    </label>
                                    <select
                                        id="roomType"
                                        name="roomType"
                                        value={formData.roomType}
                                        onChange={handleChange}
                                        required
                                    >
                                        {ROOM_TYPE_OPTIONS.map((type) => (
                                            <option
                                                key={type.value}
                                                value={type.value}
                                            >
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="admin-room-form-group">
                                    <label htmlFor="roomCapacity">
                                        Sức chứa (ghế)
                                    </label>
                                    <input
                                        id="roomCapacity"
                                        name="capacity"
                                        type="number"
                                        value={formData.capacity}
                                        readOnly
                                    />
                                    <small>
                                        Sức chứa được xác định tự động theo loại phòng.
                                    </small>
                                </div>

                                <div className="admin-room-form-group">
                                    <label htmlFor="roomStatus">
                                        Trạng thái
                                    </label>
                                    <select
                                        id="roomStatus"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        {STATUS_OPTIONS.map((status) => (
                                            <option
                                                key={status.value}
                                                value={status.value}
                                            >
                                                {status.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="admin-room-form-footer">
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
                                        : editingRoom
                                            ? "Lưu thay đổi"
                                            : "Thêm phòng"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminRooms;
