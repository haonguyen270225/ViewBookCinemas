
import combosData from "../data/combos.js";

const STORAGE_KEY = "viewbook-admin-combos";

const COMBO_STATUS_OPTIONS = ["Active", "Inactive"];

//=================== Lưu danh sách combo ========================

const saveCombos = (combos) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(combos));
    } catch (error) {
        console.error("Không thể lưu danh sách combo:", error);
        throw new Error("Không thể lưu dữ liệu combo.");
    }
};

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
        numericPrice <= 0
    ) {
        throw new Error("Giá combo phải là số nguyên dương.");
    }

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

            return parsedCombos;
        } catch (error) {
            console.error("Không thể đọc dữ liệu combo:", error);

            throw new Error(
                "Dữ liệu combo trong trình duyệt không hợp lệ."
            );
        }
    }

    const initialCombos = combosData.map((combo) => ({
        ...combo,
        status: combo.status || "Active",
        startDate: combo.startDate || null,
        endDate: combo.endDate || null
    }));

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
        if (combo.status !== "Active") {
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
