import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("billwise_user");
        return saved ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyUser = async () => {
            const token = localStorage.getItem("billwise_token");
            if (token) {
                try {
                    const res = await api.get("/auth/me");
                    setUser(res.data);
                    localStorage.setItem("billwise_user", JSON.stringify(res.data));
                } catch (err) {
                    localStorage.removeItem("billwise_token");
                    localStorage.removeItem("billwise_user");
                    setUser(null);
                }
            }
            setLoading(false);
        };
        verifyUser();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post("/auth/login", { email, password });
            const data = response.data;
            localStorage.setItem("billwise_token", data.token);
            const userInfo = { id: data.id, name: data.name, email: data.email };
            localStorage.setItem("billwise_user", JSON.stringify(userInfo));
            setUser(userInfo);
            return { success: true };
        } catch (error) {
            const msg = error.response?.data?.error || error.response?.data?.message || "Invalid email or password.";
            return { success: false, message: msg };
        }
    };

    const register = async (name, email, password, confirmPassword) => {
        try {
            const response = await api.post("/auth/register", { name, email, password, confirmPassword });
            const data = response.data;
            localStorage.setItem("billwise_token", data.token);
            const userInfo = { id: data.id, name: data.name, email: data.email };
            localStorage.setItem("billwise_user", JSON.stringify(userInfo));
            setUser(userInfo);
            return { success: true };
        } catch (error) {
            const msg = error.response?.data?.error || error.response?.data?.message || "Registration failed.";
            return { success: false, message: msg };
        }
    };

    const logout = () => {
        localStorage.removeItem("billwise_token");
        localStorage.removeItem("billwise_user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}