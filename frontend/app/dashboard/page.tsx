"use client";

export default function DashboardPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
            <div className="bg-white p-8 rounded-xl shadow-lg w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    Привет, ты авторизован!
                </h2>
            </div>
        </div>
    );
}
