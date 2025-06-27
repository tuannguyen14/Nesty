import {
    Package,
    ShoppingCart
} from 'lucide-react';
import Link from 'next/link';

export function NavigationBar() {
    return (
        <>
            {/* Navigation Bar */}
            <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white text-sm py-2">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-8">
                            {/* <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1> */}
                            <nav className="flex space-x-6">
                                <Link
                                    href="/admin"
                                    className="flex items-center text-gray-900 font-medium hover:text-blue-600"
                                >
                                    <Package className="w-4 h-4 mr-2" />
                                    Sản phẩm
                                </Link>
                                <Link
                                    href="/admin/orders"
                                    className="flex items-center text-gray-600 hover:text-blue-600"
                                >
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    Đơn hàng
                                </Link>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}