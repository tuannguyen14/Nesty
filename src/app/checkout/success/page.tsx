'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Mail, 
  Phone, 
  MapPin,
  Clock,
  ArrowRight,
  Copy,
  Download,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface OrderInfo {
  orderId: string;
  estimatedDelivery: string;
  trackingNumber: string;
}

export default function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ orderId?: string }> }) {
  const params = use(searchParams);
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  
  const orderInfo: OrderInfo = {
    orderId: params.orderId || 'ORD' + Date.now(),
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN'),
    trackingNumber: 'VN' + Math.random().toString(36).substr(2, 9).toUpperCase()
  };

  // Trigger confetti animation
  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
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
  }, []);

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderInfo.orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOrder = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Đơn hàng của tôi',
        text: `Mã đơn hàng: ${orderInfo.orderId}`,
        url: window.location.href
      });
    }
  };

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
                    {orderInfo.orderId}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyOrderId}
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

              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shareOrder}
                  className="rounded-xl border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Chia sẻ
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Tải hóa đơn
                </Button>
              </div>
            </div>

            <Separator className="bg-orange-100" />

            {/* Tracking Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Truck className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Mã vận đơn</p>
                    <p className="font-semibold">{orderInfo.trackingNumber}</p>
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
                    <p className="font-semibold">{orderInfo.estimatedDelivery}</p>
                  </div>
                </div>
              </div>
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
                <a href="mailto:support@nesty.vn" className="flex items-center gap-3 text-gray-700 hover:text-orange-600">
                  <Mail className="w-5 h-5 text-orange-500" />
                  <span>support@nesty.vn</span>
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