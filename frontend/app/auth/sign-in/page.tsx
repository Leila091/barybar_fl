"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("http://localhost:3001/api/auth/sign-in", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                throw new Error("Неверный email или пароль");
            }

            const data = await res.json();

            // ✅ Сохраняем данные в localStorage
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("token", data.access_token);

            console.log("✅ Пользователь сохранён в localStorage:", data.user);

            login(email, data.access_token);

            window.dispatchEvent(new Event("storage")); // 🔥 Оповещаем другие вкладки о смене авторизации

            router.refresh(); // 🔄 Принудительное обновление
            router.push("/"); // 🔀 Перенаправление
        } catch (err: any) {
            setError(err.message);
        }
    };



    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
            <div className="bg-white p-8 rounded-xl shadow-lg w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    Вход в Barybar
                </h2>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium">Email</label>
                        <input
                            type="email"
                            className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-blue-400 outline-none transition"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium">Пароль</label>
                        <input
                            type="password"
                            className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-blue-400 outline-none transition"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-3 rounded-lg text-lg font-semibold shadow-md hover:bg-blue-600 transition"
                    >
                        Войти
                    </button>
                </form>
                <p className="text-center mt-4 text-gray-600">
                    Нет аккаунта?{" "}
                    <a href="/auth/sign-up" className="text-blue-500 hover:underline">
                        Зарегистрируйтесь
                    </a>
                </p>
            </div>
        </div>
    );
}
