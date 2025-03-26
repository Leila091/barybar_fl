"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaCar, FaCouch, FaLaptop, FaTshirt, FaBicycle, FaCamera } from "react-icons/fa";

interface Category {
    id: number;
    name: string;
}

const categoryIcons: Record<string, JSX.Element> = {
    "Авто": <FaCar />,
    "Мебель": <FaCouch />,
    "Электроника": <FaLaptop />,
    "Одежда": <FaTshirt />,
    "Велосипеды": <FaBicycle />,
    "Фото и видео": <FaCamera />,
};

const CategoriesPage = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("http://localhost:3001/api/category");
                if (!response.ok) throw new Error(`Ошибка: ${response.status} ${response.statusText}`);

                const data = await response.json();
                setCategories(data);
            } catch (error) {
                setError("Ошибка загрузки категорий");
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return (
        <div className="max-w-6xl mx-auto mt-12 p-6">
            <h1 className="text-4xl font-bold mb-10 text-center bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Выберите категорию
            </h1>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className="bg-gray-100 animate-pulse h-48 rounded-xl shadow-md" />
                    ))}
                </div>
            ) : error ? (
                <p className="text-center text-red-600 text-lg">{error}</p>
            ) : categories.length === 0 ? (
                <p className="text-center text-gray-600 text-lg">Категории пока не добавлены</p>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {categories.map((category) => (
                        <Link key={category.id} href={`/categories/${category.id}`} className="group">
                            <div className="p-6 bg-white rounded-xl shadow-lg flex flex-col items-center text-center cursor-pointer border border-gray-200 transition-all duration-300 transform hover:-translate-y-2 hover:bg-gradient-to-r from-blue-500 to-purple-500 hover:text-white">
                                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-4xl shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
                                    <span className="transition-all duration-300 text-gray-700 group-hover:text-white">{categoryIcons[category.name] || <FaCouch />}</span>
                                </div>
                                <h2 className="text-xl font-semibold mt-4 transition-all duration-300 group-hover:text-white">{category.name}</h2>
                                <p className="text-sm mt-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                    Посмотреть объявления
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoriesPage;
