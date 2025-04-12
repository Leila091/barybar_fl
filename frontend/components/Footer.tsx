import React from 'react';
import Image from 'next/image';

const Footer = () => {
    return (
        <footer className="bg-[#0E2D6C] text-white py-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="text-center md:text-left">
                        <h3 className="text-xl md:text-2xl font-semibold mb-4">О нас</h3>
                        <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                            Barybar - ваша платформа для аренды и проката товаров и услуг. Мы создаем удобный и безопасный способ обмена вещами между людьми. Наша миссия - сделать аренду доступной и простой для каждого, помогая сохранять ресурсы и создавать устойчивое сообщество.
                        </p>
                    </div>
                    <div className="text-center md:text-right">
                        <div className="relative w-full h-[200px] md:h-[250px]">
                            <Image
                                src="/robot_futter.png"
                                alt="Barybar Robot"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-700 text-center">
                    <p className="text-gray-300">
                        © {new Date().getFullYear()} Barybar. Все права защищены.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 