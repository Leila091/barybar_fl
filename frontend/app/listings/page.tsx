'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ListingFilters from '@/components/ListingFilters';
import Link from 'next/link';

interface Listing {
    id: number;
    title: string;
    description: string;
    price: number;
    categoryId: number;
    location: string;
    imageUrl?: string;
}

interface Category {
    id: number;
    name: string;
}

const ListingsPage = () => {
    const searchParams = useSearchParams();
    const [listings, setListings] = useState<Listing[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Получаем категории
                const categoriesResponse = await fetch('/api/categories');
                const categoriesData = await categoriesResponse.json();
                setCategories(categoriesData);

                // Формируем URL для фильтрации
                const params = new URLSearchParams(searchParams.toString());
                const listingsResponse = await fetch(`/api/listings?${params.toString()}`);
                const listingsData = await listingsResponse.json();
                setListings(listingsData);
            } catch (err) {
                setError('Ошибка при загрузке данных');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [searchParams]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-lg shadow-md p-4">
                                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ListingFilters categories={categories} />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                    <Link
                        key={listing.id}
                        href={`/listing/${listing.id}`}
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                        <div className="aspect-w-16 aspect-h-9">
                            {listing.imageUrl ? (
                                <img
                                    src={listing.imageUrl}
                                    alt={listing.title}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <div className="bg-gray-100 w-full h-full flex items-center justify-center">
                                    <span className="text-gray-400">Нет изображения</span>
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {listing.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                {listing.description}
                            </p>
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-900">
                                    {listing.price.toLocaleString()} ₸
                                </span>
                                <span className="text-sm text-gray-500">
                                    {listing.location}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {listings.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">Объявлений не найдено</p>
                </div>
            )}
        </div>
    );
};

export default ListingsPage; 