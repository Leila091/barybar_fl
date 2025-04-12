import { AuthProvider } from "../app/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "../app/globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ru">
        <body className="bg-gray-100 flex flex-col min-h-screen">
            <AuthProvider>
                {/* Хедер с фиксированным позиционированием */}
                <Header />

                {/* Основной контент с отступом сверху равным высоте хедера */}
                <main className="flex-grow container mx-auto pt-20"> {/* Добавлен pt-20 (5rem = 80px) */}
                    {children}
                </main>
                <Footer />
            </AuthProvider>
        </body>
        </html>
    );
}