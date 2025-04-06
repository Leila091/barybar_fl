"use client";

import React, { useEffect, useState } from "react";
import "../app/globals.css";
import Image from "next/image";
import { Swiper as SwiperComponent, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import ListingsSlider from "./ListingsSlider";
import { FaSearch, FaCalendar, FaHandshake, FaExchangeAlt } from "react-icons/fa";
import { IconType } from "react-icons";
import Categories from "./Categories";

interface Listing {
    id: number;
    title: string;
    price: number;
    image: string;
    created_at: string;
}

interface Step {
    icon: React.ComponentType;
    title: string;
    description: string;
}

const HomePage = () => {
    const [latestListings, setLatestListings] = useState<Listing[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchLatestListings();
    }, []);

    const fetchLatestListings = async () => {
        try {
            const response = await fetch('/api/listings/latest');
            const data = await response.json();
            setLatestListings(data);
        } catch (error) {
            console.error('Error fetching latest listings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const steps: Step[] = [
        {
            icon: FaSearch,
            title: "Шаг 1",
            description: "Найдите товар/услугу"
        },
        {
            icon: FaCalendar,
            title: "Шаг 2",
            description: "Забронируйте на удобное время"
        },
        {
            icon: FaHandshake,
            title: "Шаг 3",
            description: "Получите и пользуйтесь"
        },
        {
            icon: FaExchangeAlt,
            title: "Шаг 4",
            description: "Верните товар или услугу"
        }
    ];

    const Icon = (props: { icon: React.ComponentType }) => {
        const IconComponent = props.icon;
        return <IconComponent />;
    };

    return (
        <main className="min-h-screen">
            {/* Hero Section */}
            <div className="relative mt-20 w-full max-w-[1440px] mx-auto">
                <section className="relative w-full h-[562px]">
                    <div className="w-full h-full bg-gradient-to-r from-[#5E54F3] to-[#00C2FA] flex items-center">
                        <div className="max-w-screen-xl w-full mx-auto px-6 sm:px-12 lg:px-24 flex flex-col items-center sm:items-start">
                            <h1 className="text-5xl font-bold text-white mb-4">
                                Добро пожаловать<br />
                                в <span className="text-[#FFB800]">Barybar</span>
                            </h1>
                            <p className="text-xl text-white mb-8">
                                Онлайн-платформа для аренды и проката<br />товаров и услуг
                            </p>
                            <div className="flex gap-4">
                                <button className="bg-white text-[#5E54F3] px-6 py-3 rounded-lg font-medium">
                                    Поиск вещей
                                </button>
                                <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-medium">
                                    Добавить объявление
                                </button>
                            </div>
                        </div>

                        {/* Floating Category Icons */}
                        <div className="absolute right-[123px] top-[50%] transform -translate-y-1/2">
                            <div className="relative w-[400px] h-[400px]">
                                <div className="absolute top-10 right-[0%] bg-[#FFB800] p-3 rounded-xl">
                                    <Image src="/icons/laptop.svg" alt="Laptop" width={32} height={32} />
                                </div>
                                <div className="absolute top-[25%] right-[100%] bg-[#FFB800] p-3 rounded-xl">
                                    <Image src="/Bike.png" alt="Bike" width={32} height={32} />
                                </div>
                                <div className="absolute top-[55%] right-[10%] bg-[#FFB800] p-3 rounded-xl">
                                    <Image src="/icons/car.svg" alt="Car" width={32} height={32} />
                                </div>
                                <div className="absolute bottom-[30%] right-[110%] bg-[#FFB800] p-3 rounded-xl">
                                    <Image src="/tools.png" alt="Tools" width={32} height={32} />
                                </div>
                                <div className="absolute bottom-[10%] right-[80%] bg-[#FFB800] p-3 rounded-xl">
                                    <Image src="/home.png" alt="Tools" width={32} height={32} />
                                </div>
                                <Image
                                    src="/robot.png"
                                    alt="Barybar Robot"
                                    width={300}
                                    height={400}
                                    className="absolute bottom-[-140px] right-20 z-[9999]"
                                    priority
                                />
                            </div>
                        </div>

                        {/* Wave shape */}
                        <div className="absolute bottom-0 left-0 w-full">
                            <svg viewBox="0 0 1440 180" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full">
                                <path d="M0,180 C360,120 720,150 1440,120 L1440,180 L0,180 Z" fill="white"/>
                            </svg>
                        </div>
                    </div>
                </section>
            </div>

            {/* How it works */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl font-bold text-center mb-12">Как это работает?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {steps.map((step, index) => (
                            <div key={index} className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                    <div className="w-8 h-8 text-blue-600">
                                        <Icon icon={step.icon} />
                                    </div>
                                </div>
                                <h3 className="font-medium mb-2">{step.title}</h3>
                                <p className="text-gray-600">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories */}
            <Categories />

            {/* Latest Listings */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl font-bold text-center mb-12">Последние объявления</h2>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : latestListings.length > 0 ? (
                        <ListingsSlider listings={latestListings} />
                    ) : (
                        <p className="text-center text-gray-500">Пока нет объявлений</p>
                    )}
                </div>
            </section>

            {/* About Platform */}
            <section className="bg-gradient-to-r from-[#2563EB] to-[#4F46E5] py-16">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        {/* Текстовая часть - слева */}
                        <div className="max-w-xl mb-8 md:mb-0">
                            <h2 className="text-3xl font-bold text-white mb-4">
                                Barybar - это универсальная платформа для аренды и проката различных товаров
                            </h2>
                            <p className="text-white/80 mb-6">
                                Процесс аренды удобный, прозрачный и доступен для всех сторон
                            </p>
                            {/*<div className="flex gap-4">*/}
                            {/*    <Image*/}
                            {/*        src="/robot_futter.png"*/}
                            {/*        alt="Barybar"*/}
                            {/*        width={120}*/}
                            {/*        height={40}*/}
                            {/*    />*/}
                            {/*</div>*/}
                        </div>

                        {/* Картинка - справа */}
                        <div className="relative w-full md:w-1/3">
                            <Image
                                src="/robot_futter.png"
                                alt="Barybar Robot with Boxes"
                                width={400}
                                height={400}
                                className="mx-auto md:ml-auto"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default HomePage;