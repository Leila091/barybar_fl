'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ListingFilters from '@/components/ListingFilters';
import Link from 'next/link';

interface Listing {
    id: number;
    title: string;
    description: string;
    price: number;
    categoryId: number;
    location: string;
    imageUrl?: string;
}

interface Category {
    id: number;
    name: string;
}

const ListingsPage = () => {
    const searchParams = useSearchParams();
    const [listings, setListings] = useState<Listing[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Получаем категории
                const categoriesResponse = await fetch('/api/categories');
                const categoriesData = await categoriesResponse.json();
                setCategories(categoriesData);

                // Формируем URL для фильтрации
                const params = new URLSearchParams(searchParams.toString());
                const listingsResponse = await fetch(`/api/listings?${params.toString()}`);
                const listingsData = await listingsResponse.json();
                setListings(listingsData);
            } catch (err) {
                setError('Ошибка при загрузке данных');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [searchParams]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-lg shadow-md p-4">
                                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ListingFilters categories={categories} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                    <Link
                        key={listing.id}
                        href={`/listing/${listing.id}`}
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                        <div className="aspect-w-16 aspect-h-9">
                            {listing.imageUrl ? (
                                <img
                                    src={listing.imageUrl}
                                    alt={listing.title}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <div className="bg-gray-100 w-full h-full flex items-center justify-center">
                                    <span className="text-gray-400">Нет изображения</span>
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {listing.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                {listing.description}
                            </p>
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-900">
                                    {listing.price.toLocaleString()} ₸
                                </span>
                                <span className="text-sm text-gray-500">
                                    {listing.location}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {listings.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">Объявлений не найдено</p>
                </div>
            )}
        </div>
    );
};

export default ListingsPage;

// 'use client';
//
// import { useEffect, useState } from 'react';
// import { useSearchParams } from 'next/navigation';
// import { FaSearch, FaMapMarkerAlt, FaStar, FaRegStar } from 'react-icons/fa';
// import Link from 'next/link';
// import Breadcrumbs from '@/components/Breadcrumbs';
//
// interface Listing {
//     id: number;
//     title: string;
//     description: string;
//     price: number;
//     categoryId: number;
//     location: string;
//     imageUrl?: string;
//     rating?: number;
//     reviewCount?: number;
//     priceType?: string;
// }
//
// interface Category {
//     id: number;
//     name: string;
// }
//
// const ListingsPage = () => {
//     const searchParams = useSearchParams();
//     const [listings, setListings] = useState<Listing[]>([]);
//     const [categories, setCategories] = useState<Category[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [searchQuery, setSearchQuery] = useState('');
//     const [categoryName, setCategoryName] = useState('');
//
//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 setLoading(true);
//
//                 // Получаем категории
//                 const categoriesResponse = await fetch('/api/categories');
//                 const categoriesData = await categoriesResponse.json();
//                 setCategories(categoriesData);
//
//                 // Получаем имя категории, если есть categoryId в параметрах
//                 const categoryId = searchParams.get('categoryId');
//                 if (categoryId) {
//                     const category = categoriesData.find(c => c.id === Number(categoryId));
//                     if (category) setCategoryName(category.name);
//                 }
//
//                 // Формируем URL для фильтрации
//                 const params = new URLSearchParams(searchParams.toString());
//                 const listingsResponse = await fetch(`/api/listings?${params.toString()}`);
//                 let listingsData = await listingsResponse.json();
//
//                 // Добавляем рейтинг и количество отзывов для каждого объявления
//                 listingsData = await Promise.all(
//                     listingsData.map(async (listing: Listing) => {
//                         const reviewsResponse = await fetch(`/api/listings/${listing.id}/reviews`);
//                         const reviews = await reviewsResponse.json();
//
//                         return {
//                             ...listing,
//                             rating: reviews.length > 0
//                                 ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
//                                 : 0,
//                             reviewCount: reviews.length
//                         };
//                     })
//                 );
//
//                 setListings(listingsData);
//             } catch (err) {
//                 setError('Ошибка при загрузке данных');
//                 console.error(err);
//             } finally {
//                 setLoading(false);
//             }
//         };
//
//         fetchData();
//     }, [searchParams]);
//
//     const filteredListings = listings.filter(listing =>
//         listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         listing.description.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//
//     const getPriceTypeLabel = (type?: string) => {
//         if (!type) return '';
//         switch (type) {
//             case 'per_day': return '/ сутки';
//             case 'per_item': return '';
//             case 'per_quantity': return '/ шт';
//             default: return '';
//         }
//     };
//
//     if (loading) {
//         return (
//             <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
//                 <div className="max-w-7xl mx-auto animate-pulse">
//                     <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                         {[...Array(6)].map((_, i) => (
//                             <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
//                                 <div className="aspect-square bg-gray-200"></div>
//                                 <div className="p-4">
//                                     <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
//                                     <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
//                                     <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
//                                     <div className="flex justify-between">
//                                         <div className="h-5 bg-gray-200 rounded w-1/3"></div>
//                                         <div className="h-4 bg-gray-200 rounded w-1/4"></div>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         );
//     }
//
//     if (error) {
//         return (
//             <div className="min-h-screen flex items-center justify-center p-4">
//                 <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md w-full">
//                     <h2 className="text-xl font-bold text-red-600 mb-2">Ошибка</h2>
//                     <p className="text-gray-700 mb-4">{error}</p>
//                     <button
//                         onClick={() => window.location.reload()}
//                         className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//                     >
//                         Попробовать снова
//                     </button>
//                 </div>
//             </div>
//         );
//     }
//
//     return (
//         <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
//             <div className="max-w-7xl mx-auto">
//                 <Breadcrumbs
//                     items={[
//                         { label: "Главная", href: "/" },
//                         { label: "Каталог", href: "/categories" },
//                         ...(categoryName ? [{ label: categoryName }] : [])
//                     ]}
//                 />
//
//                 <div className="mb-8">
//                     <h1 className="text-2xl font-bold text-gray-900 mb-6">
//                         {categoryName || "Все объявления"}
//                     </h1>
//
//                     <div className="flex flex-col sm:flex-row gap-4">
//                         <div className="relative flex-1">
//                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                 <FaSearch className="text-gray-400" />
//                             </div>
//                             <input
//                                 type="text"
//                                 placeholder="Поиск по объявлениям..."
//                                 className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                 value={searchQuery}
//                                 onChange={(e) => setSearchQuery(e.target.value)}
//                             />
//                         </div>
//
//                         {/*/!* Здесь можно добавить кнопку фильтров, если нужно *!/*/}
//                         {/*/!* <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50">*/}
//                         {/*    <FaFilter />*/}
//                         {/*    <span>Фильтры</span>*/}
//                         {/*</button> *!/*/}
//                     </div>
//                 </div>
//
//                 {filteredListings.length > 0 ? (
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                         {filteredListings.map((listing) => (
//                             <Link
//                                 key={listing.id}
//                                 href={`/listing/${listing.id}`}
//                                 className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
//                             >
//                                 <div className="relative aspect-square bg-gray-100">
//                                     {listing.imageUrl ? (
//                                         <img
//                                             src={listing.imageUrl}
//                                             alt={listing.title}
//                                             className="w-full h-full object-cover"
//                                         />
//                                     ) : (
//                                         <div className="w-full h-full flex items-center justify-center text-gray-400">
//                                             Нет изображения
//                                         </div>
//                                     )}
//                                 </div>
//
//                                 <div className="p-4">
//                                     <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
//                                         {listing.title}
//                                     </h3>
//
//                                     <div className="flex justify-between items-center mb-2">
//                                         <span className="text-lg font-bold text-gray-900">
//                                             {listing.price.toLocaleString()} ₸
//                                             <span className="text-sm font-normal text-gray-500 ml-1">
//                                                 {getPriceTypeLabel(listing.priceType)}
//                                             </span>
//                                         </span>
//                                         {listing.reviewCount > 0 && (
//                                             <div className="flex items-center">
//                                                 <FaStar className="text-yellow-400 text-sm mr-1" />
//                                                 <span className="text-sm text-gray-700">
//                                                     {listing.rating?.toFixed(1)}
//                                                 </span>
//                                             </div>
//                                         )}
//                                     </div>
//
//                                     <div className="flex items-center text-sm text-gray-500">
//                                         <FaMapMarkerAlt className="mr-1" />
//                                         <span className="truncate">{listing.location}</span>
//                                     </div>
//                                 </div>
//                             </Link>
//                         ))}
//                     </div>
//                 ) : (
//                     <div className="bg-white p-8 rounded-lg shadow-sm text-center">
//                         <h3 className="text-lg font-medium text-gray-900 mb-2">
//                             Объявления не найдены
//                         </h3>
//                         <p className="text-gray-500">
//                             Попробуйте изменить параметры поиска
//                         </p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };
//
// export default ListingsPage;