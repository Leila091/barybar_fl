"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    FaCheckCircle,
    FaClock,
    FaTimesCircle,
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaMoneyBillWave,
    FaArrowLeft,
    FaInfoCircle,
    FaImages,
    FaHome,
    FaStar,
    FaRegStar,
    FaUser,
    FaChevronDown,
    FaChevronUp
} from "react-icons/fa";
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';
import Breadcrumbs from '@/components/Breadcrumbs';

interface NotificationProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
}

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

interface Review {
    id: number;
    rating: number;
    comment: string;
    createdAt: string;
}

interface ReviewCardProps {
    review: Review;
}

interface ReviewsSectionProps {
    reviews: Review[];
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
    const icon = {
        success: <FaCheckCircle className="w-5 h-5" />,
        error: <FaTimesCircle className="w-5 h-5" />,
        info: <FaInfoCircle className="w-5 h-5" />
    } as const;

    return (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center space-x-2 ${
            type === 'success' ? 'bg-green-100 text-green-800' :
                type === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
        }`}>
            {icon[type]}
            <span>{message}</span>
            <button onClick={onClose} className="ml-2">
                <FaTimesCircle className="w-4 h-4" />
            </button>
        </div>
    );
};

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
    const router = useRouter();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const getVisibleItems = () => {
        if (items.length <= 2) return items;
        return isMobile
            ? [
                { label: "...", href: items[items.length - 3].href },
                ...items.slice(-2)
            ]
            : items;
    };

    const visibleItems = getVisibleItems();

    return (
        <nav className="flex mb-6 overflow-x-auto py-2" aria-label="Хлебные крошки">
            <ol className="flex items-center space-x-2 text-sm whitespace-nowrap">
                {visibleItems.map((item: BreadcrumbItem, index: number) => (
                    <li key={index} className="flex items-center">
                        {index > 0 && (
                            <svg
                                className="h-4 w-4 mx-1 text-gray-400 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        )}
                        {item.href ? (
                            <a
                                href={item.href}
                                onClick={(e) => {
                                    e.preventDefault();
                                    router.push(item.href!);
                                }}
                                className="flex items-center hover:text-blue-600 transition-colors text-nowrap text-gray-600"
                            >
                                {index === 0 && !isMobile && (
                                    <FaHome className="h-3 w-3 mr-1 flex-shrink-0" />
                                )}
                                {item.label}
                            </a>
                        ) : (
                            <span className="flex items-center text-gray-800 font-medium text-nowrap">
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

interface StarRatingProps {
    rating: number;
    className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, className = "" }) => {
    return (
        <div className={`flex items-center ${className}`}>
            {[...Array(5)].map((_, i) => (
                i < rating ?
                    <FaStar key={i} className="text-yellow-400 text-sm" /> :
                    <FaRegStar key={i} className="text-yellow-400 text-sm" />
            ))}
        </div>
    );
};

const SkeletonLoader = () => {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
                ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-lg mt-6"></div>
        </div>
    );
};

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
    return (
        <div className="p-4 border-b border-gray-100 last:border-0">
            <div className="flex items-start space-x-3">
                <div className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <FaUser className="text-gray-500" />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-900">Анонимный пользователь</h4>
                        <span className="text-xs text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                        </span>
                    </div>
                    <StarRating rating={review.rating} className="my-1" />
                    <p className="text-gray-700 text-sm">{review.comment}</p>
                </div>
            </div>
        </div>
    );
};

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="mt-8 border border-gray-200 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
                <h3 className="text-lg font-semibold flex items-center">
                    <FaStar className="text-yellow-500 mr-2" />
                    Отзывы ({reviews.length})
                </h3>
                {isOpen ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {isOpen && (
                <div className="divide-y divide-gray-200">
                    {reviews.length > 0 ? (
                        reviews.map((review, index) => (
                            <ReviewCard key={index} review={review} />
                        ))
                    ) : (
                        <div className="p-4 text-center text-gray-500">
                            Пока нет отзывов. Будьте первым!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const DatePicker = ({ value, onChange, min, max, label, error }) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
                type="date"
                value={value}
                onChange={onChange}
                className={`w-full p-2 border rounded-lg ${
                    error ? 'border-red-500 bg-red-50' : 'border-gray-300'
                } focus:ring-blue-500 focus:border-blue-500`}
                min={min}
                max={max}
                required
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
};

const ListingDetailsPage: React.FC = () => {
    const { id } = useParams();
    const router = useRouter();

    const [listing, setListing] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [bookingStartDate, setBookingStartDate] = useState("");
    const [bookingEndDate, setBookingEndDate] = useState("");
    const [dateError, setDateError] = useState(null);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [showReviews, setShowReviews] = useState(false); // Добавлено состояние для отзывов
    const [userData, setUserData] = useState({ comment: "" });
    const [user, setUser] = useState(null);
    const [isUserLoading, setIsUserLoading] = useState(true);
    const [bookedDates, setBookedDates] = useState([]);
    const [categoryName, setCategoryName] = useState("");
    const [notification, setNotification] = useState(null);
    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    const [reviews, setReviews] = useState([]);

    const getPriceTypeLabel = (priceType) => {
        if (!priceType) return 'за услугу';

        switch (priceType) {
            case 'per_day':
                return 'за сутки';
            case 'per_item':
                return 'за услугу/товар';
            case 'per_quantity':
                return 'за количество';
            default:
                return 'за услугу';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Не указано";
        const date = new Date(dateString);
        return format(date, 'dd MMMM yyyy', { locale: ru });
    };

    const getListingPhotos = () => {
        if (!listing || !listing.photos) return [];

        try {
            let photosArray = [];

            if (typeof listing.photos === 'string') {
                const cleanedString = listing.photos.replace(/[{}"]/g, '');
                photosArray = cleanedString.split(',').map(url => url.trim()).filter(url => url);

                photosArray = photosArray.map(url => {
                    if (url.startsWith('https:/') && !url.startsWith('https://')) {
                        return url.replace('https:/', 'https://');
                    }
                    return url;
                });
            } else if (Array.isArray(listing.photos)) {
                photosArray = listing.photos.map(url => {
                    if (typeof url === 'string' && url.startsWith('https:/') && !url.startsWith('https://')) {
                        return url.replace('https:/', 'https://');
                    }
                    return url;
                });
            }

            return photosArray;
        } catch (error) {
            console.error('Ошибка обработки фотографий:', error);
            return [];
        }
    };

    const showNotification = (type, message, duration = 5000) => {
        setNotification({ type, message });
        if (duration) {
            setTimeout(() => setNotification(null), duration);
        }
    };

    const handleBookingClick = () => {
        if (typeof window === "undefined") return;

        const token = localStorage.getItem("token");

        if (!token) {
            localStorage.setItem(
                "pendingBooking",
                JSON.stringify({ listingId: id, startDate: bookingStartDate, endDate: bookingEndDate })
            );
            showNotification('info', 'Для бронирования необходимо войти в систему');
            setTimeout(() => router.push("/auth/sign-in"), 2000);
            return;
        }

        setShowBookingForm(true);
    };

    const handleDateChange = (type, value) => {
        setDateError(null);

        if (type === 'start') {
            setBookingStartDate(value);

            if (bookingEndDate && new Date(value) > new Date(bookingEndDate)) {
                setBookingEndDate("");
            }
        } else {
            setBookingEndDate(value);
        }
    };

    const validateDates = () => {
        if (!bookingStartDate || !bookingEndDate) {
            setDateError('Пожалуйста, выберите обе даты');
            return false;
        }

        const start = new Date(bookingStartDate);
        const end = new Date(bookingEndDate);
        const listingStart = new Date(listing.startDate);
        const listingEnd = new Date(listing.endDate);

        if (start < listingStart) {
            setDateError(`Дата начала не может быть раньше ${formatDate(listing.startDate)}`);
            return false;
        }

        if (end > listingEnd) {
            setDateError(`Дата окончания не может быть позже ${formatDate(listing.endDate)}`);
            return false;
        }

        if (start > end) {
            setDateError('Дата начала не может быть позже даты окончания');
            return false;
        }

        const isOverlapping = bookedDates.some(({ startDate, endDate }) => {
            const bookedStart = new Date(startDate);
            const bookedEnd = new Date(endDate);
            return (start <= bookedEnd && end >= bookedStart);
        });

        if (isOverlapping) {
            setDateError('Выбранные даты уже заняты. Пожалуйста, выберите другие даты.');
            return false;
        }

        return true;
    };

    const handleBookingSubmit = async (event) => {
        event.preventDefault();

        if (!validateDates()) return;

        const bookingData = {
            listingId: Number(id),
            startDate: bookingStartDate,
            endDate: bookingEndDate,
            comment: userData.comment?.trim() || null,
            fullName: `${user?.firstName || ''} ${user?.lastName || ''}`,
            email: user?.email || '',
            phone: user?.phone || ''
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

            showNotification('success', 'Бронирование успешно создано! Перенаправляем вас...');
            setTimeout(() => router.push("/bookings"), 2000);
        } catch (error) {
            showNotification('error', error.message || "Произошла ошибка при бронировании");
        }
    };

    useEffect(() => {
        if (!id) return;

        setIsLoading(true);

        fetch(`http://localhost:3001/api/listings/${id}`)
            .then((response) => response.json())
            .then((data) => {
                setListing(data);
                setBookedDates(data.bookings || []);

                if (data.categoryId) {
                    fetch(`http://localhost:3001/api/category/${data.categoryId}`)
                        .then((response) => response.json())
                        .then((category) => setCategoryName(category.name))
                        .catch(() => setCategoryName("Не указано"));
                }

                if (typeof window !== "undefined") {
                    const userId = localStorage.getItem("userId");
                    setIsOwner(data.userId === Number(userId));
                }
            })
            .catch((error) => setError(error))
            .finally(() => setIsLoading(false));

        fetch(`http://localhost:3001/api/listings/${id}/reviews`)
            .then((response) => response.json())
            .then((data) => setReviews(data))
            .catch(() => setReviews([]));
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

    const photos = getListingPhotos().filter(url => {
        try {
            if (typeof url !== 'string') return false;
            const testUrl = url.startsWith('https:/') ? url.replace('https:/', 'https://') : url;
            new URL(testUrl);
            return true;
        } catch {
            return false;
        }
    });

    if (error) return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                <FaTimesCircle className="text-red-500 text-5xl mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-red-600 mb-2">Ошибка</h2>
                <p className="text-gray-700 mb-6">{error.message}</p>
                <button
                    onClick={() => router.push("/")}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
                >
                    На главную
                </button>
            </div>
        </div>
    );

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-4xl w-full p-6">
                <SkeletonLoader />
            </div>
        </div>
    );

    if (!listing) return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Объявление не найдено</h2>
                <button
                    onClick={() => router.push("/")}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
                >
                    На главную
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pt-20 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
                <Breadcrumbs
                    items={[
                        { label: "Главная", href: "/" },
                        { label: "Каталог", href: "/categories" },
                        { label: "Категория", href: listing?.categoryId ? `/categories/${listing.categoryId}` : "/categories" },
                        { label: listing?.title?.length > 30 ? `${listing.title.substring(0, 30)}...` : listing?.title || "" },
                    ]}
                />

                {notification && (
                    <div className="mb-6">
                        <Notification
                            type={notification.type}
                            message={notification.message}
                            onClose={() => setNotification(null)}
                        />
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-6 mb-8">
                    {/* Левая колонка - фото и описание */}
                    <div className="md:w-1/2">
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            {/* Галерея изображений */}
                    {photos.length > 0 && (
                                <div className="p-6 border-b">
                                <Swiper
                                        spaceBetween={0}
                                        navigation
                                        thumbs={{ swiper: thumbsSwiper }}
                                    modules={[Navigation, Thumbs]}
                                        className="rounded-lg overflow-hidden mb-4"
                                    >
                                        {photos.map((photo, index) => (
                                            <SwiperSlide key={index}>
                                                <div className="relative aspect-video bg-gray-100">
                                                    <img
                                                        src={photo}
                                                        alt={`Фото объявления ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                                    />
                                                </div>
                                            </SwiperSlide>
                                        ))}
                                </Swiper>
                            </div>
                            )}

                            {/* Информация о товаре */}
                            <div className="p-6">
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">{listing?.title}</h1>
                                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                                    <span className="flex items-center">
                                        <FaMapMarkerAlt className="mr-1" /> {listing?.location || "Не указано"}
                                    </span>
                                                </div>
                                <p className="text-2xl font-bold text-blue-600 mb-4">
                                    {listing?.price} ₸ <span className="text-sm font-normal">{getPriceTypeLabel(listing?.priceType)}</span>
                                </p>

                                <h2 className="text-xl font-bold mb-2">Описание</h2>
                                <p className="text-gray-700 whitespace-pre-line">{listing?.description}</p>
                            </div>
                        </div>
                    </div>

                    {/* Правая колонка - бронирование */}
                    <div className="md:w-1/2">
                        <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-4">
                            <div className="p-6 border-b">
                                <h3 className="text-lg font-semibold mb-4 flex items-center">
                                    <FaCalendarAlt className="mr-2 text-blue-500" />
                                    Доступные даты
                                </h3>
                                <p className="text-gray-700">
                                    {formatDate(listing?.startDate)} - {formatDate(listing?.endDate)}
                                </p>
                            </div>

                            <div className="p-6 border-b">
                                <h3 className="text-lg font-semibold mb-4">Выберите даты бронирования</h3>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <DatePicker
                                        value={bookingStartDate}
                                        onChange={(e) => handleDateChange('start', e.target.value)}
                                        min={listing?.startDate}
                                        max={listing?.endDate}
                                        label="Дата начала"
                                    />
                                    <DatePicker
                                        value={bookingEndDate}
                                        onChange={(e) => handleDateChange('end', e.target.value)}
                                        min={bookingStartDate || listing?.startDate}
                                        max={listing?.endDate}
                                        label="Дата окончания"
                                        disabled={!bookingStartDate}
                                    />
                                </div>
                                {dateError && <p className="text-sm text-red-500">{dateError}</p>}
                            </div>

                            {showBookingForm ? (
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold mb-4">Подтверждение бронирования</h3>

                                    <div className="space-y-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">ФИО</label>
                                            <input
                                                type="text"
                                                value={user ? `${user.firstName || ''} ${user.lastName || ''}` : ''}
                                                className="w-full p-2 border rounded-lg"
                                                readOnly
                                            />
                                        </div>

                                <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input
                                                type="email"
                                                value={user?.email || ''}
                                                className="w-full p-2 border rounded-lg"
                                                readOnly
                                            />
                                </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                                            <input
                                                type="tel"
                                                value={user?.phone || '+7'}
                                                className="w-full p-2 border rounded-lg"
                                            />
                            </div>

                                    <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
                                            <textarea
                                                value={userData.comment}
                                                onChange={(e) => setUserData({...userData, comment: e.target.value})}
                                                className="w-full p-2 border rounded-lg"
                                                rows={3}
                                                placeholder="Ваши пожелания или дополнительные требования"
                                            />
                        </div>
                    </div>

                                    <div className="flex space-x-4">
                                        <button
                                            onClick={() => setShowBookingForm(false)}
                                            className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Назад
                                        </button>
                            <button
                                            onClick={handleBookingSubmit}
                                            className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                            disabled={!bookingStartDate || !bookingEndDate || dateError}
                            >
                                Забронировать
                            </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6">
                                    <button
                                        onClick={handleBookingClick}
                                        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                                        disabled={isOwner}
                                    >
                                        {isOwner ? "Это ваше объявление" : "Продолжить бронирование"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                                </div>

                {/* Блок отзывов внизу страницы */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                    <button
                        onClick={() => setShowReviews(!showReviews)}
                        className="w-full flex justify-between items-center p-6 hover:bg-gray-50 transition-colors"
                    >
                        <h2 className="text-xl font-semibold flex items-center">
                            <FaStar className="text-yellow-400 mr-2" />
                            Отзывы ({reviews.length})
                        </h2>
                        {showReviews ? <FaChevronUp /> : <FaChevronDown />}
                    </button>

                    {showReviews && (
                        <div className="divide-y divide-gray-200">
                            {reviews.length > 0 ? (
                                reviews.map((review) => (
                                    <div key={review.id} className="p-6">
                                        <div className="flex items-start space-x-4">
                                            <div className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                                                <FaUser className="text-gray-500" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-medium">{review.author || "Анонимный пользователь"}</h3>
                                                    <span className="text-sm text-gray-500">
                                                        {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                                                    </span>
                                                </div>
                                                <div className="flex mb-2">
                                                    {[...Array(5)].map((_, i) => (
                                                        i < review.rating ?
                                                            <FaStar key={i} className="text-yellow-400" /> :
                                                            <FaRegStar key={i} className="text-yellow-400" />
                                                    ))}
                                            </div>
                                                <p className="text-gray-700">{review.comment}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-6 text-center text-gray-500">
                                    Пока нет отзывов. Будьте первым!
                                </div>
                        )}
                    </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListingDetailsPage;