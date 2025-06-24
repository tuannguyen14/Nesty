'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  Package,
  Truck,
  Mail,
  Phone,
  Clock,
  ArrowRight,
  Copy,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '@/lib/supabase';
import { OrderInfo } from '@/types/orderInfo';

export function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estimated_delivery, setEstimatedDelivery] = useState<string | null>(null);

  const orderId = searchParams.get('orderId'); // This should be the order ID from database

  // Fetch order information from Supabase
  useEffect(() => {
    const fetchOrderInfo = async () => {
      if (!orderId) {
        setError('Không tìm thấy thông tin đơn hàng');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            order_code,
            user_id,
            status,
            total_amount,
            voucher_discount,
            shipping_name,
            shipping_address,
            shipping_phone,
            shipping_code,
            shipping_provider,
            created_at
          `)
          .eq('id', orderId)
          .single();

        if (error) {
          console.error('Error fetching order:', error);
          setError('Không thể tải thông tin đơn hàng');
          return;
        }

        if (data) {
          // Calculate estimated delivery (3 days from order creation)
          const createdDate = new Date(data.created_at);
          const estimatedDate = new Date(createdDate.getTime() + 3 * 24 * 60 * 60 * 1000);
          const estimated_delivery = estimatedDate.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          setEstimatedDelivery(estimated_delivery);

          // Generate tracking number if not exists
          const shipping_code = data.shipping_code || "Chờ xác nhận"

          setOrderInfo({
            ...data,
            shipping_code: shipping_code
          });
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Đã xảy ra lỗi khi tải thông tin đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderInfo();
  }, [orderId, supabase]);

  // Trigger confetti animation
  useEffect(() => {
    if (orderInfo) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5']
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5']
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [orderInfo]);

  const copyOrderCode = () => {
    if (orderInfo?.order_code) {
      navigator.clipboard.writeText(orderInfo.order_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareOrder = () => {
    if (navigator.share && orderInfo) {
      navigator.share({
        title: 'Đơn hàng của tôi',
        text: `Mã đơn hàng: ${orderInfo.order_code}`,
        url: window.location.href
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'processing':
        return 'text-blue-600 bg-blue-50';
      case 'shipped':
        return 'text-purple-600 bg-purple-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-orange-600 bg-orange-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý';
      case 'processing':
        return 'Đang xử lý';
      case 'shipped':
        return 'Đã giao vận';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-orange-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error || !orderInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-orange-50/30 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error || 'Không tìm thấy thông tin đơn hàng'}</p>
          <Link href="/products">
            <Button className="bg-gradient-orange hover:bg-gradient-orange-dark text-white px-6 py-3 rounded-xl">
              Quay lại mua sắm
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-orange-50/30">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Success Card */}
        <Card className="border-0 shadow-2xl bg-white rounded-3xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-center text-white">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4">
              <CheckCircle className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Đặt hàng thành công!</h1>
            <p className="text-green-100">Cảm ơn bạn đã tin tưởng và mua sắm tại cửa hàng của chúng tôi</p>
          </div>

          <CardContent className="p-8 space-y-6">
            {/* Order Info */}
            <div className="text-center space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Mã đơn hàng của bạn</p>
                <div className="flex items-center justify-center gap-3">
                  <code className="text-2xl font-mono font-bold text-orange-600 bg-orange-50 px-4 py-2 rounded-xl">
                    {orderInfo.order_code}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyOrderCode}
                    className="rounded-xl border-orange-300 hover:bg-orange-50"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Order Status & Amount */}
              <div className="flex justify-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-gray-600">Trạng thái</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orderInfo.status)}`}>
                    {getStatusText(orderInfo.status)}
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">Tổng tiền</p>
                  <p className="font-bold text-lg text-orange-600">
                    {formatCurrency(orderInfo.total_amount)}
                  </p>
                </div>
              </div>
            </div>

            <Separator className="bg-orange-100" />

            {/* Shipping Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Truck className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Mã vận đơn</p>
                    <p className="font-semibold">{orderInfo.shipping_code}</p>
                    {orderInfo.shipping_provider && (
                      <p className="text-xs text-gray-500">{orderInfo.shipping_provider}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Dự kiến giao hàng</p>
                    <p className="font-semibold">{estimated_delivery}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Địa chỉ giao hàng</h4>
              <p className="font-medium">{orderInfo.shipping_name}</p>
              <p className="text-gray-600">{orderInfo.shipping_address}</p>
              {orderInfo.shipping_phone && (
                <p className="text-gray-600">SĐT: {orderInfo.shipping_phone}</p>
              )}
            </div>

            <Separator className="bg-orange-100" />

            {/* Next Steps */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-800">Các bước tiếp theo</h3>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gradient-orange rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Xác nhận đơn hàng</p>
                    <p className="text-sm text-gray-600">Chúng tôi sẽ gửi email xác nhận đơn hàng trong vài phút</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gradient-orange rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Chuẩn bị hàng</p>
                    <p className="text-sm text-gray-600">Đơn hàng sẽ được đóng gói cẩn thận trong 24h</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gradient-orange rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Giao hàng</p>
                    <p className="text-sm text-gray-600">Shipper sẽ liên hệ với bạn trước khi giao hàng</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-orange-100" />

            {/* Contact Info */}
            <div className="bg-orange-50 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Cần hỗ trợ?</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <a href="tel:1800282279" className="flex items-center gap-3 text-gray-700 hover:text-orange-600">
                  <Phone className="w-5 h-5 text-orange-500" />
                  <span>Hotline: 1800 282 279</span>
                </a>
                <a href="mailto:marketing@taiyangshoes.com.vn" className="flex items-center gap-3 text-gray-700 hover:text-orange-600">
                  <Mail className="w-5 h-5 text-orange-500" />
                  <span>marketing@taiyangshoes.com.vn</span>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/products">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-orange-300 text-orange-600 hover:bg-orange-50 px-8 py-4 rounded-2xl font-semibold"
            >
              <Package className="w-5 h-5 mr-2" />
              Tiếp tục mua sắm
            </Button>
          </Link>

          <Link href="/profile/orders">
            <Button
              size="lg"
              className="bg-gradient-orange hover:bg-gradient-orange-dark text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Theo dõi đơn hàng
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CheckoutSuccessPage;