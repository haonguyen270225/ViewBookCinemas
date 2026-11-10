
//========================= Cấu hình lưu trữ ========================

const USERS_STORAGE_KEY = "vbc_demo_users";
const SESSION_STORAGE_KEY = "vbc_demo_session";

//========================= Đọc dữ liệu ========================

const getStoredUsers = () => {
    try {
        const users = localStorage.getItem(USERS_STORAGE_KEY);
        return users ? JSON.parse(users) : [];
    } catch (error) {
        console.error("Không thể đọc dữ liệu tài khoản:", error);
        return [];
    }
};

const saveUsers = (users) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

//========================= Thông tin người dùng công khai ========================

const getPublicUser = (user) => {
    if (!user) return null;

    const {
        password,
        ...publicUser
    } = user;

    return publicUser;
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

    // Kiểm tra tên đăng nhập đã tồn tại
    const isUsernameExists = users.some(
        (user) => user.username.toLowerCase() === username.toLowerCase()
    );

    if (isUsernameExists) {
        throw new Error("Tên đăng nhập đã được sử dụng.");
    }

    // Kiểm tra email đã tồn tại
    const isEmailExists = users.some(
        (user) => user.email.toLowerCase() === email
    );

    if (isEmailExists) {
        throw new Error("Email đã được sử dụng.");
    }

    // Tạo tài khoản mới
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
            item.username.toLowerCase() === normalizedAccount ||
            item.email.toLowerCase() === normalizedAccount
    );

    if (!user || user.password !== password) {
        throw new Error("Tên đăng nhập, Email hoặc mật khẩu không chính xác.");
    }

    const publicUser = getPublicUser(user);

    // Lưu phiên đăng nhập
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
        (user) => user.userId === currentUser.userId
    );

    if (userIndex === -1) {
        throw new Error("Không tìm thấy tài khoản.");
    }

    const updatedFullName = formData.fullName.trim();
    const updatedEmail = formData.email.trim().toLowerCase();

    // Kiểm tra email trùng với tài khoản khác
    const isEmailExists = users.some(
        (user, index) =>
            index !== userIndex &&
            user.email.toLowerCase() === updatedEmail
    );

    if (isEmailExists) {
        throw new Error("Email đã được sử dụng bởi tài khoản khác.");
    }

    // Chỉ cập nhật các trường thông tin cá nhân
    const updatedUser = {
        ...users[userIndex],
        fullName: updatedFullName,
        email: updatedEmail,
        phoneNumber: formData.phoneNumber?.trim() || "",
        dateOfBirth: formData.dateOfBirth || "",
        gender: formData.gender || "",
        avatarUrl: formData.avatarUrl || "",
        updatedAt: new Date().toISOString()
    };

    users[userIndex] = updatedUser;

    saveUsers(users);

    const publicUser = getPublicUser(updatedUser);

    // Đồng bộ lại phiên đăng nhập
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
        (user) => user.userId === currentUser.userId
    );

    if (userIndex === -1) {
        throw new Error("Không tìm thấy tài khoản.");
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
