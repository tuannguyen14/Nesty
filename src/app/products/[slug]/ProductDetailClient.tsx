'use client';

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { ProductWithRelations } from "@/types/product";
import { useSupabaseCart } from "@/hooks/useSupabaseCart";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import dayjs from "dayjs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ShoppingCart,
    Heart,
    Share2,
    Star,
    Clock,
    Package,
    Shield,
    Truck,
    Zap,
    TrendingUp,
    Palette,
    Ruler,
    CheckCircle,
    Gift,
    RefreshCw,
    Phone,
    Check,
    AlertCircle,
    LogIn
} from "lucide-react";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import { getColorStyle } from '@/utils/colorUtils';


interface ProductDetailClientProps {
    product: ProductWithRelations;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const router = useRouter();
    const { user } = useAuth();
    const {
        addToCart,
        isInCart,
        loading: cartLoading,
        error: cartError
    } = useSupabaseCart();

    // Logic tính toán thông tin sản phẩm
    const variants = product.product_variants || [];
    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
    const availableColors = [...new Set(variants.map(v => v.color))];
    const availableSizes = [...new Set(variants.map(v => v.size))];

    const now = dayjs();
    const isDiscount =
        product.discount_price &&
        product.discount_start &&
        product.discount_end &&
        now.isAfter(dayjs(product.discount_start)) &&
        now.isBefore(dayjs(product.discount_end));

    const sortedImages = (product.product_images ?? []).sort((a, b) => a.sort_order - b.sort_order);
    const mainImage = sortedImages[0]?.image_url ?? "/placeholder-image.jpg";
    const otherImages = sortedImages.slice(1);

    const lightboxSlides = sortedImages.map(img => ({
        src: img.image_url,
        alt: product.name
    }));


    const discountPercent = isDiscount && product.discount_price
        ? Math.round(((product.price - product.discount_price) / product.price) * 100)
        : 0;

    const savedAmount = isDiscount && product.discount_price
        ? product.price - product.discount_price
        : 0;

    // Update selected variant when color/size changes
    useEffect(() => {
        if (selectedColor && selectedSize) {
            const variant = variants.find(v => v.color === selectedColor && v.size === selectedSize);
            setSelectedVariant(variant);
            // Reset quantity nếu variant mới có ít stock hơn
            if (variant && quantity > variant.stock) {
                setQuantity(Math.max(1, variant.stock));
            }
        } else {
            setSelectedVariant(null);
        }
    }, [selectedColor, selectedSize, variants, quantity]);

    // Get available sizes for selected color
    const getAvailableSizesForColor = (color: string) => {
        return variants
            .filter(v => v.color === color)
            .map(v => ({ size: v.size, stock: v.stock }));
    };

    // Get available colors for selected size
    const getAvailableColorsForSize = (size: string) => {
        return variants
            .filter(v => v.size === size)
            .map(v => ({ color: v.color, stock: v.stock }));
    };

    // Check if a size is available for current selected color
    const isSizeAvailable = (size: string) => {
        if (!selectedColor) return true;
        const variant = variants.find(v => v.color === selectedColor && v.size === size);
        return variant && variant.stock > 0;
    };

    // Check if a color is available for current selected size
    const isColorAvailable = (color: string) => {
        if (!selectedSize) return true;
        const variant = variants.find(v => v.color === color && v.size === selectedSize);
        return variant && variant.stock > 0;
    };

    // Get stock for a specific size when color is selected
    const getSizeStock = (size: string) => {
        if (!selectedColor) return 0;
        const variant = variants.find(v => v.color === selectedColor && v.size === size);
        return variant ? variant.stock : 0;
    };

    // Get stock for a specific color when size is selected
    const getColorStock = (color: string) => {
        if (!selectedSize) return 0;
        const variant = variants.find(v => v.color === color && v.size === selectedSize);
        return variant ? variant.stock : 0;
    };

    // Get current price based on variant
    const getCurrentPrice = () => {
        if (selectedVariant?.price_override) {
            return selectedVariant.price_override;
        }
        return isDiscount && product.discount_price ? product.discount_price : product.price;
    };

    // Get stock for selected variant
    const getVariantStock = () => {
        if (selectedVariant) {
            return selectedVariant.stock;
        }
        // Nếu chưa chọn variant, return tổng stock để hiển thị thông tin chung
        return totalStock;
    };

    // Check if product is out of stock
    const isOutOfStock = () => {
        // Nếu đã chọn đầy đủ variant
        if (selectedVariant) {
            return selectedVariant.stock <= 0;
        }
        // Nếu chưa chọn đầy đủ, kiểm tra có variant nào có stock > 0 không
        return variants.every(v => v.stock <= 0);
    };

    const handleColorSelect = (color: string) => {
        // Nếu click vào màu đã chọn thì bỏ chọn
        if (selectedColor === color) {
            setSelectedColor('');
            return;
        }

        setSelectedColor(color);
        // Reset size if current size is not available for new color
        if (selectedSize && !isSizeAvailable(selectedSize)) {
            setSelectedSize('');
        }
    };

    // Handle size selection
    const handleSizeSelect = (size: string) => {
        // Nếu click vào size đã chọn thì bỏ chọn
        if (selectedSize === size) {
            setSelectedSize('');
            return;
        }

        setSelectedSize(size);
        // Reset color if current color is not available for new size
        if (selectedColor && !isColorAvailable(selectedColor)) {
            setSelectedColor('');
        }
    };

    // Handle add to cart
    const handleAddToCart = async () => {
        // Kiểm tra đăng nhập
        if (!user) {
            router.push('/login');
            return;
        }

        // Validate selection
        if (availableColors.length > 0 && !selectedColor) {
            alert('Vui lòng chọn màu sắc');
            return;
        }
        if (availableSizes.length > 0 && !selectedSize) {
            alert('Vui lòng chọn kích thước');
            return;
        }

        if (!selectedVariant) {
            alert('Vui lòng chọn phiên bản sản phẩm');
            return;
        }

        // Kiểm tra tồn kho
        if (selectedVariant.stock < quantity) {
            alert(`Chỉ còn ${selectedVariant.stock} sản phẩm trong kho`);
            return;
        }

        if (selectedVariant.stock <= 0) {
            alert('Sản phẩm này đã hết hàng');
            return;
        }

        const success = await addToCart(selectedVariant.id, quantity);

        if (success) {
            setAddedToCart(true);
            // Reset after 2 seconds
            setTimeout(() => {
                setAddedToCart(false);
            }, 2000);
        }
        return success;
    };

    // Handle buy now
    const handleBuyNow = async () => {
        const success = await handleAddToCart();
        if (success) {
            router.push('/checkout');
        }
    };

    // Check if current selection is in cart
    const isCurrentInCart = () => {
        if (!selectedVariant) return false;
        return isInCart(selectedVariant.id);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-orange-50/30">
            {/* Error Alert */}
            {cartError && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-4 mt-4">
                    <div className="flex">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{cartError}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Breadcrumb */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="hover:text-orange-600 cursor-pointer" onClick={() => router.push('/')}>Trang chủ</span>
                        <span>/</span>
                        <span className="hover:text-orange-600 cursor-pointer" onClick={() => router.push('/products')}>Sản phẩm</span>
                        <span>/</span>
                        <span className="text-orange-600 font-medium">{product.name}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Gallery Section */}
                    <div className="space-y-6">
                        {/* Main Image */}
                        <Card className="overflow-hidden rounded-3xl shadow-xl border-0 bg-white cursor-pointer" onClick={() => {
                            setLightboxIndex(0);
                            setLightboxOpen(true);
                        }}>
                            <div className="relative aspect-square bg-gradient-to-br from-orange-50 to-amber-50">
                                <Image
                                    src={mainImage}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-700 hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />

                                {/* Floating badges */}
                                <div className="absolute top-6 left-6 flex flex-col gap-3">
                                    {isDiscount && (
                                        <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-2xl px-4 py-2 rounded-full text-sm font-bold animate-pulse-orange">
                                            <Zap className="w-4 h-4 mr-1" />
                                            GIẢM {discountPercent}%
                                        </Badge>
                                    )}
                                    {selectedVariant && selectedVariant.stock <= 5 && selectedVariant.stock > 0 && (
                                        <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg px-3 py-1.5 rounded-full text-xs">
                                            <TrendingUp className="w-3 h-3 mr-1" />
                                            Chỉ còn {selectedVariant.stock} sản phẩm
                                        </Badge>
                                    )}
                                    {selectedVariant && selectedVariant.stock <= 0 && (
                                        <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg px-3 py-1.5 rounded-full text-xs">
                                            Hết hàng
                                        </Badge>
                                    )}
                                    {product.categories && (
                                        <Badge className="bg-white/90 backdrop-blur-sm text-gray-700 shadow-lg px-3 py-1.5 rounded-full text-xs">
                                            {product.categories.name}
                                        </Badge>
                                    )}
                                </div>

                                {/* Action buttons */}
                                <div className="absolute top-6 right-6 flex flex-col gap-3">
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className={`rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg transition-all ${isInWishlist ? 'text-red-500' : 'hover:text-orange-600'
                                            }`}
                                        onClick={() => setIsInWishlist(!isInWishlist)}
                                    >
                                        <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
                                    </Button>
                                    <Button size="icon" variant="secondary" className="rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg hover:text-orange-600 transition-all">
                                        <Share2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        {/* Thumbnail Gallery */}
                        {otherImages.length > 0 && (
                            <div className="grid grid-cols-4 gap-3">
                                {otherImages.map((img, index) => (
                                    <Card
                                        key={img.id}
                                        className="overflow-hidden rounded-2xl border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                                        onClick={() => {
                                            setLightboxIndex(index + 1); // +1 vì mainImage là index 0
                                            setLightboxOpen(true);
                                        }}
                                    >
                                        <div className="relative aspect-square bg-orange-50">
                                            <Image
                                                src={img.image_url}
                                                alt={`${product.name} ${index + 2}`}
                                                fill
                                                className="object-cover hover:scale-110 transition-transform duration-300"
                                            />
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info Section */}
                    <div className="space-y-6">
                        {/* Header Info */}
                        <div className="space-y-4">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
                                {product.name}
                            </h1>

                            {/* Rating */}
                            <div className="flex items-center gap-3">
                                <div className="flex text-orange-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-current" />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-600 font-medium">(148 đánh giá)</span>
                                <Separator orientation="vertical" className="h-4" />
                                <span className="text-sm text-gray-600">Đã bán: 523</span>
                            </div>
                        </div>

                        {/* Price Section */}
                        <Card className="p-6 rounded-3xl border-0 bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg">
                            <div className="space-y-3">
                                {isDiscount ? (
                                    <>
                                        <div className="flex items-center gap-4">
                                            <span className="text-4xl font-bold text-gradient-orange">
                                                {getCurrentPrice().toLocaleString("vi-VN")}đ
                                            </span>
                                            {savedAmount > 0 && (
                                                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm">
                                                    Tiết kiệm {savedAmount.toLocaleString("vi-VN")}đ
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="line-through text-gray-400 text-xl">
                                                {product.price.toLocaleString("vi-VN")}đ
                                            </span>
                                            {product.discount_end && (
                                                <div className="flex items-center gap-1 text-orange-600 text-sm bg-orange-100 px-3 py-1 rounded-full">
                                                    <Clock className="w-4 h-4" />
                                                    <span>Kết thúc sau {dayjs(product.discount_end).diff(now, 'day')} ngày</span>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <span className="text-4xl font-bold text-gradient-orange">
                                        {getCurrentPrice().toLocaleString("vi-VN")}đ
                                    </span>
                                )}
                            </div>
                        </Card>

                        {/* Variants Selection */}
                        <div className="space-y-6">
                            {availableColors.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Palette className="w-5 h-5 text-orange-600" />
                                        <h3 className="font-semibold text-lg">Màu sắc</h3>
                                        {selectedColor && (
                                            <span className="text-sm text-gray-500">
                                                (Đã chọn: {selectedColor})
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {availableColors.map((color, idx) => {
                                            const colorStock = getColorStock(color);
                                            const isAvailable = selectedSize ? colorStock > 0 : variants.some(v => v.color === color && v.stock > 0);

                                            return (
                                                <Button
                                                    key={idx}
                                                    variant="outline"
                                                    disabled={!isAvailable}
                                                    className={`px-4 py-2 rounded-2xl border-2 transition-all duration-200 hover:scale-105 ${selectedColor === color
                                                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                                                        : isAvailable
                                                            ? 'hover:border-orange-500 hover:bg-orange-50'
                                                            : 'opacity-50 cursor-not-allowed border-gray-200 text-gray-400'
                                                        }`}
                                                    onClick={() => handleColorSelect(color)}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-4 h-4 rounded-full border border-gray-300"
                                                            style={{
                                                                backgroundColor: getColorStyle(color)
                                                            }}
                                                        />
                                                        {color}
                                                        {selectedColor === color && (
                                                            <Check className="w-4 h-4 text-orange-600" />
                                                        )}
                                                        {!isAvailable && (
                                                            <span className="text-xs text-red-500">(Hết)</span>
                                                        )}
                                                    </div>
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {availableSizes.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Ruler className="w-5 h-5 text-orange-600" />
                                        <h3 className="font-semibold text-lg">Kích thước</h3>
                                        {selectedSize && (
                                            <span className="text-sm text-gray-500">
                                                (Đã chọn: {selectedSize})
                                            </span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-4 gap-3">
                                        {availableSizes.map((size, idx) => {
                                            const sizeStock = getSizeStock(size);
                                            const isAvailable = selectedColor ? sizeStock > 0 : variants.some(v => v.size === size && v.stock > 0);

                                            return (
                                                <Button
                                                    key={idx}
                                                    variant="outline"
                                                    disabled={!isAvailable}
                                                    className={`h-12 rounded-2xl border-2 transition-all duration-200 hover:scale-105 font-medium relative ${selectedSize === size
                                                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                                                        : isAvailable
                                                            ? 'hover:border-orange-500 hover:bg-orange-50'
                                                            : 'opacity-50 cursor-not-allowed border-gray-200 text-gray-400'
                                                        }`}
                                                    onClick={() => handleSizeSelect(size)}
                                                >
                                                    <div className="flex flex-col items-center">
                                                        <span>{size}</span>
                                                        {selectedColor && (
                                                            <span className="text-xs text-gray-500">
                                                                {isAvailable ? `(${sizeStock})` : '(Hết)'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {selectedSize === size && (
                                                        <Check className="w-4 h-4 absolute top-1 right-1 text-orange-600" />
                                                    )}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Quantity Selection */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-lg">Số lượng</h3>
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-10 w-10 rounded-xl border-orange-200 hover:bg-orange-50"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={quantity <= 1}
                                    >
                                        -
                                    </Button>
                                    <span className="w-16 text-center font-semibold text-lg">{quantity}</span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-10 w-10 rounded-xl border-orange-200 hover:bg-orange-50"
                                        onClick={() => setQuantity(Math.min(getVariantStock(), quantity + 1))}
                                        disabled={quantity >= getVariantStock() || getVariantStock() <= 0}
                                    >
                                        +
                                    </Button>
                                    <span className="text-sm text-gray-500 ml-2">
                                        {selectedVariant ? (
                                            selectedVariant.stock > 0 ? (
                                                `(Còn ${selectedVariant.stock} sản phẩm)`
                                            ) : (
                                                `(Hết hàng)`
                                            )
                                        ) : (
                                            `(Tổng: ${totalStock} sản phẩm)`
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Login Required Notice */}
                        {!user && (
                            <Card className="p-4 rounded-2xl border-0 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md">
                                <div className="flex items-center gap-3">
                                    <LogIn className="w-5 h-5 text-blue-600" />
                                    <span className="text-blue-700 font-medium">
                                        Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng
                                    </span>
                                </div>
                            </Card>
                        )}

                        {/* Stock Status */}
                        <Card className={`p-4 rounded-2xl border-0 shadow-md ${isOutOfStock()
                            ? 'bg-gradient-to-r from-red-50 to-red-100'
                            : 'bg-gradient-to-r from-green-50 to-emerald-50'
                            }`}>
                            <div className="flex items-center gap-3">
                                <Package className={`w-5 h-5 ${isOutOfStock() ? 'text-red-600' : 'text-green-600'}`} />
                                {selectedVariant ? (
                                    selectedVariant.stock > 0 ? (
                                        <span className="text-green-700 font-medium">
                                            Còn {selectedVariant.stock} sản phẩm - Sẵn sàng giao hàng
                                        </span>
                                    ) : (
                                        <span className="text-red-600 font-bold">
                                            Phiên bản này đã hết hàng
                                        </span>
                                    )
                                ) : (
                                    !isOutOfStock() ? (
                                        <span className="text-green-700 font-medium">
                                            Tổng {totalStock} sản phẩm - Vui lòng chọn màu sắc và kích thước
                                        </span>
                                    ) : (
                                        <span className="text-red-600 font-bold">Tất cả phiên bản đều hết hàng</span>
                                    )
                                )}
                            </div>
                        </Card>

                        {/* Action Buttons */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className={`h-14 text-base font-semibold rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${addedToCart
                                        ? 'border-green-500 bg-green-50 text-green-600'
                                        : 'border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400'
                                        }`}
                                    disabled={isOutOfStock() || !user || (availableColors.length > 0 && !selectedColor) || (availableSizes.length > 0 && !selectedSize)}
                                    onClick={handleAddToCart}
                                >
                                    {addedToCart ? (
                                        <>
                                            <CheckCircle className="w-5 h-5 mr-2" />
                                            Đã thêm vào giỏ
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="w-5 h-5 mr-2" />
                                            {isCurrentInCart() ? 'Thêm tiếp' : 'Thêm vào giỏ'}
                                        </>
                                    )}
                                </Button>
                                <Button
                                    size="lg"
                                    className="h-14 text-base font-bold rounded-2xl bg-gradient-orange hover:bg-gradient-orange-dark text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                                    disabled={isOutOfStock() || !user || (availableColors.length > 0 && !selectedColor) || (availableSizes.length > 0 && !selectedSize)}
                                    onClick={handleBuyNow}
                                >
                                    Mua ngay
                                </Button>
                            </div>

                            {/* Contact Support */}
                            <Button
                                variant="ghost"
                                className="w-full h-12 rounded-2xl text-orange-600 hover:bg-orange-50 font-medium"
                            >
                                <Phone className="w-4 h-4 mr-2" />
                                Gọi 1800 282 279 để được tư vấn
                            </Button>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="p-4 rounded-2xl border-0 bg-gradient-to-br from-orange-50 to-amber-50 shadow-md hover:shadow-lg transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-orange rounded-xl flex items-center justify-center">
                                        <Truck className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm">Miễn phí vận chuyển</div>
                                        <div className="text-xs text-gray-600">Đơn hàng từ 300k</div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4 rounded-2xl border-0 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md hover:shadow-lg transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm">Bảo hành 12 tháng</div>
                                        <div className="text-xs text-gray-600">Chính hãng 100%</div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4 rounded-2xl border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md hover:shadow-lg transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                                        <RefreshCw className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm">Đổi trả 7 ngày</div>
                                        <div className="text-xs text-gray-600">Miễn phí</div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4 rounded-2xl border-0 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md hover:shadow-lg transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                        <Gift className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm">Quà tặng kèm</div>
                                        <div className="text-xs text-gray-600">Giá trị cao</div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Product Details Tabs */}
                <div className="mt-16">
                    <Tabs defaultValue="description" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 rounded-2xl p-1 bg-orange-100/50 h-14">
                            <TabsTrigger value="description" className="rounded-xl font-medium data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-md">
                                Mô tả sản phẩm
                            </TabsTrigger>
                            <TabsTrigger value="specifications" className="rounded-xl font-medium data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-md">
                                Thông số kỹ thuật
                            </TabsTrigger>
                            <TabsTrigger value="reviews" className="rounded-xl font-medium data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-md">
                                Đánh giá (148)
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="description" className="mt-8">
                            <Card className="p-8 rounded-3xl border-0 shadow-lg bg-white">
                                <CardContent className="p-0">
                                    <div className="prose prose-lg max-w-none">
                                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Giới thiệu sản phẩm</h3>
                                        <p className="text-gray-700 leading-relaxed text-base mb-6">
                                            {product.description || "Sản phẩm chất lượng cao, được thiết kế với công nghệ hiện đại và chất liệu cao cấp. Đem lại trải nghiệm tuyệt vời cho người sử dụng."}
                                        </p>

                                        <h4 className="text-xl font-semibold text-gray-800 mb-3">Đặc điểm nổi bật</h4>
                                        <ul className="space-y-2 text-gray-700">
                                            <li className="flex items-start gap-2">
                                                <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                                <span>Chất liệu cao cấp, bền bỉ với thời gian</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                                <span>Thiết kế hiện đại, phù hợp với mọi phong cách</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                                <span>Dễ dàng sử dụng và bảo quản</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                                <span>Đạt tiêu chuẩn chất lượng quốc tế</span>
                                            </li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="specifications" className="mt-8">
                            <Card className="p-8 rounded-3xl border-0 shadow-lg bg-white">
                                <CardContent className="p-0">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-6">Thông số kỹ thuật</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-lg text-orange-600 mb-3">Thông tin cơ bản</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between py-2 border-b border-orange-100">
                                                    <span className="text-gray-600">Danh mục</span>
                                                    <span className="font-medium text-gray-800">{product.categories?.name || "Chưa phân loại"}</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-orange-100">
                                                    <span className="text-gray-600">Thương hiệu</span>
                                                    <span className="font-medium text-gray-800">Nesty</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-orange-100">
                                                    <span className="text-gray-600">Xuất xứ</span>
                                                    <span className="font-medium text-gray-800">Việt Nam</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-orange-100">
                                                    <span className="text-gray-600">Bảo hành</span>
                                                    <span className="font-medium text-gray-800">12 tháng</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-lg text-orange-600 mb-3">Kích thước & Trọng lượng</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between py-2 border-b border-orange-100">
                                                    <span className="text-gray-600">Màu sắc</span>
                                                    <span className="font-medium text-gray-800">{availableColors.length} màu</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-orange-100">
                                                    <span className="text-gray-600">Kích thước</span>
                                                    <span className="font-medium text-gray-800">{availableSizes.length} size</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-orange-100">
                                                    <span className="text-gray-600">Chất liệu</span>
                                                    <span className="font-medium text-gray-800">Cao cấp</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-orange-100">
                                                    <span className="text-gray-600">Tình trạng</span>
                                                    <span className="font-medium text-gray-800">Mới 100%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="reviews" className="mt-8">
                            <Card className="p-8 rounded-3xl border-0 shadow-lg bg-white">
                                <CardContent className="p-0">
                                    <div className="text-center py-12">
                                        <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
                                            <Star className="w-10 h-10 text-orange-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2">Đánh giá sẽ sớm có mặt</h3>
                                        <p className="text-gray-600 mb-6">Chúng tôi đang phát triển tính năng đánh giá sản phẩm</p>
                                        <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                                            Nhận thông báo khi có đánh giá
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Related Products */}
                <div className="mt-16">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">
                            Sản phẩm
                            <span className="text-gradient-orange"> liên quan</span>
                        </h2>
                        <p className="text-gray-600">Có thể bạn cũng thích</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {/* Placeholder for related products */}
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i} className="rounded-2xl border-0 shadow-md hover:shadow-xl transition-all hover:-translate-y-2 overflow-hidden">
                                <div className="aspect-square bg-gradient-to-br from-orange-100 to-amber-100"></div>
                                <CardContent className="p-4">
                                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Lightbox */}
            <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                index={lightboxIndex}
                slides={lightboxSlides}
                carousel={{
                    finite: sortedImages.length <= 1,
                }}
                render={{
                    buttonPrev: sortedImages.length <= 1 ? () => null : undefined,
                    buttonNext: sortedImages.length <= 1 ? () => null : undefined,
                }}
            />
        </div>
    );
}