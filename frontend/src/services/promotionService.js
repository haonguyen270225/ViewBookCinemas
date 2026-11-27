
import promotionsData from "../data/promotions.js";

const STORAGE_KEY = "viewbook-admin-promotions";

const PROMOTION_STATUS_OPTIONS = ["Active", "Inactive"];
const DISCOUNT_TYPE_OPTIONS = ["Percentage", "Fixed"];

//====================================================
// Lưu dữ liệu
//====================================================

const savePromotions = (promotions) => {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(promotions)
        );
    } catch (error) {
        console.error("Không thể lưu khuyến mãi:", error);
        throw new Error("Không thể lưu dữ liệu khuyến mãi.");
    }
};

//====================================================
// Ngày tháng
//====================================================

const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const isValidDate = (value) => {
    if (!value) return true;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const date = new Date(`${value}T00:00:00`);

    return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
    );
};

const isPromotionInDateRange = (promotion) => {
    const today = getTodayDate();

    if (promotion.startDate && today < promotion.startDate) {
        return false;
    }

    if (promotion.endDate && today > promotion.endDate) {
        return false;
    }

    return true;
};

//====================================================
// Chuẩn hóa mã khuyến mãi
//====================================================

const normalizePromotionCode = (code) => {
    return String(code || "").trim().toUpperCase();
};

//====================================================
// Kiểm tra dữ liệu khuyến mãi
//====================================================

const validatePromotion = (
    data,
    promotions,
    currentId = null
) => {
    if (!data || typeof data !== "object") {
        throw new Error("Thông tin khuyến mãi không hợp lệ.");
    }

    const promotionCode = normalizePromotionCode(
        data.promotionCode
    );

    const promotionName = String(
        data.promotionName || ""
    ).trim();

    const description = String(
        data.description || ""
    ).trim();

    if (!promotionCode) {
        throw new Error("Vui lòng nhập mã khuyến mãi.");
    }

    if (!/^[A-Z0-9_-]{4,20}$/.test(promotionCode)) {
        throw new Error(
            "Mã khuyến mãi phải có từ 4 đến 20 ký tự, chỉ gồm chữ in hoa, số, dấu gạch ngang hoặc gạch dưới."
        );
    }

    if (!promotionName) {
        throw new Error("Vui lòng nhập tên chương trình.");
    }

    if (promotionName.length > 100) {
        throw new Error("Tên chương trình không được vượt quá 100 ký tự.");
    }

    const duplicatedCode = promotions.some(
        (promotion) =>
            normalizePromotionCode(promotion.promotionCode) ===
                promotionCode &&
            String(promotion.promotionId) !== String(currentId)
    );

    if (duplicatedCode) {
        throw new Error("Mã khuyến mãi đã tồn tại.");
    }

    if (!description) {
        throw new Error("Vui lòng nhập mô tả chương trình.");
    }

    if (!DISCOUNT_TYPE_OPTIONS.includes(data.discountType)) {
        throw new Error("Loại giảm giá không hợp lệ.");
    }

    const discountValue = Number(data.discountValue);

    if (
        !Number.isSafeInteger(discountValue) ||
        discountValue <= 0
    ) {
        throw new Error("Giá trị giảm giá phải là số nguyên dương.");
    }

    if (data.discountType === "Percentage" && discountValue > 100) {
        throw new Error("Mức giảm theo phần trăm không được vượt quá 100%.");
    }

    if (
        data.discountType === "Fixed" &&
        discountValue % 1000 !== 0
    ) {
        throw new Error("Số tiền giảm phải chia hết cho 1.000đ.");
    }

    const maxDiscountAmount =
        data.maxDiscountAmount === "" ||
        data.maxDiscountAmount === null ||
        data.maxDiscountAmount === undefined
            ? null
            : Number(data.maxDiscountAmount);

    if (data.discountType === "Fixed" && maxDiscountAmount !== null) {
        throw new Error(
            "Mức giảm tối đa chỉ áp dụng cho khuyến mãi theo phần trăm."
        );
    }

    if (
        maxDiscountAmount !== null &&
        (
            !Number.isSafeInteger(maxDiscountAmount) ||
            maxDiscountAmount <= 0 ||
            maxDiscountAmount % 1000 !== 0
        )
    ) {
        throw new Error(
            "Mức giảm tối đa phải là số nguyên dương và chia hết cho 1.000đ."
        );
    }

    const minOrderValue = Number(data.minOrderValue ?? 0);

    if (
        !Number.isSafeInteger(minOrderValue) ||
        minOrderValue < 0 ||
        minOrderValue % 1000 !== 0
    ) {
        throw new Error(
            "Giá trị đơn hàng tối thiểu phải là số nguyên không âm và chia hết cho 1.000đ."
        );
    }

    if (!isValidDate(data.startDate)) {
        throw new Error("Ngày bắt đầu không hợp lệ.");
    }

    if (!isValidDate(data.endDate)) {
        throw new Error("Ngày kết thúc không hợp lệ.");
    }

    if (
        data.startDate &&
        data.endDate &&
        data.endDate < data.startDate
    ) {
        throw new Error(
            "Ngày kết thúc phải bằng hoặc sau ngày bắt đầu."
        );
    }

    const usageLimit =
        data.usageLimit === "" ||
        data.usageLimit === null ||
        data.usageLimit === undefined
            ? null
            : Number(data.usageLimit);

    if (
        usageLimit !== null &&
        (
            !Number.isSafeInteger(usageLimit) ||
            usageLimit <= 0
        )
    ) {
        throw new Error(
            "Giới hạn lượt sử dụng phải là số nguyên dương hoặc để trống nếu không giới hạn."
        );
    }

    if (!PROMOTION_STATUS_OPTIONS.includes(data.status)) {
        throw new Error("Trạng thái khuyến mãi không hợp lệ.");
    }

    return {
        promotionCode,
        promotionName,
        description,
        discountValue,
        maxDiscountAmount,
        minOrderValue,
        usageLimit
    };
};

//====================================================
// Chuẩn hóa dữ liệu
//====================================================

const normalizePromotion = (data) => ({
    promotionCode: normalizePromotionCode(data.promotionCode),
    promotionName: data.promotionName.trim(),
    description: data.description.trim(),

    discountType: data.discountType,
    discountValue: Number(data.discountValue),

    maxDiscountAmount:
        data.discountType === "Percentage" &&
        data.maxDiscountAmount !== "" &&
        data.maxDiscountAmount !== null &&
        data.maxDiscountAmount !== undefined
            ? Number(data.maxDiscountAmount)
            : null,

    minOrderValue: Number(data.minOrderValue || 0),

    startDate: data.startDate || null,
    endDate: data.endDate || null,

    usageLimit:
        data.usageLimit === "" ||
        data.usageLimit === null ||
        data.usageLimit === undefined
            ? null
            : Number(data.usageLimit),

    status: data.status
});

//====================================================
// Khởi tạo dữ liệu
//====================================================

const initializePromotions = () => {
    const savedPromotions = localStorage.getItem(STORAGE_KEY);

    if (savedPromotions !== null) {
        try {
            const parsedPromotions = JSON.parse(savedPromotions);

            if (!Array.isArray(parsedPromotions)) {
                throw new Error("Dữ liệu khuyến mãi không hợp lệ.");
            }

            return parsedPromotions;
        } catch (error) {
            console.error("Không thể đọc dữ liệu khuyến mãi:", error);

            throw new Error(
                "Dữ liệu khuyến mãi trong trình duyệt không hợp lệ."
            );
        }
    }

    const initialPromotions = promotionsData.map((promotion) => ({
        ...promotion,
        usedCount: Number(promotion.usedCount) || 0,
        status: promotion.status || "Active",
        startDate: promotion.startDate || null,
        endDate: promotion.endDate || null
    }));

    savePromotions(initialPromotions);

    return initialPromotions;
};

//====================================================
// Lấy danh sách khuyến mãi
//====================================================

export const getPromotions = async () => {
    return initializePromotions();
};

//====================================================
// Lấy khuyến mãi theo ID
//====================================================

export const getPromotionById = async (id) => {
    const promotions = await getPromotions();

    return (
        promotions.find(
            (promotion) =>
                String(promotion.promotionId) === String(id)
        ) || null
    );
};

//====================================================
// Lấy danh sách khuyến mãi đang có hiệu lực
//====================================================

export const getActivePromotions = async () => {
    const promotions = await getPromotions();

    return promotions.filter((promotion) => {
        if (promotion.status !== "Active") {
            return false;
        }

        if (!isPromotionInDateRange(promotion)) {
            return false;
        }

        if (
            promotion.usageLimit !== null &&
            Number(promotion.usedCount) >= Number(promotion.usageLimit)
        ) {
            return false;
        }

        return true;
    });
};

//====================================================
// Thêm khuyến mãi
//====================================================

export const createPromotion = async (promotionData) => {
    const promotions = await getPromotions();

    validatePromotion(promotionData, promotions);

    const newId =
        Math.max(
            0,
            ...promotions.map(
                (promotion) => Number(promotion.promotionId) || 0
            )
        ) + 1;

    const newPromotion = {
        promotionId: newId,
        ...normalizePromotion(promotionData),
        usedCount: 0,
        createdAt: new Date().toISOString()
    };

    savePromotions([...promotions, newPromotion]);

    return newPromotion;
};

//====================================================
// Cập nhật khuyến mãi
//====================================================

export const updatePromotion = async (id, promotionData) => {
    const promotions = await getPromotions();

    const existingPromotion = promotions.find(
        (promotion) =>
            String(promotion.promotionId) === String(id)
    );

    if (!existingPromotion) {
        throw new Error("Không tìm thấy khuyến mãi cần cập nhật.");
    }

    validatePromotion(promotionData, promotions, id);

    const updatedPromotion = {
        ...existingPromotion,
        ...normalizePromotion(promotionData),

        // Không cho phép chỉnh sửa làm mất số lượt đã sử dụng.
        usedCount: Number(existingPromotion.usedCount) || 0,

        updatedAt: new Date().toISOString()
    };

    const updatedPromotions = promotions.map((promotion) =>
        String(promotion.promotionId) === String(id)
            ? updatedPromotion
            : promotion
    );

    savePromotions(updatedPromotions);

    return updatedPromotion;
};

//====================================================
// Cập nhật trạng thái
//====================================================

export const updatePromotionStatus = async (id, status) => {
    if (!PROMOTION_STATUS_OPTIONS.includes(status)) {
        throw new Error("Trạng thái khuyến mãi không hợp lệ.");
    }

    const promotions = await getPromotions();

    const existingPromotion = promotions.find(
        (promotion) =>
            String(promotion.promotionId) === String(id)
    );

    if (!existingPromotion) {
        throw new Error("Không tìm thấy khuyến mãi.");
    }

    const updatedPromotion = {
        ...existingPromotion,
        status,
        updatedAt: new Date().toISOString()
    };

    const updatedPromotions = promotions.map((promotion) =>
        String(promotion.promotionId) === String(id)
            ? updatedPromotion
            : promotion
    );

    savePromotions(updatedPromotions);

    return updatedPromotion;
};

//====================================================
// Xóa khuyến mãi
//====================================================

export const deletePromotion = async (id) => {
    const promotions = await getPromotions();

    const existingPromotion = promotions.find(
        (promotion) =>
            String(promotion.promotionId) === String(id)
    );

    if (!existingPromotion) {
        throw new Error("Không tìm thấy khuyến mãi cần xóa.");
    }

    const updatedPromotions = promotions.filter(
        (promotion) =>
            String(promotion.promotionId) !== String(id)
    );

    savePromotions(updatedPromotions);

    return existingPromotion;
};

//====================================================
// Tính số tiền được giảm
//====================================================

export const calculatePromotionDiscount = (
    promotion,
    orderAmount
) => {
    const amount = Number(orderAmount);

    if (
        !Number.isSafeInteger(amount) ||
        amount < 0
    ) {
        throw new Error("Giá trị đơn hàng không hợp lệ.");
    }

    if (!promotion) {
        throw new Error("Không tìm thấy thông tin khuyến mãi.");
    }

    let discountAmount = 0;

    if (promotion.discountType === "Percentage") {
        discountAmount = Math.floor(
            amount * Number(promotion.discountValue) / 100
        );

        if (promotion.maxDiscountAmount !== null) {
            discountAmount = Math.min(
                discountAmount,
                Number(promotion.maxDiscountAmount)
            );
        }
    } else if (promotion.discountType === "Fixed") {
        discountAmount = Number(promotion.discountValue);
    } else {
        throw new Error("Loại giảm giá không hợp lệ.");
    }

    discountAmount = Math.min(amount, discountAmount);

    return discountAmount;
};

//====================================================
// Kiểm tra mã khuyến mãi
//====================================================

export const validatePromotionCode = async (
    code,
    orderAmount
) => {
    const normalizedCode = normalizePromotionCode(code);
    const amount = Number(orderAmount);

    if (!normalizedCode) {
        throw new Error("Vui lòng nhập mã khuyến mãi.");
    }

    if (!Number.isSafeInteger(amount) || amount <= 0) {
        throw new Error("Tổng giá trị đơn hàng không hợp lệ.");
    }

    const promotions = await getPromotions();

    const promotion = promotions.find(
        (item) =>
            normalizePromotionCode(item.promotionCode) === normalizedCode
    );

    if (!promotion) {
        throw new Error("Mã khuyến mãi không tồn tại.");
    }

    if (promotion.status !== "Active") {
        throw new Error("Mã khuyến mãi hiện không hoạt động.");
    }

    if (!isPromotionInDateRange(promotion)) {
        throw new Error("Mã khuyến mãi chưa có hiệu lực hoặc đã hết hạn.");
    }

    if (
        promotion.usageLimit !== null &&
        Number(promotion.usedCount) >= Number(promotion.usageLimit)
    ) {
        throw new Error("Mã khuyến mãi đã hết lượt sử dụng.");
    }

    if (amount < Number(promotion.minOrderValue || 0)) {
        throw new Error(
            `Đơn hàng phải có giá trị tối thiểu ${new Intl.NumberFormat("vi-VN").format(promotion.minOrderValue)}đ để sử dụng mã này.`
        );
    }

    const discountAmount = calculatePromotionDiscount(
        promotion,
        amount
    );

    if (discountAmount <= 0) {
        throw new Error("Mã khuyến mãi không tạo ra giá trị giảm hợp lệ.");
    }

    return {
        promotion,
        discountAmount,
        finalAmount: amount - discountAmount
    };
};

//====================================================
// Ghi nhận lượt sử dụng mã khuyến mãi
//====================================================

export const increasePromotionUsage = async (id) => {
    const promotions = await getPromotions();

    const existingPromotion = promotions.find(
        (promotion) =>
            String(promotion.promotionId) === String(id)
    );

    if (!existingPromotion) {
        throw new Error("Không tìm thấy khuyến mãi.");
    }

    if (existingPromotion.status !== "Active") {
        throw new Error("Khuyến mãi hiện không hoạt động.");
    }

    if (!isPromotionInDateRange(existingPromotion)) {
        throw new Error("Khuyến mãi đã hết hạn hoặc chưa có hiệu lực.");
    }

    const usedCount = Number(existingPromotion.usedCount) || 0;

    if (
        existingPromotion.usageLimit !== null &&
        usedCount >= Number(existingPromotion.usageLimit)
    ) {
        throw new Error("Khuyến mãi đã hết lượt sử dụng.");
    }

    const updatedPromotion = {
        ...existingPromotion,
        usedCount: usedCount + 1,
        updatedAt: new Date().toISOString()
    };

    const updatedPromotions = promotions.map((promotion) =>
        String(promotion.promotionId) === String(id)
            ? updatedPromotion
            : promotion
    );

    savePromotions(updatedPromotions);

    return updatedPromotion;
};

//====================================================
// Thống kê khuyến mãi
//====================================================

export const getPromotionStatistics = async () => {
    const promotions = await getPromotions();

    return {
        total: promotions.length,

        active: promotions.filter(
            (promotion) => promotion.status === "Active"
        ).length,

        inactive: promotions.filter(
            (promotion) => promotion.status === "Inactive"
        ).length,

        totalUsed: promotions.reduce(
            (total, promotion) =>
                total + (Number(promotion.usedCount) || 0),
            0
        )
    };
};
