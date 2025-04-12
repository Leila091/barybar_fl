// frontend/components/CategoryFilters.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface Location {
    id: number;
    name: string;
    type: string;
    region: string;
}

const CategoryFilters = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const [locationId, setLocationId] = useState(searchParams.get('locationId') || '');
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch('/api/locations');
                if (!response.ok) {
                    throw new Error('Не удалось загрузить список городов');
                }
                const data = await response.json();
                if (data.error) {
                    throw new Error(data.error);
                }
                setLocations(data);
            } catch (error) {
                console.error('Error fetching locations:', error);
                setError(error instanceof Error ? error.message : 'Произошла ошибка при загрузке городов');
            } finally {
                setLoading(false);
            }
        };

        fetchLocations();
    }, []);

    useEffect(() => {
        setMinPrice(searchParams.get('minPrice') || '');
        setMaxPrice(searchParams.get('maxPrice') || '');
        setLocationId(searchParams.get('locationId') || '');
    }, [searchParams]);

    const handleFilter = () => {
        const params = new URLSearchParams();

        if (minPrice && minPrice !== '0') {
            params.set('minPrice', minPrice);
        }
        if (maxPrice && maxPrice !== '0') {
            params.set('maxPrice', maxPrice);
        }
        if (locationId && locationId !== '0') {
            params.set('locationId', locationId);
        }

        const newUrl = `${pathname}?${params.toString()}`;
        router.push(newUrl);
    };

    const handleReset = () => {
        setMinPrice('');
        setMaxPrice('');
        setLocationId('');
        router.push(pathname);
    };

    return (
        <div className="bg-white rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Фильтр</h2>

            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Местоположение
                    </h3>
                    <select
                        value={locationId}
                        onChange={(e) => setLocationId(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={loading}
                    >
                        <option value="">Все города</option>
                        {!loading && !error && locations.map((loc) => (
                            <option key={loc.id} value={loc.id}>
                                {loc.name}
                            </option>
                        ))}
                    </select>
                    {loading && (
                        <p className="text-sm text-gray-500 mt-1">Загрузка городов...</p>
                    )}
                    {error && (
                        <p className="text-sm text-red-500 mt-1">{error}</p>
                    )}
                </div>

                <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Цена
                    </h3>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="От"
                            min="0"
                        />
                        <input
                            type="number"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="До"
                            min="0"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-6 space-y-2">
                <button
                    onClick={handleFilter}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                    disabled={loading}
                >
                    Применить
                </button>
                {(minPrice || maxPrice || locationId) && (
                    <button
                        onClick={handleReset}
                        className="w-full text-gray-600 text-sm hover:text-gray-900"
                        disabled={loading}
                    >
                        Сбросить фильтры
                    </button>
                )}
            </div>
        </div>
    );
};

export default CategoryFilters;