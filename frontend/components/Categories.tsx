"use client";

import React from 'react';
import Link from 'next/link';
import { FaLaptop, FaHome, FaCar, FaTshirt, FaBabyCarriage, FaBiking, FaTools, FaBook, FaGuitar, FaBriefcase } from 'react-icons/fa';
import { MdKitchen } from 'react-icons/md';

interface Category {
    id: number;
    name: string;
    icon: any;
}

// Категории, соответствующие вашей БД
const categories: Category[] = [
    { id: 5, name: "Работа", icon: FaBriefcase },
    { id: 1, name: "Недвижимость", icon: FaHome },
    { id: 8, name: "Одежда и обувь", icon: FaTshirt },
    { id: 10, name: "Спорт и отдых", icon: FaBiking },
    { id: 7, name: "Бытовая техника", icon: MdKitchen },
    { id: 3, name: "Электроника", icon: FaLaptop },
    { id: 2, name: "Автомобили", icon: FaCar },
    { id: 9, name: "Детские товары", icon: FaBabyCarriage },
    { id: 6, name: "Музыкальные инструменты", icon: FaGuitar },
    { id: 4, name: "Книги и учебники", icon: FaBook },
];

const Categories: React.FC = () => {
    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Категории</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                            <Link
                                key={category.id}
                                href={`/categories/${category.id}`}
                                className="group"
                            >
                                <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center transition-all duration-300 hover:shadow-md hover:transform hover:-translate-y-1">
                                    <div className="w-20 h-20 bg-[#FFB800] bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                                        <Icon
                                            className="w-10 h-10 text-[#FFB800] transition-transform duration-300 group-hover:scale-110"
                                        />
                                    </div>
                                    <span className="text-center text-lg font-medium text-gray-800 group-hover:text-[#FFB800] transition-colors duration-300">
                                        {category.name}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Categories;