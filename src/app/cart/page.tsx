'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSupabaseCart } from '@/hooks/useSupabaseCart';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  CreditCard,
  Tag,
  Truck,
  Shield,
  Gift,
  CheckCircle,
  Package,
  X,
  Loader2,
  RefreshCw
} from 'lucide-react';

// Import types
import type { CartItemWithDetails } from '@/hooks/useSupabaseCart';
import { getColorStyle } from '@/utils/colorUtils';

// Memoized Cart Item Component
const CartItemCard = ({
  item,
  index,
  isProcessing,
  onQuantityChange,
  onRemove
}: {
  item: CartItemWithDetails;
  index: number;
  isProcessing: boolean;
  onQuantityChange: (id: number, quantity: number) => Promise<void>;
  onRemove: (id: number) => Promise<void>;
}) => {
  const productData = useMemo(() => {
    const product = item.product_variants.products;
    const currentPrice = item.product_variants.price_override ||
      product.discount_price ||
      product.price;

    const originalPrice = product.discount_price && product.discount_price < product.price
      ? product.price
      : null;

    const discountPercent = originalPrice && originalPrice > currentPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : null;

    const imageUrl = product.product_images && product.product_images.length > 0
      ? product.product_images.sort((a, b) => a.sort_order - b.sort_order)[0].image_url
      : '/placeholder-image.jpg';

    return {
      currentPrice,
      originalPrice,
      discountPercent,
      imageUrl,
      product
    };
  }, [item]);

  const handleQuantityChange = useCallback(async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > item.product_variants.stock) return;
    await onQuantityChange(item.id, newQuantity);
  }, [item.id, item.product_variants.stock, onQuantityChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Math.min(parseInt(e.target.value) || 1, item.product_variants.stock));
    handleQuantityChange(value);
  }, [handleQuantityChange, item.product_variants.stock]);


  return (
    <Card
      className={`border-0 shadow-lg bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 ${isProcessing ? 'opacity-50 pointer-events-none' : ''
        }`}
    >
      <CardContent className="p-4 md:p-6">
        <div className="flex gap-3 md:gap-4">
          {/* Product Image */}
          <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0">
            <Image
              src={productData.imageUrl}
              alt={productData.product.name}
              fill
              className="object-cover rounded-xl"
              sizes="(max-width: 768px) 80px, 96px"
              priority={index < 3}
            />
            {productData.discountPercent && (
              <Badge className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                -{productData.discountPercent}%
              </Badge>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0 space-y-2">
            <h3 className="font-semibold text-gray-800 text-sm md:text-base line-clamp-2 hover:text-orange-600 transition-colors">
              <Link href={`/products/${productData.product.slug}`}>
                {productData.product.name}
              </Link>
            </h3>

            {/* Variants */}
            <div className="flex flex-wrap gap-2 text-xs">
              {item.product_variants.color && (
                <Badge variant="outline" className="border-orange-200 text-xs px-2 py-0.5">
                  <span className="mr-1">Màu:</span>
                  <div
                    className="w-3 h-3 rounded-full border border-gray-300 ml-1"
                    style={{
                      backgroundColor: getColorStyle(item.product_variants.color)
                    }}
                  />
                </Badge>
              )}
              {item.product_variants.size && (
                <Badge variant="outline" className="border-orange-200 text-xs px-2 py-0.5">
                  Size: {item.product_variants.size}
                </Badge>
              )}
            </div>

            {/* Stock warning */}
            {item.product_variants.stock < 10 && (
              <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded w-fit">
                Chỉ còn {item.product_variants.stock} sản phẩm
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg md:text-xl font-bold text-gradient-orange">
                {productData.currentPrice.toLocaleString('vi-VN')}đ
              </span>
              {productData.originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  {productData.originalPrice.toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 rounded-lg border-orange-200 hover:bg-orange-50"
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                  disabled={isProcessing || item.quantity <= 1}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={handleInputChange}
                  className="w-14 h-8 text-center text-sm rounded-lg border-orange-200 focus:border-orange-500"
                  min="1"
                  max={item.product_variants.stock}
                  disabled={isProcessing}
                />
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 rounded-lg border-orange-200 hover:bg-orange-50"
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  disabled={isProcessing || item.quantity >= item.product_variants.stock}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>

              <Button
                size="sm"
                variant="ghost"
                className="text-red-500 hover:text-red-600 hover:bg-red-50 text-xs md:text-sm h-8"
                onClick={() => onRemove(item.id)}
                disabled={isProcessing}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Xóa
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function CartPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const {
    items,
    totalItems,
    subtotal,
    loading: cartLoading,
    error,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart
  } = useSupabaseCart();

  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discount, setDiscount] = useState<number>(0);
  const [processingItemId, setProcessingItemId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Separate loading states for different actions
  const [isClearingCart, setIsClearingCart] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  // FIXED: Track if cart has been initialized to prevent unnecessary refreshes
  const hasInitializedRef = useRef(false);

  // FIXED: Only refresh on navigation if needed
  useEffect(() => {
    // Only force refresh on first mount or when returning to cart page
    if (pathname === '/cart' && user && !authLoading && !hasInitializedRef.current) {
      console.log('First time visiting cart page, allowing natural initialization');
      hasInitializedRef.current = true;
    }
  }, [pathname, user, authLoading]);

  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      refreshCart();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500); // Short delay for UX
    }
  }, [refreshCart]);

  // Memoize cart summary
  const cartSummary = useMemo(() => {
    const shippingFee = subtotal >= 300000 ? 0 : 30000;
    return {
      subtotal,
      discount,
      shippingFee,
      total: subtotal - discount + shippingFee,
      appliedCoupon: appliedCoupon || undefined,
    };
  }, [subtotal, discount, appliedCoupon]);

  // Coupon handlers
  const applyCoupon = useCallback((): void => {
    const upperCouponCode = couponCode.toUpperCase();

    switch (upperCouponCode) {
      case 'ORANGE10':
        setDiscount(cartSummary.subtotal * 0.1);
        setAppliedCoupon(upperCouponCode);
        break;
      case 'FREESHIP':
        setDiscount(cartSummary.shippingFee);
        setAppliedCoupon(upperCouponCode);
        break;
      default:
        alert('Mã giảm giá không hợp lệ!');
        return;
    }
  }, [couponCode, cartSummary.subtotal, cartSummary.shippingFee]);

  const removeCoupon = useCallback((): void => {
    setDiscount(0);
    setAppliedCoupon(null);
    setCouponCode('');
  }, []);

  // OPTIMIZED handlers với debouncing
  const handleQuantityChange = useCallback(async (cartItemId: number, newQuantity: number): Promise<void> => {
    if (newQuantity < 1) return;

    setProcessingItemId(cartItemId);
    try {
      await updateQuantity(cartItemId, newQuantity);
    } finally {
      setProcessingItemId(null);
    }
  }, [updateQuantity]);

  const handleRemoveItem = useCallback(async (cartItemId: number): Promise<void> => {
    setProcessingItemId(cartItemId);
    try {
      await removeFromCart(cartItemId);
    } finally {
      setProcessingItemId(null);
    }
  }, [removeFromCart]);

  const handleClearCart = useCallback(async (): Promise<void> => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?')) {
      return;
    }

    setIsClearingCart(true);
    try {
      const success = await clearCart();
      if (!success && error) {
        alert(error);
      }
    } finally {
      setIsClearingCart(false);
    }
  }, [clearCart, error]);

  const handleCheckout = useCallback((): void => {
    if (items.length === 0) {
      alert('Giỏ hàng trống, không thể thanh toán');
      return;
    }

    setIsProcessingCheckout(true);
    router.push('/checkout');

    // Reset loading state after navigation
    setTimeout(() => {
      setIsProcessingCheckout(false);
    }, 1000);
  }, [items.length, router]);

  // Show loading state for initial load only
  const isInitialLoading = authLoading || (cartLoading && items.length === 0 && !error);

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-orange-50/30">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <Card className="border-0 shadow-xl bg-white rounded-3xl overflow-hidden">
            <CardContent className="text-center py-20">
              <Loader2 className="w-12 h-12 text-orange-400 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Đang tải giỏ hàng...</h2>
              <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show error state with refresh option
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-orange-50/30">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <Card className="border-0 shadow-xl bg-white rounded-3xl overflow-hidden">
            <CardContent className="text-center py-20">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
                <X className="w-12 h-12 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Có lỗi xảy ra</h2>
              <p className="text-gray-600 mb-8">{error}</p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="bg-gradient-orange hover:bg-gradient-orange-dark text-white px-8 py-4 rounded-2xl font-semibold"
                >
                  {isRefreshing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Thử lại
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/products')}
                  className="px-8 py-4 rounded-2xl font-semibold"
                >
                  Tiếp tục mua sắm
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show empty cart
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-orange-50/30">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <Card className="border-0 shadow-xl bg-white rounded-3xl overflow-hidden">
            <CardContent className="text-center py-20">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-orange-100 rounded-full mb-6">
                <ShoppingCart className="w-12 h-12 text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Giỏ hàng của bạn đang trống</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Hãy khám phá hàng ngàn sản phẩm tuyệt vời và thêm vào giỏ hàng của bạn!
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/products">
                  <Button
                    size="lg"
                    className="bg-gradient-orange hover:bg-gradient-orange-dark text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    <Package className="w-5 h-5 mr-2" />
                    Khám phá sản phẩm
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="px-8 py-4 rounded-2xl font-semibold"
                >
                  {isRefreshing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Làm mới
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-orange-50/30">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Header với refresh button */}
        <div className="mb-6 md:mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Giỏ hàng của bạn</h1>
            <p className="text-gray-600">
              Bạn có <span className="font-semibold text-orange-600">{totalItems}</span> sản phẩm trong giỏ hàng
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing || cartLoading}
            className="border-orange-300 text-orange-600 hover:bg-orange-50 rounded-xl"
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Làm mới
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 md:space-y-4">
            {/* ... Free Shipping Progress remains the same ... */}

            {/* Cart Items List */}
            {items.map((item, index) => (
              <CartItemCard
                key={item.id}
                item={item}
                index={index}
                isProcessing={processingItemId === item.id}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
              />
            ))}

            {/* Continue Shopping - FIXED */}
            <div className="flex justify-between items-center pt-4">
              <Link href="/products">
                <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50 rounded-xl">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Tiếp tục mua sắm
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleClearCart}
                disabled={isClearingCart || items.length === 0} // Use separate loading state
              >
                {isClearingCart ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Xóa tất cả
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl bg-white rounded-3xl sticky top-4">
              <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                <h3 className="text-lg md:text-xl font-bold text-gray-800">Tóm tắt đơn hàng</h3>

                {/* Coupon section remains the same... */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Mã giảm giá</label>
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nhập mã giảm giá"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="rounded-xl border-orange-200 focus:border-orange-500"
                      />
                      <Button
                        onClick={applyCoupon}
                        className="bg-gradient-orange hover:bg-gradient-orange-dark text-white rounded-xl px-4"
                        disabled={!couponCode.trim()}
                      >
                        <Tag className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">{appliedCoupon}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={removeCoupon}
                        className="text-red-500 hover:text-red-600 h-auto p-1"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <Separator className="bg-orange-100" />

                {/* Price Details */}
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span>{cartSummary.subtotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  {cartSummary.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá</span>
                      <span>-{cartSummary.discount.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span>
                      {cartSummary.shippingFee === 0 ? (
                        <span className="text-green-600 font-medium">Miễn phí</span>
                      ) : (
                        `${cartSummary.shippingFee.toLocaleString('vi-VN')}đ`
                      )}
                    </span>
                  </div>
                </div>

                <Separator className="bg-orange-100" />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Tổng cộng</span>
                  <span className="text-xl md:text-2xl font-bold text-gradient-orange">
                    {cartSummary.total.toLocaleString('vi-VN')}đ
                  </span>
                </div>

                {/* FIXED: Checkout Button */}
                <Button
                  size="lg"
                  className="w-full h-12 md:h-14 bg-gradient-orange hover:bg-gradient-orange-dark text-white font-bold text-base md:text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  onClick={handleCheckout}
                  disabled={isProcessingCheckout || items.length === 0} // Use separate loading state
                >
                  {isProcessingCheckout ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <CreditCard className="w-5 h-5 mr-2" />
                  )}
                  Thanh toán
                </Button>

                {/* Benefits section remains the same... */}
                <div className="space-y-3 pt-4">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Shield className="w-4 h-4 text-orange-500" />
                    <span>Thanh toán an toàn & bảo mật</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Truck className="w-4 h-4 text-orange-500" />
                    <span>Giao hàng nhanh 2-3 ngày</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Gift className="w-4 h-4 text-orange-500" />
                    <span>Quà tặng kèm hấp dẫn</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}