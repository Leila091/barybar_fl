// app/auth/auth.ts

// Регистрация пользователя
export async function registerUser(email: string, password: string, firstName: string, lastName: string) {
    try {
        const response = await fetch("http://localhost:3001/api/auth/sign-up", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password, firstName, lastName }),
        });

        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status}`);
        }

        const data = await response.json();

        // Сохраняем токен и имя пользователя только на стороне клиента
        if (typeof window !== "undefined") {
            localStorage.setItem("token", data.access_token);
            localStorage.setItem("userName", `${data.user.firstName} ${data.user.lastName}`);
        }

        return data;
    } catch (error) {
        console.error("Ошибка регистрации:", error);
        return null;
    }
}

// Вход пользователя
export async function loginUser(email: string, password: string) {
    try {
        const response = await fetch("http://localhost:3001/api/auth/sign-in", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status}`);
        }

        const data = await response.json();

        // Сохраняем токен и имя пользователя только на стороне клиента
        if (typeof window !== "undefined") {
            localStorage.setItem("token", data.access_token);
            localStorage.setItem("userName", `${data.user.firstName} ${data.user.lastName}`);
        }

        return data;
    } catch (error) {
        console.error("Ошибка входа:", error);
        return null;
    }
}

// Выход пользователя
export function logoutUser() {
    if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
    }
}

// Проверка аутентификации
export function isAuthenticated() {
    if (typeof window !== "undefined") {
        return !!localStorage.getItem("token");
    }
    return false; // На сервере всегда возвращаем false
}

// Получение имени пользователя
export function getUserName() {
    if (typeof window !== "undefined") {
        return localStorage.getItem("userName");
    }
    return null; // На сервере всегда возвращаем null
}