"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaCheckCircle, FaClock, FaTimesCircle, FaCalendarAlt, FaMapMarkerAlt, FaMoneyBillWave, FaArrowLeft } from "react-icons/fa";
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const ListingDetailsPage = () => {
    const { id } = useParams();
    const router = useRouter();

    const [listing, setListing] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [bookingStartDate, setBookingStartDate] = useState("");
    const [bookingEndDate, setBookingEndDate] = useState("");
    const [bookingError, setBookingError] = useState(null);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [showDateForm, setShowDateForm] = useState(false);
    const [showUserForm, setShowUserForm] = useState(false);
    const [userData, setUserData] = useState({ comment: "" });
    const [user, setUser] = useState(null);
    const [isUserLoading, setIsUserLoading] = useState(true);
    const [bookedDates, setBookedDates] = useState([]);
    const [categoryName, setCategoryName] = useState("");

    const getPriceTypeLabel = (priceType) => {
        if (!priceType) return 'за услугу'; // Значение по умолчанию

        switch (priceType) {
            case 'per_day':
                return 'за сутки';
            case 'per_item':
                return 'за услугу/товар';
            case 'per_quantity':
                return 'за количество';
            default:
                return 'за услугу'; // Значение по умолчанию
        }
    };

    useEffect(() => {
        if (!id) return;

        setIsLoading(true);

        fetch(`http://localhost:3001/api/listings/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setListing(data);
                setBookedDates(data.bookings || []);

                if (data.categoryId) {
                    fetch(`http://localhost:3001/api/category/${data.categoryId}`)
                        .then((res) => res.json())
                        .then((category) => setCategoryName(category.name))
                        .catch(() => setCategoryName("Не указано"));
                }

                if (typeof window !== "undefined") {
                    const userId = localStorage.getItem("userId");
                    setIsOwner(data.userId === Number(userId));
                }
            })
            .catch((err) => setError(err))
            .finally(() => setIsLoading(false));
    }, [id]);

    useEffect(() => {
        try {
            if (typeof window !== "undefined") {
                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            }
        } catch (error) {
            console.error("Ошибка при загрузке данных пользователя:", error);
        } finally {
            setIsUserLoading(false);
        }
    }, []);

    const handleBookingClick = () => {
        if (typeof window === "undefined") return;

        const token = localStorage.getItem("token");

        if (!token) {
            localStorage.setItem(
                "pendingBooking",
                JSON.stringify({ listingId: id, startDate: bookingStartDate, endDate: bookingEndDate })
            );
            router.push("/auth/sign-in");
            return;
        }

        setShowDateForm(true);
    };

    const handleDateSubmit = (e) => {
        e.preventDefault();

        if (!bookingStartDate || !bookingEndDate) {
            setBookingError("Пожалуйста, выберите даты бронирования");
            return;
        }

        const start = new Date(bookingStartDate);
        const end = new Date(bookingEndDate);

        const isOverlapping = bookedDates.some(({ startDate, endDate }) => {
            const bookedStart = new Date(startDate);
            const bookedEnd = new Date(endDate);
            return (start <= bookedEnd && end >= bookedStart);
        });

        if (isOverlapping) {
            setBookingError("Выбранные даты уже заняты. Выберите другие.");
            return;
        }

        setShowUserForm(true);
        setShowDateForm(false);
    };

    const handleUserFormSubmit = async (e) => {
        e.preventDefault();

        const bookingData = {
            listingId: Number(id),
            startDate: bookingStartDate,
            endDate: bookingEndDate,
            comment: userData.comment?.trim() || null,
        };

        try {
            const token = localStorage.getItem("token");

            const response = await fetch("http://localhost:3001/api/bookings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(bookingData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Ошибка при бронировании");
            }

            setBookingSuccess(true);
            router.push("/bookings");
        } catch (error) {
            setBookingError(error.message || "Произошла ошибка при бронировании");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Не указано";
        const date = new Date(dateString);
        return format(date, 'dd MMMM yyyy', { locale: ru });
    };

    if (error) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                <FaTimesCircle className="text-red-500 text-5xl mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-red-600 mb-2">Ошибка</h2>
                <p className="text-gray-700 mb-6">{error.message}</p>
                <button
                    onClick={() => router.push("/")}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    На главную
                </button>
            </div>
        </div>
    );

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Загрузка объявления...</p>
            </div>
        </div>
    );

    if (!listing) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Объявление не найдено</h2>
                <button
                    onClick={() => router.push("/")}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    На главную
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-10 px-4">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
                >
                    <FaArrowLeft className="mr-2" /> Назад
                </button>

                <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                    {/* Заголовок */}
                    <div className="p-8 bg-gradient-to-r from-blue-600 to-purple-600 relative">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{listing.title}</h1>
                        <p className="text-lg text-blue-100">{listing.description}</p>
                    </div>

                    {/* Основная информация */}
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-gray-50 p-6 rounded-lg shadow-sm flex items-start">
                                <FaMoneyBillWave className="text-blue-500 text-2xl mr-4 mt-1" />
                                <div>
                                    <p className="text-gray-600 font-medium">Цена</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {listing.price} ₸ <span className="text-base font-normal text-gray-600">({getPriceTypeLabel(listing?.priceType)})</span>
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-lg shadow-sm flex items-start">
                                <FaMapMarkerAlt className="text-blue-500 text-2xl mr-4 mt-1" />
                                <div>
                                    <p className="text-gray-600 font-medium">Локация</p>
                                    <p className="text-xl text-gray-800">{listing.location || "Не указано"}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-lg shadow-sm flex items-start">
                                <FaCalendarAlt className="text-blue-500 text-2xl mr-4 mt-1" />
                                <div>
                                    <p className="text-gray-600 font-medium">Доступные даты</p>
                                    <p className="text-xl text-gray-800">
                                        {formatDate(listing.startDate)} - {formatDate(listing.endDate)}
                                    </p>
                                </div>
                            </div>

                            {categoryName && (
                                <div className="bg-gray-50 p-6 rounded-lg shadow-sm flex items-start">
                                    <div>
                                        <p className="text-gray-600 font-medium">Категория</p>
                                        <p className="text-xl text-purple-600">{categoryName}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Бронирование */}
                    <div className="p-8 border-t border-gray-200">
                        {!showDateForm && !showUserForm && (
                            <button
                                onClick={handleBookingClick}
                                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors shadow-lg font-semibold"
                            >
                                Забронировать
                            </button>
                        )}

                        {showDateForm && (
                            <form onSubmit={handleDateSubmit} className="space-y-4">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Выберите даты бронирования</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">Дата начала</label>
                                        <input
                                            type="date"
                                            value={bookingStartDate}
                                            onChange={(e) => setBookingStartDate(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
                                            min={listing.startDate}
                                            max={listing.endDate}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">Дата окончания</label>
                                        <input
                                            type="date"
                                            value={bookingEndDate}
                                            onChange={(e) => setBookingEndDate(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
                                            min={bookingStartDate || listing.startDate}
                                            max={listing.endDate}
                                            required
                                        />
                                    </div>
                                </div>

                                {bookingError && (
                                    <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                                        <p>{bookingError}</p>
                                    </div>
                                )}

                                <div className="flex space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowDateForm(false)}
                                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Продолжить
                                    </button>
                                </div>
                            </form>
                        )}

                        {showUserForm && (
                            <form onSubmit={handleUserFormSubmit} className="space-y-4">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Подтверждение бронирования</h3>

                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-blue-800 mb-2">Выбранные даты:</h4>
                                    <p className="text-lg">
                                        {formatDate(bookingStartDate)} - {formatDate(bookingEndDate)}
                                    </p>
                                </div>

                                {isUserLoading ? (
                                    <p className="text-gray-500">Загрузка данных пользователя...</p>
                                ) : user ? (
                                    <>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-gray-700 font-medium mb-2">ФИО</label>
                                                <input
                                                    type="text"
                                                    value={`${user.first_name} ${user.last_name}`}
                                                    readOnly
                                                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 font-medium mb-2">Email</label>
                                                <input
                                                    type="email"
                                                    value={user.email}
                                                    readOnly
                                                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 font-medium mb-2">Комментарий (необязательно)</label>
                                                <textarea
                                                    value={userData.comment}
                                                    onChange={(e) => setUserData({ ...userData, comment: e.target.value })}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
                                                    rows={3}
                                                    placeholder="Ваши пожелания или дополнительные требования"
                                                />
                                            </div>
                                        </div>

                                        {bookingError && (
                                            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                                                <p>{bookingError}</p>
                                            </div>
                                        )}

                                        <div className="flex space-x-4">
                                            <button
                                                type="button"
                                                onClick={() => setShowUserForm(false)}
                                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                Назад
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                            >
                                                Подтвердить бронирование
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                                        <p>Ошибка загрузки данных пользователя</p>
                                    </div>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingDetailsPage;