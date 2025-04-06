import { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import Reviews from './Reviews';

interface BookingStatusProps {
    bookingId: number;
    listingId: number;
    startDate: string;
    endDate: string;
    status: string;
    isAuthenticated: boolean;
}

const BookingStatus = ({ bookingId, listingId, startDate, endDate, status, isAuthenticated }: BookingStatusProps) => {
    const [currentStatus, setCurrentStatus] = useState(status);
    const [showReviews, setShowReviews] = useState(false);

    useEffect(() => {
        // Проверяем статус бронирования каждую минуту
        const checkStatus = () => {
            const now = new Date();
            const end = new Date(endDate);
            
            if (now > end && currentStatus === 'active') {
                setCurrentStatus('completed');
                // Здесь можно добавить запрос к API для обновления статуса
            }
        };

        const interval = setInterval(checkStatus, 60000); // Проверка каждую минуту
        checkStatus(); // Первоначальная проверка

        return () => clearInterval(interval);
    }, [endDate, currentStatus]);

    const getStatusIcon = () => {
        switch (currentStatus) {
            case 'completed':
                return <FaCheckCircle className="text-green-500" />;
            case 'cancelled':
                return <FaTimesCircle className="text-red-500" />;
            default:
                return <FaClock className="text-yellow-500" />;
        }
    };

    const getStatusText = () => {
        switch (currentStatus) {
            case 'completed':
                return 'Завершено';
            case 'cancelled':
                return 'Отменено';
            case 'active':
                return 'Активно';
            default:
                return 'Неизвестно';
        }
    };

    const getStatusColor = () => {
        switch (currentStatus) {
            case 'completed':
                return 'text-green-600 bg-green-50';
            case 'cancelled':
                return 'text-red-600 bg-red-50';
            case 'active':
                return 'text-yellow-600 bg-yellow-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="mt-8">
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Статус бронирования</h2>
                
                <div className="flex items-center space-x-3 mb-4">
                    {getStatusIcon()}
                    <span className={`text-lg font-semibold ${getStatusColor()}`}>
                        {getStatusText()}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                    <div>
                        <p className="font-medium">Дата начала:</p>
                        <p>{new Date(startDate).toLocaleDateString('ru-RU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}</p>
                    </div>
                    <div>
                        <p className="font-medium">Дата окончания:</p>
                        <p>{new Date(endDate).toLocaleDateString('ru-RU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}</p>
                    </div>
                </div>

                {currentStatus === 'completed' && (
                    <div className="mt-6">
                        <button
                            onClick={() => setShowReviews(!showReviews)}
                            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {showReviews ? 'Скрыть отзывы' : 'Показать отзывы'}
                        </button>
                    </div>
                )}
            </div>

            {showReviews && currentStatus === 'completed' && (
                <Reviews listingId={listingId} isAuthenticated={isAuthenticated} />
            )}
        </div>
    );
};

export default BookingStatus; 