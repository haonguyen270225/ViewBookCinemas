
//========================= Cấu hình lưu trữ ========================

const USERS_STORAGE_KEY = "vbc_demo_users";
const SESSION_STORAGE_KEY = "vbc_demo_session";

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

//========================= Lấy người dùng hiện tại ========================

export const getCurrentUser = () => {
    try {
        const session = localStorage.getItem(SESSION_STORAGE_KEY);
        return session ? JSON.parse(session) : null;
    } catch (error) {
        console.error("Không thể đọc phiên đăng nhập:", error);
        return null;
    }
};

//========================= Đăng ký tài khoản ========================

export const registerUser = (formData) => {
    const users = getStoredUsers();

    const username = formData.username.trim();
    const email = formData.email.trim().toLowerCase();

    const isUsernameExists = users.some(
        (user) =>
            user.username?.toLowerCase() === username.toLowerCase()
    );

    if (isUsernameExists) {
        throw new Error("Tên đăng nhập đã được sử dụng.");
    }

    const isEmailExists = users.some(
        (user) =>
            user.email?.toLowerCase() === email
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

//========================= Đăng nhập ========================

export const loginUser = (account, password) => {
    const users = getStoredUsers();
    const normalizedAccount = account.trim().toLowerCase();

    const user = users.find(
        (item) =>
            item.username?.toLowerCase() === normalizedAccount ||
            item.email?.toLowerCase() === normalizedAccount
    );

    if (!user || user.password !== password) {
        throw new Error(
            "Tên đăng nhập, Email hoặc mật khẩu không chính xác."
        );
    }

    if ((user.status || "Active") !== "Active") {
        throw new Error(
            "Tài khoản của bạn hiện đang bị khóa. Vui lòng liên hệ quản trị viên."
        );
    }

    const publicUser = getPublicUser(user);

    localStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify(publicUser)
    );

    return publicUser;
};

//========================= Đăng xuất ========================

export const logoutUser = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
};

//========================= Cập nhật thông tin cá nhân ========================

export const updateUserProfile = (formData) => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
        throw new Error("Bạn chưa đăng nhập.");
    }

    const users = getStoredUsers();

    const userIndex = users.findIndex(
        (user) =>
            String(user.userId) === String(currentUser.userId)
    );

    if (userIndex === -1) {
        throw new Error("Không tìm thấy tài khoản.");
    }

    const updatedFullName = formData.fullName.trim();
    const updatedEmail = formData.email.trim().toLowerCase();

    const isEmailExists = users.some(
        (user, index) =>
            index !== userIndex &&
            user.email?.toLowerCase() === updatedEmail
    );

    if (isEmailExists) {
        throw new Error(
            "Email đã được sử dụng bởi tài khoản khác."
        );
    }

    const updatedUser = {
        ...users[userIndex],
        fullName: updatedFullName,
        email: updatedEmail,
        phoneNumber: formData.phoneNumber?.trim() || "",
        dateOfBirth: formData.dateOfBirth || "",
        gender: formData.gender || "",
        avatarUrl: formData.avatarUrl || "",
        status: users[userIndex].status || "Active",
        updatedAt: new Date().toISOString()
    };

    users[userIndex] = updatedUser;
    saveUsers(users);

    const publicUser = getPublicUser(updatedUser);

    localStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify(publicUser)
    );

    return publicUser;
};

//========================= Đổi mật khẩu ========================

export const changePassword = (oldPassword, newPassword) => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
        throw new Error("Bạn chưa đăng nhập.");
    }

    const users = getStoredUsers();

    const userIndex = users.findIndex(
        (user) =>
            String(user.userId) === String(currentUser.userId)
    );

    if (userIndex === -1) {
        throw new Error("Không tìm thấy tài khoản.");
    }

    if ((users[userIndex].status || "Active") !== "Active") {
        throw new Error("Tài khoản hiện đang bị khóa.");
    }

    if (users[userIndex].password !== oldPassword) {
        throw new Error("Mật khẩu hiện tại không chính xác.");
    }

    if (!newPassword || newPassword.length < 8) {
        throw new Error(
            "Mật khẩu mới phải có ít nhất 8 ký tự."
        );
    }

    users[userIndex] = {
        ...users[userIndex],
        password: newPassword,
        updatedAt: new Date().toISOString()
    };

    saveUsers(users);

    return true;
};

//========================= Lấy danh sách tài khoản cho Admin ========================

export const getAllUsers = () => {
    return getStoredUsers().map(getPublicUser);
};

//========================= Lấy tài khoản theo ID ========================

export const getUserById = (id) => {
    const user = getStoredUsers().find(
        (item) =>
            String(item.userId) === String(id)
    );

    return getPublicUser(user);
};

//========================= Admin cập nhật thông tin khách hàng ========================

export const updateUserByAdmin = (id, formData) => {
    const users = getStoredUsers();

    const userIndex = users.findIndex(
        (user) =>
            String(user.userId) === String(id)
    );

    if (userIndex === -1) {
        throw new Error("Không tìm thấy khách hàng.");
    }

    const fullName = formData.fullName?.trim();
    const email = formData.email?.trim().toLowerCase();
    const phoneNumber = formData.phoneNumber?.trim() || "";

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
        throw new Error(
            "Email đã được sử dụng bởi tài khoản khác."
        );
    }

    const updatedUser = {
        ...users[userIndex],
        fullName,
        email,
        phoneNumber,
        dateOfBirth: formData.dateOfBirth || "",
        gender: formData.gender || "",
        avatarUrl: formData.avatarUrl?.trim() || "",
        updatedAt: new Date().toISOString()
    };

    users[userIndex] = updatedUser;
    saveUsers(users);

    const publicUser = getPublicUser(updatedUser);

    // Đồng bộ phiên đăng nhập nếu Admin đang chỉnh sửa chính tài khoản đó.
    const currentUser = getCurrentUser();

    if (
        currentUser &&
        String(currentUser.userId) === String(id)
    ) {
        localStorage.setItem(
            SESSION_STORAGE_KEY,
            JSON.stringify(publicUser)
        );
    }

    return publicUser;
};

//========================= Admin cập nhật trạng thái tài khoản ========================

export const updateUserStatus = (id, status) => {
    const validStatuses = ["Active", "Inactive"];

    if (!validStatuses.includes(status)) {
        throw new Error("Trạng thái tài khoản không hợp lệ.");
    }

    const users = getStoredUsers();

    const userIndex = users.findIndex(
        (user) =>
            String(user.userId) === String(id)
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

    // Nếu khóa tài khoản đang đăng nhập thì kết thúc phiên hiện tại.
    if (
        currentUser &&
        String(currentUser.userId) === String(id) &&
        status === "Inactive"
    ) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
    }

    // Nếu cập nhật tài khoản hiện tại nhưng vẫn Active,
    // đồng bộ lại thông tin phiên đăng nhập.
    if (
        currentUser &&
        String(currentUser.userId) === String(id) &&
        status === "Active"
    ) {
        localStorage.setItem(
            SESSION_STORAGE_KEY,
            JSON.stringify(getPublicUser(updatedUser))
        );
    }

    return getPublicUser(updatedUser);
};
