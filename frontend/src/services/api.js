import axios from "axios";

//========================= API Configuration ========================

const api = axios.create({
    baseURL:
        import.meta.env.VITE_API_BASE_URL ||
        "https://localhost:7026/api",

    headers: {
        "Content-Type": "application/json"
    },
    timeout: 15000
});

//========================= JWT Interceptor ========================

api.interceptors.request.use(
    (config) => {
        const token =
            sessionStorage.getItem("vbc_access_token") ||
            localStorage.getItem("vbc_access_token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;