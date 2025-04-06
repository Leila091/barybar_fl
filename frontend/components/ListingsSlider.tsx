'use client';

import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Listing {
    id: number;
    title: string;
    price: number;
    image: string;
}

interface ListingsSliderProps {
    listings: Listing[];
}

const ListingsSlider = ({ listings }: ListingsSliderProps) => {
    return (
        <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={24}
            slidesPerView={4}
            navigation
            pagination={{ clickable: true }}
            breakpoints={{
                320: { slidesPerView: 1 },
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
            }}
        >
            {listings.map((listing) => (
                <SwiperSlide key={listing.id}>
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="relative h-48">
                            <Image
                                src={listing.image}
                                alt={listing.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="p-4">
                            <h3 className="font-medium mb-2">{listing.title}</h3>
                            <p className="text-blue-600 font-bold">{listing.price}₸/день</p>
                            <button className="text-blue-600 hover:underline mt-2">
                                Подробнее →
                            </button>
                        </div>
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    );
};

export default ListingsSlider; 