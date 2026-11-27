
import categoriesData from "../data/productCategories.js";

const STORAGE_KEY = "viewbook-admin-product-categories";

// Lưu danh sách danh mục
const saveCategories = (categories) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
        return true;
    } catch (error) {
        console.error("Không thể lưu danh mục:", error);
        throw new Error("Không thể lưu dữ liệu danh mục.");
    }
};

// Khởi tạo danh sách danh mục
export const getCategories = () => {
    const savedCategories = localStorage.getItem(STORAGE_KEY);

    if (savedCategories !== null) {
        try {
            const parsed = JSON.parse(savedCategories);

            if (!Array.isArray(parsed)) {
                throw new Error("Dữ liệu danh mục không hợp lệ.");
            }

            return parsed.map((category) => ({
                ...category,
                status: category.status !== false
            }));
        } catch (error) {
            console.error("Không thể đọc danh mục:", error);
            throw new Error("Dữ liệu danh mục trong trình duyệt không hợp lệ.");
        }
    }

    const initialCategories = categoriesData.map((category) => ({
        ...category,
        status: category.status !== false
    }));

    saveCategories(initialCategories);

    return initialCategories;
};

// Lấy danh mục đang hoạt động
export const getActiveCategories = () => {
    return getCategories().filter((category) => category.status === true);
};

// Lấy danh mục theo ID
export const getCategoryById = (id) => {
    return (
        getCategories().find(
            (category) => String(category.categoryId) === String(id)
        ) || null
    );
};

// Chuẩn hóa tên danh mục
const normalizeName = (value) => {
    return String(value || "")
        .trim()
        .normalize("NFC")
        .toLocaleLowerCase("vi");
};

// Kiểm tra dữ liệu danh mục
const validateCategory = (data, categories, currentId = null) => {
    const categoryName = String(data?.categoryName || "").trim();

    if (!categoryName) {
        throw new Error("Vui lòng nhập tên danh mục.");
    }

    if (categoryName.length > 100) {
        throw new Error("Tên danh mục không được vượt quá 100 ký tự.");
    }

    const duplicated = categories.some(
        (category) =>
            normalizeName(category.categoryName) === normalizeName(categoryName) &&
            String(category.categoryId) !== String(currentId)
    );

    if (duplicated) {
        throw new Error("Tên danh mục đã tồn tại.");
    }

    if (typeof data.status !== "boolean") {
        throw new Error("Trạng thái danh mục không hợp lệ.");
    }
};

// Thêm danh mục
export const createCategory = (categoryData) => {
    const categories = getCategories();

    validateCategory(categoryData, categories);

    const newId =
        Math.max(
            0,
            ...categories.map((category) => Number(category.categoryId) || 0)
        ) + 1;

    const newCategory = {
        categoryId: newId,
        categoryName: categoryData.categoryName.trim(),
        description: String(categoryData.description || "").trim(),
        status: categoryData.status,
        createdAt: new Date().toISOString()
    };

    saveCategories([...categories, newCategory]);

    return newCategory;
};

// Cập nhật danh mục
export const updateCategory = (id, categoryData) => {
    const categories = getCategories();

    const existingCategory = categories.find(
        (category) => String(category.categoryId) === String(id)
    );

    if (!existingCategory) {
        throw new Error("Không tìm thấy danh mục cần cập nhật.");
    }

    validateCategory(categoryData, categories, id);

    const updatedCategory = {
        ...existingCategory,
        categoryName: categoryData.categoryName.trim(),
        description: String(categoryData.description || "").trim(),
        status: categoryData.status,
        updatedAt: new Date().toISOString()
    };

    const updatedCategories = categories.map((category) =>
        String(category.categoryId) === String(id)
            ? updatedCategory
            : category
    );

    saveCategories(updatedCategories);

    return updatedCategory;
};

// Bật / tắt danh mục
export const updateCategoryStatus = (id, status) => {
    if (typeof status !== "boolean") {
        throw new Error("Trạng thái danh mục không hợp lệ.");
    }

    const categories = getCategories();

    const existingCategory = categories.find(
        (category) => String(category.categoryId) === String(id)
    );

    if (!existingCategory) {
        throw new Error("Không tìm thấy danh mục.");
    }

    const updatedCategories = categories.map((category) =>
        String(category.categoryId) === String(id)
            ? {
                ...category,
                status,
                updatedAt: new Date().toISOString()
            }
            : category
    );

    saveCategories(updatedCategories);

    return updatedCategories.find(
        (category) => String(category.categoryId) === String(id)
    );
};

// Xóa danh mục
// products được truyền từ trang quản lý để tránh phụ thuộc vòng với productService.
export const deleteCategory = (id, products = []) => {
    const categories = getCategories();

    const existingCategory = categories.find(
        (category) => String(category.categoryId) === String(id)
    );

    if (!existingCategory) {
        throw new Error("Không tìm thấy danh mục cần xóa.");
    }

    const relatedProducts = products.filter(
        (product) => Number(product.categoryId) === Number(id)
    );

    if (relatedProducts.length > 0) {
        throw new Error(
            `Không thể xóa danh mục "${existingCategory.categoryName}" vì đang được sử dụng bởi ${relatedProducts.length} sản phẩm. Hãy chuyển các sản phẩm sang danh mục khác trước.`
        );
    }

    const updatedCategories = categories.filter(
        (category) => String(category.categoryId) !== String(id)
    );

    saveCategories(updatedCategories);

    return true;
};

// Thống kê danh mục
export const getCategoryStatistics = () => {
    const categories = getCategories();

    return {
        total: categories.length,
        active: categories.filter((category) => category.status).length,
        inactive: categories.filter((category) => !category.status).length
    };
};
