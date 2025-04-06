"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaUser, FaSave, FaEdit } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

const Page = () => {
    const [user, setUser] = useState({ firstName: "", lastName: "", email: "", phone: "" });
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("Токен отсутствует!");
                router.push("/auth/sign-in");
                return;
            }

            console.log("Токен из localStorage:", token);
            console.log("Заголовки запроса:", {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            });

            try {
                const res = await fetch("http://localhost:3000/api/users/profile", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });

                console.log("Статус ответа:", res.status);
                console.log("Заголовки ответа:", Object.fromEntries(res.headers.entries()));

                if (!res.ok) {
                    if (res.status === 401) {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        router.push("/auth/sign-in");
                        return;
                    }
                    
                    let errorMessage = "Ошибка загрузки профиля";
                    try {
                        const errorData = await res.json();
                        errorMessage = errorData.message || errorMessage;
                    } catch (e) {
                        const errorText = await res.text();
                        errorMessage = errorText || errorMessage;
                    }
                    
                    console.error("Ошибка сервера:", errorMessage);
                    throw new Error(errorMessage);
                }

                const data = await res.json();
                console.log("Полученные данные профиля:", data);
                setUser(data);
            } catch (error) {
                console.error("Ошибка при загрузке профиля:", error);
                toast.error("Ошибка при загрузке профиля");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("Токен отсутствует!");
                router.push("/auth/sign-in");
                return;
            }

            // Создаем объект только с разрешенными полями
            const updateData = {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar
            };

            const res = await fetch("http://localhost:3000/api/users/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(updateData),
            });

            if (!res.ok) {
                if (res.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    router.push("/auth/sign-in");
                    return;
                }
                const errorData = await res.json();
                throw new Error(errorData.message || "Ошибка обновления профиля");
            }

            toast.success("✅ Профиль успешно обновлён!", {
                duration: 3000,
                position: "top-right",
            });

            setEditing(false);
        } catch (error) {
            console.error("Ошибка при обновлении профиля:", error);
            toast.error("❌ Ошибка обновления профиля!");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center mb-4 flex items-center justify-center gap-2">
                <FaUser /> Профиль
            </h2>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-gray-600">Загрузка профиля...</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-700">Имя</label>
                        {editing ? (
                            <input
                                type="text"
                                name="firstName"
                                value={user.firstName}
                                onChange={handleChange}
                                className="w-full border px-4 py-2 rounded-lg focus:ring focus:ring-blue-400"
                            />
                        ) : (
                            <p className="px-4 py-2 border rounded-lg bg-gray-100">{user.firstName || "Не указано"}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-gray-700">Фамилия</label>
                        {editing ? (
                            <input
                                type="text"
                                name="lastName"
                                value={user.lastName}
                                onChange={handleChange}
                                className="w-full border px-4 py-2 rounded-lg focus:ring focus:ring-blue-400"
                            />
                        ) : (
                            <p className="px-4 py-2 border rounded-lg bg-gray-100">{user.lastName || "Не указано"}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-gray-700">Email</label>
                        <p className="px-4 py-2 border rounded-lg bg-gray-100">{user.email}</p>
                    </div>

                    <div>
                        <label className="block text-gray-700">Телефон</label>
                        {editing ? (
                            <input
                                type="tel"
                                name="phone"
                                value={user.phone}
                                onChange={handleChange}
                                className="w-full border px-4 py-2 rounded-lg focus:ring focus:ring-blue-400"
                            />
                        ) : (
                            <p className="px-4 py-2 border rounded-lg bg-gray-100">{user.phone || "Не указан"}</p>
                        )}
                    </div>

                    {editing ? (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg flex justify-center items-center gap-2 hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            <FaSave />
                            {saving ? "Сохранение..." : "Сохранить"}
                        </button>
                    ) : (
                        <button
                            onClick={() => setEditing(true)}
                            className="w-full bg-gray-500 text-white py-2 rounded-lg flex justify-center items-center gap-2 hover:bg-gray-600"
                        >
                            <FaEdit />
                            Редактировать
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default Page;