
import api from "./api";

//========================= Cấu hình lưu trữ ========================

const USERS_STORAGE_KEY = "vbc_demo_users";
const SESSION_STORAGE_KEY = "vbc_demo_session";
const ACCESS_TOKEN_KEY = "vbc_access_token";

const MAX_AVATAR_DATA_LENGTH = 3 * 1024 * 1024;

//========================= Đọc và lưu dữ liệu ========================

const getStoredUsers = () => {
    try {
        const users = localStorage.getItem(USERS_STORAGE_KEY);
        const parsedUsers = users ? JSON.parse(users) : [];

        return Array.isArray(parsedUsers) ? parsedUsers : [];
    } catch (error) {
        console.error("Không thể đọc dữ liệu tài khoản:", error);
        return [];
    }
};

const saveUsers = (users) => {
    localStorage.setItem(
        USERS_STORAGE_KEY,
        JSON.stringify(users)
    );
};

//========================= Quản lý nơi lưu phiên đăng nhập ========================

const getSessionStorage = () => {
    if (sessionStorage.getItem(SESSION_STORAGE_KEY)) {
        return sessionStorage;
    }

    if (localStorage.getItem(SESSION_STORAGE_KEY)) {
        return localStorage;
    }

    return null;
};

const clearAuthStorage = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);

    localStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
};

//========================= Thông tin người dùng công khai ========================

const getPublicUser = (user) => {
    if (!user) return null;

    const {
        password,
        ...publicUser
    } = user;

    return {
        ...publicUser,
        status: publicUser.status || "Active"
    };
};

//========================= Đồng bộ phiên đăng nhập ========================

const syncCurrentSession = (user) => {
    const currentUser = getCurrentUser();

    if (
        currentUser &&
        String(currentUser.userId) === String(user.userId)
    ) {
        const storage = getSessionStorage();

        if (storage) {
            storage.setItem(
                SESSION_STORAGE_KEY,
                JSON.stringify(getPublicUser(user))
            );
        }
    }
};

//========================= Kiểm tra tên đăng nhập ========================

const normalizeUsername = (username) => {
    return String(username || "").trim();
};

const validateUsername = (username, users, currentIndex = -1) => {
    const normalizedUsername = normalizeUsername(username);

    if (!normalizedUsername) {
        throw new Error("Tên đăng nhập không được để trống.");
    }

    if (normalizedUsername.length < 4) {
        throw new Error("Tên đăng nhập phải có ít nhất 4 ký tự.");
    }

    if (normalizedUsername.length > 30) {
        throw new Error("Tên đăng nhập không được vượt quá 30 ký tự.");
    }

    const isExists = users.some(
        (user, index) =>
            index !== currentIndex &&
            user.username?.toLowerCase() === normalizedUsername.toLowerCase()
    );

    if (isExists) {
        throw new Error("Tên đăng nhập đã được sử dụng.");
    }

    return normalizedUsername;
};

//========================= Kiểm tra avatar ========================

const validateAvatar = (avatarValue) => {
    const avatar = String(avatarValue || "").trim();

    if (
        avatar.startsWith("data:image/") &&
        avatar.length > MAX_AVATAR_DATA_LENGTH
    ) {
        throw new Error(
            "Ảnh đại diện quá lớn. Vui lòng chọn ảnh có dung lượng tối đa khoảng 2MB."
        );
    }

    return avatar;
};

//========================= Tạo mật khẩu tạm thời ========================

const generateTemporaryPassword = (length = 12) => {
    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";

    const randomValues = new Uint32Array(length);

    if (globalThis.crypto?.getRandomValues) {
        globalThis.crypto.getRandomValues(randomValues);
    } else {
        for (let i = 0; i < length; i++) {
            randomValues[i] = Math.floor(Math.random() * 0xffffffff);
        }
    }

    return Array.from(randomValues)
        .map(value => characters[value % characters.length])
        .join("");
};

//========================= Lấy người dùng hiện tại ========================

export const getCurrentUser = () => {
    try {
        const storage = getSessionStorage();

        if (!storage) return null;

        const session = storage.getItem(SESSION_STORAGE_KEY);

        return session ? JSON.parse(session) : null;
    } catch (error) {
        console.error("Không thể đọc phiên đăng nhập:", error);
        return null;
    }
};

//========================= Đăng ký tài khoản DEMO ========================
// Chức năng này vẫn sử dụng localStorage.
// Sẽ kết nối Register API ở bước tích hợp tiếp theo.

export const registerUser = (formData) => {
    const users = getStoredUsers();

    const username = validateUsername(formData.username, users);
    const email = formData.email.trim().toLowerCase();

    const isEmailExists = users.some(
        user => user.email?.toLowerCase() === email
    );

    if (isEmailExists) {
        throw new Error("Email đã được sử dụng.");
    }

    const newUser = {
        userId: Date.now(),
        fullName: formData.fullName.trim(),
        username,
        email,
        phoneNumber: formData.phoneNumber?.trim() || "",
        dateOfBirth: "",
        gender: "",
        avatarUrl: "",
        password: formData.password,
        status: "Active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    return getPublicUser(newUser);
};

//========================= Đăng nhập bằng Backend API ========================

export const loginUser = async (account, password, rememberMe = false) => {
    try {
        const response = await api.post("/auth/login", {
            account: account.trim(),
            password
        });

        const {
            token,
            expiresAt,
            user
        } = response.data;

        if (!token || !user) {
            throw new Error(
                "Dữ liệu đăng nhập từ máy chủ không hợp lệ."
            );
        }

        // Chuẩn hóa dữ liệu người dùng từ Backend.
        const sessionData = {
            ...user,
            role: user.roleName || user.role || "",
            expiresAt
        };

        // Xóa phiên cũ trước khi tạo phiên mới.
        clearAuthStorage();

        // Ghi nhớ đăng nhập:
        // Có chọn: localStorage.
        // Không chọn: sessionStorage.
        const storage = rememberMe
            ? localStorage
            : sessionStorage;

        storage.setItem(ACCESS_TOKEN_KEY, token);

        storage.setItem(
            SESSION_STORAGE_KEY,
            JSON.stringify(sessionData)
        );

        return sessionData;

    } catch (error) {
        if (error.response?.status === 401) {
            throw new Error(
                "Tên đăng nhập, Email hoặc mật khẩu không chính xác."
            );
        }

        if (error.response?.status === 400) {
            throw new Error(
                "Thông tin đăng nhập không hợp lệ."
            );
        }

        if (error.code === "ERR_NETWORK") {
            throw new Error(
                "Không thể kết nối máy chủ. Vui lòng kiểm tra Backend và cấu hình CORS."
            );
        }

        if (error.code === "ECONNABORTED") {
            throw new Error(
                "Máy chủ phản hồi quá lâu. Vui lòng thử lại."
            );
        }

        throw new Error(
            error.response?.data?.message ||
            error.message ||
            "Đăng nhập thất bại. Vui lòng thử lại."
        );
    }
};

//========================= Kiểm tra người dùng bằng Backend API ========================

export const verifyCurrentUser = async () => {
    try {
        const response = await api.get("/auth/me");

        return response.data;
    } catch (error) {
        clearAuthStorage();
        throw error;
    }
};

//========================= Đăng xuất ========================

export const logoutUser = () => {
    clearAuthStorage();
};

//========================= Cập nhật thông tin cá nhân DEMO ========================
// Chức năng này hiện vẫn sử dụng dữ liệu localStorage.

export const updateUserProfile = (formData) => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
        throw new Error("Bạn chưa đăng nhập.");
    }

    const users = getStoredUsers();

    const userIndex = users.findIndex(
        user => String(user.userId) === String(currentUser.userId)
    );

    if (userIndex === -1) {
        throw new Error("Không tìm thấy tài khoản trong dữ liệu demo.");
    }

    if ((users[userIndex].status || "Active") !== "Active") {
        throw new Error("Tài khoản hiện đang bị khóa.");
    }

    const updatedFullName = formData.fullName.trim();
    const updatedEmail = formData.email.trim().toLowerCase();

    if (!updatedFullName) {
        throw new Error("Họ và tên không được để trống.");
    }

    const isEmailExists = users.some(
        (user, index) =>
            index !== userIndex &&
            user.email?.toLowerCase() === updatedEmail
    );

    if (isEmailExists) {
        throw new Error("Email đã được sử dụng bởi tài khoản khác.");
    }

    const updatedUser = {
        ...users[userIndex],
        fullName: updatedFullName,
        email: updatedEmail,
        phoneNumber: formData.phoneNumber?.trim() || "",
        dateOfBirth: formData.dateOfBirth || "",
        gender: formData.gender || "",
        avatarUrl: validateAvatar(
            formData.avatarUrl ?? users[userIndex].avatarUrl
        ),
        status: users[userIndex].status || "Active",
        updatedAt: new Date().toISOString()
    };

    users[userIndex] = updatedUser;
    saveUsers(users);

    const publicUser = getPublicUser(updatedUser);

    syncCurrentSession(publicUser);

    return publicUser;
};

//========================= Đổi mật khẩu khách hàng DEMO ========================
// Chức năng này chưa kết nối Change Password API.

export const changePassword = (oldPassword, newPassword) => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
        throw new Error("Bạn chưa đăng nhập.");
    }

    const users = getStoredUsers();

    const userIndex = users.findIndex(
        user => String(user.userId) === String(currentUser.userId)
    );

    if (userIndex === -1) {
        throw new Error("Không tìm thấy tài khoản trong dữ liệu demo.");
    }

    if ((users[userIndex].status || "Active") !== "Active") {
        throw new Error("Tài khoản hiện đang bị khóa.");
    }

    if (users[userIndex].password !== oldPassword) {
        throw new Error("Mật khẩu hiện tại không chính xác.");
    }

    if (!newPassword || newPassword.length < 8) {
        throw new Error("Mật khẩu mới phải có ít nhất 8 ký tự.");
    }

    users[userIndex] = {
        ...users[userIndex],
        password: newPassword,
        updatedAt: new Date().toISOString()
    };

    saveUsers(users);

    return true;
};

//========================= Lấy danh sách tài khoản cho Admin DEMO ========================

export const getAllUsers = () => {
    return getStoredUsers().map(getPublicUser);
};

//========================= Lấy tài khoản theo ID DEMO ========================

export const getUserById = (id) => {
    const user = getStoredUsers().find(
        item => String(item.userId) === String(id)
    );

    return getPublicUser(user);
};

//========================= Admin cập nhật thông tin khách hàng DEMO ========================

export const updateUserByAdmin = (id, formData) => {
    const users = getStoredUsers();

    const userIndex = users.findIndex(
        user => String(user.userId) === String(id)
    );

    if (userIndex === -1) {
        throw new Error("Không tìm thấy khách hàng.");
    }

    const fullName = formData.fullName?.trim();
    const email = formData.email?.trim().toLowerCase();

    if (!fullName) {
        throw new Error("Họ và tên không được để trống.");
    }

    if (!email) {
        throw new Error("Email không được để trống.");
    }

    const isEmailExists = users.some(
        (user, index) =>
            index !== userIndex &&
            user.email?.toLowerCase() === email
    );

    if (isEmailExists) {
        throw new Error("Email đã được sử dụng bởi tài khoản khác.");
    }

    const username = formData.username !== undefined
        ? validateUsername(formData.username, users, userIndex)
        : users[userIndex].username;

    const updatedUser = {
        ...users[userIndex],
        username,
        fullName,
        email,
        phoneNumber: formData.phoneNumber?.trim() || "",
        dateOfBirth: formData.dateOfBirth || "",
        gender: formData.gender || "",
        avatarUrl: validateAvatar(
            formData.avatarUrl ?? users[userIndex].avatarUrl
        ),
        updatedAt: new Date().toISOString()
    };

    users[userIndex] = updatedUser;
    saveUsers(users);

    syncCurrentSession(updatedUser);

    return getPublicUser(updatedUser);
};

//========================= Admin đặt lại tên đăng nhập DEMO ========================

export const resetCustomerUsername = (id, newUsername) => {
    const users = getStoredUsers();

    const userIndex = users.findIndex(
        user => String(user.userId) === String(id)
    );

    if (userIndex === -1) {
        throw new Error("Không tìm thấy khách hàng.");
    }

    const username = validateUsername(
        newUsername,
        users,
        userIndex
    );

    const updatedUser = {
        ...users[userIndex],
        username,
        updatedAt: new Date().toISOString()
    };

    users[userIndex] = updatedUser;
    saveUsers(users);

    syncCurrentSession(updatedUser);

    return getPublicUser(updatedUser);
};

//========================= Admin tạo mật khẩu tạm thời DEMO ========================

export const resetCustomerPassword = (id) => {
    const users = getStoredUsers();

    const userIndex = users.findIndex(
        user => String(user.userId) === String(id)
    );

    if (userIndex === -1) {
        throw new Error("Không tìm thấy khách hàng.");
    }

    if ((users[userIndex].status || "Active") !== "Active") {
        throw new Error(
            "Không thể đặt lại mật khẩu cho tài khoản đang bị khóa."
        );
    }

    const temporaryPassword = generateTemporaryPassword();

    const updatedUser = {
        ...users[userIndex],
        password: temporaryPassword,
        updatedAt: new Date().toISOString()
    };

    users[userIndex] = updatedUser;
    saveUsers(users);

    return {
        customer: getPublicUser(updatedUser),
        temporaryPassword
    };
};

//========================= Admin cập nhật trạng thái tài khoản DEMO ========================

export const updateUserStatus = (id, status) => {
    const validStatuses = ["Active", "Inactive"];

    if (!validStatuses.includes(status)) {
        throw new Error("Trạng thái tài khoản không hợp lệ.");
    }

    const users = getStoredUsers();

    const userIndex = users.findIndex(
        user => String(user.userId) === String(id)
    );

    if (userIndex === -1) {
        throw new Error("Không tìm thấy khách hàng.");
    }

    const updatedUser = {
        ...users[userIndex],
        status,
        updatedAt: new Date().toISOString()
    };

    users[userIndex] = updatedUser;
    saveUsers(users);

    const currentUser = getCurrentUser();

    if (
        currentUser &&
        String(currentUser.userId) === String(id) &&
        status === "Inactive"
    ) {
        clearAuthStorage();
    } else {
        syncCurrentSession(updatedUser);
    }

    return getPublicUser(updatedUser);
};
