import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        if (!token) {
            setError("Недействительная ссылка для сброса пароля");
            return;
        }

        if (!newPassword || !confirmPassword) {
            setError("Пожалуйста, заполните все поля");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Пароли не совпадают");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:3001/api/auth/password-reset/reset", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token, newPassword }),
            });

            if (!response.ok) {
                throw new Error("Не удалось сбросить пароль");
            }

            setSuccess(true);
            setTimeout(() => router.push("/signin"), 3000);
        } catch (err: any) {
            setError(err.message || "Произошла ошибка при сбросе пароля");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                Сброс пароля
            </h2>

            {email && (
                <p className="mb-4 text-center text-gray-600">
                    Для аккаунта: <span className="font-medium">{email}</span>
                </p>
            )}

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
                    {error}
                </div>
            )}

            {success ? (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center">
                    Пароль успешно изменен! Перенаправляем на страницу входа...
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-1">
                            Новый пароль
                        </label>
                        <input
                            id="newPassword"
                            type="password"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={8}
                            autoComplete="new-password"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-1">
                            Подтвердите пароль
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={8}
                            autoComplete="new-password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3 px-4 rounded-lg text-lg font-semibold shadow-md transition-colors ${
                            isLoading
                                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                                : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}
                    >
                        {isLoading ? "Сброс..." : "Сбросить пароль"}
                    </button>
                </form>
            )}
        </div>
    );
}