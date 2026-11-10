
//=================== Dữ liệu phim mẫu cho ViewBookCinemas ========================

// Lưu ý:
// - Đây là dữ liệu demo để xây dựng giao diện Frontend.
// - Khi có Backend, dữ liệu này sẽ được thay thế bằng dữ liệu từ API.
// - trailerUrl dành cho đường dẫn MP4 trực tiếp.
// - trailerPageUrl là đường dẫn đến video tham khảo trên Pexels.

export const featuredMovies = [
    {
        id: 1,
        title: "Người Nhện: Trở Về Nhà",
        slug: "nguoi-nhen-tro-ve-nha",
        description:
            "Một hành trình khám phá những bí mật bị chôn giấu, nơi lòng dũng cảm và niềm tin quyết định số phận của tất cả.",

        posterUrl:
            "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=85",

        backdropUrl:
            "https://upload.wikimedia.org/wikipedia/vi/d/d0/Spider-Man-_Homecoming.JPG?utm_source=vi.wikipedia.org&utm_campaign=index&utm_content=original",

        trailerUrl: null,

        trailerPageUrl:
            "/trailers/Nguoi_Nhen_Tro_Ve_Nha.mp4",

        releaseDate: "2026-10-15",
        durationMinutes: 125,
        ageRating: "T16",

        language: "Tiếng Việt",
        subtitle: "Phụ đề tiếng Việt",

        genres: ["Phiêu lưu", "Hành động", "Khoa học viễn tưởng"],

        rating: 8.8,
        status: "NOW_SHOWING",

        isFeatured: true,
        displayOrder: 1
    },

    {
        id: 2,
        title: "Nobita và nước Nhật thời nguyên thủy",
        slug: "nobita-va-nuoc-nhat-thoi-nguyen-thuy",
        description:
            "Giữa thành phố rộng lớn, một câu chuyện bí ẩn dần được hé lộ qua những cuộc gặp gỡ tưởng chừng như ngẫu nhiên.",

        posterUrl:
            "https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m26wlcsx1ub6db_tn",

        backdropUrl:
            "https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m26wlcsx1ub6db_tn",

        trailerUrl: null,

        trailerPageUrl:
            "https://www.pexels.com/video/people-watching-in-theater-while-eating-popcorn-7985886/",

        releaseDate: "2026-10-22",
        durationMinutes: 112,
        ageRating: "T13",

        language: "Tiếng Việt",
        subtitle: "Phụ đề tiếng Việt",

        genres: ["Tâm lý", "Bí ẩn", "Tình cảm"],

        rating: 8.5,
        status: "NOW_SHOWING",

        isFeatured: true,
        displayOrder: 2
    },

    {
        id: 3,
        title: "Ngày Cuối Cùng",
        slug: "ngay-cuoi-cung",
        description:
            "Khi thời gian không còn nhiều, những lựa chọn khó khăn nhất cũng trở thành cơ hội để thay đổi mọi thứ.",

        posterUrl:
            "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=85",

        backdropUrl:
            "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920&q=85",

        trailerUrl: null,

        trailerPageUrl:
            "https://www.pexels.com/video/friends-watching-movie-in-the-cinema-7233478/",

        releaseDate: "2026-11-20",
        durationMinutes: 135,
        ageRating: "T16",

        language: "Tiếng Việt",
        subtitle: "Phụ đề tiếng Việt",

        genres: ["Hành động", "Tâm lý", "Kịch tính"],

        rating: 9.0,
        status: "COMING_SOON",

        isFeatured: true,
        displayOrder: 3
    }
];

//=================== Xuất dữ liệu mặc định ========================

export default featuredMovies;
