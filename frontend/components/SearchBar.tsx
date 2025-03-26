"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SearchBar = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const router = useRouter();

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        try {
            const response = await fetch(`http://localhost:3001/api/listings/search?q=${query}`);
            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error("Ошибка поиска:", error);
        }
    };

    const handleSelectListing = (listingId) => {
        router.push(`/listings/${listingId}`);
    };

    return (
        <div className="p-4">
            <form onSubmit={handleSearch} className="flex gap-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Введите название или категорию..."
                    className="w-full p-2 border rounded-lg"
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                    Найти
                </button>
            </form>

            {results.length > 0 && (
                <ul className="mt-4 border rounded-lg p-2 bg-white shadow-lg">
                    {results.map((listing) => (
                        <li
                            key={listing.id}
                            onClick={() => handleSelectListing(listing.id)}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                        >
                            {listing.title}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchBar;
