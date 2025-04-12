"use client";

import React from "react";
import "../app/globals.css";
import Image from "next/image";
import { FaSearch, FaCalendar, FaHandshake, FaExchangeAlt } from "react-icons/fa";
import { IconType } from "react-icons";
import Categories from "./Categories";

interface Step {
    icon: React.ComponentType;
    title: string;
    description: string;
}

const HomePage = () => {
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
        return <IconComponent className="text-2xl" />;
    };

    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative w-full max-w-[1440px] mx-auto overflow-hidden">
                <section className="relative w-full h-auto min-h-[500px] md:h-[662px]">
                    <div className="w-full h-full bg-gradient-to-r from-[#5E54F3] to-[#00C2FA] flex items-center pt-20 pb-32 md:pt-0 md:pb-0">
                        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center sm:items-start">
                            <h1 className="text-4xl md:text-[64px] font-black leading-tight md:leading-[70px] text-white mb-4 text-center sm:text-left">
                                Добро пожаловать<br />
                                в <span className="text-[#FFB800]">Barybar</span>
                            </h1>
                            <p className="text-lg md:text-2xl font-bold text-white mb-8 text-center sm:text-left">
                                Онлайн-платформа для аренды и проката<br />товаров и услуг
                            </p>
                            {/*<div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">*/}
                            {/*    <button className="bg-white text-[#008FC8] px-4 py-3 md:px-6 md:py-3 rounded-lg font-semibold text-sm md:text-base">*/}
                            {/*        Поиск вещей*/}
                            {/*    </button>*/}
                            {/*    <button className="border-2 border-white text-white px-4 py-3 md:px-6 md:py-3 rounded-lg font-semibold text-sm md:text-base">*/}
                            {/*        Добавить объявление*/}
                            {/*    </button>*/}
                            {/*</div>*/}
                        </div>

                        {/* Floating Category Icons - скрываем на мобильных */}
                        <div className="hidden md:block absolute right-[123px] top-[50%] transform -translate-y-1/2">
                            <div className="relative w-[400px] h-[400px]">
                                {/*<div className="absolute top-10 right-[0%] bg-[#FFB800] p-3 rounded-xl">*/}
                                {/*    <Image src="/tools.png" alt="Laptop" width={32} height={32} />*/}
                                {/*</div>*/}
                                {/*<div className="absolute top-[25%] right-[100%] bg-[#FFB800] p-3 rounded-xl">*/}
                                {/*    <Image src="/Bike.png" alt="Bike" width={32} height={32} />*/}
                                {/*</div>*/}
                                {/*<div className="absolute top-[55%] right-[10%] bg-[#FFB800] p-3 rounded-xl">*/}
                                {/*    <Image src="/Frame.png" alt="Car" width={32} height={32} />*/}
                                {/*</div>*/}
                                {/*<div className="absolute bottom-[30%] right-[80%] bg-[#FFB800] p-3 rounded-xl">*/}
                                {/*    <Image src="/tools.png" alt="Tools" width={32} height={32} />*/}
                                {/*</div>*/}
                                {/*<div className="absolute bottom-[10%] right-[80%] bg-[#FFB800] p-3 rounded-xl">*/}
                                {/*    <Image src="/home.png" alt="Tools" width={32} height={32} />*/}
                                {/*</div>*/}
                                <Image
                                    src="/robot.png"
                                    alt="Barybar Robot"
                                    width={300}
                                    height={400}
                                    className="absolute bottom-[-80px] right-20 z-[9999]"
                                    priority
                                />
                            </div>
                        </div>

                        {/* Wave shape */}
                        <div className="absolute bottom-0 left-0 w-full z-10">
                            <svg viewBox="0 0 1440 120" fill="none" className="w-full">
                                <path d="M0,60 C360,20 720,40 1440,20 L1440,120 L0,120 Z" fill="white"/>
                            </svg>
                        </div>
                    </div>
                </section>
            </div>

            {/* How it works */}
            <section className="relative w-full py-12 md:py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col items-center mb-8 md:mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold text-[#0E2D6C]">Как это работает?</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className="flex flex-col items-center p-4 md:p-6 bg-white rounded-xl"
                                style={{
                                    border: '1px solid #E5EFFC',
                                    boxShadow: '0px 10px 12px -2px rgba(14, 45, 108, 0.08), 0px 4px 4px -2px rgba(14, 45, 108, 0.03)',
                                    width: '100%',
                                    minHeight: '180px'
                                }}
                            >
                                <div
                                    className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 mb-4 md:mb-6"
                                    style={{
                                        background: 'linear-gradient(294.69deg, #00C2FA 7.09%, #5E54F3 85.3%)',
                                        borderRadius: '12px'
                                    }}
                                >
                                    <div className="w-6 h-6 md:w-8 md:h-8 text-white">
                                        <Icon icon={step.icon} />
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-2 w-full">
                                    <h3 className="text-lg md:text-xl font-semibold text-[#121212] text-center">
                                        {step.title}
                                    </h3>
                                    <p className="text-base md:text-lg font-normal text-[#121212] text-center">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories */}
            <Categories
                iconSize={32}
                textSize="text-lg"
                titleSize="text-2xl md:text-3xl"
            />

            {/* About Platform */}
            {/*<section className="bg-gradient-to-r from-[#2563EB] to-[#4F46E5] py-12 md:py-16">*/}
            {/*    <div className="container mx-auto px-4">*/}
            {/*        <div className="flex flex-col md:flex-row items-center justify-between">*/}
            {/*            <div className="max-w-xl mb-8 md:mb-0 order-2 md:order-1">*/}
            {/*                <h2 className="text-2xl md:text-[32px] font-bold text-white leading-tight md:leading-[38px] mb-4 md:mb-6 text-center md:text-left">*/}
            {/*                    Barybar – это универсальная платформа для аренды и проката различных товаров*/}
            {/*                </h2>*/}
            {/*                <p className="text-lg md:text-[20px] text-white opacity-80 leading-relaxed md:leading-[26px] text-center md:text-left">*/}
            {/*                    Процесс аренды удобный, прозрачный и доступен для всех сторон*/}
            {/*                </p>*/}
            {/*            </div>*/}
            
            {/*            <div className="relative w-full md:w-1/3 mb-8 md:mb-0 order-1 md:order-2">*/}
            {/*                <Image*/}
            {/*                    src="/robot_futter.png"*/}
            {/*                    alt="Barybar Robot with Boxes"*/}
            {/*                    width={400}*/}
            {/*                    height={400}*/}
            {/*                    className="mx-auto md:ml-auto"*/}
            {/*                    priority*/}
            {/*                />*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</section>*/}
        </main>
    );
};

export default HomePage;