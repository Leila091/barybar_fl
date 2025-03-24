import { AuthProvider } from "../app/context/AuthContext"; // Импортируем AuthProvider
import Header from "@/components/Header";
import "../app/globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ru">
        <body className="bg-gray-100">
        <AuthProvider> {/* Обёртка приложения в AuthProvider */}
            <Header />
            <main className="container mx-auto">{children}</main>
        </AuthProvider>
        </body>
        </html>
    );
}