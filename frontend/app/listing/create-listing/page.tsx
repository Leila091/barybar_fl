"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function CreateListingModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [showConfirmClose, setShowConfirmClose] = useState(false);
    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);
    const [form, setForm] = useState({
        title: "",
        description: "",
        price: "",
        priceType: "per_day",
        quantity: "",
        categoryId: "",
        locationId: "",
        startDate: "",
        endDate: "",
        photos: [] as File[],
    });
    const [preview, setPreview] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!isOpen) return;

        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [categoriesRes, locationsRes] = await Promise.all([
                    fetch("/api/category"),
                    fetch("/api/location"),
                ]);

                if (!categoriesRes.ok || !locationsRes.ok) {
                    throw new Error("Failed to fetch data");
                }

                setCategories(await categoriesRes.json());
                setLocations(await locationsRes.json());
            } catch (error) {
                toast.error("Не удалось загрузить данные");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [isOpen]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 20) {
            toast.error("Можно загрузить не более 20 фото");
            return;
        }
        setForm((prev) => ({ ...prev, photos: files }));
        setPreview(files.map((file) => URL.createObjectURL(file)));
    };

    const handleCloseModal = () => {
        const hasData = Object.values(form).some((value) =>
            Array.isArray(value) ? value.length > 0 : value !== ""
        );

        if (hasData) {
            setShowConfirmClose(true);
        } else {
            resetFormAndClose();
        }
    };

    const handleConfirmClose = () => {
        resetFormAndClose();
    };

    const handleCancelClose = () => {
        setShowConfirmClose(false);
    };

    const resetFormAndClose = () => {
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
        setIsOpen(false);
        setShowConfirmClose(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (!form.title.trim() || !form.description.trim() || !form.categoryId || !form.locationId) {
            toast.error("Заполните все обязательные поля");
            setIsLoading(false);
            return;
        }

        if (!form.price || isNaN(Number(form.price))) {
            toast.error("Укажите корректную цену");
            setIsLoading(false);
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Требуется авторизация");
            setIsLoading(false);
            return;
        }

        try {
            const photoUrls = await Promise.all(
                form.photos.map(async (file) => {
                    const formData = new FormData();
                    formData.append("files", file);

                    const response = await fetch("/api/listings/upload-photos", {
                        method: "POST",
                        headers: { Authorization: `Bearer ${token}` },
                        body: formData,
                    });

                    if (!response.ok) throw new Error("Ошибка загрузки фото");
                    return (await response.json()).urls[0];
                })
            );

            const response = await fetch("/api/listings/create", {
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
                    categoryId: Number(form.categoryId),
                    location: locations.find((loc) => loc.id === Number(form.locationId))?.name,
                    startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
                    endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
                    photos: photoUrls
                }),
            });

            if (!response.ok) {
                throw new Error((await response.json()).message || "Ошибка создания");
            }

            toast.success("Объявление создано!");

            setTimeout(() => {
                resetFormAndClose();
                router.push("/listing/my-listings");
            }, 1500);
        } catch (error: any) {
            toast.error(error.message || "Ошибка при создании");
        } finally {
            setIsLoading(false);
        }
    };

    const ConfirmDialog = ({ onCancel, onConfirm }: { onCancel: () => void, onConfirm: () => void }) => (
        <div className="fixed inset-0 flex items-center justify-center z-[200]">
            <div className="fixed inset-0 bg-gray-100 bg-opacity-50 z-[199]"></div>
            <div
                className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 border border-gray-200 shadow-lg z-[201]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-50 mb-4">
                        <svg
                            className="h-6 w-6 text-blue-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Вы уверены?</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Введенные данные не будут сохранены
                    </p>
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-200"
                        >
                            Продолжить
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition"
                        >
                            Отменить
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
            >
                + Новое объявление
            </button>

            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative border border-gray-100 shadow-lg">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl z-10 transition"
                            disabled={isLoading}
                            aria-label="Закрыть"
                        >
                            &times;
                        </button>

                        <div className="p-6">
                            <h2 className="text-xl font-medium mb-5 text-gray-800">
                                Новое объявление
                            </h2>

                            {isLoading && !categories.length ? (
                                <div className="text-center py-8">Загрузка данных...</div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Название <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={form.title}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Описание <span className="text-red-400">*</span>
                                        </label>
                                        <textarea
                                            name="description"
                                            value={form.description}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-300 focus:border-blue-300 h-32"
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Цена <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                name="price"
                                                value={form.price}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
                                                required
                                                disabled={isLoading}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Категория <span className="text-red-400">*</span>
                                            </label>
                                            <select
                                                name="categoryId"
                                                value={form.categoryId}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
                                                required
                                                disabled={isLoading}
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Тип цены <span className="text-red-400">*</span>
                                        </label>
                                        <div className="flex flex-wrap gap-3">
                                            {[
                                                { value: "per_day", label: "За день" },
                                                { value: "per_unit", label: "За количество" },
                                                { value: "fixed", label: "Фиксированная" },
                                            ].map((option) => (
                                                <label
                                                    key={option.value}
                                                    className="flex items-center gap-2 text-sm"
                                                >
                                                    <input
                                                        type="radio"
                                                        name="priceType"
                                                        value={option.value}
                                                        checked={form.priceType === option.value}
                                                        onChange={handleChange}
                                                        disabled={isLoading}
                                                        className="text-blue-500 focus:ring-blue-300"
                                                    />
                                                    {option.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {form.priceType === "per_unit" && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Количество
                                            </label>
                                            <input
                                                type="number"
                                                name="quantity"
                                                value={form.quantity}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
                                                disabled={isLoading}
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Местоположение <span className="text-red-400">*</span>
                                        </label>
                                        <select
                                            name="locationId"
                                            value={form.locationId}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
                                            required
                                            disabled={isLoading}
                                        >
                                            <option value="">Выберите местоположение</option>
                                            {locations.map((location) => (
                                                <option key={location.id} value={location.id}>
                                                    {location.name}, {location.region}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Дата начала
                                            </label>
                                            <input
                                                type="date"
                                                name="startDate"
                                                value={form.startDate}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
                                                disabled={isLoading}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Дата окончания
                                            </label>
                                            <input
                                                type="date"
                                                name="endDate"
                                                value={form.endDate}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Фотографии (макс. 20)
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
                                            multiple
                                            disabled={isLoading}
                                        />
                                        {preview.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {preview.map((url, index) => (
                                                    <div key={index} className="relative">
                                                        <img
                                                            src={url}
                                                            alt={`Preview ${index}`}
                                                            className="w-16 h-16 object-cover rounded border border-gray-200"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newPhotos = [...form.photos];
                                                                const newPreview = [...preview];
                                                                newPhotos.splice(index, 1);
                                                                newPreview.splice(index, 1);
                                                                setForm((prev) => ({ ...prev, photos: newPhotos }));
                                                                setPreview(newPreview);
                                                            }}
                                                            className="absolute -top-1 -right-1 bg-red-400 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-500"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full py-2.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition ${
                                            isLoading ? "opacity-70 cursor-not-allowed" : ""
                                        }`}
                                    >
                                        {isLoading ? "Создание..." : "Опубликовать"}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showConfirmClose && (
                <ConfirmDialog
                    onCancel={handleCancelClose}
                    onConfirm={handleConfirmClose}
                />
            )}

            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: "#fff",
                        color: "#334155",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: "12px 16px",
                        fontSize: "14px",
                    },
                }}
            />
        </>
    );
}