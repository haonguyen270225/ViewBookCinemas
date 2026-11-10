
const USERS_KEY = "vbc_demo_users";
const SESSION_KEY = "vbc_demo_session";

// Đọc danh sách tài khoản demo
const getUsers = () => {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch {
        return [];
    }
};

// Lưu danh sách tài khoản demo
const saveUsers = (users) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Chỉ lấy thông tin công khai của người dùng
const toPublicUser = (user) => ({
    userId: user.userId,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    phoneNumber: user.phoneNumber || "",
    avatarUrl: user.avatarUrl || ""
});

// Đăng ký tài khoản demo
export const registerUser = (formData) => {
    const users = getUsers();

    const username = formData.username.trim();
    const email = formData.email.trim().toLowerCase();

    const usernameExists = users.some(
        (user) => user.username.toLowerCase() === username.toLowerCase()
    );

    if (usernameExists) {
        throw new Error("Tên đăng nhập đã được sử dụng.");
    }

    const emailExists = users.some(
        (user) => user.email.toLowerCase() === email
    );

    if (emailExists) {
        throw new Error("Địa chỉ Email đã được đăng ký.");
    }

    const newUser = {
        userId: crypto.randomUUID(),
        fullName: formData.fullName.trim(),
        username,
        email,
        phoneNumber: formData.phoneNumber.trim(),
        password: formData.password,
        avatarUrl: ""
    };

    saveUsers([...users, newUser]);

    return toPublicUser(newUser);
};

// Đăng nhập bằng username hoặc email
export const loginUser = (account, password) => {
    const users = getUsers();
    const normalizedAccount = account.trim().toLowerCase();

    const user = users.find((item) =>
        item.username.toLowerCase() === normalizedAccount ||
        item.email.toLowerCase() === normalizedAccount
    );

    if (!user || user.password !== password) {
        throw new Error("Tên đăng nhập/Email hoặc mật khẩu không chính xác.");
    }

    const publicUser = toPublicUser(user);

    localStorage.setItem(SESSION_KEY, JSON.stringify(publicUser));

    return publicUser;
};

// Lấy phiên đăng nhập hiện tại
export const getCurrentUser = () => {
    try {
        return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
    } catch {
        return null;
    }
};

// Đăng xuất
export const logoutUser = () => {
    localStorage.removeItem(SESSION_KEY);
};
