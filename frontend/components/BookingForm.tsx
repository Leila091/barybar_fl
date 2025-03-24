"use client";

import { useState } from "react";

interface BookingFormProps {
    listingId: number;
    userId: number;
    onBookingSuccess: () => void;
}

const BookingForm = ({ listingId, userId, onBookingSuccess }: BookingFormProps) => {
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:3001/api/bookings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ listingId, userId, startDate, endDate }),
            });

            if (!response.ok) {
                throw new Error("Ошибка при бронировании");
            }

            const data = await response.json();
            console.log("Бронирование создано:", data);
            onBookingSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Забронировать</h2>

            <div className="mb-4">
                <label className="block text-gray-600 mb-1">Дата начала:</label>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div className="mb-4">
                <label className="block text-gray-600 mb-1">Дата окончания:</label>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

            <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2 text-white font-medium rounded-lg transition ${
                    isLoading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
                {isLoading ? "Бронирование..." : "Забронировать"}
            </button>
        </form>
    );
};

export default BookingForm;
