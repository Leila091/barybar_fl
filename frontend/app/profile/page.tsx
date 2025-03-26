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
                router.push("/login");
                return;
            }

            try {
                const res = await fetch("http://localhost:3000/api/users/profile", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) throw new Error("Ошибка загрузки профиля");

                const data = await res.json();
                setUser(data);
            } catch (error) {
                console.error(error);
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
                return;
            }

            const res = await fetch("http://localhost:3000/api/users/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(user),
            });

            if (!res.ok) throw new Error("Ошибка обновления профиля");

            toast.success("✅ Профиль успешно обновлён!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });

            setEditing(false);
        } catch (error) {
            console.error(error);
            toast.error("❌ Ошибка обновления профиля!");
        } finally {
            setSaving(false);
        }
    };


    if (loading) return <p className="text-center">Загрузка...</p>;

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center mb-4 flex items-center justify-center gap-2">
                <FaUser /> Профиль
            </h2>

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
        </div>
    );
};

export default Page;
