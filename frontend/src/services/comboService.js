
import combosData from "../data/combos.js";

const STORAGE_KEY = "viewbook-admin-combos";

const COMBO_STATUS_OPTIONS = ["Active", "Inactive"];

//=================== Lưu danh sách combo ========================

const saveCombos = (combos) => {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(combos)
        );
    } catch (error) {
        console.error("Không thể lưu danh sách combo:", error);
        throw new Error("Không thể lưu dữ liệu combo.");
    }
};

//=================== Chuẩn hóa tồn kho ========================

const normalizeStockQuantity = (value) => {
    const quantity = Number(value);

    if (
        !Number.isSafeInteger(quantity) ||
        quantity < 0
    ) {
        throw new Error(
            "Số lượng tồn kho combo phải là số nguyên không âm."
        );
    }

    return quantity;
};

//=================== Chuẩn hóa combo cũ ========================

const normalizeStoredCombo = (combo) => ({
    ...combo,
    stockQuantity:
        combo.stockQuantity === undefined ||
        combo.stockQuantity === null
            ? 20
            : normalizeStockQuantity(combo.stockQuantity),
    status: combo.status || "Active",
    startDate: combo.startDate || null,
    endDate: combo.endDate || null
});

//=================== Kiểm tra ngày ========================

const isValidDate = (value) => {
    if (!value) return true;

    return !Number.isNaN(new Date(value).getTime());
};

//=================== Kiểm tra dữ liệu combo ========================

const validateCombo = (data, combos, currentId = null) => {
    const {
        comboName,
        description,
        price,
        stockQuantity,
        status,
        startDate,
        endDate
    } = data || {};

    if (!comboName || !comboName.trim()) {
        throw new Error("Vui lòng nhập tên combo.");
    }

    const normalizedName = comboName
        .trim()
        .toLocaleLowerCase("vi");

    const duplicatedName = combos.some(
        (combo) =>
            combo.comboName.trim().toLocaleLowerCase("vi") ===
                normalizedName &&
            String(combo.comboId) !== String(currentId)
    );

    if (duplicatedName) {
        throw new Error("Tên combo đã tồn tại.");
    }

    if (!description || !description.trim()) {
        throw new Error("Vui lòng nhập mô tả combo.");
    }

    const numericPrice = Number(price);

    if (
        !Number.isSafeInteger(numericPrice) ||
        numericPrice < 1000 ||
        numericPrice % 1000 !== 0
    ) {
        throw new Error(
            "Giá combo phải là số nguyên dương và chia hết cho 1.000 VNĐ."
        );
    }

    normalizeStockQuantity(stockQuantity ?? 0);

    if (!COMBO_STATUS_OPTIONS.includes(status)) {
        throw new Error("Trạng thái combo không hợp lệ.");
    }

    if (!isValidDate(startDate)) {
        throw new Error("Ngày bắt đầu không hợp lệ.");
    }

    if (!isValidDate(endDate)) {
        throw new Error("Ngày kết thúc không hợp lệ.");
    }

    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end < start) {
            throw new Error(
                "Ngày kết thúc phải bằng hoặc sau ngày bắt đầu."
            );
        }
    }
};

//=================== Chuẩn hóa dữ liệu combo ========================

const normalizeCombo = (data) => ({
    comboName: data.comboName.trim(),
    description: data.description.trim(),
    price: Number(data.price),
    stockQuantity: normalizeStockQuantity(
        data.stockQuantity ?? 0
    ),
    imageUrl: data.imageUrl?.trim() || "",
    status: data.status,
    startDate: data.startDate || null,
    endDate: data.endDate || null
});

//=================== Khởi tạo dữ liệu ========================

const initializeCombos = () => {
    const savedCombos = localStorage.getItem(STORAGE_KEY);

    if (savedCombos !== null) {
        try {
            const parsedCombos = JSON.parse(savedCombos);

            if (!Array.isArray(parsedCombos)) {
                throw new Error("Dữ liệu combo không hợp lệ.");
            }

            const normalizedCombos = parsedCombos.map(
                normalizeStoredCombo
            );

            // Tự động cập nhật dữ liệu combo cũ.
            const hasChanged = parsedCombos.some(
                (combo, index) =>
                    combo.stockQuantity !==
                        normalizedCombos[index].stockQuantity
            );

            if (hasChanged) {
                saveCombos(normalizedCombos);
            }

            return normalizedCombos;
        } catch (error) {
            console.error("Không thể đọc dữ liệu combo:", error);

            throw new Error(
                error.message ||
                "Dữ liệu combo trong trình duyệt không hợp lệ."
            );
        }
    }

    const initialCombos = combosData.map((combo) =>
        normalizeStoredCombo(combo)
    );

    saveCombos(initialCombos);

    return initialCombos;
};

//=================== Lấy danh sách combo ========================

export const getCombos = async () => {
    return initializeCombos();
};

//=================== Lấy combo theo ID ========================

export const getComboById = async (id) => {
    const combos = await getCombos();

    return (
        combos.find(
            (combo) => String(combo.comboId) === String(id)
        ) || null
    );
};

//=================== Lấy combo đang kinh doanh ========================

export const getActiveCombos = async () => {
    const combos = await getCombos();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return combos.filter((combo) => {
        if (
            combo.status !== "Active" ||
            Number(combo.stockQuantity) <= 0
        ) {
            return false;
        }

        if (combo.startDate) {
            const startDate = new Date(combo.startDate);
            startDate.setHours(0, 0, 0, 0);

            if (today < startDate) {
                return false;
            }
        }

        if (combo.endDate) {
            const endDate = new Date(combo.endDate);
            endDate.setHours(23, 59, 59, 999);

            if (today > endDate) {
                return false;
            }
        }

        return true;
    });
};

//=================== Thêm combo ========================

export const createCombo = async (comboData) => {
    const combos = await getCombos();

    validateCombo(comboData, combos);

    const newId =
        Math.max(
            0,
            ...combos.map(
                (combo) => Number(combo.comboId) || 0
            )
        ) + 1;

    const newCombo = {
        comboId: newId,
        ...normalizeCombo(comboData),
        createdAt: new Date().toISOString()
    };

    saveCombos([...combos, newCombo]);

    return newCombo;
};

//=================== Cập nhật combo ========================

export const updateCombo = async (id, comboData) => {
    const combos = await getCombos();

    const existingCombo = combos.find(
        (combo) => String(combo.comboId) === String(id)
    );

    if (!existingCombo) {
        throw new Error("Không tìm thấy combo cần cập nhật.");
    }

    validateCombo(comboData, combos, id);

    const updatedCombo = {
        ...existingCombo,
        ...normalizeCombo(comboData),
        updatedAt: new Date().toISOString()
    };

    const updatedCombos = combos.map((combo) =>
        String(combo.comboId) === String(id)
            ? updatedCombo
            : combo
    );

    saveCombos(updatedCombos);

    return updatedCombo;
};

//=================== Cập nhật trạng thái combo ========================

export const updateComboStatus = async (id, status) => {
    if (!COMBO_STATUS_OPTIONS.includes(status)) {
        throw new Error("Trạng thái combo không hợp lệ.");
    }

    const combos = await getCombos();

    const existingCombo = combos.find(
        (combo) => String(combo.comboId) === String(id)
    );

    if (!existingCombo) {
        throw new Error("Không tìm thấy combo.");
    }

    const updatedCombos = combos.map((combo) =>
        String(combo.comboId) === String(id)
            ? {
                ...combo,
                status,
                updatedAt: new Date().toISOString()
            }
            : combo
    );

    saveCombos(updatedCombos);

    return updatedCombos.find(
        (combo) => String(combo.comboId) === String(id)
    );
};

//=================== Trừ tồn kho combo ========================

export const decreaseComboStock = async (quantities = {}) => {
    if (
        !quantities ||
        typeof quantities !== "object" ||
        Array.isArray(quantities)
    ) {
        throw new Error("Danh sách số lượng combo không hợp lệ.");
    }

    const combos = await getCombos();

    const updatedCombos = combos.map((combo) => ({
        ...combo
    }));

    for (const [comboId, rawQuantity] of Object.entries(quantities)) {
        const quantity = Number(rawQuantity);

        if (quantity <= 0) {
            continue;
        }

        if (!Number.isSafeInteger(quantity)) {
            throw new Error("Số lượng combo phải là số nguyên dương.");
        }

        const combo = updatedCombos.find(
            (item) => String(item.comboId) === String(comboId)
        );

        if (!combo || combo.status !== "Active") {
            throw new Error(
                `Combo có ID ${comboId} hiện không khả dụng.`
            );
        }

        const stockQuantity = normalizeStockQuantity(
            combo.stockQuantity
        );

        if (stockQuantity < quantity) {
            throw new Error(
                `Combo "${combo.comboName}" chỉ còn ${stockQuantity} phần trong kho. Vui lòng điều chỉnh số lượng.`
            );
        }

        combo.stockQuantity = stockQuantity - quantity;
        combo.updatedAt = new Date().toISOString();
    }

    saveCombos(updatedCombos);

    return updatedCombos;
};

//=================== Hoàn tồn kho combo ========================

export const restoreComboStock = async (quantities = {}) => {
    if (
        !quantities ||
        typeof quantities !== "object" ||
        Array.isArray(quantities)
    ) {
        throw new Error("Danh sách số lượng combo cần hoàn không hợp lệ.");
    }

    const combos = await getCombos();

    const updatedCombos = combos.map((combo) => ({
        ...combo
    }));

    for (const [comboId, rawQuantity] of Object.entries(quantities)) {
        const quantity = Number(rawQuantity);

        if (quantity <= 0) {
            continue;
        }

        if (!Number.isSafeInteger(quantity)) {
            throw new Error("Số lượng combo cần hoàn không hợp lệ.");
        }

        const combo = updatedCombos.find(
            (item) => String(item.comboId) === String(comboId)
        );

        if (!combo) {
            throw new Error(
                `Không tìm thấy combo có ID ${comboId} để hoàn kho.`
            );
        }

        const currentStock = normalizeStockQuantity(
            combo.stockQuantity
        );

        const nextStock = currentStock + quantity;

        if (!Number.isSafeInteger(nextStock)) {
            throw new Error("Số lượng tồn kho combo vượt giới hạn.");
        }

        combo.stockQuantity = nextStock;
        combo.updatedAt = new Date().toISOString();
    }

    saveCombos(updatedCombos);

    return updatedCombos;
};

//=================== Xóa combo ========================

export const deleteCombo = async (id) => {
    const combos = await getCombos();

    const existingCombo = combos.find(
        (combo) => String(combo.comboId) === String(id)
    );

    if (!existingCombo) {
        throw new Error("Không tìm thấy combo cần xóa.");
    }

    const updatedCombos = combos.filter(
        (combo) => String(combo.comboId) !== String(id)
    );

    saveCombos(updatedCombos);

    return existingCombo;
};

//=================== Ngừng kinh doanh combo ========================

export const deactivateCombo = async (id) => {
    return updateComboStatus(id, "Inactive");
};

//=================== Kích hoạt combo ========================

export const activateCombo = async (id) => {
    return updateComboStatus(id, "Active");
};
