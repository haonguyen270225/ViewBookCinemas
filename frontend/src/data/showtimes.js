
//=================== Hàm tạo ngày chiếu mẫu ========================

const getDateOffset = (offset) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

//=================== Danh sách rạp chiếu mẫu ========================

export const cinemas = [
    {
        id: 1,
        name: "ViewBookCinemas - Cần Thơ",
        address: "Địa chỉ cụ thể của rạp, Ninh Kiều, Cần Thơ, Việt Nam"
    },
    {
        id: 2,
        name: "ViewBookCinemas - TP. Hồ Chí Minh",
        address: "Địa chỉ cụ thể của rạp, Quận 1, TP. Hồ Chí Minh, Việt Nam"
    }
];

//=================== Danh sách lịch chiếu mẫu ========================

export const showtimes = [
    {
        id: 1,
        movieId: 1,
        cinemaId: 1,
        roomName: "Phòng 01",
        movieVersion: "2D - Phụ đề Việt",
        startTime: `${getDateOffset(0)}T09:00:00`,
        endTime: `${getDateOffset(0)}T11:05:00`,
        basePrice: 75000,
        status: "Scheduled"
    },
    {
        id: 2,
        movieId: 1,
        cinemaId: 1,
        roomName: "Phòng 02",
        movieVersion: "2D - Lồng tiếng Việt",
        startTime: `${getDateOffset(0)}T13:30:00`,
        endTime: `${getDateOffset(0)}T15:35:00`,
        basePrice: 85000,
        status: "Scheduled"
    },
    {
        id: 3,
        movieId: 2,
        cinemaId: 1,
        roomName: "Phòng 03",
        movieVersion: "2D - Phụ đề Việt",
        startTime: `${getDateOffset(0)}T18:00:00`,
        endTime: `${getDateOffset(0)}T19:50:00`,
        basePrice: 80000,
        status: "Scheduled"
    },
    {
        id: 4,
        movieId: 3,
        cinemaId: 1,
        roomName: "Phòng 01",
        movieVersion: "2D - Phụ đề Việt",
        startTime: `${getDateOffset(1)}T10:00:00`,
        endTime: `${getDateOffset(1)}T11:45:00`,
        basePrice: 75000,
        status: "Scheduled"
    },
    {
        id: 5,
        movieId: 4,
        cinemaId: 1,
        roomName: "Phòng 02",
        movieVersion: "2D - Phụ đề Việt",
        startTime: `${getDateOffset(1)}T19:30:00`,
        endTime: `${getDateOffset(1)}T21:45:00`,
        basePrice: 90000,
        status: "Scheduled"
    },
    {
        id: 6,
        movieId: 1,
        cinemaId: 2,
        roomName: "Phòng 05",
        movieVersion: "2D - Phụ đề Việt",
        startTime: `${getDateOffset(0)}T15:00:00`,
        endTime: `${getDateOffset(0)}T17:05:00`,
        basePrice: 95000,
        status: "Scheduled"
    },
    {
        id: 7,
        movieId: 2,
        cinemaId: 2,
        roomName: "Phòng 06",
        movieVersion: "2D - Phụ đề Việt",
        startTime: `${getDateOffset(1)}T20:00:00`,
        endTime: `${getDateOffset(1)}T21:50:00`,
        basePrice: 100000,
        status: "Scheduled"
    }
];
