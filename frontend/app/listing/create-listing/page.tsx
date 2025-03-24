"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateListing() {
    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);
    const [form, setForm] = useState({
        title: "",
        description: "",
        price: "",
        priceType: "per_day",  // значение по умолчанию
        quantity: "",
        categoryId: "",
        locationId: "",
        startDate: "",
        endDate: "",
        photos: [] as File[],
    });

    const [preview, setPreview] = useState<string[]>([]);
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchCategories = async () => {
            const response = await fetch("http://localhost:3001/api/category");
            const data = await response.json();
            setCategories(data);
        };

        const fetchLocations = async () => {
            const response = await fetch("http://localhost:3001/api/location");
            const data = await response.json();
            console.log("Locations data:", data); // Логирование для отладки
            setLocations(data);
        };

        fetchCategories();
        fetchLocations();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 20) {
            alert("Можно загрузить не более 20 фото!");
            return;
        }
        setForm({ ...form, photos: files });
        setPreview(files.map((file) => URL.createObjectURL(file)));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Проверка обязательных полей
        if (!form.title.trim() || !form.description.trim() || !form.categoryId.trim() || !form.locationId.trim()) {
            alert("Заполните все обязательные поля!");
            return;
        }
        if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
            alert("Цена должна быть положительным числом!");
            return;
        }
        if (form.priceType === "per_unit" && (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) <= 0)) {
            alert("Укажите корректное количество товара!");
            return;
        }
        if (!form.startDate || !form.endDate) {
            alert("Выберите корректные даты!");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Вы не авторизованы!");
            return;
        }

        try {
            // Загружаем фото в Cloudinary
            const photoUrls = await Promise.all(
                form.photos.map(async (file) => {
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

            // Создаем объявление
            const response = await fetch("http://localhost:3001/api/listings/create", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: form.title,
                    description: form.description,
                    price: Number(form.price),
                    priceType: form.priceType,
                    quantity: form.priceType === "per_unit" ? Number(form.quantity) : undefined,
                    categoryId: Number(form.categoryId),
                    location: locations.find(loc => loc.id === Number(form.locationId))?.name, // Ensure location is a string
                    startDate: new Date(form.startDate).toISOString(),
                    endDate: new Date(form.endDate).toISOString(),
                    photos: photoUrls,
                    status: "draft",
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            setShowModal(true);
            setTimeout(() => {
                setShowModal(false);
                router.push("/listing/my-listings");
            }, 2000);

            // Сброс формы
            setForm({
                title: "",
                description: "",
                price: "",
                priceType: "per_day",
                quantity: "",
                categoryId: "",
                locationId: "",
                startDate: "",
                endDate: "",
                photos: [],
            });
            setPreview([]);
        } catch (error) {
            console.error("Ошибка:", error);
            alert(error.message);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 p-8 border rounded-lg shadow-lg bg-white">
            <h2 className="text-2xl font-semibold mb-6 text-center">Создание объявления</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Название</label>
                    <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        className="w-full p-4 border rounded-md focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        className="w-full p-4 border rounded-md focus:ring-2 focus:ring-blue-500 h-36"
                        required
                    ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Цена</label>
                        <input
                            type="number"
                            name="price"
                            value={form.price}
                            onChange={handleChange}
                            className="w-full p-4 border rounded-md focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
                        <select
                            name="categoryId"
                            value={form.categoryId}
                            onChange={handleChange}
                            className="w-full p-4 border rounded-md focus:ring-2 focus:ring-blue-500"
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
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Тип цены</label>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="priceType"
                                value="per_day"
                                checked={form.priceType === "per_day"}
                                onChange={handleChange}
                            />
                            Цена за день
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                value="per_unit"
                                checked={form.priceType === "per_unit"}
                                onChange={handleChange}
                            />
                            Цена за количество
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="priceType"
                                value="fixed"
                                checked={form.priceType === "fixed"}
                                onChange={handleChange}
                            />
                            Фиксированная цена
                        </label>
                    </div>
                </div>

                {form.priceType === "per_unit" && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Количество</label>
                        <input
                            type="number"
                            name="quantity"
                            value={form.quantity}
                            onChange={handleChange}
                            className="w-full p-4 border rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Местоположение</label>
                    <select
                        name="locationId"
                        value={form.locationId}
                        onChange={handleChange}
                        className="w-full p-4 border rounded-md focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="">Выберите местоположение</option>
                        {locations.map((location) => (
                            <option key={location.id} value={location.id}>
                                {location.name}, {location.region}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Дата начала</label>
                    <input
                        type="date"
                        name="startDate"
                        value={form.startDate}
                        onChange={handleChange}
                        className="w-full p-4 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Дата окончания</label>
                    <input
                        type="date"
                        name="endDate"
                        value={form.endDate}
                        onChange={handleChange}
                        className="w-full p-4 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Фотографии</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full p-4 border rounded-md focus:ring-2 focus:ring-blue-500"
                        multiple
                    />
                    {preview.length > 0 && (
                        <div className="flex gap-2 mt-2">
                            {preview.map((url, index) => (
                                <img key={index} src={url} alt={`Preview ${index}`} className="w-20 h-20 object-cover rounded" />
                            ))}
                        </div>
                    )}
                </div>

                <button type="submit" className="w-full py-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition">
                    Создать объявление
                </button>
            </form>
        </div>
    );
}