'use client'

import { ProductWithDetails } from '@/types/product';
import {
    Edit,
    Trash2,
    Eye,
    Package,
    Palette,
    Percent,
    AlertCircle,
    Layers,
    MoreVertical,
    Archive
} from 'lucide-react';
import { useState } from 'react';

interface ProductsGridProps {
    products: ProductWithDetails[];
    onEdit: (product: ProductWithDetails) => void;
    onDelete: (product: ProductWithDetails) => void;
    onAddProduct: () => void;
    viewMode?: 'grid' | 'list';
}

export default function ProductsGrid({
    products,
    onEdit,
    onDelete,
    onAddProduct,
    viewMode = 'grid'
}: ProductsGridProps) {
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const getTotalStock = (product: ProductWithDetails) => {
        if (!product.variants || product.variants.length === 0) return 0;
        return product.variants.reduce((sum, variant) => sum + variant.stock, 0);
    };

    const isOnSale = (product: ProductWithDetails) => {
        if (!product.discount_price || !product.discount_start || !product.discount_end) {
            return false;
        }
        const now = new Date();
        const start = new Date(product.discount_start);
        const end = new Date(product.discount_end);
        return now.getTime() >= start.getTime() && now.getTime() <= end.getTime() && product.discount_price < product.price;
    };

    const getDiscountPercentage = (product: ProductWithDetails) => {
        if (!isOnSale(product) || !product.discount_price) {
            return 0;
        }
        return Math.round(((product.price - product.discount_price) / product.price) * 100);
    };

    const getStockStatus = (stock: number) => {
        if (stock === 0) return { label: 'Hết hàng', color: 'red' };
        if (stock <= 5) return { label: 'Sắp hết', color: 'yellow' };
        return { label: 'Còn hàng', color: 'green' };
    };

    if (products.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center border border-gray-200 dark:border-gray-700">
                <div className="max-w-md mx-auto">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 mb-4">
                        <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Chưa có sản phẩm nào
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Hãy bắt đầu bằng cách thêm sản phẩm đầu tiên cho cửa hàng của bạn.
                    </p>
                    <button
                        onClick={onAddProduct}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg"
                    >
                        <Package className="w-5 h-5 mr-2" />
                        Thêm sản phẩm đầu tiên
                    </button>
                </div>
            </div>
        );
    }

    // List view component
    const ListView = () => (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Sản phẩm
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Danh mục
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Giá
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Tồn kho
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Biến thể
                        </th>
                        <th className="relative px-6 py-3">
                            <span className="sr-only">Hành động</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {products.map((product) => {
                        const stock = getTotalStock(product);
                        const stockStatus = getStockStatus(stock);
                        const discountPercentage = getDiscountPercentage(product);

                        return (
                            <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0">
                                            {product.images && product.images.length > 0 ? (
                                                <img
                                                    className="h-10 w-10 rounded-lg object-cover"
                                                    src={product.images[0].image_url}
                                                    alt={product.name}
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                    <Package className="h-5 w-5 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {product.name}
                                            </div>
                                            {discountPercentage > 0 && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                                    -{discountPercentage}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-gray-900 dark:text-gray-300">
                                        {product.category?.name || '-'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {isOnSale(product) ? (
                                        <div>
                                            <div className="text-sm font-medium text-red-600 dark:text-red-400">
                                                {formatPrice(product.discount_price!)}
                                            </div>
                                            <div className="text-xs text-gray-500 line-through">
                                                {formatPrice(product.price)}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {formatPrice(product.price)}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                        ${stockStatus.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                                        ${stockStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                                        ${stockStatus.color === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                                    `}>
                                        {stock} ({stockStatus.label})
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {product.variants ? product.variants.length : 0} biến thể
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onEdit(product)}
                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`)) {
                                                    onDelete(product);
                                                }
                                            }}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );

    // Grid view component
    const GridView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
                const discountPercentage = getDiscountPercentage(product);
                const onSale = isOnSale(product);
                const stock = getTotalStock(product);
                const stockStatus = getStockStatus(stock);

                return (
                    <div
                        key={product.id}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                    >
                        {/* Product Image */}
                        <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
                            {product.images && product.images.length > 0 ? (
                                <img
                                    src={product.images[0].image_url}
                                    alt={product.name}
                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                                    <Package className="w-12 h-12 text-gray-400 dark:text-gray-600" />
                                </div>
                            )}

                            {/* Badges */}
                            <div className="absolute top-3 left-3 flex flex-col gap-2">
                                {discountPercentage > 0 && (
                                    <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-lg">
                                        <Percent className="w-3 h-3 mr-1" />
                                        -{discountPercentage}%
                                    </div>
                                )}
                                {stock === 0 && (
                                    <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-800 text-white shadow-lg">
                                        <AlertCircle className="w-3 h-3 mr-1" />
                                        Hết hàng
                                    </div>
                                )}
                            </div>

                            {/* Actions Menu */}
                            <div className="absolute top-3 right-3">
                                <div className="relative">
                                    <button
                                        onClick={() => setActiveMenu(activeMenu === String(product.id) ? null : String(product.id))}
                                        className="p-2 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                    </button>
                                    {activeMenu === String(product.id) && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-10">
                                            <button
                                                onClick={() => {
                                                    onEdit(product);
                                                    setActiveMenu(null);
                                                }}
                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                <Edit className="w-4 h-4 mr-2" />
                                                Chỉnh sửa
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`)) {
                                                        onDelete(product);
                                                    }
                                                    setActiveMenu(null);
                                                }}
                                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Xóa sản phẩm
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-5">
                            {/* Category */}
                            {product.category && (
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                    {product.category.name}
                                </p>
                            )}

                            {/* Name */}
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
                                {product.name}
                            </h3>

                            {/* Price */}
                            <div className="mb-4">
                                {onSale ? (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl font-bold text-red-600 dark:text-red-400">
                                                {formatPrice(product.discount_price!)}
                                            </span>
                                            <span className="text-sm text-gray-500 line-through">
                                                {formatPrice(product.price)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                                            Tiết kiệm {formatPrice(product.price - product.discount_price!)}
                                        </p>
                                    </div>
                                ) : (
                                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                                        {formatPrice(product.price)}
                                    </span>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <Archive className="w-4 h-4 text-gray-400" />
                                    <span className={`font-medium
                                        ${stockStatus.color === 'green' ? 'text-green-600 dark:text-green-400' : ''}
                                        ${stockStatus.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' : ''}
                                        ${stockStatus.color === 'red' ? 'text-red-600 dark:text-red-400' : ''}
                                    `}>
                                        {stock} tồn kho
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Layers className="w-4 h-4 text-gray-400" />
                                    <span>{product.variants ? product.variants.length : 0} biến thể</span>
                                </div>
                            </div>

                            {/* Variants Preview */}
                            {product.availableColors && product.availableColors.length > 0 && (
                                <div className="flex items-center gap-2 mb-4">
                                    <Palette className="w-4 h-4 text-gray-400" />
                                    <div className="flex gap-1">
                                        {product.availableColors.slice(0, 4).map((color, index) => (
                                            <div
                                                key={index}
                                                className="w-5 h-5 rounded-full border-2 border-gray-200 dark:border-gray-600"
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                        {product.availableColors.length > 4 && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                +{product.availableColors.length - 4}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    onClick={() => onEdit(product)}
                                    className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                                >
                                    <Edit className="w-4 h-4 inline mr-1" />
                                    Sửa
                                </button>
                                <button
                                    onClick={() => window.open(`/products/${product.slug}`, '_blank')}
                                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    return viewMode === 'list' ? <ListView /> : <GridView />;
}