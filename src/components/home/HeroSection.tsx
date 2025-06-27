'use client';

import { Button } from "@/components/ui/button";
import { ShoppingBag, Star, Sparkles, TrendingUp, Award, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-200/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* GIẢM PADDING TOP: từ py-20 md:py-28 xuống pt-8 md:pt-12 */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-8 md:pt-12 pb-20 md:pb-28">
        <div className="text-center">
          {/* Badge - GIẢM MARGIN BOTTOM: từ mb-8 xuống mb-4 */}
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-100 to-amber-100 backdrop-blur-sm rounded-full border border-orange-200 mb-4 animate-pulse-orange">
            <Sparkles className="w-4 h-4 mr-2 text-orange-600" />
            <span className="text-sm font-semibold text-orange-700">✨ Ưu đãi độc quyền - Giảm đến 50%</span>
          </div>

          {/* Main Heading - SỬA LINE-HEIGHT ĐỂ HIỂN THỊ DẤU TIẾNG VIỆT */}
          <h1 className="text-3xl md:text-3xl lg:text-5xl font-bold mb-4 leading-normal md:leading-relaxed">
            <span className="text-gray-800">Mua sắm</span>
            <br />
            <span className="text-5xl md:text-7xl lg:text-6xl text-gradient-orange inline-block transform hover:scale-105 transition-transform duration-300 py-2">
              Tiết kiệm hơn
            </span>
          </h1>

          {/* GIẢM MARGIN BOTTOM: từ mb-10 xuống mb-6 */}
          <p className="text-xl md:text-2xl mb-6 text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Khám phá hàng ngàn sản phẩm chất lượng với giá cả tốt nhất. 
            <span className="text-orange-600 font-semibold"> Giao hàng nhanh chóng</span>, 
            <span className="text-orange-600 font-semibold"> đảm bảo chính hãng</span>
          </p>

          {/* CTA Buttons - GIẢM MARGIN BOTTOM: từ mb-16 xuống mb-10 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
            <Button
              size="lg"
              onClick={() => router.push('/products')}
              className="group bg-gradient-orange hover:bg-gradient-orange-dark text-white px-8 py-6 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-orange-200 transition-all duration-300 transform hover:-translate-y-1 hover-lift"
            >
              <ShoppingBag className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Khám phá ngay
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/products?category=dep-banh-mi')}
              className="border-2 border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 px-8 py-6 text-lg font-semibold rounded-2xl transition-all duration-300 hover-lift"
            >
              Xem danh mục
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover-lift border border-orange-100">
              <div className="w-14 h-14 bg-gradient-orange rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Truck className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Giao hàng nhanh</h3>
              <p className="text-sm text-gray-600">Miễn phí vận chuyển đơn từ 300k</p>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover-lift border border-orange-100">
              <div className="w-14 h-14 bg-gradient-orange rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Award className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Đảm bảo chất lượng</h3>
              <p className="text-sm text-gray-600">100% hàng chính hãng</p>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover-lift border border-orange-100">
              <div className="w-14 h-14 bg-gradient-orange rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Ưu đãi hấp dẫn</h3>
              <p className="text-sm text-gray-600">Giảm giá lên đến 50%</p>
            </div>
          </div>

          {/* Stats - GIẢM MARGIN TOP: từ mt-20 xuống mt-12 */}
          <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center group">
              <div className="text-3xl md:text-4xl font-bold text-gradient-orange group-hover:scale-110 transition-transform">100+</div>
              <div className="text-sm text-gray-600 mt-1">Sản phẩm</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl md:text-4xl font-bold text-gradient-orange group-hover:scale-110 transition-transform">50K+</div>
              <div className="text-sm text-gray-600 mt-1">Khách hàng</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl md:text-4xl font-bold text-gradient-orange group-hover:scale-110 transition-transform">99%</div>
              <div className="text-sm text-gray-600 mt-1">Hài lòng</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="url(#gradient)"/>
          <defs>
            <linearGradient id="gradient" x1="720" y1="60" x2="720" y2="120" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fed7aa" stopOpacity="0.3"/>
              <stop offset="1" stopColor="#fb923c" stopOpacity="0.1"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
    </section>
  );
}