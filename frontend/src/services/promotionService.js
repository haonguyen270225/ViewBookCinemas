
import promotionsData from "../data/promotions.js";

const STORAGE_KEY = "viewbook-admin-promotions";

const PROMOTION_STATUS_OPTIONS = ["Active", "Inactive"];
const DISCOUNT_TYPE_OPTIONS = ["Percentage", "Fixed"];

// Lưu dữ liệu.
const savePromotions = (promotions) => {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(promotions)
        );
    } catch (error) {
        console.error("Không thể lưu khuyến mãi:", error);

        throw new Error(
            "Không thể lưu dữ liệu khuyến mãi."
        );
    }
};

// Ngày tháng.
const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const isValidDate = (value) => {
    if (!value) return true;

    if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return false;
    }

    const [year, month, day] = value.split("-").map(Number);

    const date = new Date(year, month - 1, day);

    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
};

const isPromotionInDateRange = (promotion) => {
    const today = getTodayDate();

    if (
        promotion.startDate &&
        today < promotion.startDate
    ) {
        return false;
    }

    if (
        promotion.endDate &&
        today > promotion.endDate
    ) {
        return false;
    }

    return true;
};

// Chuẩn hóa mã khuyến mãi.
const normalizePromotionCode = (code) => {
    return String(code || "").trim().toUpperCase();
};

// Chuẩn hóa dữ liệu đầu vào.
const normalizePromotion = (data) => ({
    promotionCode: normalizePromotionCode(
        data.promotionCode
    ),

    promotionName: String(
        data.promotionName || ""
    ).trim(),

    description: String(
        data.description || ""
    ).trim(),

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

// Kiểm tra dữ liệu khuyến mãi.
const validatePromotion = (
    data,
    promotions,
    currentId = null
) => {
    if (!data || typeof data !== "object") {
        throw new Error(
            "Thông tin khuyến mãi không hợp lệ."
        );
    }

    const normalized = normalizePromotion(data);

    const {
        promotionCode,
        promotionName,
        description,
        discountType,
        discountValue,
        maxDiscountAmount,
        minOrderValue,
        usageLimit,
        startDate,
        endDate,
        status
    } = normalized;

    if (!promotionCode) {
        throw new Error(
            "Vui lòng nhập mã khuyến mãi."
        );
    }

    if (!/^[A-Z0-9_-]{4,20}$/.test(promotionCode)) {
        throw new Error(
            "Mã khuyến mãi phải có từ 4 đến 20 ký tự, chỉ gồm chữ in hoa, số, dấu gạch ngang hoặc gạch dưới."
        );
    }

    if (!promotionName) {
        throw new Error(
            "Vui lòng nhập tên chương trình."
        );
    }

    if (promotionName.length > 100) {
        throw new Error(
            "Tên chương trình không được vượt quá 100 ký tự."
        );
    }

    const duplicatedCode = promotions.some(
        (promotion) =>
            normalizePromotionCode(
                promotion.promotionCode
            ) === promotionCode &&
            String(promotion.promotionId) !== String(currentId)
    );

    if (duplicatedCode) {
        throw new Error(
            "Mã khuyến mãi đã tồn tại."
        );
    }

    if (!description) {
        throw new Error(
            "Vui lòng nhập mô tả chương trình."
        );
    }

    if (!DISCOUNT_TYPE_OPTIONS.includes(discountType)) {
        throw new Error(
            "Loại giảm giá không hợp lệ."
        );
    }

    if (
        !Number.isSafeInteger(discountValue) ||
        discountValue <= 0
    ) {
        throw new Error(
            "Giá trị giảm giá phải là số nguyên dương."
        );
    }

    if (
        discountType === "Percentage" &&
        discountValue > 100
    ) {
        throw new Error(
            "Mức giảm theo phần trăm không được vượt quá 100%."
        );
    }

    if (
        discountType === "Fixed" &&
        discountValue % 1000 !== 0
    ) {
        throw new Error(
            "Số tiền giảm phải chia hết cho 1.000đ."
        );
    }

    if (
        discountType === "Fixed" &&
        maxDiscountAmount !== null
    ) {
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

    if (
        !Number.isSafeInteger(minOrderValue) ||
        minOrderValue < 0 ||
        minOrderValue % 1000 !== 0
    ) {
        throw new Error(
            "Giá trị đơn hàng tối thiểu phải là số nguyên không âm và chia hết cho 1.000đ."
        );
    }

    if (!isValidDate(startDate)) {
        throw new Error(
            "Ngày bắt đầu không hợp lệ."
        );
    }

    if (!isValidDate(endDate)) {
        throw new Error(
            "Ngày kết thúc không hợp lệ."
        );
    }

    if (
        startDate &&
        endDate &&
        endDate < startDate
    ) {
        throw new Error(
            "Ngày kết thúc phải bằng hoặc sau ngày bắt đầu."
        );
    }

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

    if (!PROMOTION_STATUS_OPTIONS.includes(status)) {
        throw new Error(
            "Trạng thái khuyến mãi không hợp lệ."
        );
    }

    return normalized;
};

// Chuẩn hóa bản ghi khuyến mãi khi đọc.
const normalizeStoredPromotion = (promotion) => {
    const rawUsedCount = Number(promotion.usedCount);

    const usedCount =
        Number.isSafeInteger(rawUsedCount) &&
        rawUsedCount >= 0
            ? rawUsedCount
            : 0;

    const usedBookingCodes = Array.isArray(
        promotion.usedBookingCodes
    )
        ? [
            ...new Set(
                promotion.usedBookingCodes
                    .filter(Boolean)
                    .map(String)
            )
        ]
        : [];

    const rawUsageLimit = promotion.usageLimit;

    const usageLimit =
        rawUsageLimit === "" ||
        rawUsageLimit === undefined ||
        rawUsageLimit === null
            ? null
            : Number(rawUsageLimit);

    return {
        ...promotion,

        usedCount,

        usedBookingCodes,

        status: promotion.status || "Active",

        startDate: promotion.startDate || null,

        endDate: promotion.endDate || null,

        usageLimit:
            usageLimit === null ||
            !Number.isSafeInteger(usageLimit) ||
            usageLimit <= 0
                ? null
                : usageLimit
    };
};

// Khởi tạo dữ liệu.
const initializePromotions = () => {
    const savedPromotions = localStorage.getItem(
        STORAGE_KEY
    );

    if (savedPromotions !== null) {
        try {
            const parsedPromotions = JSON.parse(
                savedPromotions
            );

            if (!Array.isArray(parsedPromotions)) {
                throw new Error(
                    "Dữ liệu khuyến mãi không hợp lệ."
                );
            }

            return parsedPromotions.map(
                normalizeStoredPromotion
            );

        } catch (error) {
            console.error(
                "Không thể đọc dữ liệu khuyến mãi:",
                error
            );

            throw new Error(
                "Dữ liệu khuyến mãi trong trình duyệt không hợp lệ."
            );
        }
    }

    const initialPromotions = promotionsData.map(
        normalizeStoredPromotion
    );

    savePromotions(initialPromotions);

    return initialPromotions;
};

// Lấy danh sách khuyến mãi.
export const getPromotions = async () => {
    return initializePromotions();
};

// Lấy khuyến mãi theo ID.
export const getPromotionById = async (id) => {
    const promotions = await getPromotions();

    return (
        promotions.find(
            (promotion) =>
                String(promotion.promotionId) === String(id)
        ) || null
    );
};

// Lấy danh sách khuyến mãi đang có hiệu lực.
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
            Number(promotion.usedCount) >=
                Number(promotion.usageLimit)
        ) {
            return false;
        }

        return true;
    });
};

// Thêm khuyến mãi.
export const createPromotion = async (promotionData) => {
    const promotions = await getPromotions();

    const normalized = validatePromotion(
        promotionData,
        promotions
    );

    const newId =
        Math.max(
            0,
            ...promotions.map(
                (promotion) =>
                    Number(promotion.promotionId) || 0
            )
        ) + 1;

    const newPromotion = {
        promotionId: newId,

        ...normalized,

        usedCount: 0,

        usedBookingCodes: [],

        createdAt: new Date().toISOString()
    };

    savePromotions([
        ...promotions,
        newPromotion
    ]);

    return newPromotion;
};

// Cập nhật khuyến mãi.
export const updatePromotion = async (
    id,
    promotionData
) => {
    const promotions = await getPromotions();

    const existingPromotion = promotions.find(
        (promotion) =>
            String(promotion.promotionId) === String(id)
    );

    if (!existingPromotion) {
        throw new Error(
            "Không tìm thấy khuyến mãi cần cập nhật."
        );
    }

    const normalized = validatePromotion(
        promotionData,
        promotions,
        id
    );

    // Không được đặt giới hạn thấp hơn số lượt đã sử dụng.
    const usedCount =
        Number(existingPromotion.usedCount) || 0;

    if (
        normalized.usageLimit !== null &&
        normalized.usageLimit < usedCount
    ) {
        throw new Error(
            `Giới hạn sử dụng không thể thấp hơn ${usedCount} lượt đã được sử dụng.`
        );
    }

    const updatedPromotion = {
        ...existingPromotion,

        ...normalized,

        // Giữ nguyên lịch sử sử dụng.
        usedCount,

        usedBookingCodes: Array.isArray(
            existingPromotion.usedBookingCodes
        )
            ? existingPromotion.usedBookingCodes
            : [],

        updatedAt: new Date().toISOString()
    };

    const updatedPromotions = promotions.map(
        (promotion) =>
            String(promotion.promotionId) === String(id)
                ? updatedPromotion
                : promotion
    );

    savePromotions(updatedPromotions);

    return updatedPromotion;
};

// Cập nhật trạng thái.
export const updatePromotionStatus = async (
    id,
    status
) => {
    if (!PROMOTION_STATUS_OPTIONS.includes(status)) {
        throw new Error(
            "Trạng thái khuyến mãi không hợp lệ."
        );
    }

    const promotions = await getPromotions();

    const existingPromotion = promotions.find(
        (promotion) =>
            String(promotion.promotionId) === String(id)
    );

    if (!existingPromotion) {
        throw new Error(
            "Không tìm thấy khuyến mãi."
        );
    }

    const updatedPromotion = {
        ...existingPromotion,

        status,

        updatedAt: new Date().toISOString()
    };

    const updatedPromotions = promotions.map(
        (promotion) =>
            String(promotion.promotionId) === String(id)
                ? updatedPromotion
                : promotion
    );

    savePromotions(updatedPromotions);

    return updatedPromotion;
};

// Xóa khuyến mãi.
export const deletePromotion = async (id) => {
    const promotions = await getPromotions();

    const existingPromotion = promotions.find(
        (promotion) =>
            String(promotion.promotionId) === String(id)
    );

    if (!existingPromotion) {
        throw new Error(
            "Không tìm thấy khuyến mãi cần xóa."
        );
    }

    const usedCount =
        Number(existingPromotion.usedCount) || 0;

    const usedBookingCodes = Array.isArray(
        existingPromotion.usedBookingCodes
    )
        ? existingPromotion.usedBookingCodes
        : [];

    // Không xóa promotion đã được booking sử dụng.
    // Giữ bản ghi để booking cũ vẫn tham chiếu được.
    if (
        usedCount > 0 ||
        usedBookingCodes.length > 0
    ) {
        throw new Error(
            `Không thể xóa khuyến mãi "${existingPromotion.promotionCode}" vì đã có ${Math.max(
                usedCount,
                usedBookingCodes.length
            )} lượt sử dụng. Bạn có thể chuyển trạng thái sang Ngừng hoạt động thay vì xóa.`
        );
    }

    const updatedPromotions = promotions.filter(
        (promotion) =>
            String(promotion.promotionId) !== String(id)
    );

    savePromotions(updatedPromotions);

    return existingPromotion;
};

// Tính số tiền được giảm.
export const calculatePromotionDiscount = (
    promotion,
    orderAmount
) => {
    const amount = Number(orderAmount);

    if (
        !Number.isSafeInteger(amount) ||
        amount < 0
    ) {
        throw new Error(
            "Giá trị đơn hàng không hợp lệ."
        );
    }

    if (!promotion) {
        throw new Error(
            "Không tìm thấy thông tin khuyến mãi."
        );
    }

    const discountValue = Number(
        promotion.discountValue
    );

    if (
        !Number.isSafeInteger(discountValue) ||
        discountValue <= 0
    ) {
        throw new Error(
            "Giá trị giảm giá của khuyến mãi không hợp lệ."
        );
    }

    let discountAmount = 0;

    if (promotion.discountType === "Percentage") {
        discountAmount = Math.floor(
            (amount * discountValue) / 100
        );

        if (promotion.maxDiscountAmount !== null) {
            const maxDiscount = Number(
                promotion.maxDiscountAmount
            );

            if (
                Number.isSafeInteger(maxDiscount) &&
                maxDiscount > 0
            ) {
                discountAmount = Math.min(
                    discountAmount,
                    maxDiscount
                );
            }
        }

    } else if (promotion.discountType === "Fixed") {
        discountAmount = discountValue;

    } else {
        throw new Error(
            "Loại giảm giá không hợp lệ."
        );
    }

    return Math.min(amount, discountAmount);
};

// Kiểm tra mã khuyến mãi.
export const validatePromotionCode = async (
    code,
    orderAmount
) => {
    const normalizedCode = normalizePromotionCode(
        code
    );

    const amount = Number(orderAmount);

    if (!normalizedCode) {
        throw new Error(
            "Vui lòng nhập mã khuyến mãi."
        );
    }

    if (
        !Number.isSafeInteger(amount) ||
        amount <= 0
    ) {
        throw new Error(
            "Tổng giá trị đơn hàng không hợp lệ."
        );
    }

    const promotions = await getPromotions();

    const promotion = promotions.find(
        (item) =>
            normalizePromotionCode(
                item.promotionCode
            ) === normalizedCode
    );

    if (!promotion) {
        throw new Error(
            "Mã khuyến mãi không tồn tại."
        );
    }

    if (promotion.status !== "Active") {
        throw new Error(
            "Mã khuyến mãi hiện không hoạt động."
        );
    }

    if (!isPromotionInDateRange(promotion)) {
        throw new Error(
            "Mã khuyến mãi chưa có hiệu lực hoặc đã hết hạn."
        );
    }

    if (
        promotion.usageLimit !== null &&
        Number(promotion.usedCount) >=
            Number(promotion.usageLimit)
    ) {
        throw new Error(
            "Mã khuyến mãi đã hết lượt sử dụng."
        );
    }

    if (
        amount < Number(promotion.minOrderValue || 0)
    ) {
        throw new Error(
            `Đơn hàng phải có giá trị tối thiểu ${new Intl.NumberFormat(
                "vi-VN"
            ).format(
                promotion.minOrderValue
            )}đ để sử dụng mã này.`
        );
    }

    const discountAmount = calculatePromotionDiscount(
        promotion,
        amount
    );

    if (discountAmount <= 0) {
        throw new Error(
            "Mã khuyến mãi không tạo ra giá trị giảm hợp lệ."
        );
    }

    return {
        promotion,
        discountAmount,
        finalAmount: amount - discountAmount
    };
};

// Ghi nhận lượt sử dụng mã khuyến mãi.
export const increasePromotionUsage = async (
    id,
    bookingCode = null
) => {
    const promotions = await getPromotions();

    const existingPromotion = promotions.find(
        (promotion) =>
            String(promotion.promotionId) === String(id)
    );

    if (!existingPromotion) {
        throw new Error(
            "Không tìm thấy khuyến mãi."
        );
    }

    const usedBookingCodes = Array.isArray(
        existingPromotion.usedBookingCodes
    )
        ? existingPromotion.usedBookingCodes
        : [];

    const normalizedBookingCode = bookingCode
        ? String(bookingCode)
        : null;

    // Booking đã được ghi nhận thì không tăng lượt lần nữa.
    if (
        normalizedBookingCode &&
        usedBookingCodes.includes(normalizedBookingCode)
    ) {
        return existingPromotion;
    }

    if (existingPromotion.status !== "Active") {
        throw new Error(
            "Khuyến mãi hiện không hoạt động."
        );
    }

    if (!isPromotionInDateRange(existingPromotion)) {
        throw new Error(
            "Khuyến mãi đã hết hạn hoặc chưa có hiệu lực."
        );
    }

    const usedCount =
        Number(existingPromotion.usedCount) || 0;

    if (
        existingPromotion.usageLimit !== null &&
        usedCount >= Number(existingPromotion.usageLimit)
    ) {
        throw new Error(
            "Khuyến mãi đã hết lượt sử dụng."
        );
    }

    const updatedPromotion = {
        ...existingPromotion,

        usedCount: usedCount + 1,

        usedBookingCodes: normalizedBookingCode
            ? [
                ...usedBookingCodes,
                normalizedBookingCode
            ]
            : usedBookingCodes,

        updatedAt: new Date().toISOString()
    };

    const updatedPromotions = promotions.map(
        (promotion) =>
            String(promotion.promotionId) === String(id)
                ? updatedPromotion
                : promotion
    );

    savePromotions(updatedPromotions);

    return updatedPromotion;
};

// Hoàn lại lượt sử dụng khuyến mãi khi hủy booking.
export const decreasePromotionUsage = async (
    id,
    bookingCode
) => {
    if (!bookingCode) {
        throw new Error(
            "Thiếu mã đơn đặt vé để hoàn lượt khuyến mãi."
        );
    }

    const promotions = await getPromotions();

    const existingPromotion = promotions.find(
        (promotion) =>
            String(promotion.promotionId) === String(id)
    );

    if (!existingPromotion) {
        throw new Error(
            "Không tìm thấy khuyến mãi cần hoàn lượt."
        );
    }

    const usedBookingCodes = Array.isArray(
        existingPromotion.usedBookingCodes
    )
        ? existingPromotion.usedBookingCodes
        : [];

    const normalizedBookingCode = String(
        bookingCode
    );

    // Chưa ghi nhận hoặc đã hoàn trước đó thì không trừ tiếp.
    if (
        !usedBookingCodes.includes(normalizedBookingCode)
    ) {
        return existingPromotion;
    }

    const updatedPromotion = {
        ...existingPromotion,

        usedCount: Math.max(
            0,
            (Number(existingPromotion.usedCount) || 0) - 1
        ),

        usedBookingCodes: usedBookingCodes.filter(
            (code) =>
                code !== normalizedBookingCode
        ),

        updatedAt: new Date().toISOString()
    };

    const updatedPromotions = promotions.map(
        (promotion) =>
            String(promotion.promotionId) === String(id)
                ? updatedPromotion
                : promotion
    );

    savePromotions(updatedPromotions);

    return updatedPromotion;
};

// Thống kê khuyến mãi.
export const getPromotionStatistics = async () => {
    const promotions = await getPromotions();

    return {
        total: promotions.length,

        active: promotions.filter(
            (promotion) =>
                promotion.status === "Active"
        ).length,

        inactive: promotions.filter(
            (promotion) =>
                promotion.status === "Inactive"
        ).length,

        totalUsed: promotions.reduce(
            (total, promotion) =>
                total + (Number(promotion.usedCount) || 0),
            0
        )
    };
};
