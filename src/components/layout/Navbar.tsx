'use client'

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useCart } from '@/hooks/useCart';
import { Search, ShoppingCart, User, Menu, X, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';

import { useAuth } from '@/hooks/useAuth';

// Enum để định nghĩa các loại menu
enum MenuType {
    CATEGORY = 'category',
    ACCOUNT = 'account',
    MOBILE = 'mobile',
    SEARCH = 'search'
}

// Interface cho category
interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image_url?: string;
    is_active: boolean;
    created_at: string;
}

export default function Navbar() {
    const { user, loading, logout } = useAuth();
    const { cart } = useCart();

    // State cho categories
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    // Sử dụng một state object để quản lý tất cả menu states
    const [menuStates, setMenuStates] = useState({
        [MenuType.CATEGORY]: false,
        [MenuType.ACCOUNT]: false,
        [MenuType.MOBILE]: false,
        [MenuType.SEARCH]: false
    });

    const [searchQuery, setSearchQuery] = useState('');

    // Fetch categories từ Supabase
    const fetchCategories = useCallback(async () => {
        try {
            setCategoriesLoading(true);
            const { data, error } = await supabase
                .from('categories')
                .select('*')
            // .eq('is_active', true)
            // .order('name', { ascending: true });

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
    }, [supabase]);

    // Fetch categories khi component mount
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Hàm toggle menu - chỉ mở menu được chọn, đóng tất cả menu khác
    const toggleMenu = useCallback((menuType: MenuType) => {
        setMenuStates(prev => ({
            ...Object.keys(prev).reduce((acc, key) => {
                acc[key as MenuType] = key === menuType ? !prev[key as MenuType] : false;
                return acc;
            }, {} as typeof prev)
        }));
    }, []);

    // Hàm đóng tất cả menu
    const closeAllMenus = useCallback(() => {
        setMenuStates({
            [MenuType.CATEGORY]: false,
            [MenuType.ACCOUNT]: false,
            [MenuType.MOBILE]: false,
            [MenuType.SEARCH]: false
        });
    }, []);

    // Hàm đóng menu cụ thể
    const closeMenu = useCallback((menuType: MenuType) => {
        setMenuStates(prev => ({
            ...prev,
            [menuType]: false
        }));
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
        }
    };

    // Click outside để đóng menu
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
        <nav className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg sticky top-0 z-50">
            {/* Top Bar */}
            <div className="bg-orange-700 text-white text-sm py-2">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                    <span>🚚 Miễn phí vận chuyển cho đơn hàng trên 300k</span>
                    <div className="hidden md:flex space-x-4">
                        <span>Hotline: 1800282279</span>
                        <span>|</span>
                        <Link href="/support" className="hover:underline">Hỗ trợ</Link>
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="bg-white p-3 rounded-full">
                            <Image
                                src="/logo/logo.png"
                                alt="Nesty Logo"
                                width={150}
                                height={60}
                                className="drop-shadow-md"
                                style={{width: 'auto', height: 'auto'}}
                            />
                        </div>
                    </Link>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <form onSubmit={handleSearch} className="w-full relative">
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 pr-12 rounded-full border-1 focus:outline-none focus:ring-2 text-white"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-600 hover:bg-orange-700 text-white p-2 rounded-full transition-colors"
                            >
                                <Search size={16} />
                            </button>
                        </form>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center space-x-6">
                        {/* Categories Dropdown */}
                        <div className="relative menu-container">
                            <button
                                onClick={() => toggleMenu(MenuType.CATEGORY)}
                                className="flex items-center space-x-1 text-white hover:text-orange-200 transition-colors"
                            >
                                <span>Danh mục</span>
                                <ChevronDown
                                    size={16}
                                    className={`transform transition-transform ${menuStates[MenuType.CATEGORY] ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {menuStates[MenuType.CATEGORY] && (
                                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                                    {categoriesLoading ? (
                                        <div className="px-4 py-2 text-gray-500 text-center">
                                            Đang tải...
                                        </div>
                                    ) : categories.length > 0 ? (
                                        categories.map((category) => (
                                            <Link
                                                key={category.id}
                                                href={`/category/${category.slug}`}
                                                className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                                                onClick={() => closeMenu(MenuType.CATEGORY)}
                                            >
                                                {category.name}
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="px-4 py-2 text-gray-500 text-center">
                                            Không có danh mục nào
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Cart */}
                        <Link href="/cart" className="flex items-center space-x-1 text-white hover:text-orange-200 transition-colors relative">
                            <ShoppingCart size={20} />
                            <span>Giỏ hàng</span>
                            {cart.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {cart.length}
                                </span>
                            )}
                        </Link>

                        {/* User Account */}
                        <div className="relative menu-container">
                            <button
                                className="flex items-center space-x-1 text-white hover:text-orange-200 transition-colors"
                                onClick={() => toggleMenu(MenuType.ACCOUNT)}
                            >
                                <User size={20} />
                                <span>Tài khoản</span>
                                <ChevronDown
                                    size={16}
                                    className={`transform transition-transform ${menuStates[MenuType.ACCOUNT] ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {/* User Dropdown */}
                            {menuStates[MenuType.ACCOUNT] && (
                                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                                    {!loading ? (
                                        user ? (
                                            <>
                                                <Link
                                                    href="/profile/orders"
                                                    className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                                                    onClick={() => closeMenu(MenuType.ACCOUNT)}
                                                >
                                                    Đơn hàng của tôi
                                                </Link>
                                                <Link
                                                    href="/profile"
                                                    className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                                                    onClick={() => closeMenu(MenuType.ACCOUNT)}
                                                >
                                                    Thông tin cá nhân
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        logout();
                                                        closeMenu(MenuType.ACCOUNT);
                                                    }}
                                                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                                                >
                                                    Đăng xuất
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <Link
                                                    href="/login"
                                                    className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                                                    onClick={() => closeMenu(MenuType.ACCOUNT)}
                                                >
                                                    Đăng nhập
                                                </Link>
                                                <Link
                                                    href="/register"
                                                    className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                                                    onClick={() => closeMenu(MenuType.ACCOUNT)}
                                                >
                                                    Đăng ký
                                                </Link>
                                            </>
                                        )
                                    ) : null}
                                </div>
                            )}
                        </div>

                        {/* Admin Link */}
                        <Link href="/admin" className="text-white hover:text-orange-200 transition-colors">
                            Admin
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden flex items-center space-x-2">
                        <button
                            onClick={() => toggleMenu(MenuType.SEARCH)}
                            className="text-white p-2"
                        >
                            <Search size={20} />
                        </button>
                        <Link href="/cart" className="text-white p-2 relative">
                            <ShoppingCart size={20} />
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                    {cart.length}
                                </span>
                            )}
                        </Link>
                        <button
                            onClick={() => toggleMenu(MenuType.MOBILE)}
                            className="text-white p-2"
                        >
                            {menuStates[MenuType.MOBILE] ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                {menuStates[MenuType.SEARCH] && (
                    <div className="md:hidden pb-4">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-3 pr-12 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-orange-300 text-gray-700"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-600 hover:bg-orange-700 text-white p-2 rounded-full"
                            >
                                <Search size={16} />
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* Mobile Menu */}
            {menuStates[MenuType.MOBILE] && (
                <div className="md:hidden bg-orange-600 border-t border-orange-400 menu-container">
                    <div className="px-4 py-4 space-y-4">
                        {/* Categories */}
                        <div>
                            <button
                                onClick={() => toggleMenu(MenuType.CATEGORY)}
                                className="flex items-center justify-between w-full text-white font-medium"
                            >
                                <span>Danh mục sản phẩm</span>
                                <ChevronDown
                                    size={16}
                                    className={`transform transition-transform ${menuStates[MenuType.CATEGORY] ? 'rotate-180' : ''}`}
                                />
                            </button>
                            {menuStates[MenuType.CATEGORY] && (
                                <div className="mt-2 ml-4 space-y-2">
                                    {categoriesLoading ? (
                                        <div className="text-orange-100">Đang tải...</div>
                                    ) : categories.length > 0 ? (
                                        categories.map((category) => (
                                            <Link
                                                key={category.id}
                                                href={`/category/${category.slug}`}
                                                className="block text-orange-100 hover:text-white py-1"
                                                onClick={closeAllMenus}
                                            >
                                                {category.name}
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="text-orange-100">Không có danh mục nào</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Mobile Links */}
                        {!user ? (
                            <Link
                                href="/login"
                                className="block text-white py-2"
                                onClick={closeAllMenus}
                            >
                                Đăng nhập
                            </Link>
                        ) : (
                            <Link
                                href="/profile/orders"
                                className="block text-white py-2"
                                onClick={closeAllMenus}
                            >
                                Đơn hàng của tôi
                            </Link>
                        )}

                        <Link
                            href="/admin"
                            className="block text-white py-2"
                            onClick={closeAllMenus}
                        >
                            Admin
                        </Link>
                    </div>
                </div>
            )}

            {/* Overlay only for mobile menu */}
            {menuStates[MenuType.MOBILE] && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden"
                    onClick={closeAllMenus}
                />
            )}
        </nav>
    );
}