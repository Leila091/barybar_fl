"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Category {
    id: number;
    name: string;
    image: string;
}

const CategoriesPage = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                console.log("Запрос на: http://localhost:3001/api/category");
                const response = await fetch("http://localhost:3001/api/category");
                if (!response.ok) throw new Error(`Ошибка: ${response.status} ${response.statusText}`);

                const data = await response.json();
                console.log("Полученные категории:", data);
                setCategories(data);
            } catch (error) {
                console.error("Ошибка загрузки категорий:", error);
                setError("Ошибка загрузки категорий");
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) return <p className="text-center text-gray-600">Загрузка категорий...</p>;
    if (error) return <p className="text-center text-red-600">{error}</p>;

    return (
        <div className="max-w-6xl mx-auto mt-10 p-6">
            <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Категории
            </h1>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categories.map((category) => (
                    <Link key={category.id} href={`/categories/${category.id}`}>
                        <div className="p-6 bg-white rounded-xl shadow-lg flex flex-col items-center text-center cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="w-24 h-24 mb-4 flex items-center justify-center">
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800">{category.name}</h2>
                            <p className="text-sm text-gray-500 mt-2">Исследуйте больше</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default CategoriesPage;