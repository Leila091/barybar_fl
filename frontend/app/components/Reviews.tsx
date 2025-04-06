import { useState, useEffect } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar, FaUserCircle } from 'react-icons/fa';
import { Review } from '../types';

interface ReviewsProps {
    listingId: number;
    isAuthenticated: boolean;
}

const Reviews = ({ listingId, isAuthenticated }: ReviewsProps) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Загрузка отзывов
    useEffect(() => {
        fetchReviews();
    }, [listingId]);

    const fetchReviews = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/reviews/listing/${listingId}`);
            if (!response.ok) throw new Error('Ошибка загрузки отзывов');
            const data = await response.json();
            setReviews(data);
        } catch (err) {
            setError('Не удалось загрузить отзывы');
            console.error('Error fetching reviews:', err);
        }
    };

    // Обработка отправки нового отзыва
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) {
            setError('Для добавления отзыва необходимо войти в систему');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    listingId,
                    rating: newReview.rating,
                    comment: newReview.comment
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка при добавлении отзыва');
            }

            const newReviewData = await response.json();
            setReviews([...reviews, newReviewData]);
            setNewReview({ rating: 0, comment: '' });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка при добавлении отзыва');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Компонент для отображения звезд рейтинга
    const RatingStars = ({ rating }: { rating: number }) => {
        return (
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-400">
                        {star <= rating ? (
                            <FaStar className="w-5 h-5" />
                        ) : star - 0.5 <= rating ? (
                            <FaStarHalfAlt className="w-5 h-5" />
                        ) : (
                            <FaRegStar className="w-5 h-5" />
                        )}
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Отзывы</h2>

            {/* Форма добавления отзыва */}
            {isAuthenticated && (
                <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Оставить отзыв</h3>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Оценка
                        </label>
                        <div className="flex items-center space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setNewReview({ ...newReview, rating: star })}
                                    className="text-yellow-400 hover:text-yellow-500 transition-colors"
                                >
                                    {star <= newReview.rating ? (
                                        <FaStar className="w-6 h-6" />
                                    ) : (
                                        <FaRegStar className="w-6 h-6" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Комментарий
                        </label>
                        <textarea
                            value={newReview.comment}
                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
                            rows={4}
                            required
                            placeholder="Опишите ваш опыт..."
                        />
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting || !newReview.rating || !newReview.comment}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
                    </button>
                </form>
            )}

            {/* Список отзывов */}
            <div className="space-y-6">
                {reviews.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Пока нет отзывов</p>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center">
                                    <FaUserCircle className="w-10 h-10 text-gray-400 mr-3" />
                                    <div>
                                        <h4 className="font-semibold text-gray-800">{review.userName}</h4>
                                        <p className="text-sm text-gray-500">
                                            {new Date(review.createdAt).toLocaleDateString('ru-RU', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <RatingStars rating={review.rating} />
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Reviews; 