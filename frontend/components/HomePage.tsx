"use client";

import React, { useState, useEffect } from "react";
import "../app/globals.css";
import { FaSearch, FaCheckCircle, FaClock, FaShieldAlt } from "react-icons/fa";
import Image from "next/image";

// Хук для анимации появления карточек при прокрутке
const useFadeInOnScroll = () => {
    useEffect(() => {
        const elements = document.querySelectorAll('.fade-in');
        const handleScroll = () => {
            elements.forEach((el) => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight) {
                    el.classList.add('fade-in-visible');
                }
            });
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Для инициализации при первой загрузке

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
};

const HomePage = () => {
    useFadeInOnScroll();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleStart = () => {
        setIsModalOpen(true); // Открываем модальное окно при нажатии на кнопку
    };

    const closeModal = () => {
        setIsModalOpen(false); // Закрываем модальное окно
    };

    const listings = [
        { id: 1, title: "Ноутбук в аренду", price: "5000 KZT/день" },
        { id: 2, title: "Дрель Makita", price: "2000 KZT/день" },
        { id: 3, title: "Горный велосипед", price: "7000 KZT/день" },
        { id: 4, title: "Авто Toyota Camry", price: "15 000 KZT/день" },
    ];

    return (
        <>
            {/* Hero Section */}
            <main className="relative flex flex-col items-start justify-center text-left px-8 py-18 pl-20 bg-gradient-to-r from-blue-500 to-indigo-600 text-white min-h-[500px]">
                <h1 className="text-6xl font-extrabold mb-4">Добро пожаловать в Barybar</h1>
                <p className="text-4xl max-w-2xl mb-6">
                    Онлайн-платформа для аренды и проката товаров и услуг
                </p>

                {/* Фон */}

                {/* Робот */}
                <div className="absolute right-10 bottom-0 z-10">
                    <Image
                        src="/1.png"
                        alt="Робот Barybar"
                        width={350}
                        height={350}
                        className="mx-auto"
                    />
                </div>

                {/* Элементы интерфейса */}
                {/*<div className="absolute left-[739px] top-[168px] w-[68px] h-[68px] bg-yellow-400 rounded-[21px]">*/}
                {/*    <Image src="/Frame 3.png" alt="Телефон" layout="fill" objectFit="contain" />*/}
                {/*</div>*/}

                {/*<div className="absolute left-[1213.88px] top-[402.63px] w-[68px] h-[68px] bg-yellow-400 rounded-[21px] transform rotate-[12.1deg]">*/}
                {/*    <Image src="/Frame 4.png" alt="Чат" layout="fill" objectFit="contain" />*/}
                {/*</div>*/}

                {/* Волны звука */}
                {/*<div className="absolute bottom-1 left-10 max-w-72 bg-gradient-to-r from-[#CCDEFF] to-[#FFFFFF]">*/}
                {/*    <Image src="/Vector.png" alt="Волны звука" width={999} height={100} />*/}
                {/*</div>*/}
            </main>

            {/* Модальное окно для регистрации/входа */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Зарегистрируйтесь или войдите</h2>
                        <p className="text-gray-600 mb-6">Для доступа к функционалу необходимо создать аккаунт или войти в существующий.</p>
                        <div className="flex space-x-4">
                            <button
                                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                                onClick={() => alert("Открыть форму регистрации")}
                            >
                                Регистрация
                            </button>
                            <button
                                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                                onClick={() => alert("Открыть форму входа")}
                            >
                                Войти
                            </button>
                        </div>
                        <button
                            className="mt-4 text-blue-500 hover:underline"
                            onClick={closeModal}
                        >
                            Закрыть
                        </button>
                    </div>
                </div>
            )}

            {/* Последние объявления */}
            <section className="w-full max-w-6xl mx-auto px-8 py-12 text-center">
                <h2 className="text-3xl font-semibold text-gray-800 mb-6">Последние объявления</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {listings.map((listing) => (
                        <div
                            key={listing.id}
                            className="bg-white p-6 rounded-xl shadow-md text-center card fade-in"
                        >
                            <h3 className="text-xl font-semibold text-gray-800">{listing.title}</h3>
                            <p className="text-lg text-blue-500 font-bold mt-2">{listing.price}</p>
                            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                                Подробнее
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Как это работает? */}
            <section className="w-full max-w-6xl mx-auto px-8 py-12 text-center">
                <h2 className="text-3xl font-semibold text-gray-800 mb-6">Как это работает?</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {["Найдите товар/услугу", "Забронируйте на удобное время", "Получите и пользуйтесь", "Верните товар или завершите услугу"].map((step, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl shadow-md text-center fade-in">
                            <h3 className="font-semibold text-xl text-blue-500">Шаг {index + 1}</h3>
                            <p className="text-gray-600 mt-2">{step}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Преимущества платформы */}
            <section className="w-full max-w-6xl mx-auto px-8 py-12 text-center">
                <h2 className="text-3xl font-semibold text-gray-800 mb-6">Почему выбирают "БәріБар"?</h2>
                <div className="flex space-x-6 overflow-x-auto py-4 px-2 scrollbar-hide">
                    {[
                        { text: "Удобный поиск и фильтры", icon: <FaSearch className='text-blue-500 text-3xl' /> },
                        { text: "Прямое бронирование без звонков", icon: <FaClock className='text-blue-500 text-3xl' /> },
                        { text: "Гарантии безопасности", icon: <FaShieldAlt className='text-blue-500 text-3xl' /> },
                        { text: "Простота аренды", icon: <FaCheckCircle className='text-blue-500 text-3xl' /> },
                    ].map((adv, index) => (
                        <div key={index} className="flex flex-col items-center bg-white p-6 rounded-xl shadow-md min-w-[220px]">
                            {adv.icon}
                            <p className="text-gray-600 mt-2 font-medium">{adv.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Популярные категории */}
            <section className="w-full max-w-6xl mx-auto px-8 py-12 text-center">
                <h2 className="text-3xl font-semibold text-gray-800 mb-6">Популярные категории</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {["Электроника", "Инструменты", "Спорт и активный отдых", "Автомобили"].map((category, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl shadow-md text-center fade-in">
                            <p className="text-gray-600 text-lg font-medium">{category}</p>
                        </div>
                    ))}
                </div>
            </section>

        </>
    );
};

export default HomePage;