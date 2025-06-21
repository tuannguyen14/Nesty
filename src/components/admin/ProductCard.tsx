import { ProductWithDetails } from '@/types/product';

interface ProductCardProps {
    product: ProductWithDetails
    onEdit: (product: ProductWithDetails) => void
    onDelete: (product: ProductWithDetails) => void
}

export default function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
    const handleDelete = () => {
        if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`)) {
            onDelete(product)
        }
    }

    // Kiểm tra xem có đang trong thời gian giảm giá không
    const isDiscountActive = () => {
        if (!product.discount_price || !product.discount_start || !product.discount_end) {
            return false
        }

        const now = new Date()
        const startDate = new Date(product.discount_start)
        const endDate = new Date(product.discount_end)

        return now >= startDate && now <= endDate
    }

    // Tìm variant có giá thấp nhất và cao nhất
    const getVariantPriceRange = () => {
        if (!product.variants || product.variants.length === 0) {
            return {
                minPrice: product.price,
                maxPrice: product.price,
                hasDiscount: isDiscountActive(),
                discountPrice: product.discount_price || 0
            }
        }

        let minPrice = Number.MAX_VALUE
        let maxPrice = 0

        product.variants.forEach(variant => {
            // Sử dụng price_override nếu có, nếu không thì dùng price từ product
            const variantPrice = variant.price_override || product.price

            if (variantPrice < minPrice) minPrice = variantPrice
            if (variantPrice > maxPrice) maxPrice = variantPrice
        })

        return {
            minPrice: minPrice === Number.MAX_VALUE ? product.price : minPrice,
            maxPrice: maxPrice === 0 ? product.price : maxPrice,
            hasDiscount: isDiscountActive(),
            discountPrice: product.discount_price || 0
        }
    }

    // Tính tổng tồn kho từ tất cả variants
    const getTotalStock = () => {
        if (!product.variants || product.variants.length === 0) return 0
        return product.variants.reduce((total, variant) => total + variant.stock, 0)
    }

    // Tính discount percentage
    const getDiscountPercentage = () => {
        if (!isDiscountActive() || !product.discount_price) {
            return 0
        }

        const originalPrice = product.price
        const discountPrice = product.discount_price

        if (originalPrice <= discountPrice) {
            return 0
        }

        return Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
    }

    const priceRange = getVariantPriceRange()
    const totalStock = getTotalStock()
    const discountPercent = getDiscountPercentage()

    // Format giá
    const formatPrice = (price: number) => {
        return price.toLocaleString('vi-VN')
    }

    // Hiển thị giá
    const renderPrice = () => {
        if (priceRange.hasDiscount && priceRange.discountPrice > 0) {
            // Có giảm giá
            return (
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-red-600">
                            {formatPrice(priceRange.discountPrice)}đ
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            -{discountPercent}%
                        </span>
                    </div>
                    <span className="text-sm text-gray-500 line-through decoration-2 decoration-red-400">
                        {priceRange.minPrice === priceRange.maxPrice
                            ? `${formatPrice(priceRange.minPrice)}đ`
                            : `${formatPrice(priceRange.minPrice)}đ - ${formatPrice(priceRange.maxPrice)}đ`
                        }
                    </span>
                </div>
            )
        } else {
            // Không có giảm giá
            if (priceRange.minPrice === priceRange.maxPrice) {
                return (
                    <span className="text-lg font-bold text-green-600">
                        {formatPrice(priceRange.minPrice)}đ
                    </span>
                )
            } else {
                return (
                    <span className="text-lg font-bold text-green-600">
                        {formatPrice(priceRange.minPrice)}đ - {formatPrice(priceRange.maxPrice)}đ
                    </span>
                )
            }
        }
    }


    return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-w-1 aspect-h-1 relative">
                <img
                    src={product.images?.[0]?.image_url || '/placeholder-image.png'}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                />
                {discountPercent > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                        -{discountPercent}%
                    </div>
                )}
            </div>
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {product.description || 'Không có mô tả'}
                </p>
                <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col">
                        {renderPrice()}
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${totalStock > 0
                            ? totalStock > 10
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                        {totalStock > 0 ? `Còn ${totalStock}` : 'Hết hàng'}
                    </span>
                </div>

                {/* Hiển thị số lượng variants */}
                <div className="mb-3 text-xs text-gray-500">
                    {product.variants ? `${product.variants.length} phiên bản` : 'Chưa có phiên bản'}
                </div>

                <div className="flex space-x-2">
                    <button
                        onClick={() => onEdit(product)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                    >
                        Sửa
                    </button>
                    <button
                        onClick={handleDelete}
                        className="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                    >
                        Xóa
                    </button>
                </div>
            </div>
        </div>
    )
}
