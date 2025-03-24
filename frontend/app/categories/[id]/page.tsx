"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Listing {
    id: number;
    title: string;
    description: string;
    imageUrl?: string;
}

const CategoryListingsPage = () => {
    const params = useParams();
    const id = params.id ? Number(params.id) : null;
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            console.error("Ошибка: отсутствует ID категории");
            setError("Ошибка: отсутствует ID категории");
            setLoading(false);
            return;
        }

        const fetchListings = async () => {
            try {
                console.log(`Запрос на: http://localhost:3001/api/listings/category/${id}`);
                const response = await fetch(`http://localhost:3001/api/listings/category/${id}`);
                if (!response.ok) throw new Error(`Ошибка: ${response.status} ${response.statusText}`);

                const data = await response.json();
                console.log("Полученные объявления:", data);
                setListings(data);
            } catch (error) {
                console.error("Ошибка загрузки объявлений:", error);
                setError("Ошибка загрузки объявлений");
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, [id]);

    if (loading) return <p className="text-center text-gray-600">Загрузка объявлений...</p>;
    if (error) return <p className="text-center text-red-600">{error}</p>;

    return (
        <div className="max-w-6xl mx-auto mt-10 p-6">
            <h1 className="text-3xl font-semibold mb-6 text-center text-gray-800">Объявления</h1>

            {listings.length === 0 ? (
                <p className="text-center text-gray-600">По данной категории нет объявлений</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map((listing) => (
                        <Link key={listing.id} href={`/listing/${listing.id}`}>
                            <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center text-center hover:shadow-xl transition">
                                <img
                                    src={listing.imageUrl || "/placeholder.jpg"}
                                    alt={listing.title}
                                    className="w-24 h-24 object-contain mb-2"
                                />
                                <p className="text-lg font-medium text-gray-800">{listing.title}</p>
                                <p className="text-gray-600">{listing.description}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryListingsPage;
