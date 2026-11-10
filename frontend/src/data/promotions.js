
//=================== Danh sách khuyến mãi mẫu ========================

export const promotions = [
    {
        id: 1,
        code: "VBC20",
        name: "Ưu đãi thành viên mới",
        description:
            "Giảm 20% giá trị đơn hàng dành cho khách hàng lần đầu đặt vé tại ViewBookCinemas.",
        discountType: "Percentage",
        discountValue: 20,
        maxDiscountAmount: 50000,
        minOrderAmount: 100000,
        startDate: "2026-11-01T00:00:00",
        endDate: "2026-11-30T23:59:59",
        usageLimit: 1000,
        usedCount: 320,
        status: "Active",
        image:
            "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900"
    },
    {
        id: 2,
        code: "MOVIE50",
        name: "Xem phim thả ga",
        description:
            "Giảm ngay 50.000 VNĐ cho hóa đơn đặt vé và dịch vụ có giá trị từ 200.000 VNĐ.",
        discountType: "FixedAmount",
        discountValue: 50000,
        maxDiscountAmount: null,
        minOrderAmount: 200000,
        startDate: "2026-11-05T00:00:00",
        endDate: "2026-11-25T23:59:59",
        usageLimit: 500,
        usedCount: 180,
        status: "Active",
        image:
            "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=900"
    },
    {
        id: 3,
        code: "WEEKEND15",
        name: "Cuối tuần ưu đãi",
        description:
            "Tận hưởng ưu đãi giảm 15% khi đặt vé xem phim vào dịp cuối tuần.",
        discountType: "Percentage",
        discountValue: 15,
        maxDiscountAmount: 40000,
        minOrderAmount: 80000,
        startDate: "2026-11-14T00:00:00",
        endDate: "2026-12-31T23:59:59",
        usageLimit: 800,
        usedCount: 0,
        status: "Active",
        image:
            "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=900"
    },
    {
        id: 4,
        code: "COMBO30",
        name: "Ưu đãi bắp nước",
        description:
            "Giảm 30% cho đơn hàng khi mua combo bắp nước cùng vé xem phim.",
        discountType: "Percentage",
        discountValue: 30,
        maxDiscountAmount: 60000,
        minOrderAmount: 150000,
        startDate: "2026-12-01T00:00:00",
        endDate: "2026-12-31T23:59:59",
        usageLimit: 600,
        usedCount: 0,
        status: "Active",
        image:
            "https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=900"
    },
    {
        id: 5,
        code: "SUMMER25",
        name: "Mùa hè điện ảnh",
        description:
            "Chương trình ưu đãi giảm 25% dành cho khách hàng yêu thích điện ảnh.",
        discountType: "Percentage",
        discountValue: 25,
        maxDiscountAmount: 50000,
        minOrderAmount: 100000,
        startDate: "2026-06-01T00:00:00",
        endDate: "2026-07-31T23:59:59",
        usageLimit: 1000,
        usedCount: 950,
        status: "Inactive",
        image:
            "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=900"
    },
    {
        id: 6,
        code: "NEWYEAR",
        name: "Chào năm mới",
        description:
            "Ưu đãi đặc biệt giảm 100.000 VNĐ cho hóa đơn từ 300.000 VNĐ.",
        discountType: "FixedAmount",
        discountValue: 100000,
        maxDiscountAmount: null,
        minOrderAmount: 300000,
        startDate: "2027-01-01T00:00:00",
        endDate: "2027-01-31T23:59:59",
        usageLimit: 1000,
        usedCount: 0,
        status: "Active",
        image:
            "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=900"
    }
];
