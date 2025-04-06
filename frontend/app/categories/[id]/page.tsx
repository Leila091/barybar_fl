"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    FaArrowLeft,
    FaImage,
    FaCar,
    FaLaptop,
    FaTshirt,
    FaTools,
    FaFootballBall,
    FaHome,
    FaExclamationTriangle,
    FaBaby,
    FaBook,
    FaMusic,
    FaBlender
} from "react-icons/fa";
import Breadcrumbs from '@/components/Breadcrumbs';
import CategoryFilters from '@/components/CategoryFilters';

interface Listing {
    id: number;
    title: string;
    description: string;
    price: number;
    category_id: number;
    user_id: number;
    status: string;
    location_id: number;
    created_at: string;
    updated_at: string;
    category_name?: string;
    location_city?: string;
    location_region?: string;
    imageUrl?: string;
}

interface Category {
    id: number;
    name: string;
}

const CategoryListingsPage = () => {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = params.id ? Number(params.id) : null;
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [category, setCategory] = useState<Category | null>(null);
    const [categoryName, setCategoryName] = useState<string>('');

    // Маппинг категорий по ID
    const getCategoryStyles = (categoryId?: number) => {
        const categoryMap: Record<number, {
            icon: JSX.Element;
            bgColor: string;
            textColor: string;
            pattern: string;
        }> = {
            1: { // Электроника
                icon: <FaLaptop className="text-4xl" />,
                bgColor: 'bg-purple-50',
                textColor: 'text-purple-400',
                pattern: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <rect x="30" y="30" width="40" height="40" stroke="currentColor" 
                stroke-width="1" fill="none" opacity="0.1"/>
        </svg>`
            },
            2: { // Бытовая техника
                icon: <FaBlender className="text-4xl" />,
                bgColor: 'bg-blue-50',
                textColor: 'text-blue-400',
                pattern: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="20" stroke="currentColor" 
                  stroke-width="1" fill="none" opacity="0.1"/>
        </svg>`
            },
            3: { // Автомобили
                icon: <FaCar className="text-4xl" />,
                bgColor: 'bg-red-50',
                textColor: 'text-red-400',
                pattern: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M20,50 L80,50 M30,30 L30,70 M70,30 L70,70" 
                stroke="currentColor" stroke-width="2" fill="none" opacity="0.1"/>
        </svg>`
            },
            4: { // Недвижимость
                icon: <FaHome className="text-4xl" />,
                bgColor: 'bg-indigo-50',
                textColor: 'text-indigo-400',
                pattern: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M50,20 L20,50 L20,80 L80,80 L80,50 Z" 
                stroke="currentColor" stroke-width="1" fill="none" opacity="0.1"/>
        </svg>`
            },
            5: { // Одежда и обувь
                icon: <FaTshirt className="text-4xl" />,
                bgColor: 'bg-pink-50',
                textColor: 'text-pink-400',
                pattern: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M50,20 L20,40 L20,70 L80,70 L80,40 Z" 
                stroke="currentColor" stroke-width="1" fill="none" opacity="0.1"/>
        </svg>`
            },
            6: { // Детские товары
                icon: <FaBaby className="text-4xl" />,
                bgColor: 'bg-yellow-50',
                textColor: 'text-yellow-400',
                pattern: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M50,30 Q70,50 50,70 Q30,50 50,30 Z" 
                stroke="currentColor" stroke-width="1" fill="none" opacity="0.1"/>
        </svg>`
            },
            7: { // Спорт и отдых
                icon: <FaFootballBall className="text-4xl" />,
                bgColor: 'bg-green-50',
                textColor: 'text-green-400',
                pattern: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="30" stroke="currentColor" 
                  stroke-width="1" fill="none" opacity="0.1"/>
        </svg>`
            },
            8: { // Инструменты
                icon: <FaTools className="text-4xl" />,
                bgColor: 'bg-amber-50',
                textColor: 'text-amber-400',
                pattern: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M30,30 L70,70 M70,30 L30,70" 
                stroke="currentColor" stroke-width="2" fill="none" opacity="0.1"/>
        </svg>`
            },
            9: { // Книги и учебники
                icon: <FaBook className="text-4xl" />,
                bgColor: 'bg-emerald-50',
                textColor: 'text-emerald-400',
                pattern: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M30,20 L70,20 L70,80 L30,80 Z" 
                stroke="currentColor" stroke-width="1" fill="none" opacity="0.1"/>
        </svg>`
            },
            10: { // Музыкальные инструменты
                icon: <FaMusic className="text-4xl" />,
                bgColor: 'bg-cyan-50',
                textColor: 'text-cyan-400',
                pattern: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M40,30 L40,70 M60,30 L60,70" 
                stroke="currentColor" stroke-width="2" fill="none" opacity="0.1"/>
        </svg>`
            }
        };

        return categoryMap[categoryId as keyof typeof categoryMap] || {
            icon: <FaImage className="text-4xl" />,
            bgColor: 'bg-gray-50',
            textColor: 'text-gray-400',
            pattern: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" stroke-width="1" opacity="0.1" />
      </svg>`
        };
    };

    const generatePlaceholder = (categoryId?: number) => {
        const { icon, bgColor, textColor, pattern } = getCategoryStyles(categoryId);

        return (
            <div className={`w-full h-48 ${bgColor} ${textColor} flex items-center justify-center relative overflow-hidden`}>
                <div
                    className="absolute inset-0 opacity-50"
                    dangerouslySetInnerHTML={{ __html: pattern }}
                />
                <div className="z-10">
                    {icon}
                </div>
            </div>
        );
    };

    const formatPrice = (price?: number, priceType?: string) => {
        if (!price) return "Цена не указана";

        const typeMap: Record<string, string> = {
            per_day: "/ сутки",
            per_hour: "/ час",
            per_item: "за единицу",
            fixed: ""
        };

        return `${price.toLocaleString()} ₸ ${typeMap[priceType || 'fixed']}`.trim();
    };

    useEffect(() => {
        if (!id) {
            setError("Ошибка: отсутствует ID категории");
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const [categoryResponse, listingsResponse] = await Promise.all([
                    fetch(`http://localhost:3001/api/category/${id}`),
                    fetch(`/api/listings/category/${id}`)
                ]);

                if (!categoryResponse.ok) throw new Error("Ошибка загрузки категории");
                if (!listingsResponse.ok) throw new Error("Ошибка загрузки объявлений");

                const [categoryData, listingsData] = await Promise.all([
                    categoryResponse.json(),
                    listingsResponse.json()
                ]);

                console.log('Listings response:', listingsData);

                setCategory(categoryData);
                setListings(listingsData || []);
                setCategoryName(categoryData.name);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error instanceof Error ? error.message : "Ошибка загрузки данных");
                setListings([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, index) => (
                        <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="h-48 bg-gray-100 animate-pulse" />
                            <div className="p-4 space-y-3">
                                <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
                                <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                    <div className="text-red-500 mb-4">
                        <FaExclamationTriangle className="text-4xl mx-auto" />
                    </div>
                    <h2 className="text-lg font-medium text-gray-900 mb-2">Ошибка загрузки</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Обновить
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Breadcrumbs />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                    <FaArrowLeft />
                    <span>Назад</span>
                </button>
                <h1 className="text-2xl font-semibold text-gray-900">
                    {categoryName || `Категория #${id}`}
                </h1>
                <div className="text-sm text-gray-500">
                    {listings.length} {listings.length % 10 === 1 && listings.length % 100 !== 11
                    ? 'объявление'
                    : listings.length % 10 >= 2 && listings.length % 10 <= 4 && (listings.length % 100 < 10 || listings.length % 100 >= 20)
                        ? 'объявления'
                        : 'объявлений'}
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-64 flex-shrink-0">
                    <CategoryFilters />
                </div>

                <div className="flex-1">
                    {listings.length === 0 ? (
                        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                            <div className="text-gray-400 mb-4">
                                <FaImage className="text-4xl mx-auto" />
                            </div>
                            <h2 className="text-lg font-medium text-gray-900 mb-2">Нет объявлений</h2>
                            <p className="text-gray-600 mb-6">В этой категории пока нет доступных объявлений</p>
                            <button
                                onClick={() => router.push('/')}
                                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                На главную
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {listings.map((listing) => (
                                <div
                                    key={listing.id}
                                    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <Link href={`/listing/${listing.id}`} className="block">
                                        {listing.imageUrl ? (
                                            <div className="relative h-48 overflow-hidden">
                                                <img
                                                    src={listing.imageUrl}
                                                    alt={listing.title}
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        ) : (
                                            generatePlaceholder(listing.category_id)
                                        )}
                                        <div className="p-4">
                                            <h3 className="text-lg font-semibold mb-2">{listing.title}</h3>
                                            <p className="text-gray-600 mb-2">{listing.description}</p>
                                            <p className="text-blue-600 font-semibold">
                                                ${listing.price.toLocaleString()}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-2">
                                                {listing.location_city}, {listing.location_region}
                                            </p>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryListingsPage;