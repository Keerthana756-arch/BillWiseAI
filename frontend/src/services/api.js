import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || (typeof window !== "undefined" && window.location.port === "5173" ? "http://localhost:8080/api" : "/api"),
    timeout: 15000,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("billwise_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            const currentPath = window.location.pathname;
            if (currentPath !== "/login" && currentPath !== "/register" && currentPath !== "/") {
                localStorage.removeItem("billwise_token");
                localStorage.removeItem("billwise_user");
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;