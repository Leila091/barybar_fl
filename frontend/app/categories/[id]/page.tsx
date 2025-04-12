"use client";
import Breadcrumbs from "@/components/Breadcrumbs";
import ListingFilters from "@/components/ListingFilters";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
    FaArrowLeft,
    FaExclamationTriangle,
    FaImage,
    FaMapMarkerAlt,
} from "react-icons/fa";

interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  priceType?: string;
  category_id: number;
  user_id: number;
  status: string;
  location: string;
  created_at: string;
  updated_at: string;
  photos: string[];
  mainPhoto?: string;
}

interface Category {
  id: number;
  name: string;
}

const CategoryListingsPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id ? Number(params.id) : null;
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  // Получаем параметры фильтрации
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const locationFilter = searchParams.get("location");

  const getPriceTypeLabel = (priceType?: string) => {
    if (!priceType) return "за услугу";

    switch (priceType) {
      case "per_day":
        return "за сутки";
      case "per_item":
        return "за услугу/товар";
      case "per_quantity":
        return "за количество";
      default:
        return "за услугу";
    }
  };

  const processPhotos = (photos: any): string[] => {
    if (!photos) return [];

    if (typeof photos === "string") {
      try {
        const cleaned = photos.replace(/[{}"]/g, "");
        return cleaned
          .split(",")
          .map((url: string) => url.trim())
          .filter((url: string) => url !== "");
      } catch (e) {
        console.error("Error parsing photos string:", e);
        return [];
      }
    }

    if (Array.isArray(photos)) {
      return photos.filter((url) => typeof url === "string" && url.trim() !== "");
    }

    return [];
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/categories");
        if (!response.ok) throw new Error("Ошибка загрузки категорий");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/locations");
        if (!response.ok) throw new Error("Ошибка загрузки локаций");
        const data = await response.json();
        setLocations(data);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    if (!id) {
      setError("Ошибка: отсутствует ID категории");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Собираем параметры запроса
        const queryParams = new URLSearchParams();
        if (minPrice) queryParams.append("minPrice", minPrice);
        if (maxPrice) queryParams.append("maxPrice", maxPrice);
        if (locationFilter) queryParams.append("location", locationFilter);

        const [categoryResponse, listingsResponse] = await Promise.all([
          fetch(`http://localhost:3001/api/category/${id}`),
          fetch(
            `http://localhost:3001/api/listings/category/${id}?${queryParams.toString()}`
          ),
        ]);

        if (!categoryResponse.ok) throw new Error("Ошибка загрузки категории");
        if (!listingsResponse.ok) throw new Error("Ошибка загрузки объявлений");

        const categoryData = await categoryResponse.json();
        let listingsData = await listingsResponse.json();

        listingsData = listingsData.map((listing: any) => ({
          ...listing,
          photos: processPhotos(listing.photos),
          mainPhoto: processPhotos(listing.photos)[0],
        }));

        setCategory(categoryData);
        setListings(listingsData);
        setCategoryName(categoryData.name);
        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(
          error instanceof Error ? error.message : "Ошибка загрузки данных"
        );
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, minPrice, maxPrice, locationFilter]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
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
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Ошибка загрузки
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Обновить
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              На главную
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Категории", href: "/categories" },
          { label: categoryName || `Категория #${id}` },
        ]}
      />

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
          {listings.length}{" "}
          {listings.length % 10 === 1 && listings.length % 100 !== 11
            ? "объявление"
            : listings.length % 10 >= 2 &&
              listings.length % 10 <= 4 &&
              (listings.length % 100 < 10 || listings.length % 100 >= 20)
            ? "объявления"
            : "объявлений"}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-72 flex-shrink-0">
          <ListingFilters categories={categories} locations={locations} />
        </div>

        <div className="flex-1">
          {listings.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <div className="text-gray-400 mb-4">
                <FaImage className="text-4xl mx-auto" />
              </div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Нет объявлений
              </h2>
              <p className="text-gray-600 mb-6">
                В этой категории пока нет доступных объявлений
              </p>
              <button
                onClick={() => router.push("/")}
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
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full"
                >
                  <Link
                    href={`/listing/${listing.id}`}
                    className="block flex-grow"
                  >
                    <div className="relative h-48 sm:h-56 bg-gray-100">
                      {listing.mainPhoto ? (
                        <img
                          src={listing.mainPhoto}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.src = "/placeholder-image.jpg";
                            img.className =
                              "w-full h-full object-contain p-4 bg-gray-100";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <FaImage className="text-4xl text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex-grow">
                      <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                        {listing.title}
                      </h3>
                      <p className="text-blue-600 font-semibold mb-2">
                        {listing.price
                          ? `${listing.price.toLocaleString()} ₸`
                          : "Цена не указана"}
                        {listing.priceType && (
                          <span className="text-sm font-normal text-gray-500 ml-2">
                            {getPriceTypeLabel(listing.priceType)}
                          </span>
                        )}
                      </p>
                      {listing.location && (
                        <p className="text-sm text-gray-500 mt-2 flex items-center">
                          <FaMapMarkerAlt className="mr-1 flex-shrink-0" />
                          <span className="truncate">{listing.location}</span>
                        </p>
                      )}
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