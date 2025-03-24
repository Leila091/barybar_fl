"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

const EditListing = () => {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        priceType: "per_day", // Added priceType
        categoryId: "",
        location: "",
        status: "",
        startDate: "",
        endDate: "",
        mainPhoto: "",
        photos: [] as string[],
    });

    const [newPhotos, setNewPhotos] = useState<File[]>([]);
    const [preview, setPreview] = useState<string[]>([]);

    let token: string | null = null;
    let userId: number | null = null;

    if (typeof window !== "undefined") {
        token = localStorage.getItem("token");
        if (!token) {
            console.error("Токен не найден в localStorage");
            setError("Токен не найден. Пожалуйста, авторизуйтесь.");
            return;
        }

        try {
            const decoded = JSON.parse(atob(token.split(".")[1]));
            userId = decoded?.sub || null;

            if (!userId) {
                console.error("User ID не найден в токене");
                setError("User ID не найден в токене.");
                return;
            }
        } catch (error) {
            console.error("Ошибка при декодировании токена:", error);
            setError("Ошибка при декодировании токена. Пожалуйста, авторизуйтесь снова.");
            return;
        }
    }

    useEffect(() => {
        if (!id) {
            setError("ID объявления не найден");
            return;
        }

        if (!userId || !token) {
            setError("Токен или User ID отсутствуют");
            return;
        }

        const fetchListing = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:3001/api/listings/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Ошибка при загрузке объявления");
                }

                const data = await response.json();

                let photosArray: string[] = [];
                if (typeof data.photos === "string") {
                    const cleanedString = data.photos.replace(/[{}"]/g, "");
                    photosArray = cleanedString.split(",");
                } else if (Array.isArray(data.photos)) {
                    photosArray = data.photos;
                }

                setFormData({
                    title: data.title || "",
                    description: data.description || "",
                    price: data.price || "",
                    priceType: data.priceType || "per_day", // Added priceType
                    categoryId: data.categoryId ? Number(data.categoryId) : "",
                    location: data.location || "",
                    status: data.status || "",
                    startDate: data.startDate ? data.startDate.split("T")[0] : "",
                    endDate: data.endDate ? data.endDate.split("T")[0] : "",
                    mainPhoto: data.mainPhoto || "",
                    photos: photosArray,
                });
            } catch (err) {
                setError(err.message || "Ошибка при загрузке объявления");
            } finally {
                setLoading(false);
            }
        };

        fetchListing();
    }, [id, userId, token]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("http://localhost:3001/api/category");
                const data = await response.json();
                setCategories(data);
            } catch (err) {
                setError("Ошибка при загрузке категорий");
            }
        };

        fetchCategories();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 20) {
            alert("Можно загрузить не более 20 фото!");
            return;
        }
        setNewPhotos(files);
        setPreview(files.map((file) => URL.createObjectURL(file)));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            alert("Вы не авторизованы!");
            return;
        }

        try {
            let photoUrls: string[] = [];

            if (newPhotos.length > 0) {
                photoUrls = await Promise.all(
                    newPhotos.map(async (file) => {
                        const formData = new FormData();
                        formData.append("files", file);

                        const response = await fetch("http://localhost:3001/api/listings/upload-photos", {
                            method: "POST",
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                            body: formData,
                        });

                        if (!response.ok) {
                            throw new Error("Ошибка загрузки фото");
                        }

                        const data = await response.json();
                        return data.urls[0];
                    })
                );
            }

            const payload = {
                ...formData,
                categoryId: Number(formData.categoryId),
                price: Number(formData.price),
                photos: newPhotos.length > 0 ? [...formData.photos, ...photoUrls] : formData.photos,
                status: formData.status,
            };

            const response = await fetch(`http://localhost:3001/api/listings/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Ошибка при обновлении объявления");

            alert("Объявление успешно обновлено!");
            router.push("/listing/my-listings");
        } catch (error) {
            setError(error.message || "Ошибка при обновлении объявления");
        }
    };

    if (loading) return <p className="text-center text-gray-500">Загрузка объявления...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-10 px-4">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
                >
                    <FaArrowLeft className="mr-2" /> Назад
                </button>

                <div className="bg-white rounded-xl shadow-2xl overflow-hidden p-8">
                    <h1 className="text-2xl font-bold mb-6 text-center">Редактирование объявления</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            {/* Заголовок */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
                                    required
                                />
                            </div>

                            {/* Описание */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition h-32"
                                    required
                                />
                            </div>

                            {/* Цена и тип цены */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Цена</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Тип цены</label>
                                    <select
                                        name="priceType"
                                        value={formData.priceType}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition bg-white"
                                        required
                                    >
                                        <option value="per_day">За день</option>
                                        <option value="per_item">За услугу/товар</option>
                                        <option value="per_quantity">За количество</option>
                                    </select>
                                </div>
                            </div>

                            {/* Категория и местоположение */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
                                    <select
                                        name="categoryId"
                                        value={formData.categoryId}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition bg-white"
                                        required
                                    >
                                        <option value="">Выберите категорию</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Местоположение</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Даты */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Дата окончания</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Фото */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Загрузите новые фото</label>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition bg-gray-50"
                                    accept="image/*"
                                />
                            </div>

                            {/* Превью новых фото */}
                            {preview.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Превью новых фото</label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {preview.map((src, index) => (
                                            <img
                                                key={index}
                                                src={src}
                                                alt="preview"
                                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Существующие фото */}
                            {formData.photos.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Текущие фото</label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {formData.photos.map((src, index) => (
                                            <img
                                                key={index}
                                                src={src}
                                                alt="existing"
                                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Статус */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition bg-white"
                                    required
                                >
                                    <option value="draft">Черновик</option>
                                    <option value="published">Опубликовано</option>
                                    <option value="archived">В архиве</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors shadow-lg font-semibold"
                        >
                            Сохранить изменения
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditListing;