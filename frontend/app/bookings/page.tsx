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
    hasReview: string;
    review?: {
        id: number;
        rating: number;
        comment: string;
        createdAt: string;
    };
}

const BookingsPage = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
    const [completedBookings, setCompletedBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

    // Состояния для модалки отзыва
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
    const [rating, setRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("Не найден токен авторизации");

                const response = await fetch(`http://localhost:3001/api/bookings/my`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error("Ошибка при загрузке бронирований");
                }

                const data = await response.json();
                const formattedBookings = Array.isArray(data) ? data : [];
                
                console.log('Все бронирования:', formattedBookings);
                console.log('Отзывы:', formattedBookings.map(b => b.review));

                setBookings(formattedBookings);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookings();
    }, []);

    // Добавляем новый useEffect для обновления списков при переключении вкладок
    useEffect(() => {
        console.log('Активная вкладка изменилась:', activeTab);
        console.log('Текущие бронирования:', bookings);
        
        if (activeTab === 'active') {
            setActiveBookings(bookings.filter(b => b.status === 'confirmed'));
            console.log('Установлены активные бронирования:', bookings.filter(b => b.status === 'confirmed'));
        } else {
            setCompletedBookings(bookings.filter(b => 
                b.status === 'completed' || b.status === 'canceled'
            ));
            console.log('Установлены завершенные бронирования:', bookings.filter(b => 
                b.status === 'completed' || b.status === 'canceled'
            ));
        }
    }, [activeTab, bookings]);

    const handleCancelClick = (booking: Booking) => {
        setSelectedBooking(booking);
        setIsModalOpen(true);
    };

    const confirmCancelBooking = async () => {
        if (!selectedBooking) return;

        try {
            const response = await fetch(
                `http://localhost:3001/api/booking-management/${selectedBooking.id}/cancel-by-renter`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Ошибка при отмене бронирования");
            }

            setBookings(prev =>
                prev.map(b =>
                    b.id === selectedBooking.id ? { ...b, status: "canceled" } : b
                )
            );
            setActiveBookings(prev => prev.filter(b => b.id !== selectedBooking.id));
            setCompletedBookings(prev => [...prev, {...selectedBooking, status: "canceled"}]);

            setIsModalOpen(false);
            setSelectedBooking(null);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const openReviewModal = (booking: Booking) => {
        setReviewBooking(booking);
        setIsReviewModalOpen(true);
    };

    const submitReview = async () => {
        if (!reviewBooking || !reviewComment.trim()) return;

        setIsSubmittingReview(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Не найден токен авторизации");

            const response = await fetch(`http://localhost:3001/api/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    bookingId: reviewBooking.id,
                    rating,
                    comment: reviewComment
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Ошибка при отправке отзыва");
            }

            const newReview = await response.json();
            console.log('Отзыв успешно добавлен:', newReview);

            // Обновляем состояние бронирований
            const updatedBooking = {
                ...reviewBooking,
                hasReview: true,
                review: {
                    id: newReview.id,
                    rating: newReview.rating,
                    comment: newReview.comment,
                    createdAt: newReview.createdAt
                }
            };

            setBookings(prev =>
                prev.map(b =>
                    b.id === reviewBooking.id ? updatedBooking : b
                )
            );

            // Обновляем список завершенных бронирований
            setCompletedBookings(prev =>
                prev.map(b =>
                    b.id === reviewBooking.id ? updatedBooking : b
                )
            );

            // Закрываем модалку и сбрасываем состояние
            setIsReviewModalOpen(false);
            setReviewBooking(null);
            setRating(5);
            setReviewComment('');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmittingReview(false);
        }
    };

    if (typeof window === 'undefined') return null;
    if (isLoading) return <p className="text-center text-lg text-gray-600">Загрузка...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    const currentBookings = activeTab === 'active' ? activeBookings : completedBookings;

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Мои бронирования
            </h1>

            {/* Табы */}
            <div className="flex border-b border-gray-200 mb-8">
                <button
                    className={`py-2 px-4 font-medium ${activeTab === 'active' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('active')}
                >
                    Активные
                </button>
                <button
                    className={`py-2 px-4 font-medium ${activeTab === 'completed' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('completed')}
                >
                    Завершенные
                </button>
            </div>

            {currentBookings.length === 0 ? (
                <p className="text-center text-gray-500 text-lg">
                    {activeTab === 'active'
                        ? 'У вас нет активных бронирований.'
                        : 'У вас нет завершенных бронирований.'}
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {currentBookings.map((booking) => (
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
                                                : "bg-gray-500 text-white"
                                    }`}
                                >
                                    {booking.status === "confirmed"
                                        ? "Подтверждено"
                                        : booking.status === "pending"
                                            ? "Ожидает подтверждения"
                                            : "Завершено"}
                                </div>

                                {activeTab === 'active' && booking.status !== "canceled" && (
                                    <button
                                        onClick={() => handleCancelClick(booking)}
                                        className="mt-4 w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-all duration-300"
                                    >
                                        Отменить бронирование
                                    </button>
                                )}

                                {activeTab === 'completed' && booking.review && (
                                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center mb-2">
                                            <div className="flex text-yellow-500">
                                                {Array(5).fill(0).map((_, i) => (
                                                    <span key={i}>{i < (booking.review?.rating || 0) ? '★' : '☆'}</span>
                                                ))}
                                            </div>
                                            <span className="text-sm text-gray-500 ml-2">
                                                {booking.review?.createdAt ? 
                                                    format(new Date(booking.review.createdAt), 'dd.MM.yyyy') : 
                                                    'Дата не указана'}
                                            </span>
                                        </div>
                                        <p className="text-gray-700">{booking.review?.comment || 'Нет комментария'}</p>
                                    </div>
                                )}

                                {activeTab === 'completed' && !booking.review && (
                                    <button
                                        onClick={() => openReviewModal(booking)}
                                        className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-all duration-300"
                                    >
                                        Оставить отзыв
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

            {/* Модалка отзыва */}
            {isReviewModalOpen && reviewBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg p-6 shadow-lg w-96">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Оставить отзыв</h2>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Ваша оценка</label>
                            <div className="flex space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className={`text-3xl ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Комментарий</label>
                            <textarea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded"
                                rows={4}
                                placeholder="Поделитесь вашими впечатлениями..."
                                maxLength={500}
                            />
                            <p className="text-right text-sm text-gray-500 mt-1">
                                {reviewComment.length}/500 символов
                            </p>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setIsReviewModalOpen(false);
                                    setReviewComment('');
                                }}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all duration-300"
                                disabled={isSubmittingReview}
                            >
                                Отмена
                            </button>
                            <button
                                onClick={submitReview}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300"
                                disabled={!reviewComment.trim() || isSubmittingReview}
                            >
                                {isSubmittingReview ? 'Отправка...' : 'Отправить'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingsPage;