"use client";

import React from 'react';
import Link from 'next/link';
import { FaLaptop, FaHome, FaCar, FaTshirt, FaBabyCarriage, FaBiking, FaTools, FaBook, FaGuitar } from 'react-icons/fa';
import { MdKitchen } from 'react-icons/md';

interface Category {
    id: number;
    name: string;
    icon: any;
}

const categories: Category[] = [
    { id: 1, name: "Электроника", icon: FaLaptop },
    { id: 2, name: "Бытовая техника", icon: MdKitchen },
    { id: 3, name: "Автомобили", icon: FaCar },
    { id: 4, name: "Недвижимость", icon: FaHome },
    { id: 5, name: "Одежда и обувь", icon: FaTshirt },
    { id: 6, name: "Детские товары", icon: FaBabyCarriage },
    { id: 7, name: "Спорт и отдых", icon: FaBiking },
    { id: 8, name: "Инструменты", icon: FaTools },
    { id: 9, name: "Книги и учебники", icon: FaBook },
    { id: 10, name: "Музыкальные инструменты", icon: FaGuitar },
];

const Categories: React.FC = () => {
    return (
        <section className="py-16">
            <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold text-center mb-12">Категории</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                            <Link 
                                key={category.id} 
                                href={`/categories/${category.id}`}
                                className="group"
                            >
                                <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center transition-all duration-300 hover:shadow-md">
                                    <div className="w-16 h-16 bg-[#FFB800] bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                                        <Icon 
                                            className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" 
                                        />
                                    </div>
                                    <span className="text-center text-gray-800 group-hover:text-[#FFB800] transition-colors duration-300">
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