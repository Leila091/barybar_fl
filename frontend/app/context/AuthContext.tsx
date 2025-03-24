"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface AuthContextType {
    isAuthenticated: boolean;
    userName: string | null;
    login: (email: string, token: string, firstName: string, lastName: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const name = localStorage.getItem("userName"); // Получаем имя и фамилию
        if (token && name) {
            setIsAuthenticated(true);
            setUserName(name); // Устанавливаем имя и фамилию
        }
    }, []);

    const login = (email: string, token: string, firstName: string, lastName: string) => {
        localStorage.setItem("token", token);
        localStorage.setItem("userName", `${firstName} ${lastName}`); // Сохраняем имя и фамилию
        setIsAuthenticated(true);
        setUserName(`${firstName} ${lastName}`); // Устанавливаем имя и фамилию
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userName"); // Удаляем имя и фамилию
        setIsAuthenticated(false);
        setUserName(null); // Сбрасываем имя и фамилию
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, userName, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};