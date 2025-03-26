"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Listing {
    id: number;
    title: string;
    description: string;
    imageUrl?: string;
}

const CategoryListingsPage = () => {
    const params = useParams();
    const router = useRouter();
    const id = params.id ? Number(params.id) : null;
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError("Ошибка: отсутствует ID категории");
            setLoading(false);
            return;
        }

        const fetchListings = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/listings/category/${id}`);
                if (!response.ok) throw new Error(`Ошибка: ${response.status} ${response.statusText}`);

                const data = await response.json();
                setListings(data);
            } catch (error) {
                setError("Ошибка загрузки объявлений");
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, [id]);

    return (
        <div className="max-w-6xl mx-auto mt-12 p-6">
            {/* Кнопка назад */}
            <button
                onClick={() => router.back()}
                className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg shadow"
            >
                ← Назад
            </button>

            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Объявления категории {id}</h1>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, index) => (
                        <div
                            key={index}
                            className="bg-gray-100 animate-pulse rounded-lg shadow-md p-4 flex flex-col gap-3"
                        >
                            <div className="h-32 bg-gray-300 rounded-md" />
                            <div className="h-4 bg-gray-300 rounded w-3/4" />
                            <div className="h-4 bg-gray-300 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="text-center">
                    <p className="text-red-600 text-lg">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                    >
                        Обновить
                    </button>
                </div>
            ) : listings.length === 0 ? (
                <p className="text-center text-gray-600 text-lg">По данной категории нет объявлений</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map((listing) => (
                        <div
                            key={listing.id}
                            className="bg-white p-5 rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                        >
                            <Link href={`/listing/${listing.id}`} className="group block">
                                <div className="relative w-full h-40 overflow-hidden rounded-lg">
                                    <img
                                        src={listing.imageUrl || "/placeholder.jpg"}
                                        alt={listing.title}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mt-4 truncate">
                                    {listing.title}
                                </h3>
                                <p className="text-gray-600 text-sm line-clamp-2 mt-1">
                                    {listing.description}
                                </p>
                            </Link>
                            <Link
                                href={`/listing/${listing.id}`}
                                className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                            >
                                Подробнее
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryListingsPage;
