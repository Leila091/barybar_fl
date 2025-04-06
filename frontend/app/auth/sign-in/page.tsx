import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import ForgotPasswordForm from "../../../components/ForgotPasswordForm";

export default function SignInPage({
                                       onSuccess,
                                       onSwitchToSignUp,
                                   }: {
    onSuccess?: () => void;
    onSwitchToSignUp?: () => void;
}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    useEffect(() => {
        console.log('Component mounted');
        return () => {
            console.log('Component unmounted');
        };
    }, []);

    useEffect(() => {
        console.log('Component state updated:', {
            error,
            isLoading,
            showForgotPassword,
            errorType: typeof error,
            errorLength: error?.length
        });
        if (error) {
            console.log('Error component should be visible with message:', error);
        }
    }, [error, isLoading, showForgotPassword]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (!email || !password) {
            setError("Заполните все поля");
            setIsLoading(false);
            return;
        }

        try {
            console.log('Отправка запроса на сервер...', { email });
            const response = await fetch("http://localhost:3001/api/auth/sign-in", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ email, password }),
            });

            console.log('Получен ответ от сервера:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });

            let data;
            try {
                const text = await response.text();
                console.log('Сырой ответ:', text);
                data = text ? JSON.parse(text) : {};
                console.log('Распарсенные данные:', data);
            } catch (parseError) {
                console.error('Ошибка парсинга ответа:', parseError);
                setError("Ошибка при обработке ответа от сервера");
                setIsLoading(false);
                return;
            }

            if (!response.ok) {
                console.log('Ответ не успешный:', {
                    status: response.status,
                    data: data
                });

                if (response.status === 401) {
                    const errorMessage = data.message || "Неверный email или пароль";
                    console.log('Установка ошибки 401:', errorMessage);
                    setError(errorMessage);
                    setIsLoading(false);
                    return;
                }

                setError(data.message || "Ошибка при входе");
                setIsLoading(false);
                return;
            }

            console.log('Успешный вход, сохранение данных...');
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("token", data.access_token);

            login(data.user.email, data.access_token, data.user.firstName, data.user.lastName);
            window.dispatchEvent(new Event("storage"));

            if (onSuccess) onSuccess();
            router.refresh();
        } catch (err: any) {
            console.error('Ошибка сети или другая ошибка:', err);
            if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
                setError("Не удалось подключиться к серверу. Проверьте подключение к интернету.");
            } else {
                setError(err.message || "Произошла ошибка при попытке входа");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        console.log('Состояние компонента обновлено:', {
            error,
            isLoading,
            showForgotPassword,
            errorType: typeof error,
            errorLength: error?.length,
            errorValue: error
        });
    }, [error, isLoading, showForgotPassword]);

    if (showForgotPassword) {
        return <ForgotPasswordForm onBackToSignIn={() => setShowForgotPassword(false)} />;
    }

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                Вход в Barybar
            </h2>

            {error && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[200] animate-slide-down">
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg shadow-lg flex items-center">
                        <svg className="w-6 h-6 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                        </svg>
                        <span className="font-medium text-base">
                            {error || "Произошла ошибка при попытке входа"}
                        </span>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4">
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium">Email</label>
                    <input
                        type="email"
                        className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-blue-400 outline-none transition"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (error) setError("");
                        }}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium">Пароль</label>
                    <input
                        type="password"
                        className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-blue-400 outline-none transition"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (error) setError("");
                        }}
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 rounded-lg text-lg font-semibold shadow-md transition ${
                        isLoading
                            ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                >
                    {isLoading ? "Вход..." : "Войти"}
                </button>
            </form>

            <div className="mt-4 text-center space-y-2">
                <p className="text-gray-600">
                    Нет аккаунта?{" "}
                    <button
                        onClick={onSwitchToSignUp}
                        className="text-blue-500 hover:underline"
                    >
                        Зарегистрируйтесь
                    </button>
                </p>
                <p>
                    <button
                        onClick={() => setShowForgotPassword(true)}
                        className="text-blue-500 hover:underline"
                    >
                        Забыли пароль?
                    </button>
                </p>
            </div>
        </div>
    );
}