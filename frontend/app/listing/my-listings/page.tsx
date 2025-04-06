"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaHome, FaEdit, FaBullhorn, FaArchive, FaSpinner } from "react-icons/fa";

const Breadcrumbs = ({ items }: { items: { label: string; href?: string }[] }) => {
    const router = useRouter();

    return (
        <nav className="flex mb-6 overflow-x-auto py-2" aria-label="Хлебные крошки">
            <ol className="flex items-center space-x-2 text-sm whitespace-nowrap">
                {items.map((item, index) => (
                    <li key={index} className="flex items-center">
                        {index > 0 && <span className="mx-1 text-gray-400">/</span>}
                        {item.href ? (
                            <a
                                href={item.href}
                                onClick={(e) => {
                                    e.preventDefault();
                                    router.push(item.href!);
                                }}
                                className="text-blue-600 hover:text-blue-800 transition-colors flex items-center"
                            >
                                {index === 0 && <FaHome className="mr-1" size={14} />}
                                {item.label}
                            </a>
                        ) : (
                            <span className="text-gray-600 font-medium">{item.label}</span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

const MyListings = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchListings = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("http://localhost:3001/api/listings/my-listings", {
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status}`);
            }

            const data = await response.json();
            data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setListings(data);
        } catch (error) {
            console.error("Ошибка при загрузке объявлений:", error);
            alert("Ошибка при загрузке объявлений");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const updateStatus = async (id, status) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const response = await fetch(`http://localhost:3001/api/listings/${id}`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status}`);
            }

            setListings(prev => prev.map(item =>
                item.id === id ? {...item, status} : item
            ));
        } catch (error) {
            console.error("Ошибка при обновлении статуса:", error);
            alert("Ошибка при обновлении статуса");
        }
    };

    const getStatusLabel = (status) => {
        const statusClasses = {
            draft: "bg-yellow-100 text-yellow-800",
            published: "bg-green-100 text-green-800",
            archived: "bg-gray-100 text-gray-800",
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClasses[status]}`}>
                {status === "draft" ? "Черновик" : status === "published" ? "Опубликован" : "В архиве"}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Не указано";
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                <Breadcrumbs
                    items={[
                        { label: "Главная", href: "/" },
                        { label: "Мои объявления" }
                    ]}
                />

                <div className="bg-white rounded-lg shadow-lg p-5 sm:p-6">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-center text-gray-900">
                        Мои объявления
                    </h1>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-10">
                            <FaSpinner className="animate-spin text-blue-500 text-2xl mb-3" />
                            <p className="text-gray-600">Загрузка объявлений...</p>
                        </div>
                    ) : listings.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-gray-500 mb-4">У вас нет объявлений.</p>
                            <button
                                onClick={() => router.push("/listing/create-listing")}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Создать объявление
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-5 sm:space-y-6">
                            {listings.map((listing) => (
                                <div
                                    key={listing.id}
                                    className="bg-white rounded-lg shadow-sm p-5 sm:p-6 hover:shadow-md transition-shadow duration-300 border border-gray-200 relative"
                                >
                                    <div className="absolute top-3 right-3">
                                        {getStatusLabel(listing.status)}
                                    </div>

                                    {listing.mainPhoto && (
                                        <img
                                            src={listing.mainPhoto}
                                            alt={listing.title}
                                            className="w-full h-40 sm:h-48 object-cover rounded mb-4"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    )}

                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                                        {listing.title}
                                    </h2>

                                    <p className="text-gray-700 mb-4 text-sm sm:text-base">
                                        {listing.description}
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm sm:text-base text-gray-600 mb-4">
                                        <div>
                                            <span className="font-semibold">Цена:</span> {listing.price} ₸
                                        </div>
                                        <div>
                                            <span className="font-semibold">Локация:</span> {listing.location || "Не указана"}
                                        </div>
                                        <div>
                                            <span className="font-semibold">Дата начала:</span> {formatDate(listing.startDate)}
                                        </div>
                                        <div>
                                            <span className="font-semibold">Дата окончания:</span> {formatDate(listing.endDate)}
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row justify-between gap-3 mt-4">
                                        <button
                                            onClick={() => router.push(`/listing/edit-listing/${listing.id}`)}
                                            className="flex items-center justify-center px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-200 shadow-sm text-sm sm:text-base"
                                        >
                                            <FaEdit className="mr-2" />
                                            Редактировать
                                        </button>

                                        <div className="flex gap-3">
                                            {listing.status === 'draft' && (
                                                <button
                                                    onClick={() => updateStatus(listing.id, 'published')}
                                                    className="flex items-center justify-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 shadow-sm text-sm sm:text-base flex-1"
                                                >
                                                    <FaBullhorn className="mr-2" />
                                                    Опубликовать
                                                </button>
                                            )}

                                            {listing.status !== 'archived' && (
                                                <button
                                                    onClick={() => updateStatus(listing.id, 'archived')}
                                                    className="flex items-center justify-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 shadow-sm text-sm sm:text-base flex-1"
                                                >
                                                    <FaArchive className="mr-2" />
                                                    Архивировать
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyListings;