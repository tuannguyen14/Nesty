'use client';

import { useState } from 'react';
import { useSupabaseCart } from '@/hooks/useSupabaseCart';
import { useRouter } from 'next/navigation';
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
  Loader2
} from 'lucide-react';

// Import types
import type { CartItemWithDetails } from '@/hooks/useSupabaseCart';

interface CartSummary {
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  appliedCoupon?: string;
}

export default function CartPage() {
  const router = useRouter();
  const { 
    items, 
    totalItems, 
    subtotal, 
    loading, 
    error, 
    updateQuantity, 
    removeFromCart, 
    clearCart 
  } = useSupabaseCart();

  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discount, setDiscount] = useState<number>(0);
  const [processingItemId, setProcessingItemId] = useState<number | null>(null);

  // Calculate cart summary
  const cartSummary: CartSummary = {
    subtotal,
    discount,
    shippingFee: subtotal >= 300000 ? 0 : 30000,
    total: subtotal - discount + (subtotal >= 300000 ? 0 : 30000),
    appliedCoupon: appliedCoupon || undefined,
  };

  // Mock coupon validation
  const applyCoupon = (): void => {
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
  };

  const removeCoupon = (): void => {
    setDiscount(0);
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handleQuantityChange = async (cartItemId: number, newQuantity: number): Promise<void> => {
    if (newQuantity < 1) return;
    
    setProcessingItemId(cartItemId);
    const success = await updateQuantity(cartItemId, newQuantity);
    if (!success) {
      alert('Không thể cập nhật số lượng sản phẩm');
    }
    setProcessingItemId(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, cartItemId: number): void => {
    const value = parseInt(e.target.value) || 1;
    handleQuantityChange(cartItemId, value);
  };

  const handleRemoveItem = async (cartItemId: number): Promise<void> => {
    setProcessingItemId(cartItemId);
    const success = await removeFromCart(cartItemId);
    if (!success) {
      alert('Không thể xóa sản phẩm khỏi giỏ hàng');
    }
    setProcessingItemId(null);
  };

  const handleClearCart = async (): Promise<void> => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?')) {
      const success = await clearCart();
      if (!success) {
        alert('Không thể xóa giỏ hàng');
      }
    }
  };

  // Helper function to get product image
  const getProductImage = (item: CartItemWithDetails): string => {
    const images = item.product_variants.products.product_images;
    if (images && images.length > 0) {
      return images.sort((a, b) => a.sort_order - b.sort_order)[0].image_url;
    }
    return '/placeholder-image.jpg';
  };

  // Helper function to get product price
  const getProductPrice = (item: CartItemWithDetails): number => {
    const product = item.product_variants.products;
    return item.product_variants.price_override || 
           product.discount_price || 
           product.price;
  };

  // Helper function to get original price
  const getOriginalPrice = (item: CartItemWithDetails): number | null => {
    const product = item.product_variants.products;
    if (product.discount_price && product.discount_price < product.price) {
      return product.price;
    }
    return null;
  };

  // Helper function to calculate discount percentage
  const getDiscountPercent = (item: CartItemWithDetails): number | null => {
    const originalPrice = getOriginalPrice(item);
    const currentPrice = getProductPrice(item);
    
    if (originalPrice && originalPrice > currentPrice) {
      return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    }
    return null;
  };

  // Show loading state
  if (loading) {
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

  // Show error state
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
              <Button 
                onClick={() => window.location.reload()}
                className="bg-gradient-orange hover:bg-gradient-orange-dark text-white px-8 py-4 rounded-2xl font-semibold"
              >
                Thử lại
              </Button>
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
              <Link href="/products">
                <Button 
                  size="lg"
                  className="bg-gradient-orange hover:bg-gradient-orange-dark text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <Package className="w-5 h-5 mr-2" />
                  Khám phá sản phẩm
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-orange-50/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Giỏ hàng của bạn</h1>
          <p className="text-gray-600">
            Bạn có <span className="font-semibold text-orange-600">{totalItems}</span> sản phẩm trong giỏ hàng
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Free Shipping Progress */}
            {cartSummary.subtotal < 300000 && (
              <Card className="border-0 shadow-md bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Truck className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Mua thêm {(300000 - cartSummary.subtotal).toLocaleString('vi-VN')}đ để được miễn phí vận chuyển!
                    </span>
                  </div>
                  <div className="w-full bg-orange-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-orange h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((cartSummary.subtotal / 300000) * 100, 100)}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cart Items List */}
            {items.map((item: CartItemWithDetails, index: number) => {
              const currentPrice = getProductPrice(item);
              const originalPrice = getOriginalPrice(item);
              const discountPercent = getDiscountPercent(item);
              const isProcessing = processingItemId === item.id;

              return (
                <Card 
                  key={item.id} 
                  className={`border-0 shadow-lg bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all ${isProcessing ? 'opacity-50' : ''}`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.5s ease-out forwards'
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
                        <Image
                          src={getProductImage(item)}
                          alt={item.product_variants.products.name}
                          fill
                          className="object-cover rounded-xl"
                        />
                        {discountPercent && (
                          <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full">
                            -{discountPercent}%
                          </Badge>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-gray-800 line-clamp-2 hover:text-orange-600 transition-colors">
                          <Link href={`/products/${item.product_variants.products.slug}`}>
                            {item.product_variants.products.name}
                          </Link>
                        </h3>
                        
                        {/* Variants */}
                        <div className="flex gap-3 text-sm">
                          {item.product_variants.color && (
                            <Badge variant="outline" className="border-orange-200">
                              Màu: {item.product_variants.color}
                            </Badge>
                          )}
                          {item.product_variants.size && (
                            <Badge variant="outline" className="border-orange-200">
                              Size: {item.product_variants.size}
                            </Badge>
                          )}
                        </div>

                        {/* Stock warning */}
                        {item.product_variants.stock < 10 && (
                          <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                            Chỉ còn {item.product_variants.stock} sản phẩm
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-gradient-orange">
                            {currentPrice.toLocaleString('vi-VN')}đ
                          </span>
                          {originalPrice && originalPrice > currentPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              {originalPrice.toLocaleString('vi-VN')}đ
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 rounded-lg border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={isProcessing || item.quantity <= 1}
                            >
                              {isProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Minus className="w-4 h-4" />
                              )}
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleInputChange(e, item.id)}
                              className="w-16 h-8 text-center rounded-lg border-orange-200 focus:border-orange-500"
                              min="1"
                              max={item.product_variants.stock}
                              disabled={isProcessing}
                            />
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 rounded-lg border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={isProcessing || item.quantity >= item.product_variants.stock}
                            >
                              {isProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Plus className="w-4 h-4" />
                              )}
                            </Button>
                          </div>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 mr-1" />
                            )}
                            Xóa
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Continue Shopping */}
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
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Xóa tất cả
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl bg-white rounded-3xl sticky top-4">
              <CardContent className="p-6 space-y-6">
                <h3 className="text-xl font-bold text-gray-800">Tóm tắt đơn hàng</h3>

                {/* Coupon */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Mã giảm giá</label>
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nhập mã giảm giá"
                        value={couponCode}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCouponCode(e.target.value)}
                        className="rounded-xl border-orange-200 focus:border-orange-500"
                      />
                      <Button
                        onClick={applyCoupon}
                        className="bg-gradient-orange hover:bg-gradient-orange-dark text-white rounded-xl px-4"
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
                  <span className="text-2xl font-bold text-gradient-orange">
                    {cartSummary.total.toLocaleString('vi-VN')}đ
                  </span>
                </div>

                {/* Checkout Button */}
                <Button
                  size="lg"
                  className="w-full h-14 bg-gradient-orange hover:bg-gradient-orange-dark text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  onClick={() => router.push('/checkout')}
                  disabled={loading}
                >
                  {loading ? (
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

        {/* Recently Viewed */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Có thể bạn quan tâm
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Card key={i} className="border-0 shadow-md hover:shadow-xl transition-all rounded-2xl overflow-hidden">
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

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}