
export const promotions = [
    {
        promotionId: 1,
        promotionCode: "WELCOME10",
        promotionName: "Ưu đãi khách hàng mới",
        description: "Giảm 10% cho đơn hàng đầu tiên.",
        discountType: "Percentage",
        discountValue: 10,
        maxDiscountAmount: 50000,
        minOrderValue: 50000,
        startDate: null,
        endDate: null,
        usageLimit: 100,
        usedCount: 0,
        status: "Active"
    },
    {
        promotionId: 2,
        promotionCode: "VBC20K",
        promotionName: "Ưu đãi giảm 20.000đ",
        description: "Giảm trực tiếp 20.000đ cho đơn hàng đủ điều kiện.",
        discountType: "Fixed",
        discountValue: 20000,
        maxDiscountAmount: null,
        minOrderValue: 100000,
        startDate: null,
        endDate: null,
        usageLimit: 200,
        usedCount: 0,
        status: "Active"
    },
    {
        promotionId: 3,
        promotionCode: "MOVIE15",
        promotionName: "Ưu đãi xem phim",
        description: "Giảm 15% giá trị đơn hàng.",
        discountType: "Percentage",
        discountValue: 15,
        maxDiscountAmount: 70000,
        minOrderValue: 150000,
        startDate: null,
        endDate: null,
        usageLimit: 150,
        usedCount: 0,
        status: "Active"
    },
    {
        promotionId: 4,
        promotionCode: "COMEBACK30K",
        promotionName: "Ưu đãi quay trở lại",
        description: "Giảm 30.000đ cho đơn hàng từ 150.000đ.",
        discountType: "Fixed",
        discountValue: 30000,
        maxDiscountAmount: null,
        minOrderValue: 150000,
        startDate: null,
        endDate: null,
        usageLimit: 50,
        usedCount: 0,
        status: "Inactive"
    }
];

export default promotions;
