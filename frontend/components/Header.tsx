"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaBars, FaBoxOpen, FaBriefcase, FaCar, FaChevronDown, FaChild, FaFutbol, FaHandsHelping, FaHome, FaLaptop, FaSearch, FaTimes, FaTshirt, FaTv, FaUser } from "react-icons/fa";
import { logoutUser } from "../app/auth/auth";
import SignInPage from "../app/auth/sign-in/page";
import SignUpPage from "../app/auth/sign-up/page";
import "../app/globals.css";
import CreateListingModal from "../app/listing/create-listing/page";

interface Category {
  id: number;
  name: string;
}

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
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  const categoryIcons: Record<string, JSX.Element> = {
    "Недвижимость": <FaHome className="text-lg" />,
    "Автомобили": <FaCar className="text-lg" />,
    "Электроника": <FaLaptop className="text-lg" />,
    "Одежда": <FaTshirt className="text-lg" />,
    "Работа": <FaBriefcase className="text-lg" />,
    "Услуги": <FaHandsHelping className="text-lg" />,
    "Бытовая техника": <FaTv className="text-lg" />,
    "Одежда и обувь": <FaTshirt className="text-lg" />,
    "Спорт и отдых": <FaFutbol className="text-lg" />,
    "Детские товары": <FaChild className="text-lg" />,
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/category");
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchExpanded(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setIsCategoriesOpen(false);
      }
      if (!userDropdownRef.current?.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
  

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsAuth(false);
          setUser(null);
          return;
        }

        const res = await fetch("/api/users/profile", {
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
    setIsMobileMenuOpen(false);
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
    setIsMobileMenuOpen(false);
    router.refresh();
    router.push("/");
  };

  const formatPrice = (listing: any) => {
    if (listing.currency === 'KZT') {
      return `${listing.price} ₸/день`;
    }
    return `${listing.price} тг/день`;
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full h-20 bg-gradient-to-r from-[#5E54F3] to-[#00C2FA] z-50 shadow-md">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          {/* Логотип и кнопка категорий */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Barybar"
                width={120}
                height={42}
                className="h-8 w-auto"
              />
            </Link>

            {/* Выпадающее меню категорий */}
            <div className="relative" ref={categoriesRef}>
              <button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 border border-white rounded-lg text-white hover:bg-white/10 transition"
              >
                <span className="font-semibold text-base">Категории</span>
                <FaChevronDown className={`transition-transform ${isCategoriesOpen ? 'transform rotate-180' : ''}`} />
              </button>

              {isCategoriesOpen && (
                <div className={`absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-30 py-2 max-h-96 overflow-y-auto transition-opacity duration-200 ${isCategoriesOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>

                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/categories/${category.id}`}
                      onClick={() => setIsCategoriesOpen(false)}
                    >
                      <div className="flex items-center px-4 py-3 hover:bg-gray-100 transition cursor-pointer text-base text-gray-800">
                        <span className="mr-3">
                          {categoryIcons[category.name] || <FaBoxOpen className="text-lg" />}
                        </span>
                        {category.name}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Десктоп навигация */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Поиск на десктопе с анимацией */}
            <div
              ref={searchRef}
              className={`relative transition-all duration-300 ${isSearchExpanded ? 'w-96' : 'w-64'}`}
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsSearchExpanded(true)}
                placeholder="Поиск"
                className={`w-full pl-4 pr-10 py-2 rounded-lg border border-white bg-transparent text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 text-base transition-all duration-300 ${isSearchExpanded ? 'bg-white/20' : ''}`}
              />
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white" />

              {results.length > 0 && (
                <div className="absolute mt-1 w-full bg-white rounded-lg shadow-lg z-30 max-h-60 overflow-y-auto">
                  {results.map((listing: any) => (
                    <div
                      key={listing.id}
                      onClick={() => handleSelectListing(listing.id)}
                      className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <p className="text-gray-800 font-medium">{listing.title}</p>
                      <p className="text-base text-gray-500">{formatPrice(listing)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Кнопки для авторизованных */}
            {isAuth ? (
              <div className="flex items-center space-x-3">
                <CreateListingModal />

                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-white text-white hover:bg-white/10 transition"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Аватар"
                        className="w-7 h-7 rounded-full"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                        <FaUser className="text-white text-base" />
                      </div>
                    )}
                    <span className="font-medium text-base">{user?.firstName || "Профиль"}</span>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-30 py-1">
                      <Link href="/profile">
                        <div className="px-4 py-2 hover:bg-gray-100 transition cursor-pointer text-base">
                          Мой профиль
                        </div>
                      </Link>
                      <Link href="/listing/my-listings">
                        <div className="px-4 py-2 hover:bg-gray-100 transition cursor-pointer text-base">
                          Мои объявления
                        </div>
                      </Link>
                      <Link href="/bookings">
                        <div className="px-4 py-2 hover:bg-gray-100 transition cursor-pointer text-base">
                          Мои бронирования
                        </div>
                      </Link>
                      <div className="border-t border-gray-200 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition text-red-500 text-base"
                      >
                        Выйти
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSignInModal(true)}
                  className="px-3 py-1.5 rounded-lg border border-white text-white hover:bg-white/10 transition text-base"
                >
                  Войти
                </button>
                <button
                  onClick={() => setShowSignUpModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#FFDA63] text-[#5E54F3] hover:bg-[#FFE58A] transition text-base"
                >
                  Регистрация
                </button>
              </div>
            )}
          </div>

          {/* Мобильное меню кнопка */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white"
          >
            {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </header>

      {/* Мобильное меню */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-40 pt-16 overflow-y-auto">
          <div className="container mx-auto px-4 py-6">
            {/* Поиск в мобильном меню */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Поиск объявления"
                  className="w-full pl-4 pr-10 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                />
                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {results.length > 0 && (
                <div className="mt-2 bg-white rounded-lg shadow-lg max-h-60 overflow-y-auto border border-gray-200">
                  {results.map((listing: any) => (
                    <div
                      key={listing.id}
                      onClick={() => handleSelectListing(listing.id)}
                      className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <p className="text-gray-800 font-medium">{listing.title}</p>
                      <p className="text-base text-gray-500">{formatPrice(listing)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Основные ссылки */}
            <nav className="space-y-4 mb-6">
              <Link
                href="/categories"
                className="block px-4 py-3 rounded-lg hover:bg-gray-100 transition font-medium text-base"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Категории
              </Link>

              {isAuth && (
                <>
                  <CreateListingModal
                    mobileView
                    onClose={() => setIsMobileMenuOpen(false)}
                  />
                  <Link
                    href="/profile"
                    className="block px-4 py-3 rounded-lg hover:bg-gray-100 transition font-medium text-base"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Мой профиль
                  </Link>
                  <Link
                    href="/listing/my-listings"
                    className="block px-4 py-3 rounded-lg hover:bg-gray-100 transition font-medium text-base"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Мои объявления
                  </Link>
                  <Link
                    href="/bookings"
                    className="block px-4 py-3 rounded-lg hover:bg-gray-100 transition font-medium text-base"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Мои бронирования
                  </Link>
                </>
              )}
            </nav>

            {/* Кнопки авторизации */}
            {isAuth ? (
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition font-medium text-base"
              >
                Выйти из аккаунта
              </button>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowSignInModal(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 rounded-lg border border-blue-500 text-blue-500 hover:bg-blue-50 transition font-medium text-base"
                >
                  Войти
                </button>
                <button
                  onClick={() => {
                    setShowSignUpModal(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-[#FFDA63] text-[#5E54F3] hover:bg-[#FFE58A] transition font-medium text-base"
                >
                  Зарегистрироваться
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Модальные окна авторизации */}
      {showSignInModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md relative max-h-[90vh] overflow-y-auto">
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
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md relative max-h-[90vh] overflow-y-auto">
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