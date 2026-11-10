
const movies = [
    {
        id: 1,
        title: "Người Nhện: Trở Về Nhà",
        poster: "https://upload.wikimedia.org/wikipedia/vi/d/d0/Spider-Man-_Homecoming.JPG?utm_source=vi.wikipedia.org&utm_campaign=index&utm_content=original",
        trailerUrl: "/trailers/Nguoi_Nhen_Tro_Ve_Nha.mp4",
        genres: ["Hành động", "Viễn tưởng"],
        duration: 125,
        rating: 8.5,
        ageRating: "T16",
        country: "Mỹ",
        status: "Đang chiếu"
    },
    {
        id: 2,
        title: "Nobita và nước Nhật thời nguyên thủy",
        poster: "https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m26wlcsx1ub6db_tn",
        trailerUrl: "/trailers/Nobita_Va_Nuoc_Nhat_Thoi_Nguyen_Thuy.mp4",
        genres: ["Hoạt hình", "Phiêu lưu" ,"Bí ẩn"],
        duration: 110,
        rating: 8.2,
        ageRating: "T18",
        country: "Nhật Bản",
        status: "Đang chiếu"
    },
    {
        id: 3,
        title: "Ngôi sao năm cánh 1 triệu đô",
        poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKcJEnA2qNi0cup3XJ_anNADZc_tu3WVJ-49Tqc0zL1TBhOP8g6EOEyA6V&s=10",
        trailerUrl: "",
        genres: ["Trinh thám", "Hoạt hình"],
        duration: 105,
        rating: 9.2,
        ageRating: "T13",
        country: "Việt Nam",
        status: "Sắp chiếu"
    },
    {
        id: 4,
        title: "Chú hề ma quái - 02",
        poster: "data:image/jpeg;base64,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",
        trailerUrl: "",
        genres: ["Khoa học", "Hành động"],
        duration: 135,
        rating: 8.7,
        ageRating: "T16",
        country: "Nhật Bản",
        status: "Đang chiếu"
    },
    {
        id: 5,
        title: "Thành Phố Tương Lai",
        poster: "https://i.pinimg.com/736x/b4/a4/8f/b4a48fd735425954e0d1c145c1443f99.jpg",
        trailerUrl: "",
        genres: ["Hành động" , "Hoạt Hình"],
        duration: 135,
        rating: 8.7,
        ageRating: "T16",
        country: "Nhật Bản",
        status: "Đang chiếu"
    }
];

export default movies;
