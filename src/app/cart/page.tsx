'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useCart } from '@/contexts/CartProvider';
import { CartItemWithDetails } from '@/hooks/useSupabaseCart';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getColorStyle } from '@/utils/colorUtils';
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

// Constants
const SHIPPING_THRESHOLD = 300000;
const SHIPPING_FEE = 30000;
const COUPONS = {
  ORANGE10: { discount: 0.1, type: 'percentage' },
  FREESHIP: { discount: SHIPPING_FEE, type: 'fixed' }
} as const;

// Types
interface CartSummary {
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  appliedCoupon?: string;
}

interface CouponState {
  code: string;
  appliedCoupon: string | null;
  discount: number;
}

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
  // Memoize product data calculation
  const productData = useMemo(() => {
    const product = item.product_variants.products;
    const currentPrice = item.product_variants.price_override || product.discount_price || product.price;
    const originalPrice = product.discount_price && product.discount_price < product.price ? product.price : null;
    const discountPercent = originalPrice && originalPrice > currentPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : null;
    const imageUrl = product.product_images?.[0]?.image_url || '/placeholder-image.jpg';

    return { currentPrice, originalPrice, discountPercent, imageUrl, product };
  }, [item]);

  // Optimized quantity change with debounce
  const handleQuantityChange = useCallback(async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > item.product_variants.stock) return;
    await onQuantityChange(item.id, newQuantity);
  }, [item.id, item.product_variants.stock, onQuantityChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Math.min(parseInt(e.target.value) || 1, item.product_variants.stock));
    handleQuantityChange(value);
  }, [handleQuantityChange, item.product_variants.stock]);

  const isLowStock = item.product_variants.stock < 10;
  const isOutOfStock = item.product_variants.stock === 0;

  return (
    <Card className={`border-0 shadow-lg bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
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
                    style={{ backgroundColor: getColorStyle(item.product_variants.color) }}
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
            {isLowStock && (
              <div className={`text-xs px-2 py-1 rounded w-fit ${
                isOutOfStock 
                  ? 'text-red-600 bg-red-50' 
                  : 'text-orange-600 bg-orange-50'
              }`}>
                {isOutOfStock ? 'Hết hàng' : `Chỉ còn ${item.product_variants.stock} sản phẩm`}
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
                  disabled={isProcessing || item.quantity <= 1 || isOutOfStock}
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
                  disabled={isProcessing || isOutOfStock}
                />
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 rounded-lg border-orange-200 hover:bg-orange-50"
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  disabled={isProcessing || item.quantity >= item.product_variants.stock || isOutOfStock}
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

// Loading Screen Component
const LoadingScreen = ({ message }: { message: string }) => (
  <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-orange-50/30">
    <div className="max-w-4xl mx-auto px-4 py-16">
      <Card className="border-0 shadow-xl bg-white rounded-3xl overflow-hidden">
        <CardContent className="text-center py-20">
          <Loader2 className="w-12 h-12 text-orange-400 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{message}</h2>
          <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Error Screen Component
const ErrorScreen = ({ error, onRefresh, isRefreshing }: { 
  error: string; 
  onRefresh: () => void; 
  isRefreshing: boolean; 
}) => {
  const router = useRouter();
  
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
                onClick={onRefresh}
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
};

// Empty Cart Component
const EmptyCart = ({ onRefresh, isRefreshing }: { 
  onRefresh: () => void; 
  isRefreshing: boolean; 
}) => (
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
              onClick={onRefresh}
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

// Custom hook for coupon logic
const useCoupon = (subtotal: number, shippingFee: number) => {
  const [couponState, setCouponState] = useState<CouponState>({
    code: '',
    appliedCoupon: null,
    discount: 0
  });

  const applyCoupon = useCallback(() => {
    const upperCode = couponState.code.toUpperCase();
    const coupon = COUPONS[upperCode as keyof typeof COUPONS];
    
    if (!coupon) {
      alert('Mã giảm giá không hợp lệ!');
      return;
    }

    const discount = coupon.type === 'percentage' 
      ? subtotal * coupon.discount 
      : coupon.discount;

    setCouponState(prev => ({
      ...prev,
      appliedCoupon: upperCode,
      discount
    }));
  }, [couponState.code, subtotal]);

  const removeCoupon = useCallback(() => {
    setCouponState({ code: '', appliedCoupon: null, discount: 0 });
  }, []);

  const updateCode = useCallback((code: string) => {
    setCouponState(prev => ({ ...prev, code }));
  }, []);

  return {
    ...couponState,
    applyCoupon,
    removeCoupon,
    updateCode
  };
};

// Custom hook for cart operations
const useCartOperations = () => {
  const { updateQuantity, removeFromCart, clearCart } = useCart();
  const [processingItemId, setProcessingItemId] = useState<number | null>(null);
  const [isClearingCart, setIsClearingCart] = useState(false);

  const handleQuantityChange = useCallback(async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setProcessingItemId(cartItemId);
    try {
      await updateQuantity(cartItemId, newQuantity);
    } finally {
      setProcessingItemId(null);
    }
  }, [updateQuantity]);

  const handleRemoveItem = useCallback(async (cartItemId: number) => {
    setProcessingItemId(cartItemId);
    try {
      await removeFromCart(cartItemId);
    } finally {
      setProcessingItemId(null);
    }
  }, [removeFromCart]);

  const handleClearCart = useCallback(async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?')) {
      return;
    }

    setIsClearingCart(true);
    try {
      await clearCart();
    } finally {
      setIsClearingCart(false);
    }
  }, [clearCart]);

  return {
    processingItemId,
    isClearingCart,
    handleQuantityChange,
    handleRemoveItem,
    handleClearCart
  };
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
    refreshCart
  } = useCart();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const hasInitializedRef = useRef(false);

  // Custom hooks
  const { processingItemId, isClearingCart, handleQuantityChange, handleRemoveItem, handleClearCart } = useCartOperations();

  // Memoize cart summary
  const cartSummary = useMemo((): CartSummary => {
    const shippingFee = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    return {
      subtotal,
      discount: 0,
      shippingFee,
      total: subtotal + shippingFee,
    };
  }, [subtotal]);

  const coupon = useCoupon(cartSummary.subtotal, cartSummary.shippingFee);

  // Updated cart summary with coupon
  const finalCartSummary = useMemo((): CartSummary => ({
    ...cartSummary,
    discount: coupon.discount,
    total: cartSummary.subtotal - coupon.discount + cartSummary.shippingFee,
    appliedCoupon: coupon.appliedCoupon || undefined
  }), [cartSummary, coupon.discount, coupon.appliedCoupon]);

  // Initialize cart on first visit
  useEffect(() => {
    if (pathname === '/cart' && user && !authLoading && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
    }
  }, [pathname, user, authLoading]);

  // Handlers
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      refreshCart();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, [refreshCart]);

  const handleCheckout = useCallback(() => {
    if (items.length === 0) {
      alert('Giỏ hàng trống, không thể thanh toán');
      return;
    }

    setIsProcessingCheckout(true);
    router.push('/checkout');
    setTimeout(() => setIsProcessingCheckout(false), 1000);
  }, [items.length, router]);

  // Loading states
  const isInitialLoading = authLoading || (cartLoading && items.length === 0 && !error);

  if (isInitialLoading) {
    return <LoadingScreen message="Đang tải giỏ hàng..." />;
  }

  if (error) {
    return <ErrorScreen error={error} onRefresh={handleRefresh} isRefreshing={isRefreshing} />;
  }

  if (items.length === 0) {
    return <EmptyCart onRefresh={handleRefresh} isRefreshing={isRefreshing} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-orange-50/30">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Header */}
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
            {/* Free Shipping Progress */}
            {subtotal < SHIPPING_THRESHOLD && (
              <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Truck className="w-5 h-5 text-orange-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Mua thêm {(SHIPPING_THRESHOLD - subtotal).toLocaleString('vi-VN')}đ để được miễn phí vận chuyển
                    </span>
                  </div>
                  <div className="w-full bg-orange-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((subtotal / SHIPPING_THRESHOLD) * 100, 100)}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

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

            {/* Action Buttons */}
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
                disabled={isClearingCart || items.length === 0}
              >
                {isClearingCart && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Xóa tất cả
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl bg-white rounded-3xl sticky top-4">
              <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                <h3 className="text-lg md:text-xl font-bold text-gray-800">Tóm tắt đơn hàng</h3>

                {/* Coupon Section */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Mã giảm giá</label>
                  {!coupon.appliedCoupon ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nhập mã giảm giá"
                        value={coupon.code}
                        onChange={(e) => coupon.updateCode(e.target.value)}
                        className="rounded-xl border-orange-200 focus:border-orange-500"
                      />
                      <Button
                        onClick={coupon.applyCoupon}
                        className="bg-gradient-orange hover:bg-gradient-orange-dark text-white rounded-xl px-4"
                        disabled={!coupon.code.trim()}
                      >
                        <Tag className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">{coupon.appliedCoupon}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={coupon.removeCoupon}
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
                    <span>{finalCartSummary.subtotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  {finalCartSummary.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá</span>
                      <span>-{finalCartSummary.discount.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span>
                      {finalCartSummary.shippingFee === 0 ? (
                        <span className="text-green-600 font-medium">Miễn phí</span>
                      ) : (
                        `${finalCartSummary.shippingFee.toLocaleString('vi-VN')}đ`
                      )}
                    </span>
                  </div>
                </div>

                <Separator className="bg-orange-100" />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Tổng cộng</span>
                  <span className="text-xl md:text-2xl font-bold text-gradient-orange">
                    {finalCartSummary.total.toLocaleString('vi-VN')}đ
                  </span>
                </div>

                {/* Checkout Button */}
                <Button
                  size="lg"
                  className="w-full h-12 md:h-14 bg-gradient-orange hover:bg-gradient-orange-dark text-white font-bold text-base md:text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  onClick={handleCheckout}
                  disabled={isProcessingCheckout || items.length === 0}
                >
                  {isProcessingCheckout ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <CreditCard className="w-5 h-5 mr-2" />
                  )}
                  Thanh toán
                </Button>

                {/* Benefits */}
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