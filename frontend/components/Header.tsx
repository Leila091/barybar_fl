"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaSearch, FaBars, FaUser, FaSignOutAlt, FaList, FaCalendarAlt, FaTimes } from "react-icons/fa";
import { IconType } from "react-icons";
import { isAuthenticated, logoutUser } from "../app/auth/auth";
import "../app/globals.css";
import CreateListingModal from "../app/listing/create-listing/page";
import SignInPage from "../app/auth/sign-in/page";
import SignUpPage from "../app/auth/sign-up/page";
import Image from "next/image";

const renderIcon = (Icon: IconType, size = 20) => {
    return <Icon size={size} />;
};

const Header = () => {
    const router = useRouter();
    const [isAuth, setIsAuth] = useState(false);
    const [user, setUser] = useState<{ firstName: string; avatar?: string } | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showSignUpModal, setShowSignUpModal] = useState(false);
    const [showSignInModal, setShowSignInModal] = useState(false);

    // Проверка аутентификации и загрузка профиля
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setIsAuth(false);
                    setUser(null);
                    return;
                }

                const res = await fetch("http://localhost:3000/api/users/profile", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    if (res.status === 401) {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        setIsAuth(false);
                        setUser(null);
                        return;
                    }
                    throw new Error("Ошибка загрузки профиля");
                }

                const data = await res.json();
                if (data && data.firstName) {
                    setUser(data);
                    setIsAuth(true);
                }
            } catch (err) {
                console.error("Ошибка при загрузке профиля:", err);
                setIsAuth(false);
                setUser(null);
            }
        };

        checkAuth();
        window.addEventListener("storage", checkAuth);
        return () => window.removeEventListener("storage", checkAuth);
    }, []);

    // Поиск объявлений
    useEffect(() => {
        const fetchResults = async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }

            try {
                const response = await fetch(`/api/listings/search?q=${query}`);
                const data = await response.json();
                setResults(data);
            } catch (error) {
                console.error("Ошибка поиска:", error);
            }
        };

        const timer = setTimeout(fetchResults, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const handleSelectListing = (listingId: number) => {
        setQuery("");
        setResults([]);
        router.push(`/listing/${listingId}`);
    };

    const resetAuthForms = () => {
        setShowSignInModal(false);
        setShowSignUpModal(false);
    };

    const handleLogout = () => {
        logoutUser();
        setIsAuth(false);
        setUser(null);
        router.refresh();
        router.push("/");
    };

    return (
        <>
            <header className="fixed top-0 left-0 w-full h-20 bg-gradient-to-r from-[#5E54F3] to-[#00C2FA] z-50 shadow-md">
                <div className="container mx-auto px-4 h-full flex items-center justify-between">
                    {/* Логотип и категории */}
                    <div className="flex items-center space-x-4">
                        <Link href="/" className="flex items-center">
                            <Image
                                src="/logo.png"
                                alt="Barybar"
                                width={120}
                                height={40}
                                className="h-10 w-auto"
                            />
                        </Link>

                        <Link
                            href="/categories"
                            className="hidden md:flex items-center space-x-2 px-3 py-2 border border-white rounded-lg text-white hover:bg-white/10 transition"
                        >
                            {/*<Image*/}
                            {/*    src="/category.png"*/}
                            {/*    alt="Categories"*/}
                            {/*    width={20}*/}
                            {/*    height={20}*/}
                            {/*/>*/}
                            <span className="font-semibold text-sm">Категории</span>
                        </Link>
                    </div>

                    {/* Поиск (только на десктопе) */}
                    <div className="hidden md:block flex-1 max-w-md mx-4 relative">
                        <div className="relative">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Поиск сервиса"
                                className="w-full pl-4 pr-10 py-2 rounded-lg border border-white bg-transparent text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                            />
                            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white" />
                        </div>

                        {results.length > 0 && (
                            <div className="absolute mt-1 w-full bg-white rounded-lg shadow-lg z-30 max-h-60 overflow-y-auto">
                                {results.map((listing: any) => (
                                    <div
                                        key={listing.id}
                                        onClick={() => handleSelectListing(listing.id)}
                                        className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                    >
                                        <p className="text-gray-800 font-medium">{listing.title}</p>
                                        <p className="text-sm text-gray-500">{listing.price} ₽/день</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Кнопки авторизации/профиль */}
                    <div className="flex items-center space-x-3">
                        {isAuth ? (
                            <>
                                <CreateListingModal />
                                <div className="relative">
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-white text-white hover:bg-white/10 transition"
                                    >
                                        {user?.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt="Аватар"
                                                className="w-8 h-8 rounded-full"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                                <FaUser className="text-white" />
                                            </div>
                                        )}
                                        <span className="font-semibold text-sm">{user?.firstName || "Профиль"}</span>
                                    </button>

                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-30 py-1">
                                            <Link href="/profile">
                                                <div className="px-4 py-2 hover:bg-gray-100 transition cursor-pointer">
                                                    Мой профиль
                                                </div>
                                            </Link>
                                            <Link href="/listing/my-listings">
                                                <div className="px-4 py-2 hover:bg-gray-100 transition cursor-pointer">
                                                    Мои объявления
                                                </div>
                                            </Link>
                                            <Link href="/bookings">
                                                <div className="px-4 py-2 hover:bg-gray-100 transition cursor-pointer">
                                                    Мои бронирования
                                                </div>
                                            </Link>
                                            <div className="border-t border-gray-200 my-1"></div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 hover:bg-gray-100 transition text-red-500"
                                            >
                                                Выйти
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        resetAuthForms();
                                        setShowSignInModal(true);
                                    }}
                                    className="px-4 py-2 rounded-lg border border-white text-white hover:bg-white/10 transition"
                                >
                                    Войти
                                </button>
                                <button
                                    onClick={() => {
                                        resetAuthForms();
                                        setShowSignUpModal(true);
                                    }}
                                    className="px-4 py-2 rounded-lg bg-[#FFDA63] text-[#5E54F3] hover:bg-[#FFE58A] transition"
                                >
                                    Зарегистрироваться
                                </button>
                            </>
                        )}

                        {/* Кнопка меню для мобильных */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 text-white"
                        >
                            <FaBars size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Мобильное меню */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed top-20 left-0 right-0 bg-white shadow-lg z-40 p-4">
                    <div className="mb-4">
                        <div className="relative">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Поиск сервиса"
                                className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>

                        {results.length > 0 && (
                            <div className="mt-1 bg-white rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {results.map((listing: any) => (
                                    <div
                                        key={listing.id}
                                        onClick={() => {
                                            handleSelectListing(listing.id);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                    >
                                        <p className="text-gray-800 font-medium">{listing.title}</p>
                                        <p className="text-sm text-gray-500">{listing.price} ₽/день</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Link
                            href="/categories"
                            className="block px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Категории
                        </Link>

                        {isAuth ? (
                            <>
                                <CreateListingModal mobileView onClose={() => setIsMobileMenuOpen(false)} />
                                <Link
                                    href="/profile"
                                    className="block px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Мой профиль
                                </Link>
                                <Link
                                    href="/listing/my-listings"
                                    className="block px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Мои объявления
                                </Link>
                                <Link
                                    href="/bookings"
                                    className="block px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Мои бронирования
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition text-red-500"
                                >
                                    Выйти
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        resetAuthForms();
                                        setShowSignInModal(true);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                                >
                                    Войти
                                </button>
                                <button
                                    onClick={() => {
                                        resetAuthForms();
                                        setShowSignUpModal(true);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full px-4 py-2 rounded-lg bg-[#FFDA63] text-[#5E54F3] hover:bg-[#FFE58A] transition"
                                >
                                    Зарегистрироваться
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Модальные окна авторизации */}
            {showSignInModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md relative">
                        <button
                            onClick={() => setShowSignInModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <FaTimes size={20} />
                        </button>
                        <SignInPage
                            onSuccess={() => {
                                setShowSignInModal(false);
                                router.refresh();
                            }}
                            onSwitchToSignUp={() => {
                                setShowSignInModal(false);
                                setShowSignUpModal(true);
                            }}
                        />
                    </div>
                </div>
            )}

            {showSignUpModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md relative">
                        <button
                            onClick={() => setShowSignUpModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <FaTimes size={20} />
                        </button>
                        <SignUpPage
                            onSuccess={() => {
                                setShowSignUpModal(false);
                                router.refresh();
                            }}
                            onSwitchToSignIn={() => {
                                setShowSignUpModal(false);
                                setShowSignInModal(true);
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;