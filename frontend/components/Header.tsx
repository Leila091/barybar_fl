"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaSearch, FaBars, FaUser, FaSignOutAlt, FaList, FaCalendarAlt } from "react-icons/fa";
import { isAuthenticated, logoutUser, getUserName } from "../app/auth/auth";
import "../app/globals.css";

const Header = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const name = getUserName();
        setUserName(name);
    }, []);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleLogout = () => {
        logoutUser();
        router.push("/");
    };

    return (
        <header className="bg-white shadow-md py-4 px-8 relative z-20">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-6">
                    <Link href="/" className="text-3xl font-bold text-gray-800">Barybar</Link>
                    <Link href="/categories" className="text-gray-700 hover:text-blue-500 transition flex items-center gap-2">
                        <FaBars /> Категории
                    </Link>
                </div>

                <div className="flex-1 mx-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Поиск..."
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <FaSearch className="absolute right-3 top-3 text-gray-500" />
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    {isAuthenticated() ? (
                        <>
                            <Link
                                href="/listing/create-listing"
                                className="px-6 py-2 bg-blue-900 text-white rounded-lg shadow-md hover:bg-green-600 transition"
                            >
                                Подать объявление
                            </Link>

                            <div className="relative">
                                <div
                                    className="flex items-center gap-2 cursor-pointer hover:text-blue-500 transition"
                                    onClick={toggleDropdown}
                                >
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                        <FaUser className="text-gray-600" />
                                    </div>
                                    <span className="text-gray-700 font-medium">{userName}</span>
                                </div>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-md z-30 py-2">
                                        <Link href="/profile">
                                            <div className="flex items-center px-4 py-2 hover:bg-gray-100 transition cursor-pointer">
                                                <FaUser className="mr-3 text-gray-500" />
                                                <span>Мой профиль</span>
                                            </div>
                                        </Link>
                                        <Link href="/listing/my-listings">
                                            <div className="flex items-center px-4 py-2 hover:bg-gray-100 transition cursor-pointer">
                                                <FaList className="mr-3 text-gray-500" />
                                                <span>Мои объявления</span>
                                            </div>
                                        </Link>
                                        <Link href="/bookings">
                                            <div className="flex items-center px-4 py-2 hover:bg-gray-100 transition cursor-pointer">
                                                <FaCalendarAlt className="mr-3 text-gray-500" />
                                                <span>Мои бронирования</span>
                                            </div>
                                        </Link>
                                        <div className="border-t border-gray-200 my-1"></div>
                                        <div
                                            className="flex items-center px-4 py-2 hover:bg-gray-100 transition cursor-pointer text-red-500"
                                            onClick={handleLogout}
                                        >
                                            <FaSignOutAlt className="mr-3" />
                                            <span>Выйти</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex space-x-4">
                            <Link
                                href="/auth/sign-in"
                                className="px-4 py-2 text-gray-700 hover:text-blue-500 transition"
                            >
                                Вход
                            </Link>
                            <Link
                                href="/auth/sign-up"
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                            >
                                Регистрация
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;