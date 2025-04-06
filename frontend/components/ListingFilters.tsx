'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaFilter, FaSearch } from 'react-icons/fa';

interface ListingFiltersProps {
    categories: Array<{
        id: number;
        name: string;
    }>;
}

const ListingFilters = ({ categories }: ListingFiltersProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
    const [location, setLocation] = useState(searchParams.get('location') || '');

    const handleFilter = () => {
        const params = new URLSearchParams();
        
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (categoryId) params.set('categoryId', categoryId);
        if (location) params.set('location', location);

        router.push(`/listings?${params.toString()}`);
    };

    const handleReset = () => {
        setMinPrice('');
        setMaxPrice('');
        setCategoryId('');
        setLocation('');
        router.push('/listings');
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                    <FaFilter className="mr-2" />
                    Фильтры
                </h2>
                <button
                    onClick={handleReset}
                    className="text-sm text-gray-500 hover:text-gray-700"
                >
                    Сбросить
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Минимальная цена
                    </label>
                    <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="От"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Максимальная цена
                    </label>
                    <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="До"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Категория
                    </label>
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Все категории</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Локация
                    </label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Введите город"
                    />
                </div>
            </div>

            <div className="mt-4">
                <button
                    onClick={handleFilter}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    <FaSearch className="mr-2" />
                    Применить фильтры
                </button>
            </div>
        </div>
    );
};

export default ListingFilters; 