
import productsData from "../data/products.js";
import { productCategories } from "../data/productCategories.js";

const STORAGE_KEY = "viewbook-admin-products";

const PRODUCT_STATUS_OPTIONS = ["Active", "Inactive"];

//=================== Lưu danh sách sản phẩm ========================

const saveProducts = (products) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (error) {
        console.error("Không thể lưu sản phẩm:", error);
        throw new Error("Không thể lưu dữ liệu sản phẩm.");
    }
};

//=================== Kiểm tra danh mục ========================

const validateCategory = (categoryId) => {
    const category = productCategories.find(
        (item) => Number(item.categoryId) === Number(categoryId)
    );

    if (!category || !category.status) {
        throw new Error("Danh mục không tồn tại hoặc đang ngừng hoạt động.");
    }

    return category;
};

//=================== Kiểm tra dữ liệu sản phẩm ========================

const validateProduct = (data, products, currentId = null) => {
    const {
        productName,
        categoryId,
        description,
        price,
        stockQuantity,
        status
    } = data || {};

    if (!productName || !productName.trim()) {
        throw new Error("Vui lòng nhập tên sản phẩm.");
    }

    const normalizedName = productName.trim().toLocaleLowerCase("vi");

    const duplicatedName = products.some(
        (product) =>
            product.productName.trim().toLocaleLowerCase("vi") === normalizedName &&
            String(product.productId) !== String(currentId)
    );

    if (duplicatedName) {
        throw new Error("Tên sản phẩm đã tồn tại.");
    }

    validateCategory(categoryId);

    if (!description || !description.trim()) {
        throw new Error("Vui lòng nhập mô tả sản phẩm.");
    }

    if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
        throw new Error("Giá sản phẩm phải lớn hơn 0.");
    }

    if (
        !Number.isInteger(Number(stockQuantity)) ||
        Number(stockQuantity) < 0
    ) {
        throw new Error("Số lượng tồn kho phải là số nguyên không âm.");
    }

    if (!PRODUCT_STATUS_OPTIONS.includes(status)) {
        throw new Error("Trạng thái sản phẩm không hợp lệ.");
    }
};

//=================== Chuẩn hóa dữ liệu sản phẩm ========================

const normalizeProduct = (data) => ({
    productName: data.productName.trim(),
    categoryId: Number(data.categoryId),
    description: data.description.trim(),
    price: Number(data.price),
    imageUrl: data.imageUrl?.trim() || "",
    stockQuantity: Number(data.stockQuantity),
    status: data.status
});

//=================== Khởi tạo dữ liệu ========================

const initializeProducts = () => {
    const savedProducts = localStorage.getItem(STORAGE_KEY);

    if (savedProducts !== null) {
        try {
            const parsedProducts = JSON.parse(savedProducts);

            if (!Array.isArray(parsedProducts)) {
                throw new Error("Dữ liệu sản phẩm không hợp lệ.");
            }

            return parsedProducts;
        } catch (error) {
            console.error("Không thể đọc dữ liệu sản phẩm:", error);
            throw new Error("Dữ liệu sản phẩm trong trình duyệt không hợp lệ.");
        }
    }

    const initialProducts = productsData.map((product) => ({
        ...product,
        status: product.status || "Active"
    }));

    saveProducts(initialProducts);

    return initialProducts;
};

//=================== Lấy danh sách sản phẩm ========================

export const getProducts = async () => {
    return initializeProducts();
};

//=================== Lấy danh sách sản phẩm đang kinh doanh ========================

export const getActiveProducts = async () => {
    const products = await getProducts();

    return products.filter(
        (product) => product.status === "Active"
    );
};

//=================== Lấy sản phẩm theo ID ========================

export const getProductById = async (id) => {
    const products = await getProducts();

    return (
        products.find(
            (product) => String(product.productId) === String(id)
        ) || null
    );
};

//=================== Lấy sản phẩm theo danh mục ========================

export const getProductsByCategoryId = async (categoryId) => {
    const products = await getProducts();

    return products.filter(
        (product) => Number(product.categoryId) === Number(categoryId)
    );
};

//=================== Thêm sản phẩm ========================

export const createProduct = async (productData) => {
    const products = await getProducts();

    validateProduct(productData, products);

    const newId =
        Math.max(
            0,
            ...products.map((product) => Number(product.productId) || 0)
        ) + 1;

    const newProduct = {
        productId: newId,
        ...normalizeProduct(productData),
        createdAt: new Date().toISOString()
    };

    saveProducts([...products, newProduct]);

    return newProduct;
};

//=================== Cập nhật sản phẩm ========================

export const updateProduct = async (id, productData) => {
    const products = await getProducts();

    const existingProduct = products.find(
        (product) => String(product.productId) === String(id)
    );

    if (!existingProduct) {
        throw new Error("Không tìm thấy sản phẩm cần cập nhật.");
    }

    validateProduct(productData, products, id);

    const updatedProduct = {
        ...existingProduct,
        ...normalizeProduct(productData),
        updatedAt: new Date().toISOString()
    };

    const updatedProducts = products.map((product) =>
        String(product.productId) === String(id)
            ? updatedProduct
            : product
    );

    saveProducts(updatedProducts);

    return updatedProduct;
};

//=================== Cập nhật trạng thái sản phẩm ========================

export const updateProductStatus = async (id, status) => {
    if (!PRODUCT_STATUS_OPTIONS.includes(status)) {
        throw new Error("Trạng thái sản phẩm không hợp lệ.");
    }

    const products = await getProducts();

    const existingProduct = products.find(
        (product) => String(product.productId) === String(id)
    );

    if (!existingProduct) {
        throw new Error("Không tìm thấy sản phẩm.");
    }

    const updatedProducts = products.map((product) =>
        String(product.productId) === String(id)
            ? {
                ...product,
                status,
                updatedAt: new Date().toISOString()
            }
            : product
    );

    saveProducts(updatedProducts);

    return updatedProducts.find(
        (product) => String(product.productId) === String(id)
    );
};

//=================== Ngừng kinh doanh sản phẩm ========================

export const deactivateProduct = async (id) => {
    return updateProductStatus(id, "Inactive");
};

//=================== Kích hoạt sản phẩm ========================

export const activateProduct = async (id) => {
    return updateProductStatus(id, "Active");
};
