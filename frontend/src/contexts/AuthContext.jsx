
import {
    createContext,
    useContext,
    useState
} from "react";

//========================= Import Auth Services ========================

import {
    getCurrentUser,
    loginUser,
    logoutUser,
    registerUser,
    updateUserProfile,
    changePassword
} from "../services/authService";

const AuthContext = createContext(null);

//========================= Auth Provider ========================

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => getCurrentUser());
    const [notification, setNotification] = useState(null);

    //========================= Đăng ký ========================

    const register = (formData) => {
        return registerUser(formData);
    };

    //========================= Đăng nhập ========================

    const login = (account, password) => {
        const loggedInUser = loginUser(account, password);

        setUser(loggedInUser);

        return loggedInUser;
    };

    //========================= Đăng xuất ========================

    const logout = () => {
        logoutUser();
        setUser(null);
    };

    //========================= Cập nhật thông tin cá nhân ========================

    const updateProfile = (formData) => {
        const updatedUser = updateUserProfile(formData);

        setUser(updatedUser);

        return updatedUser;
    };

    //========================= Đổi mật khẩu ========================

    const updatePassword = (oldPassword, newPassword) => {
        return changePassword(oldPassword, newPassword);
    };

    //========================= Thông báo ========================

    const showNotification = (message, type = "success") => {
        setNotification({ message, type });
    };

    const clearNotification = () => {
        setNotification(null);
    };

    //========================= Context Value ========================

    const value = {
        user,
        isAuthenticated: Boolean(user),
        register,
        login,
        logout,
        updateProfile,
        updatePassword,
        notification,
        showNotification,
        clearNotification
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

//========================= Custom Hook ========================

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth phải được sử dụng bên trong AuthProvider."
        );
    }

    return context;
}
