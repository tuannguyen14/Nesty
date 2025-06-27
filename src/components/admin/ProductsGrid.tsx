'use client'

import { ProductWithDetails } from '@/types/product';

interface ProductsGridProps {
    products: ProductWithDetails[];
    onEdit: (product: ProductWithDetails) => void;
    onDelete: (product: ProductWithDetails) => void;
    onAddProduct: () => void;
}

export default function ProductsGrid({ products, onEdit, onDelete, onAddProduct }: ProductsGridProps) {
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

    if (products.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="max-w-md mx-auto">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có sản phẩm nào</h3>
                    <p className="mt-1 text-sm text-gray-500">Hãy bắt đầu bằng cách thêm sản phẩm đầu tiên.</p>
                    <div className="mt-6">
                        <button
                            onClick={onAddProduct}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Thêm sản phẩm
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                    Danh sách sản phẩm ({products.length})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => {
                        const discountPercentage = getDiscountPercentage(product);
                        const onSale = isOnSale(product);

                        return (
                            <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-white">
                                {/* Product Image */}
                                <div className="aspect-w-16 aspect-h-9 bg-gray-200 relative overflow-hidden">
                                    {product.images && product.images.length > 0 ? (
                                        <img
                                            src={product.images[0].image_url}
                                            alt={product.name}
                                            className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Discount Badge */}
                                    {discountPercentage > 0 && (
                                        <div className="absolute top-2 right-2">
                                            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                                <span className="drop-shadow-sm">-{discountPercentage}%</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Stock status overlay */}
                                    {getTotalStock(product) === 0 && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                            <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold text-sm">
                                                HẾT HÀNG
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Product Info */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="text-lg font-semibold text-gray-900 truncate flex-1 leading-tight">
                                            {product.name}
                                        </h4>
                                        {onSale && (
                                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300">
                                                <span className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></span>
                                                SALE
                                            </span>
                                        )}
                                    </div>

                                    {product.category && (
                                        <p className="text-sm text-gray-500 mb-2">{product.category.name}</p>
                                    )}

                                    {/* Price */}
                                    <div className="mb-3">
                                        {onSale ? (
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl font-bold text-red-600">
                                                        {formatPrice(product.discount_price!)}
                                                    </span>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        Giảm {discountPercentage}%
                                                    </span>
                                                </div>
                                                <div className="relative">
                                                    <span className="text-sm text-gray-500 line-through decoration-2 decoration-red-400">
                                                        {formatPrice(product.price)}
                                                    </span>
                                                    <span className="ml-2 text-xs text-green-600 font-medium">
                                                        Tiết kiệm {formatPrice(product.price - product.discount_price!)}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-xl font-bold text-gray-900">
                                                {formatPrice(product.price)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Stock and Variants */}
                                    <div className="flex items-center justify-between text-sm mb-3">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTotalStock(product) > 10
                                            ? 'bg-green-100 text-green-800'
                                            : getTotalStock(product) > 0
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {getTotalStock(product) > 0 ? `Còn ${getTotalStock(product)}` : 'Hết hàng'}
                                        </span>
                                        <span className="text-gray-500">
                                            {product.variants ? product.variants.length : 0} biến thể
                                        </span>
                                    </div>

                                    {/* Variants Preview */}
                                    {product.variants && product.variants.length > 0 && (
                                        <div className="mb-3">
                                            <div className="flex flex-wrap gap-1">
                                                {product.variants.slice(0, 3).map((variant, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                                    >
                                                        {variant.color} - {variant.size}
                                                    </span>
                                                ))}
                                                {product.variants.length > 3 && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        +{product.variants.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                                        <button
                                            onClick={() => onEdit(product)}
                                            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 hover:shadow-md"
                                        >
                                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`)) {
                                                    onDelete(product);
                                                }
                                            }}
                                            className="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-all duration-200 hover:shadow-md"
                                        >
                                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

