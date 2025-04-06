"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export default function SignUpPage({
                                       onSuccess,
                                       onSwitchToSignIn,
                                   }: {
    onSuccess?: () => void;
    onSwitchToSignIn?: () => void;
}) {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        phone: "",
        verificationCode: ""
    });
    const [showCodeInput, setShowCodeInput] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhoneChange = (value: string) => {
        setFormData(prev => ({ ...prev, phone: value || "" }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors([]);

        // Валидация
        const newErrors: string[] = [];
        if (formData.password !== formData.confirmPassword) {
            newErrors.push("Пароли не совпадают");
        }
        if (formData.password.length < 8) {
            newErrors.push("Пароль должен содержать минимум 8 символов");
        }
        if (!formData.phone) {
            newErrors.push("Номер телефона обязателен");
        }

        if (newErrors.length > 0) {
            setErrors(newErrors);
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("http://localhost:3001/api/auth/sign-up", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    confirmPassword: formData.confirmPassword,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Ошибка регистрации");
            }

            setShowCodeInput(true);
        } catch (err: any) {
            setErrors([err.message || "Ошибка регистрации"]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("http://localhost:3001/api/auth/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    code: formData.verificationCode
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Ошибка проверки кода");
            }

            const data = await res.json();

            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("token", data.access_token);

            login(data.access_token, data.user);
            window.dispatchEvent(new Event("storage"));
            router.refresh();

            if (onSuccess) onSuccess();
        } catch (err: any) {
            setErrors([err.message || "Ошибка проверки кода"]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                Регистрация в Barybar
            </h2>

            {errors.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
                    {errors.map((error, index) => (
                        <p key={index} className="text-sm">• {error}</p>
                    ))}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Фамилия</label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
                            required
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                    <PhoneInput
                        international
                        defaultCountry="KZ"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        className="phone-input"
                        inputClassName="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
                            required
                            minLength={8}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Подтвердите пароль</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
                            required
                        />
                    </div>
                </div>

                {!showCodeInput ? (
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3 rounded-lg font-semibold transition ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                    >
                        {isLoading ? 'Отправка...' : 'Зарегистрироваться'}
                    </button>
                ) : (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Код подтверждения (отправлен на {formData.email})
                        </label>
                        <input
                            type="text"
                            name="verificationCode"
                            value={formData.verificationCode}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
                            placeholder="Введите 6-значный код"
                            required
                            maxLength={6}
                        />
                        <button
                            type="button"
                            onClick={handleVerifyCode}
                            disabled={isLoading}
                            className={`w-full mt-4 py-3 rounded-lg font-semibold transition ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                        >
                            {isLoading ? 'Проверка...' : 'Подтвердить'}
                        </button>
                    </div>
                )}
            </form>

            <p className="text-center mt-6 text-sm text-gray-600">
                Уже есть аккаунт?{' '}
                <button
                    onClick={onSwitchToSignIn}
                    className="text-blue-500 hover:underline font-medium"
                >
                    Войти
                </button>
            </p>
        </div>
    );
}