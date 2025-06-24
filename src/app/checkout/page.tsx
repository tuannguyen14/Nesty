// Fixed Checkout Page - Correct Database Schema
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSupabaseCart } from '@/hooks/useSupabaseCart';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft,
  CreditCard,
  Truck,
  MapPin,
  Phone,
  Mail,
  User,
  ShoppingBag,
  Shield,
  Clock,
  CheckCircle,
  Wallet,
  Building,
  QrCode,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

import vietnamProvinces from '@/data/provinces/VietnamProvinces.json';

import { ShippingInfo } from '@/types/shippingInfo';
import { PaymentMethod } from '@/types/paymentMethod';


const paymentMethods: PaymentMethod[] = [
  {
    id: 'cod',
    name: 'Thanh toán khi nhận hàng (COD)',
    description: 'Thanh toán bằng tiền mặt khi nhận hàng',
    icon: Truck,
    isPopular: true
  },
  {
    id: 'bank',
    name: 'Chuyển khoản ngân hàng',
    description: 'Chuyển khoản qua tài khoản ngân hàng',
    icon: Building
  },
  {
    id: 'card',
    name: 'Thẻ tín dụng/Ghi nợ',
    description: 'Visa, Mastercard, JCB',
    icon: CreditCard
  },
  {
    id: 'ewallet',
    name: 'Ví điện tử',
    description: 'MoMo, ZaloPay, VNPay',
    icon: Wallet
  },
  {
    id: 'qr',
    name: 'QR Code',
    description: 'Quét mã QR để thanh toán',
    icon: QrCode
  }
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart, loading: cartLoading } = useSupabaseCart();
  const { user, loading: userLoading } = useAuth();

  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(null);

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    ward: '',
    district: '',
    city: '',
    // note: ''
  });

  const [errors, setErrors] = useState<Partial<ShippingInfo>>({});

  // Memoized data cho dropdown
  const availableDistricts = useMemo(() => {
    if (!shippingInfo.city) return [];
    const selectedProvince = vietnamProvinces.find(p => p.name === shippingInfo.city);
    return selectedProvince?.districts || [];
  }, [shippingInfo.city]);

  const availableWards = useMemo(() => {
    if (!shippingInfo.district) return [];
    const selectedDistrict = availableDistricts.find(d => d.name === shippingInfo.district);
    return selectedDistrict?.wards || [];
  }, [shippingInfo.district, availableDistricts]);

  // Redirect if cart is empty
  useEffect(() => {
    // Chỉ redirect khi cart đã load xong và thực sự rỗng
    if (!userLoading && !cartLoading && items.length === 0) {
      router.push('/cart');
    }
  }, [items.length, cartLoading, router, userLoading]);

  // Auto-fill user info if logged in
  useEffect(() => {
    if (user) {
      setShippingInfo(prev => ({
        ...prev,
        email: user.email || '',
        fullName: user.full_name || ''
      }));
    }
  }, [user]);

  // Reset district and ward when city changes
  useEffect(() => {
    if (shippingInfo.city) {
      setShippingInfo(prev => ({
        ...prev,
        district: '',
        ward: ''
      }));
    }
  }, [shippingInfo.city]);

  // Reset ward when district changes
  useEffect(() => {
    if (shippingInfo.district) {
      setShippingInfo(prev => ({
        ...prev,
        ward: ''
      }));
    }
  }, [shippingInfo.district]);

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-orange-50/30 flex items-center justify-center">
        <Card className="border-0 shadow-xl bg-white rounded-3xl overflow-hidden">
          <CardContent className="text-center py-20">
            <Loader2 className="w-16 h-16 text-orange-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Đang tải giỏ hàng...</h2>
            <p className="text-gray-600">Vui lòng đợi trong giây lát.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!cartLoading && items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-orange-50/30 flex items-center justify-center">
        <Card className="border-0 shadow-xl bg-white rounded-3xl overflow-hidden">
          <CardContent className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-orange-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Giỏ hàng trống</h2>
            <p className="text-gray-600 mb-8">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
            <Link href="/products">
              <Button className="bg-gradient-orange hover:bg-gradient-orange-dark text-white px-8 py-4 rounded-2xl">
                Tiếp tục mua sắm
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate totals
  const shippingFee = subtotal >= 300000 ? 0 : 30000;
  const total = subtotal - discount + shippingFee;

  // Apply coupon function với voucher lookup
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      alert('Vui lòng nhập mã giảm giá');
      return;
    }

    try {
      // Tìm voucher trong database
      const { data: voucher, error } = await supabase
        .from('vouchers')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .single();

      if (error || !voucher) {
        alert('Mã giảm giá không hợp lệ!');
        return;
      }

      // Kiểm tra voucher còn hiệu lực
      const now = new Date();
      if (voucher.valid_from && new Date(voucher.valid_from) > now) {
        alert('Mã giảm giá chưa có hiệu lực');
        return;
      }
      if (voucher.valid_to && new Date(voucher.valid_to) < now) {
        alert('Mã giảm giá đã hết hạn');
        return;
      }

      // Kiểm tra giá trị đơn hàng tối thiểu
      if (voucher.min_order_value && subtotal < voucher.min_order_value) {
        alert(`Đơn hàng phải có giá trị tối thiểu ${voucher.min_order_value.toLocaleString('vi-VN')}đ`);
        return;
      }

      // Tính toán giảm giá
      let discountAmount = 0;
      if (voucher.discount_type === 'percent') {
        discountAmount = subtotal * (voucher.discount_value / 100);
        if (voucher.max_discount && discountAmount > voucher.max_discount) {
          discountAmount = voucher.max_discount;
        }
      } else {
        discountAmount = voucher.discount_value;
      }

      setDiscount(discountAmount);
      setAppliedCoupon(voucher.code);
      setSelectedVoucherId(voucher.id);
      alert('Áp dụng mã giảm giá thành công!');
    } catch (error) {
      console.error('Error applying coupon:', error);
      alert('Có lỗi xảy ra khi áp dụng mã giảm giá');
    }
  };

  const removeCoupon = () => {
    setDiscount(0);
    setAppliedCoupon(null);
    setSelectedVoucherId(null);
    setCouponCode('');
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<ShippingInfo> = {};

    if (!shippingInfo.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
    }
    if (!shippingInfo.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(shippingInfo.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    if (!shippingInfo.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(shippingInfo.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!shippingInfo.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
    }
    if (!shippingInfo.ward.trim()) {
      newErrors.ward = 'Vui lòng chọn phường/xã';
    }
    if (!shippingInfo.district.trim()) {
      newErrors.district = 'Vui lòng chọn quận/huyện';
    }
    if (!shippingInfo.city.trim()) {
      newErrors.city = 'Vui lòng chọn tỉnh/thành phố';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // FIXED: Handle order submission với database schema chính xác
  const handleSubmitOrder = async () => {
    if (!validateForm()) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }

    if (!agreeTerms) {
      alert('Vui lòng đồng ý với điều khoản và điều kiện');
      return;
    }

    setLoading(true);

    try {
      // ✅ Tạo order theo đúng schema
      const orderData = {
        user_id: user?.id || null,
        status: 'pending',
        total_amount: total,
        voucher_id: selectedVoucherId, // ID từ vouchers table
        voucher_discount: discount,
        shipping_name: shippingInfo.fullName,
        shipping_address: `${shippingInfo.address}, ${shippingInfo.ward}, ${shippingInfo.district}, ${shippingInfo.city}`,
        shipping_phone: shippingInfo.phone,
        shipping_code: null, // Sẽ được update sau khi có thông tin vận chuyển
        shipping_provider: null, // Sẽ được update sau
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select('id')
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw orderError;
      }

      // ✅ Tạo order items theo đúng schema
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_variant_id: item.product_variant_id,
        quantity: item.quantity,
        price: item.product_variants.price_override ||
          item.product_variants.products.discount_price ||
          item.product_variants.products.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items creation error:', itemsError);
        throw itemsError;
      }

      // ✅ Cập nhật voucher usage nếu có
      if (selectedVoucherId && user) {
        const { error: usageError } = await supabase
          .from('voucher_usages')
          .insert({
            voucher_id: selectedVoucherId,
            user_id: user.id,
            order_id: order.id
          });

        if (usageError) {
          console.error('Voucher usage error:', usageError);
          // Không throw error vì order đã tạo thành công
        }
      }

      // Clear cart after successful order
      await clearCart();

      // Redirect to success page
      router.push(`/checkout/success?orderId=${order.id}`);
    } catch (error: any) {
      console.error('Error creating order:', error);
      alert('Có lỗi xảy ra khi đặt hàng: ' + (error.message || 'Vui lòng thử lại!'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Helper function để get product image
  const getProductImage = (item: any): string => {
    const images = item.product_variants.products.product_images;
    if (images && images.length > 0) {
      return images.sort((a: any, b: any) => a.sort_order - b.sort_order)[0].image_url;
    }
    return '/placeholder-image.jpg';
  };

  // Helper function để get product price
  const getProductPrice = (item: any): number => {
    return item.product_variants.price_override ||
      item.product_variants.products.discount_price ||
      item.product_variants.products.price;
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-orange-50/30 flex items-center justify-center">
        <Card className="border-0 shadow-xl bg-white rounded-3xl overflow-hidden">
          <CardContent className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-orange-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Giỏ hàng trống</h2>
            <p className="text-gray-600 mb-8">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
            <Link href="/products">
              <Button className="bg-gradient-orange hover:bg-gradient-orange-dark text-white px-8 py-4 rounded-2xl">
                Tiếp tục mua sắm
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-orange-50/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Thanh toán</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/cart" className="hover:text-orange-600">Giỏ hàng</Link>
            <span>/</span>
            <span className="text-orange-600 font-medium">Thanh toán</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <Card className="border-0 shadow-lg rounded-3xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  Thông tin giao hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName" className="mb-2 flex items-center gap-1">
                      <User className="w-4 h-4 text-orange-500" />
                      Họ và tên <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      value={shippingInfo.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className={`rounded-xl ${errors.fullName ? 'border-red-500' : 'border-orange-200 focus:border-orange-500'}`}
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="mb-2 flex items-center gap-1">
                      <Phone className="w-4 h-4 text-orange-500" />
                      Số điện thoại <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      value={shippingInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="0123456789"
                      className={`rounded-xl ${errors.phone ? 'border-red-500' : 'border-orange-200 focus:border-orange-500'}`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="mb-2 flex items-center gap-1">
                    <Mail className="w-4 h-4 text-orange-500" />
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="email@example.com"
                    className={`rounded-xl ${errors.email ? 'border-red-500' : 'border-orange-200 focus:border-orange-500'}`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="address" className="mb-2">
                    Địa chỉ chi tiết <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="address"
                    value={shippingInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Số nhà, tên đường"
                    className={`rounded-xl ${errors.address ? 'border-red-500' : 'border-orange-200 focus:border-orange-500'}`}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {/* Tỉnh/Thành phố */}
                  <div>
                    <Label htmlFor="city" className="mb-2">
                      Tỉnh/Thành phố <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={shippingInfo.city}
                      onValueChange={(value) => handleInputChange('city', value)}
                    >
                      <SelectTrigger className={`rounded-xl ${errors.city ? 'border-red-500' : 'border-orange-200 focus:border-orange-500'}`}>
                        <SelectValue placeholder="Chọn tỉnh/thành phố" />
                      </SelectTrigger>
                      <SelectContent>
                        {vietnamProvinces.map((province) => (
                          <SelectItem key={province.name} value={province.name}>
                            {province.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>

                  {/* Quận/Huyện */}
                  <div>
                    <Label htmlFor="district" className="mb-2">
                      Quận/Huyện <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={shippingInfo.district}
                      onValueChange={(value) => handleInputChange('district', value)}
                      disabled={!shippingInfo.city}
                    >
                      <SelectTrigger className={`rounded-xl ${errors.district ? 'border-red-500' : 'border-orange-200 focus:border-orange-500'} ${!shippingInfo.city ? 'opacity-50' : ''}`}>
                        <SelectValue placeholder="Chọn quận/huyện" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDistricts.map((district) => (
                          <SelectItem key={district.name} value={district.name}>
                            {district.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.district && (
                      <p className="text-red-500 text-sm mt-1">{errors.district}</p>
                    )}
                  </div>

                  {/* Phường/Xã */}
                  <div>
                    <Label htmlFor="ward" className="mb-2">
                      Phường/Xã <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={shippingInfo.ward}
                      onValueChange={(value) => handleInputChange('ward', value)}
                      disabled={!shippingInfo.district}
                    >
                      <SelectTrigger className={`rounded-xl ${errors.ward ? 'border-red-500' : 'border-orange-200 focus:border-orange-500'} ${!shippingInfo.district ? 'opacity-50' : ''}`}>
                        <SelectValue placeholder="Chọn phường/xã" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableWards.map((ward) => (
                          <SelectItem key={ward.name} value={ward.name}>
                            {ward.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.ward && (
                      <p className="text-red-500 text-sm mt-1">{errors.ward}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="note" className="mb-2">
                    Ghi chú (tùy chọn)
                  </Label>
                  <Textarea
                    id="note"
                    // value={shippingInfo.note}
                    // onChange={(e) => handleInputChange('note', e.target.value)}
                    placeholder="Ghi chú về đơn hàng, ví dụ: giao hàng giờ hành chính..."
                    className="rounded-xl border-orange-200 focus:border-orange-500 min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="border-0 shadow-lg rounded-3xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CreditCard className="w-5 h-5 text-orange-500" />
                  Phương thức thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedPayment}
                  onValueChange={setSelectedPayment}
                  className="space-y-3"
                >
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <div key={method.id} className="relative">
                        <label
                          htmlFor={method.id}
                          className={`flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedPayment === method.id
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300'
                            }`}
                        >
                          <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedPayment === method.id
                              ? 'bg-gradient-orange text-white'
                              : 'bg-gray-100 text-gray-600'
                              }`}>
                              <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800">{method.name}</h4>
                              <p className="text-sm text-gray-600">{method.description}</p>
                            </div>
                          </div>
                          {method.isPopular && (
                            <Badge className="absolute -top-2 right-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs">
                              Phổ biến
                            </Badge>
                          )}
                        </label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Terms and Back button */}
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                  className="mt-1"
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  Tôi đã đọc và đồng ý với{' '}
                  <Link href="/terms" className="text-orange-600 hover:underline">
                    điều khoản và điều kiện
                  </Link>{' '}
                  của cửa hàng
                </label>
              </div>

              <Link href="/cart">
                <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50 rounded-xl">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại giỏ hàng
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl bg-white rounded-3xl sticky top-4">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <ShoppingBag className="w-5 h-5 text-orange-500" />
                  Đơn hàng của bạn
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Cart Items - ✅ Fixed structure */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={getProductImage(item)}
                          alt={item.product_variants.products.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                        <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                          {item.quantity}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-800 truncate">
                          {item.product_variants.products.name}
                        </h4>
                        {(item.product_variants.color || item.product_variants.size) && (
                          <p className="text-xs text-gray-500">
                            {item.product_variants.color && `Màu: ${item.product_variants.color}`}
                            {item.product_variants.color && item.product_variants.size && ' - '}
                            {item.product_variants.size && `Size: ${item.product_variants.size}`}
                          </p>
                        )}
                        <p className="text-sm font-semibold text-orange-600">
                          {(getProductPrice(item) * item.quantity).toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
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
                      >
                        Áp dụng
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
                        Xóa
                      </Button>
                    </div>
                  )}
                </div>

                <Separator className="bg-orange-100" />

                {/* Price Details */}
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span>{subtotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá</span>
                      <span>-{discount.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span>
                      {shippingFee === 0 ? (
                        <span className="text-green-600 font-medium">Miễn phí</span>
                      ) : (
                        `${shippingFee.toLocaleString('vi-VN')}đ`
                      )}
                    </span>
                  </div>
                </div>

                <Separator className="bg-orange-100" />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Tổng cộng</span>
                  <span className="text-2xl font-bold text-gradient-orange">
                    {total.toLocaleString('vi-VN')}đ
                  </span>
                </div>

                {/* Submit Button */}
                <Button
                  size="lg"
                  className="w-full h-14 bg-gradient-orange hover:bg-gradient-orange-dark text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  onClick={handleSubmitOrder}
                  disabled={loading || !agreeTerms}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang xử lý...
                    </div>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Đặt hàng
                    </>
                  )}
                </Button>

                {/* Security Info */}
                <div className="space-y-2 pt-4">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Shield className="w-4 h-4 text-orange-500" />
                    <span>Thanh toán an toàn & bảo mật</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span>Giao hàng trong 2-3 ngày</span>
                  </div>
                </div>

                {/* Alert */}
                {!user && (
                  <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-orange-800 mb-1">Bạn chưa đăng nhập</p>
                        <p className="text-orange-700">
                          <Link href="/login" className="underline">Đăng nhập</Link> để theo dõi đơn hàng dễ dàng hơn
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
