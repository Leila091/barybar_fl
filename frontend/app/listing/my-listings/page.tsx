"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IconBaseProps, IconType } from "react-icons";
import { FaArchive, FaBullhorn, FaEdit, FaEye, FaFileAlt, FaHome, FaImage, FaRedo, FaSpinner, FaTrash } from "react-icons/fa";

interface Listing {
    id: number;
    title: string;
    description: string;
    price: number;
    location: string;
    status: 'draft' | 'published' | 'archived';
    photos: string[];
    mainPhoto?: string;
    createdAt: string;
    updatedAt: string;
}

const Breadcrumbs = ({ items }: { items: { label: string; href?: string }[] }) => {
    const router = useRouter();

    return (
        <nav className="flex mb-6 overflow-x-auto py-2" aria-label="Хлебные крошки">
            <ol className="flex items-center space-x-2 text-sm whitespace-nowrap">
                {items.map((item, index) => (
                    <li key={index} className="flex items-center">
                        {index > 0 && <span className="mx-1 text-gray-400">/</span>}
                        {item.href ? (
                            <a
                                href={item.href}
                                onClick={(e) => {
                                    e.preventDefault();
                                    router.push(item.href!);
                                }}
                                className="text-blue-600 hover:text-blue-800 transition-colors flex items-center"
                            >
                                {index === 0 && <FaHome className="mr-1" size={14} />}
                                {item.label}
                            </a>
                        ) : (
                            <span className="text-gray-600 font-medium">{item.label}</span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

interface IconProps extends IconBaseProps {
    icon: IconType;
}

const Icon = ({ icon: IconComponent, ...props }: IconProps) => {
    return <IconComponent {...props} />;
};

const MyListings = () => {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'active' | 'drafts' | 'archived'>('active');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteListingId, setDeleteListingId] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const router = useRouter();

    const processPhotos = (photos: any): string[] => {
        if (!photos) return [];
        
        if (typeof photos === 'string') {
            try {
                const cleaned = photos.replace(/[{}"]/g, '');
                return cleaned.split(',').map(url => url.trim()).filter(url => url !== '');
            } catch (e) {
                console.error('Error parsing photos string:', e);
                return [];
            }
        }
        
        if (Array.isArray(photos)) {
            return photos.filter(url => typeof url === 'string' && url.trim() !== '');
        }
        
        return [];
    };

    const fetchListings = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("http://localhost:3001/api/listings/my-listings", {
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status}`);
            }

            const data = await response.json();
            const processedData = data.map((listing: any) => ({
                ...listing,
                photos: processPhotos(listing.photos),
                mainPhoto: processPhotos(listing.photos)[0]
            }));
            
            processedData.sort((a: Listing, b: Listing) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setListings(processedData);
        } catch (error) {
            console.error("Ошибка при загрузке объявлений:", error);
            alert("Ошибка при загрузке объявлений");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const updateStatus = async (id: number, status: 'draft' | 'published' | 'archived') => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const response = await fetch(`http://localhost:3001/api/listings/${id}`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status}`);
            }

            setListings(prev => prev.map(item =>
                item.id === id ? { ...item, status } : item
            ));
        } catch (error) {
            console.error("Ошибка при обновлении статуса:", error);
            alert("Ошибка при обновлении статуса");
        }
    };

    const deleteListing = async (id: number | null) => {
        if (id === null) return;
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const response = await fetch(`http://localhost:3001/api/listings/${id}`, {
                method: 'DELETE',
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status}`);
            }

            setListings(prev => prev.filter(item => item.id !== id));
            setShowDeleteModal(false);
        } catch (error) {
            console.error("Ошибка при удалении объявления:", error);
            alert("Ошибка при удалении объявления");
        }
    };

    const getStatusLabel = (status: 'draft' | 'published' | 'archived') => {
        const statusClasses = {
            draft: "bg-yellow-100 text-yellow-800",
            published: "bg-green-100 text-green-800",
            archived: "bg-gray-100 text-gray-800",
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClasses[status]}`}>
                {status === "draft" ? "Черновик" : status === "published" ? "Опубликован" : "В архиве"}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "Не указано";
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    };

    const filteredListings = listings.filter(listing => {
        switch (activeTab) {
            case 'active':
                return listing.status === 'published';
            case 'drafts':
                return listing.status === 'draft';
            case 'archived':
                return listing.status === 'archived';
            default:
                return true;
        }
    });

    // Вычисляем общее количество страниц
    const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
    
    // Получаем текущие объявления для отображения
    const currentListings = filteredListings.slice(0, currentPage * itemsPerPage);
    
    // Проверяем, есть ли еще объявления для показа
    const hasMoreItems = currentListings.length < filteredListings.length;

    // Функция для загрузки следующей страницы
    const loadMoreItems = () => {
        setCurrentPage(prev => prev + 1);
    };

    // Сбрасываем текущую страницу при смене вкладки
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    const getTabCount = (tabType: 'active' | 'drafts' | 'archived') => {
        return listings.filter(listing => {
            if (tabType === 'active') return listing.status === 'published';
            if (tabType === 'drafts') return listing.status === 'draft';
            if (tabType === 'archived') return listing.status === 'archived';
            return false;
        }).length;
    };

    const GridView = ({ listings }: { listings: Listing[] }) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {listings.map((listing) => (
                <div
                    key={listing.id}
                    className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow duration-300 border border-gray-200 relative"
                >
                    <div className="absolute top-4 right-4">
                        {getStatusLabel(listing.status)}
                    </div>

                    <div className="rounded-lg overflow-hidden mb-4 h-44 bg-gray-100">
                        {listing.mainPhoto ? (
                            <img
                                src={listing.mainPhoto}
                                alt={listing.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    const img = e.target as HTMLImageElement;
                                    img.src = "/placeholder-image.jpg";
                                    img.className = "w-full h-full object-contain p-4 bg-gray-100";
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <FaImage size={24} className="text-gray-400" />
                            </div>
                        )}
                    </div>

                    <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">{listing.title}</h2>

                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                        <div><span className="font-medium text-gray-700">Цена:</span> {listing.price} ₸</div>
                        <div><span className="font-medium text-gray-700">Локация:</span> {listing.location || "Не указана"}</div>
                        <div><span className="font-medium text-gray-700">Создано:</span> {formatDate(listing.createdAt)}</div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mt-4">
                        <button
                            onClick={() => router.push(`/listing/edit-listing/${listing.id}`)}
                            className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                            <FaEdit size={16} className="mr-2" />
                            Редактировать
                        </button>

                        <div className="flex gap-3 flex-wrap sm:flex-nowrap">
                            {listing.status === 'draft' && (
                                <button 
                                    onClick={() => updateStatus(listing.id, 'published')}
                                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                >
                                    <FaBullhorn size={16} className="mr-2" />
                                    Опубликовать
                                </button>
                            )}

                            {listing.status === 'published' && (
                                <button 
                                    onClick={() => updateStatus(listing.id, 'archived')}
                                    className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                >
                                    <FaArchive size={16} className="mr-2" />
                                    Архивировать
                                </button>
                            )}

                            {listing.status === 'archived' && (
                                <>
                                    <button 
                                        onClick={() => updateStatus(listing.id, 'published')}
                                        className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                    >
                                        <FaRedo size={16} className="mr-2" />
                                        Восстановить
                                    </button>
                                    <button 
                                        onClick={() => { setDeleteListingId(listing.id); setShowDeleteModal(true); }}
                                        className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                    >
                                        <FaTrash size={16} className="mr-2" />
                                        Удалить
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const ListView = ({ listings }: { listings: Listing[] }) => (
        <div className="space-y-4">
            {listings.map((listing) => (
                <div
                    key={listing.id}
                    className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-300 border border-gray-200 relative"
                >
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="sm:w-1/4 rounded-lg overflow-hidden h-40 bg-gray-100">
                            {listing.mainPhoto ? (
                                <img
                                    src={listing.mainPhoto}
                                    alt={listing.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        const img = e.target as HTMLImageElement;
                                        img.src = "/placeholder-image.jpg";
                                        img.className = "w-full h-full object-contain p-4 bg-gray-100";
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                    <FaImage className="text-3xl text-gray-400" />
                                </div>
                            )}
                        </div>
                        
                        <div className="sm:w-3/4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">{listing.title}</h2>
                                    <div className="text-sm text-gray-600 mb-2">
                                        <span className="font-medium">Цена:</span> {listing.price} ₸ • 
                                        <span className="font-medium ml-2">Локация:</span> {listing.location || "Не указана"} • 
                                        <span className="font-medium ml-2">Создано:</span> {formatDate(listing.createdAt)}
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4">
                                    {getStatusLabel(listing.status)}
                                </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
                                <button
                                    onClick={() => router.push(`/listing/edit-listing/${listing.id}`)}
                                    className="flex items-center justify-center px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                >
                                    <FaEdit size={16} className="mr-2" />
                                    Редактировать
                                </button>

                                <div className="flex gap-2 flex-wrap">
                                    {listing.status === 'draft' && (
                                        <button 
                                            onClick={() => updateStatus(listing.id, 'published')}
                                            className="flex items-center justify-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                        >
                                            <FaBullhorn size={16} className="mr-2" />
                                            Опубликовать
                                        </button>
                                    )}

                                    {listing.status === 'published' && (
                                        <button 
                                            onClick={() => updateStatus(listing.id, 'archived')}
                                            className="flex items-center justify-center px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                        >
                                            <FaArchive size={16} className="mr-2" />
                                            Архивировать
                                        </button>
                                    )}

                                    {listing.status === 'archived' && (
                                        <>
                                            <button 
                                                onClick={() => updateStatus(listing.id, 'published')}
                                                className="flex items-center justify-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                            >
                                                <FaRedo size={16} className="mr-2" />
                                                Восстановить
                                            </button>
                                            <button 
                                                onClick={() => { setDeleteListingId(listing.id); setShowDeleteModal(true); }}
                                                className="flex items-center justify-center px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                            >
                                                <FaTrash size={16} className="mr-2" />
                                                Удалить
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <Breadcrumbs
                items={[
                    { label: "Главная", href: "/" },
                    { label: "Мои объявления" }
                ]}
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-0">Мои объявления</h1>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        <FaHome size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        <FaFileAlt size={20} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm mb-6">
                <div className="flex flex-wrap border-b">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`px-6 py-4 text-sm font-medium ${
                            activeTab === 'active'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Активные ({getTabCount('active')})
                    </button>
                    <button
                        onClick={() => setActiveTab('drafts')}
                        className={`px-6 py-4 text-sm font-medium ${
                            activeTab === 'drafts'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Черновики ({getTabCount('drafts')})
                    </button>
                    <button
                        onClick={() => setActiveTab('archived')}
                        className={`px-6 py-4 text-sm font-medium ${
                            activeTab === 'archived'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        В архиве ({getTabCount('archived')})
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <FaSpinner className="animate-spin text-4xl text-blue-600" />
                </div>
            ) : currentListings.length > 0 ? (
                <>
                    {viewMode === 'grid' ? (
                        <GridView listings={currentListings} />
                    ) : (
                        <ListView listings={currentListings} />
                    )}
                    
                    {hasMoreItems && (
                        <div className="flex justify-center mt-8">
                            <button
                                onClick={loadMoreItems}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                            >
                                <FaRedo className="mr-2" />
                                Показать еще {Math.min(itemsPerPage, filteredListings.length - currentListings.length)} объявлений
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">У вас пока нет объявлений в этой категории</p>
                </div>
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-semibold mb-4">Подтверждение удаления</h3>
                        <p className="text-gray-600 mb-6">Вы уверены, что хотите удалить это объявление? Это действие нельзя отменить.</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={() => deleteListing(deleteListingId)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Удалить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyListings;