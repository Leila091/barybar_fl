


"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FaFilter, FaSearch } from "react-icons/fa";

interface ListingFiltersProps {
  categories: Array<{
    id: number;
    name: string;
  }>;
  locations: string[];
}

const ListingFilters = ({ categories, locations }: ListingFiltersProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [minPrice, setMinPrice] = useState<string>(
    searchParams.get("minPrice") || ""
  );
  const [maxPrice, setMaxPrice] = useState<string>(
    searchParams.get("maxPrice") || ""
  );
  const [location, setLocation] = useState<string>(
    searchParams.get("location") || ""
  );

  const handleFilter = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");

    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");

    if (location) params.set("location", location);
    else params.delete("location");

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleReset = () => {
    setMinPrice("");
    setMaxPrice("");
    setLocation("");
    router.push(pathname);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <FaFilter className="mr-2" />
          Фильтры
        </h2>
        <button
          onClick={handleReset}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Сбросить
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Минимальная цена
          </label>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="От"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Максимальная цена
          </label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="До"
            min="0"
          />
        </div>

        <div>
          {/* <label className="block text-sm font-medium text-gray-700 mb-1">
            Локация
          </label> */}
          {/* <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Все локации</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select> */}
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={handleFilter}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <FaSearch className="mr-2" />
          Применить фильтры
        </button>
      </div>
    </div>
  );
};

export default ListingFilters;