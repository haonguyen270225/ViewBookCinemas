
import { useEffect, useMemo, useState } from "react";

import { getCinemas } from "../../../services/cinemaService.js";
import { getRooms } from "../../../services/roomService.js";

import {
    getSeats,
    getSeatTypes,
    updateSeat
} from "../../../services/seatService.js";

import "./AdminSeats.css";

function AdminSeats() {
    const [cinemas, setCinemas] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [seats, setSeats] = useState([]);
    const [seatTypes, setSeatTypes] = useState([]);

    const [selectedCinemaId, setSelectedCinemaId] = useState("");
    const [selectedRoomId, setSelectedRoomId] = useState("");

    const [selectedSeat, setSelectedSeat] = useState(null);
    const [formData, setFormData] = useState({
        seatTypeId: "",
        status: "Active"
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    // Tải dữ liệu
    const loadData = async () => {
        setIsLoading(true);
        setError("");

        try {
            const [
                cinemasData,
                roomsData,
                seatsData,
                seatTypesData
            ] = await Promise.all([
                getCinemas(),
                getRooms(),
                getSeats(),
                getSeatTypes()
            ]);

            setCinemas(cinemasData);
            setRooms(roomsData);
            setSeats(seatsData);
            setSeatTypes(seatTypesData);

            if (cinemasData.length > 0) {
                const firstCinemaId = String(cinemasData[0].id);

                setSelectedCinemaId(firstCinemaId);

                const firstRoom = roomsData.find(
                    (room) =>
                        String(room.cinemaId) === firstCinemaId
                );

                setSelectedRoomId(
                    firstRoom ? String(firstRoom.roomId) : ""
                );
            }
        } catch (error) {
            console.error("Không thể tải dữ liệu ghế:", error);

            setError(
                error.message || "Không thể tải dữ liệu ghế."
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Lấy phòng thuộc rạp được chọn
    const filteredRooms = useMemo(() => {
        return rooms.filter(
            (room) =>
                String(room.cinemaId) === selectedCinemaId
        );
    }, [rooms, selectedCinemaId]);

    // Lấy phòng đang chọn
    const selectedRoom = useMemo(() => {
        return rooms.find(
            (room) => String(room.roomId) === selectedRoomId
        ) || null;
    }, [rooms, selectedRoomId]);

    // Lấy ghế thuộc phòng
    const roomSeats = useMemo(() => {
        return seats
            .filter(
                (seat) =>
                    String(seat.roomId) === selectedRoomId
            )
            .sort((a, b) => {
                if (a.seatRow !== b.seatRow) {
                    return a.seatRow.localeCompare(b.seatRow);
                }

                return a.seatNumber - b.seatNumber;
            });
    }, [seats, selectedRoomId]);

    // Thống kê
    const statistics = useMemo(() => ({
        total: roomSeats.length,

        active: roomSeats.filter(
            (seat) => seat.status === "Active"
        ).length,

        inactive: roomSeats.filter(
            (seat) => seat.status !== "Active"
        ).length
    }), [roomSeats]);

    // Nhóm ghế theo hàng
    const seatRows = useMemo(() => {
        const rows = {};

        roomSeats.forEach((seat) => {
            if (!rows[seat.seatRow]) {
                rows[seat.seatRow] = [];
            }

            rows[seat.seatRow].push(seat);
        });

        return Object.entries(rows);
    }, [roomSeats]);

    // Thay đổi rạp
    const handleCinemaChange = (event) => {
        const cinemaId = event.target.value;

        setSelectedCinemaId(cinemaId);

        const firstRoom = rooms.find(
            (room) => String(room.cinemaId) === cinemaId
        );

        setSelectedRoomId(
            firstRoom ? String(firstRoom.roomId) : ""
        );

        setSelectedSeat(null);
    };

    // Chọn ghế
    const handleSelectSeat = (seat) => {
        setSelectedSeat(seat);

        setFormData({
            seatTypeId: String(seat.seatTypeId),
            status: seat.status
        });
    };

    // Cập nhật form
    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value
        }));
    };

    // Lưu ghế
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!selectedSeat) return;

        setIsSaving(true);

        try {
            const updatedSeat = await updateSeat(
                selectedSeat.seatId,
                {
                    seatTypeId: Number(formData.seatTypeId),
                    status: formData.status
                }
            );

            setSeats((current) =>
                current.map((seat) =>
                    String(seat.seatId) ===
                    String(updatedSeat.seatId)
                        ? updatedSeat
                        : seat
                )
            );

            setSelectedSeat(updatedSeat);
            alert("Cập nhật thông tin ghế thành công.");
        } catch (error) {
            console.error("Không thể cập nhật ghế:", error);

            alert(error.message || "Không thể cập nhật ghế.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="admin-seats">
                <div className="admin-seats-empty">
                    <i className="bi bi-hourglass-split"></i>
                    <h5>Đang tải dữ liệu ghế...</h5>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-seats">
                <div className="admin-seats-empty">
                    <i className="bi bi-exclamation-circle"></i>
                    <h5>Không thể tải dữ liệu ghế</h5>
                    <p>{error}</p>
                    <button type="button" onClick={loadData}>
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-seats">
            <div className="admin-page-intro">
                <div>
                    <h3>Quản lý ghế ngồi</h3>
                    <p>
                        Quản lý sơ đồ, loại ghế và trạng thái ghế
                        trong từng phòng chiếu.
                    </p>
                </div>
            </div>

            {/* Bộ lọc rạp và phòng */}
            <section className="admin-panel admin-seats-filter">
                <div>
                    <label htmlFor="seatCinema">Rạp chiếu</label>
                    <select
                        id="seatCinema"
                        value={selectedCinemaId}
                        onChange={handleCinemaChange}
                    >
                        {cinemas.map((cinema) => (
                            <option
                                key={cinema.id}
                                value={String(cinema.id)}
                            >
                                {cinema.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="seatRoom">Phòng chiếu</label>
                    <select
                        id="seatRoom"
                        value={selectedRoomId}
                        onChange={(event) => {
                            setSelectedRoomId(event.target.value);
                            setSelectedSeat(null);
                        }}
                    >
                        {filteredRooms.map((room) => (
                            <option
                                key={room.roomId}
                                value={String(room.roomId)}
                            >
                                {room.roomName} - {room.roomType}
                            </option>
                        ))}
                    </select>
                </div>
            </section>

            {selectedRoom ? (
                <>
                    {/* Thống kê */}
                    <div className="admin-seats-statistics">
                        <div className="admin-seat-stat-card">
                            <span>Tổng số ghế</span>
                            <strong>{statistics.total}</strong>
                        </div>

                        <div className="admin-seat-stat-card">
                            <span>Đang hoạt động</span>
                            <strong>{statistics.active}</strong>
                        </div>

                        <div className="admin-seat-stat-card">
                            <span>Ngừng hoạt động</span>
                            <strong>{statistics.inactive}</strong>
                        </div>
                    </div>

                    <div className="admin-seats-layout">
                        {/* Sơ đồ ghế */}
                        <section className="admin-panel admin-seats-map-panel">
                            <div className="admin-seats-heading">
                                <div>
                                    <h5>{selectedRoom.roomName}</h5>
                                    <p>
                                        {selectedRoom.roomType} ·{" "}
                                        {selectedRoom.capacity} ghế
                                    </p>
                                </div>
                            </div>

                            <div className="admin-seats-screen">
                                <i className="bi bi-display"></i>
                                MÀN HÌNH
                            </div>

                            <div className="admin-seats-map">
                                {seatRows.map(([row, rowSeats]) => (
                                    <div
                                        className="admin-seat-row"
                                        key={row}
                                    >
                                        <span>{row}</span>

                                        <div className="admin-seat-row-list">
                                            {rowSeats.map((seat) => {
                                                const seatType =
                                                    seatTypes.find(
                                                        (type) =>
                                                            Number(type.seatTypeId) ===
                                                            Number(seat.seatTypeId)
                                                    );

                                                const typeClass =
                                                    seatType?.seatTypeName === "Ghế VIP"
                                                        ? "vip"
                                                        : seatType?.seatTypeName === "Ghế đôi"
                                                            ? "couple"
                                                            : "standard";

                                                return (
                                                    <button
                                                        type="button"
                                                        key={seat.seatId}
                                                        className={[
                                                            "admin-seat-item",
                                                            typeClass,
                                                            seat.status === "Inactive"
                                                                ? "inactive"
                                                                : "",
                                                            selectedSeat?.seatId === seat.seatId
                                                                ? "selected"
                                                                : ""
                                                        ].join(" ")}
                                                        onClick={() =>
                                                            handleSelectSeat(seat)
                                                        }
                                                        title={`${seat.seatCode} - ${seatType?.seatTypeName || "Không xác định"}`}
                                                    >
                                                        {seat.seatNumber}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <span>{row}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="admin-seats-legend">
                                <span>
                                    <i className="standard"></i>
                                    Ghế thường
                                </span>
                                <span>
                                    <i className="vip"></i>
                                    Ghế VIP
                                </span>
                                <span>
                                    <i className="couple"></i>
                                    Ghế đôi
                                </span>
                                <span>
                                    <i className="inactive"></i>
                                    Ngừng hoạt động
                                </span>
                                <span>
                                    <i className="selected"></i>
                                    Đang chọn
                                </span>
                            </div>
                        </section>

                        {/* Thông tin ghế */}
                        <section className="admin-panel admin-seat-detail">
                            <h5>Thông tin ghế</h5>

                            {selectedSeat ? (
                                <form onSubmit={handleSubmit}>
                                    <div className="admin-seat-code">
                                        <span>Mã ghế</span>
                                        <strong>{selectedSeat.seatCode}</strong>
                                    </div>

                                    <div className="admin-seat-detail-group">
                                        <label htmlFor="seatType">
                                            Loại ghế
                                        </label>
                                        <select
                                            id="seatType"
                                            name="seatTypeId"
                                            value={formData.seatTypeId}
                                            onChange={handleChange}
                                        >
                                            {seatTypes.map((type) => (
                                                <option
                                                    key={type.seatTypeId}
                                                    value={String(type.seatTypeId)}
                                                >
                                                    {type.seatTypeName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="admin-seat-detail-group">
                                        <label htmlFor="seatStatus">
                                            Trạng thái
                                        </label>
                                        <select
                                            id="seatStatus"
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                        >
                                            <option value="Active">
                                                Đang hoạt động
                                            </option>
                                            <option value="Inactive">
                                                Ngừng hoạt động
                                            </option>
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                    >
                                        <i className="bi bi-check-lg"></i>
                                        {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                                    </button>
                                </form>
                            ) : (
                                <div className="admin-seat-detail-empty">
                                    <i className="bi bi-cursor"></i>
                                    <p>
                                        Chọn một ghế trên sơ đồ để xem
                                        và chỉnh sửa thông tin.
                                    </p>
                                </div>
                            )}
                        </section>
                    </div>
                </>
            ) : (
                <div className="admin-panel admin-seats-empty">
                    <i className="bi bi-grid-3x3"></i>
                    <h5>Chưa có phòng chiếu</h5>
                    <p>Rạp này chưa có phòng chiếu để quản lý ghế.</p>
                </div>
            )}
        </div>
    );
}

export default AdminSeats;
