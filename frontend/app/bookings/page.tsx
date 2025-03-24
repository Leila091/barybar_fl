"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

interface Booking {
    id: number;
    listingId: number;
    title: string;
    startDate: string;
    endDate: string;
    status: string;
    location: string;
    price: string;
    mainPhoto: string;
}

const BookingsPage = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const fetchBookings = async () => {
            try {
                const response = await fetch("http://localhost:3001/api/bookings", {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Ошибка при загрузке бронирований");
                }

                const data = await response.json();
                setBookings(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookings();
    }, []);

    if (!isClient) {
        return null;
    }

    if (isLoading) {
        return <p className="text-center text-lg text-gray-600">Загрузка...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-center mb-6">Мои бронирования</h1>
            {bookings.length === 0 ? (
                <p className="text-center text-gray-500">У вас нет активных бронирований.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookings.map((booking) => (
                        <div
                            key={booking.id}
                            className="bg-white border rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                        >
                            <div className="relative h-48 overflow-hidden rounded-t-lg">
                                {booking.mainPhoto ? (
                                    <img
                                        src={booking.mainPhoto}
                                        alt={booking.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-300 flex items-center justify-center text-white text-lg font-semibold">
                                        Без фото
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <p className="text-xl font-semibold text-gray-800">{booking.title}</p>
                                <p className="text-gray-600 text-sm">{booking.location}</p>
                                <div className="flex justify-between mt-2">
                                    <span className="text-gray-500 text-sm">
                                        {format(new Date(booking.startDate), "dd.MM.yyyy")} -{" "}
                                        {format(new Date(booking.endDate), "dd.MM.yyyy")}
                                    </span>
                                    <span className="text-lg font-semibold text-green-500">
                                        {booking.price} ₸
                                    </span>
                                </div>
                                <div
                                    className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold ${
                                        booking.status === "confirmed"
                                            ? "bg-green-100 text-green-600"
                                            : "bg-yellow-100 text-yellow-600"
                                    }`}
                                >
                                    {booking.status === "confirmed" ? "Подтверждено" : "Ожидает подтверждения"}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BookingsPage;
