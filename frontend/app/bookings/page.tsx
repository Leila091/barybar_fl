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
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null); // Выбранное бронирование для отмены
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Состояние модалки

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("Не найден токен авторизации");

                const response = await fetch("http://localhost:3001/api/bookings/my", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error("Ошибка при загрузке бронирований");
                }

                const data = await response.json();
                setBookings(Array.isArray(data) ? data : []);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookings();
    }, []);


    const handleCancelClick = (booking: Booking) => {
        setSelectedBooking(booking);
        setIsModalOpen(true);
    };

    const confirmCancelBooking = async () => {
        if (!selectedBooking) return;

        try {
            const response = await fetch(`http://localhost:3001/api/booking-management/${selectedBooking.id}/cancel-by-renter`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) {
                throw new Error("Ошибка при отмене бронирования");
            }

            // Обновляем состояние после отмены
            setBookings((prevBookings) =>
                prevBookings.map((booking) =>
                    booking.id === selectedBooking.id ? { ...booking, status: "canceled" } : booking
                )
            );

            setIsModalOpen(false);
            setSelectedBooking(null);
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (typeof window === 'undefined') return null;
    if (isLoading) return <p className="text-center text-lg text-gray-600">Загрузка...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Мои бронирования
            </h1>
            {bookings.length === 0 ? (
                <p className="text-center text-gray-500 text-lg">У вас нет активных бронирований.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {bookings.map((booking) => (
                        <div
                            key={booking.id}
                            className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-2xl hover:scale-105"
                        >
                            <div className="relative h-52 overflow-hidden">
                                {booking.mainPhoto ? (
                                    <img
                                        src={booking.mainPhoto}
                                        alt={booking.title}
                                        className="w-full h-full object-cover transition-all duration-300 hover:opacity-80"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-lg font-semibold">
                                        📷 Нет фото
                                    </div>
                                )}
                            </div>
                            <div className="p-5">
                                <h2 className="text-xl font-semibold text-gray-900">{booking.title}</h2>
                                <p className="text-gray-600 text-sm mt-1">{booking.location}</p>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-gray-500 text-sm">
                                        {format(new Date(booking.startDate), "dd.MM.yyyy")} –{" "}
                                        {format(new Date(booking.endDate), "dd.MM.yyyy")}
                                    </span>
                                    <span className="text-lg font-semibold text-blue-600">
                                        {booking.price} ₸
                                    </span>
                                </div>
                                <div
                                    className={`mt-4 px-3 py-1 text-sm font-medium text-center rounded-full ${
                                        booking.status === "confirmed"
                                            ? "bg-green-500 text-white"
                                            : booking.status === "pending"
                                                ? "bg-yellow-500 text-white"
                                                : "bg-red-500 text-white"
                                    }`}
                                >
                                    {booking.status === "confirmed" ? "Подтверждено" : booking.status === "pending" ? "Ожидает подтверждения" : "Отменено"}
                                </div>

                                {/* Кнопка отмены */}
                                {booking.status !== "canceled" && (
                                    <button
                                        onClick={() => handleCancelClick(booking)}
                                        className="mt-4 w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-all duration-300"
                                    >
                                        Отменить бронирование
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Модалка подтверждения отмены */}
            {isModalOpen && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg p-6 shadow-lg w-96">
                        <h2 className="text-xl font-semibold text-gray-900">Отменить бронирование?</h2>
                        <p className="text-gray-600 mt-2">
                            Вы уверены, что хотите отменить бронирование <strong>{selectedBooking.title}</strong>?
                        </p>
                        <div className="mt-4 flex justify-end space-x-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all duration-300"
                            >
                                Нет
                            </button>
                            <button
                                onClick={confirmCancelBooking}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300"
                            >
                                Да
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingsPage;
