import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordForm({
                                               onBackToSignIn,
                                           }: {
    onBackToSignIn: () => void;
}) {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        if (!email) {
            setError("Пожалуйста, введите ваш email");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:3001/api/auth/password-reset/request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                throw new Error("Не удалось отправить запрос на сброс пароля");
            }

            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "Произошла ошибка при отправке запроса");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                Восстановление пароля
            </h2>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
                    {error}
                </div>
            )}

            {success ? (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center">
                    Инструкции по сбросу пароля отправлены на {email}, если такой email зарегистрирован.
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
                            Ваш email
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
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
                        {isLoading ? "Отправка..." : "Отправить ссылку"}
                    </button>
                </form>
            )}

            <div className="mt-6 text-center">
                <button
                    onClick={onBackToSignIn}
                    className="text-blue-500 hover:text-blue-600 hover:underline focus:outline-none"
                >
                    Вернуться к входу
                </button>
            </div>
        </div>
    );
}