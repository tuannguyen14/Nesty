'use client'

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useCart } from '@/contexts/CartProvider';
import { Search, ShoppingCart, User, Menu, X, ChevronDown, Phone, MapPin, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

import { Category } from '@/types/category';

import OverlayLoading from "@/components/loading/OverlayLoading";

enum MenuType {
    CATEGORY = 'category',
    ACCOUNT = 'account',
    MOBILE = 'mobile',
    SEARCH = 'search'
}


export default function Navbar() {
    const { user, loading: userLoading, logout } = useAuth();
    const { totalItems, loading: cartLoading } = useCart(); // Sử dụng Global Cart Context

    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [menuStates, setMenuStates] = useState({
        [MenuType.CATEGORY]: false,
        [MenuType.ACCOUNT]: false,
        [MenuType.MOBILE]: false,
        [MenuType.SEARCH]: false
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);

    const [loading, setLoading] = useState(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            setCategoriesLoading(true);
            const { data, error } = await supabase
                .from('categories')
                .select('*');

            if (error) {
                console.error('Error fetching categories:', error);
                return;
            }

            setCategories(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setCategoriesLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const toggleMenu = useCallback((menuType: MenuType) => {
        setMenuStates(prev => ({
            ...Object.keys(prev).reduce((acc, key) => {
                acc[key as MenuType] = key === menuType ? !prev[key as MenuType] : false;
                return acc;
            }, {} as typeof prev)
        }));
    }, []);

    const closeAllMenus = useCallback(() => {
        setMenuStates({
            [MenuType.CATEGORY]: false,
            [MenuType.ACCOUNT]: false,
            [MenuType.MOBILE]: false,
            [MenuType.SEARCH]: false
        });
    }, []);

    const closeMenu = useCallback((menuType: MenuType) => {
        setMenuStates(prev => ({
            ...prev,
            [menuType]: false
        }));
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        try {
            setLoading(true);
            e.preventDefault();
            if (searchQuery.trim()) {
                window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
            }
        } catch (error) {
            console.error("Handle search error: ", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('.menu-container')) {
                closeAllMenus();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [closeAllMenus]);

    return (
        <>
            {/* Top Bar */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white text-sm py-2">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">TP Tân Uyên, Bình Dương</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5" />
                                <span>1800 282 279</span>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-4 text-sm">
                            <span className="animate-pulse">🚚 Miễn phí vận chuyển đơn từ 300k</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <nav className={`bg-white sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-lg' : 'shadow-md'
                }`}>
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center py-3">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-2 group">
                            <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-0.5 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                                <div className="bg-white p-2 rounded-xl">
                                    <Image
                                        src="/logo/logo.png"
                                        alt="Nesty Logo"
                                        width={120}
                                        height={40}
                                        className="h-8 w-auto"
                                        priority
                                        style={{ width: "auto", height: "auto" }}
                                    />
                                </div>
                            </div>
                        </Link>

                        {/* Search Bar - Desktop */}
                        <div className="hidden md:flex flex-1 max-w-xl mx-8">
                            <form onSubmit={handleSearch} className="w-full relative group">
                                <input
                                    type="text"
                                    placeholder="Bạn cần tìm gì hôm nay?"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-5 py-3 pr-12 rounded-full border-2 border-orange-200 focus:border-orange-500 focus:outline-none transition-all duration-300 bg-orange-50/50 hover:bg-orange-50 focus:bg-white"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white p-2.5 rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
                                >
                                    <Search size={18} />
                                </button>
                            </form>
                        </div>

                        {/* Desktop Navigation Links */}
                        <div className="hidden md:flex items-center gap-2">
                            {/* Categories Dropdown */}
                            <div className="relative menu-container">
                                <button
                                    onClick={() => toggleMenu(MenuType.CATEGORY)}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-all duration-300 font-medium"
                                >
                                    <span className="text-sm">Danh mục</span>
                                    <ChevronDown
                                        size={16}
                                        className={`transform transition-transform ${menuStates[MenuType.CATEGORY] ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {menuStates[MenuType.CATEGORY] && (
                                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl py-2 z-50 border border-orange-100 overflow-hidden">
                                        <div className="max-h-96 overflow-y-auto">
                                            {categoriesLoading ? (
                                                <div className="px-4 py-3 text-gray-500 text-center">
                                                    <div className="inline-block w-5 h-5 border-2 border-orange-300 border-t-transparent rounded-full animate-spin"></div>
                                                </div>
                                            ) : categories.length > 0 ? (
                                                categories.map((category) => (
                                                    <Link
                                                        key={category.id}
                                                        href={`/products?category=${category.slug}`}
                                                        className="block px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all duration-200 text-sm"
                                                        onClick={() => closeMenu(MenuType.CATEGORY)}
                                                    >
                                                        {category.name}
                                                    </Link>
                                                ))
                                            ) : (
                                                <div className="px-4 py-3 text-gray-500 text-center text-sm">
                                                    Không có danh mục nào
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* About Us */}
                            <Link
                                href="/about"
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-all duration-300"
                            >
                                <Info size={20} />
                                <span className="text-sm font-medium hidden lg:inline">Về chúng tôi</span>
                            </Link>

                            {/* Cart - Now using Global Cart Context */}
                            <Link
                                href="/cart"
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-all duration-300 relative group"
                            >
                                <div className="relative">
                                    <ShoppingCart size={20} />
                                    {/* Cart Badge - Now synced globally */}
                                    {cartLoading ? (
                                        <span className="absolute -top-2 -right-2 bg-gray-400 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                        </span>
                                    ) : totalItems > 0 ? (
                                        <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse-orange">
                                            {totalItems}
                                        </span>
                                    ) : null}
                                </div>
                                <span className="text-sm font-medium hidden lg:inline">Giỏ hàng</span>
                            </Link>

                            {/* User Account */}
                            <div className="relative menu-container">
                                <button
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-lg"
                                    onClick={() => toggleMenu(MenuType.ACCOUNT)}
                                >
                                    <User size={20} />
                                    <span className="text-sm font-medium">
                                        {user ? user.email?.split('@')[0] : 'Tài khoản'}
                                    </span>
                                    <ChevronDown
                                        size={16}
                                        className={`transform transition-transform ${menuStates[MenuType.ACCOUNT] ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {/* User Dropdown */}
                                {menuStates[MenuType.ACCOUNT] && (
                                    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl py-2 z-50 border border-orange-100 overflow-hidden">
                                        {!userLoading ? (
                                            user ? (
                                                <>
                                                    <div className="px-4 py-3 border-b border-orange-100">
                                                        <p className="text-sm font-medium text-gray-900">{user.email}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">ID: {user.id.slice(0, 8)}...</p>
                                                    </div>
                                                    <Link
                                                        href="/profile?tab=overview"
                                                        className="block px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all duration-200 text-sm"
                                                        onClick={() => closeMenu(MenuType.ACCOUNT)}
                                                    >
                                                        Thông tin cá nhân
                                                    </Link>
                                                    <Link
                                                        href="/profile?tab=orders"
                                                        className="block px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all duration-200 text-sm"
                                                        onClick={() => closeMenu(MenuType.ACCOUNT)}
                                                    >
                                                        Đơn hàng của tôi
                                                    </Link>
                                                    {
                                                        user?.role === "admin" ?
                                                            <Link
                                                                href="/admin"
                                                                className="block px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all duration-200 text-sm"
                                                                onClick={() => closeMenu(MenuType.ACCOUNT)}
                                                            >
                                                                Quản trị
                                                            </Link>
                                                            : null
                                                    }
                                                    <div className="border-t border-orange-100 mt-2 pt-2">
                                                        <button
                                                            onClick={() => {
                                                                logout();
                                                                closeMenu(MenuType.ACCOUNT);
                                                            }}
                                                            className="block w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 transition-all duration-200 text-sm font-medium"
                                                        >
                                                            Đăng xuất
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <Link
                                                        href="/login"
                                                        className="block px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all duration-200 text-sm font-medium"
                                                        onClick={() => closeMenu(MenuType.ACCOUNT)}
                                                    >
                                                        Đăng nhập
                                                    </Link>
                                                    <Link
                                                        href="/register"
                                                        className="block px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all duration-200 text-sm"
                                                        onClick={() => closeMenu(MenuType.ACCOUNT)}
                                                    >
                                                        Đăng ký tài khoản
                                                    </Link>
                                                </>
                                            )
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <div className="md:hidden flex items-center gap-2">
                            <button
                                onClick={() => toggleMenu(MenuType.SEARCH)}
                                className="p-2.5 rounded-xl hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-all duration-300"
                            >
                                <Search size={20} />
                            </button>
                            <Link href="/cart" className="p-2.5 rounded-xl hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-all duration-300 relative">
                                <ShoppingCart size={20} />
                                {/* Mobile cart badge - Now synced globally */}
                                {cartLoading ? (
                                    <span className="absolute -top-1 -right-1 bg-gray-400 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                    </span>
                                ) : totalItems > 0 ? (
                                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px] font-bold">
                                        {totalItems}
                                    </span>
                                ) : null}
                            </Link>
                            <button
                                onClick={() => toggleMenu(MenuType.MOBILE)}
                                className="p-2.5 rounded-xl hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-all duration-300"
                            >
                                {menuStates[MenuType.MOBILE] ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Search Bar */}
                    {menuStates[MenuType.SEARCH] && (
                        <div className="md:hidden pb-3 menu-container">
                            <form onSubmit={handleSearch} className="relative">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm sản phẩm..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-5 py-3 pr-12 rounded-full border-2 border-orange-200 focus:border-orange-500 focus:outline-none bg-orange-50/50"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-2.5 rounded-full"
                                >
                                    <Search size={16} />
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Mobile Menu */}
                {menuStates[MenuType.MOBILE] && (
                    <div className="md:hidden bg-white border-t border-orange-100 menu-container">
                        <div className="px-4 py-4 space-y-2">
                            {/* Categories */}
                            <div>
                                <button
                                    onClick={() => toggleMenu(MenuType.CATEGORY)}
                                    className="flex items-center justify-between w-full py-3 text-gray-700 font-medium"
                                >
                                    <span>Danh mục sản phẩm</span>
                                    <ChevronDown
                                        size={18}
                                        className={`transform transition-transform text-orange-500 ${menuStates[MenuType.CATEGORY] ? 'rotate-180' : ''}`}
                                    />
                                </button>
                                {menuStates[MenuType.CATEGORY] && (
                                    <div className="mt-2 ml-4 space-y-2 pb-3">
                                        {categoriesLoading ? (
                                            <div className="text-gray-400 text-sm">Đang tải...</div>
                                        ) : categories.length > 0 ? (
                                            categories.map((category) => (
                                                <Link
                                                    key={category.id}
                                                    href={`/products?category=${category.slug}`}
                                                    className="block text-gray-600 hover:text-orange-600 py-2 text-sm"
                                                    onClick={closeAllMenus}
                                                >
                                                    {category.name}
                                                </Link>
                                            ))
                                        ) : (
                                            <div className="text-gray-400 text-sm">Không có danh mục nào</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Mobile Links */}
                            <Link
                                href="/about"
                                className="block py-3 text-gray-700 hover:text-orange-600 font-medium"
                                onClick={closeAllMenus}
                            >
                                Về chúng tôi
                            </Link>

                            {!user ? (
                                <>
                                    <Link
                                        href="/login"
                                        className="block py-3 text-gray-700 hover:text-orange-600 font-medium"
                                        onClick={closeAllMenus}
                                    >
                                        Đăng nhập
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="block py-3 text-gray-700 hover:text-orange-600"
                                        onClick={closeAllMenus}
                                    >
                                        Đăng ký
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="//profile?tab=overview"
                                        className="block py-3 text-gray-700 hover:text-orange-600 font-medium"
                                        onClick={closeAllMenus}
                                    >
                                        Thông tin cá nhân
                                    </Link>
                                    <Link
                                        href="//profile?tab=oders"
                                        className="block py-3 text-gray-700 hover:text-orange-600"
                                        onClick={closeAllMenus}
                                    >
                                        Đơn hàng của tôi
                                    </Link>
                                    <button
                                        onClick={() => {
                                            logout();
                                            closeAllMenus();
                                        }}
                                        className="block w-full text-left py-3 text-red-600 hover:text-red-700 font-medium"
                                    >
                                        Đăng xuất
                                    </button>
                                </>
                            )}

                            {
                                user?.role === "admin" ?
                                    <Link
                                        href="/admin"
                                        className="block py-3 text-gray-700 hover:text-orange-600 font-medium border-t border-orange-100"
                                        onClick={closeAllMenus}
                                    >
                                        Quản trị
                                    </Link>
                                    : null
                            }
                        </div>
                    </div>
                )}
            </nav>

            {/* Mobile menu overlay */}
            {(menuStates[MenuType.MOBILE] || menuStates[MenuType.CATEGORY]) && (
                <div
                    className="fixed inset-0 bg-black/25 z-40 md:hidden"
                    onClick={closeAllMenus}
                />
            )}

            <OverlayLoading
                isVisible={userLoading || loading || cartLoading || categoriesLoading}
                message="Đang xử lý yêu cầu của bạn..."
            />
        </>
    );
}