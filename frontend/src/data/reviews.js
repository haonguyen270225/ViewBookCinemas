
//=================== Dữ liệu đánh giá phim mẫu ========================

const reviews = [
    //=================== Movie 1 ========================

    {
        id: 1,
        movieId: 1,
        authorId: "demo-user",
        userName: "Bạn",
        rating: 5,
        content: "Một bộ phim rất đáng xem. Nội dung hấp dẫn, diễn xuất tốt và các cảnh hành động được đầu tư.",
        createdAt: "2026-11-05T10:30:00"
    },
    {
        id: 2,
        movieId: 1,
        authorId: "user-002",
        userName: "Minh Anh",
        rating: 4,
        content: "Phim có nhịp độ tốt, nhiều phân cảnh thú vị. Mình khá hài lòng với trải nghiệm xem phim.",
        createdAt: "2026-11-06T14:20:00"
    },
    {
        id: 3,
        movieId: 1,
        authorId: "user-003",
        userName: "Hoàng Nam",
        rating: 5,
        content: "Hình ảnh đẹp, âm thanh tốt và nội dung cuốn hút từ đầu đến cuối.",
        createdAt: "2026-11-07T19:15:00"
    },

    //=================== Movie 2 ========================

    {
        id: 4,
        movieId: 2,
        authorId: "user-004",
        userName: "Thu Hà",
        rating: 5,
        content: "Một bộ phim hoạt hình rất dễ thương, phù hợp để xem cùng gia đình.",
        createdAt: "2026-11-06T09:00:00"
    },
    {
        id: 5,
        movieId: 2,
        authorId: "user-005",
        userName: "Đức Anh",
        rating: 4,
        content: "Cốt truyện thú vị, hình ảnh đẹp. Một vài phân đoạn hơi dài nhưng nhìn chung rất ổn.",
        createdAt: "2026-11-08T16:40:00"
    },

    //=================== Movie 3 ========================

    {
        id: 6,
        movieId: 3,
        authorId: "user-006",
        userName: "Ngọc Mai",
        rating: 4,
        content: "Ý tưởng phim khá mới lạ, cách xây dựng câu chuyện tạo được sự tò mò.",
        createdAt: "2026-11-07T11:25:00"
    },
    {
        id: 7,
        movieId: 3,
        authorId: "user-007",
        userName: "Quốc Bảo",
        rating: 5,
        content: "Một bộ phim có nhiều điểm thú vị. Mình rất mong chờ những phần tiếp theo.",
        createdAt: "2026-11-09T20:10:00"
    },

    //=================== Movie 4 ========================

    {
        id: 8,
        movieId: 4,
        authorId: "user-008",
        userName: "Tuấn Kiệt",
        rating: 4,
        content: "Không khí phim tốt, có nhiều phân đoạn gây hồi hộp. Phù hợp với người thích thể loại kinh dị.",
        createdAt: "2026-11-08T21:00:00"
    },
    {
        id: 9,
        movieId: 4,
        authorId: "user-009",
        userName: "Bảo Trân",
        rating: 3,
        content: "Phim có một số cảnh ấn tượng nhưng nội dung chưa thực sự khiến mình bất ngờ.",
        createdAt: "2026-11-09T15:30:00"
    },

    //=================== Movie 5 ========================

    {
        id: 10,
        movieId: 5,
        authorId: "user-010",
        userName: "Phương Linh",
        rating: 5,
        content: "Phần hình ảnh rất đẹp, thế giới trong phim được xây dựng ấn tượng.",
        createdAt: "2026-11-09T13:10:00"
    },
    {
        id: 11,
        movieId: 5,
        authorId: "user-011",
        userName: "Gia Huy",
        rating: 4,
        content: "Nội dung dễ theo dõi, phần hình ảnh và âm thanh đều tốt.",
        createdAt: "2026-11-10T18:45:00"
    }
];

export default reviews;
