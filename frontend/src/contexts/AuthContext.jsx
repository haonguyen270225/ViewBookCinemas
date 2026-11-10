
import {
    createContext,
    useContext,
    useState
} from "react";

import {
    getCurrentUser,
    loginUser,
    logoutUser,
    registerUser
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => getCurrentUser());
    const [notification, setNotification] = useState(null);

    const register = (formData) => {
        return registerUser(formData);
    };

    const login = (account, password) => {
        const loggedInUser = loginUser(account, password);
        setUser(loggedInUser);
        return loggedInUser;
    };

    const logout = () => {
        logoutUser();
        setUser(null);
    };

    const showNotification = (message, type = "success") => {
        setNotification({ message, type });
    };

    const clearNotification = () => {
        setNotification(null);
    };

    const value = {
        user,
        isAuthenticated: Boolean(user),
        register,
        login,
        logout,
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

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth phải được sử dụng bên trong AuthProvider."
        );
    }

    return context;
}
