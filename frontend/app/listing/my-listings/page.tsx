"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
            console.log("Загрузка объявлений...");
            const response = await fetch("http://localhost:3001/api/listings/my-listings", {
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status}`);
            }

            const data = await response.json();
            console.log("Объявления загружены:", data);
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

            // После изменения статуса перезапрашиваем список
            setLoading(true);
            await fetchListings();
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

    return (
        <div className="max-w-4xl mx-auto mt-10 p-5 bg-white rounded-lg shadow-lg">
            <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">Мои объявления</h1>

            {loading ? (
                <div className="text-center text-gray-600">Загрузка...</div>
            ) : listings.length === 0 ? (
                <div className="text-center text-gray-500">У вас нет объявлений.</div>
            ) : (
                <div className="space-y-8">
                    {listings.map((listing) => (
                        <div
                            key={listing.id}
                            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-200 relative"
                        >
                            <div className="absolute top-2 right-2">{getStatusLabel(listing.status)}</div>
                            {listing.mainPhoto && (
                                <img src={listing.mainPhoto} alt="Main" className="w-full h-48 object-cover rounded mb-4" />
                            )}
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{listing.title}</h2>
                            <p className="text-gray-700 mb-4">{listing.description}</p>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <p><span className="font-semibold">Цена:</span> {listing.price} ₸</p>
                                <p><span className="font-semibold">Локация:</span> {listing.location}</p>
                                <p><span className="font-semibold">Дата начала:</span> {new Date(listing.startDate).toLocaleDateString()}</p>
                                <p><span className="font-semibold">Дата окончания:</span> {new Date(listing.endDate).toLocaleDateString()}</p>
                            </div>
                            <div className="flex justify-between mt-4">
                                <button
                                    onClick={() => router.push(`/listing/edit-listing/${listing.id}`)}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-200 shadow-md"
                                >
                                    ✏️ Редактировать
                                </button>
                                {listing.status === 'draft' && (
                                    <button
                                        onClick={() => updateStatus(listing.id, 'published')}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 shadow-md"
                                    >
                                        📢 Опубликовать
                                    </button>
                                )}
                                {listing.status !== 'archived' && (
                                    <button
                                        onClick={() => updateStatus(listing.id, 'archived')}
                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 shadow-md"
                                    >
                                        🗃️ Архивировать
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyListings;