'use client';

import { Button } from "@/components/ui/button";
import { ShoppingBag, Star } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-pink-500/90"></div>
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "url('banner/banner.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-yellow-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-24 md:py-32">
        <div className="text-center text-white">
          <div className="mb-6 inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
            <Star className="w-4 h-4 mr-2 text-yellow-300 fill-current" />
            <span className="text-sm font-medium">Sản phẩm chất lượng cao</span>
          </div>

          <h1 className="text-4xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent leading-tight">
            Chào mừng đến với
            <br />
            <span className="text-5xl md:text-8xl bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
              Cửa hàng
            </span>
          </h1>

          <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Khám phá bộ sưu tập những sản phẩm tuyệt vời nhất với chất lượng đảm bảo và giá cả hợp lý
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="group bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-blue-200/50 transition-all duration-300 transform hover:-translate-y-1"
            >
              <ShoppingBag className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Khám phá ngay
            </Button>

            {/* <Button
              size="lg"
              variant="outline"
              className="border-2 border-white/50 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300"
            >
              Xem catalog
            </Button> */}
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-300">1000+</div>
              <div className="text-sm text-blue-100 mt-1">Sản phẩm</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-300">50K+</div>
              <div className="text-sm text-blue-100 mt-1">Khách hàng</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-pink-300">99%</div>
              <div className="text-sm text-blue-100 mt-1">Hài lòng</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}