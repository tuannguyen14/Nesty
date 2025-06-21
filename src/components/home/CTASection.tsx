'use client';

import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500"></div>
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-yellow-300/10 rounded-full blur-2xl animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center px-4 text-white">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Không tìm thấy sản phẩm phù hợp?
        </h2>
        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
          Đội ngũ chuyên gia của chúng tôi sẵn sàng tư vấn và hỗ trợ bạn tìm kiếm sản phẩm hoàn hảo
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Button
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-2xl shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            💬 Liên hệ tư vấn
          </Button>
          {/* <Button
            size="lg"
            variant="outline"
            className="border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300"
          >
            📋 Xem catalog
          </Button> */}
        </div>
      </div>
    </section>
  );
}