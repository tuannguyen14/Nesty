'use client';

import { Button } from "@/components/ui/button";
import { MessageCircle, HeadphonesIcon, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CTASection() {
  const router = useRouter();

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600"></div>
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-yellow-300/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-orange-300/10 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-1/3 right-1/3 w-36 h-36 bg-amber-300/10 rounded-full blur-2xl animate-float delay-500"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-8">
          <HeadphonesIcon className="w-4 h-4 mr-2 text-white" />
          <span className="text-sm font-medium text-white">Hỗ trợ 24/7</span>
        </div>

        {/* Heading */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
          Cần tư vấn
          <span className="block text-yellow-300 mt-2">sản phẩm phù hợp?</span>
        </h2>
        
        <p className="text-xl text-orange-100 mb-10 max-w-2xl mx-auto leading-relaxed">
          Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng tư vấn và hỗ trợ bạn 
          tìm kiếm sản phẩm hoàn hảo nhất với nhu cầu và ngân sách của bạn
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-3xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="text-3xl font-bold text-yellow-300 mb-1">5 phút</div>
            <div className="text-sm text-orange-100">Phản hồi nhanh</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="text-3xl font-bold text-yellow-300 mb-1">24/7</div>
            <div className="text-sm text-orange-100">Hỗ trợ liên tục</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="text-3xl font-bold text-yellow-300 mb-1">100%</div>
            <div className="text-sm text-orange-100">Khách hàng hài lòng</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => router.push('/contact')}
            className="group bg-white text-orange-600 hover:bg-orange-50 px-8 py-4 text-lg font-semibold rounded-2xl shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover-lift"
          >
            <MessageCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Chat ngay với tư vấn viên
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          {/* <Button
            size="lg"
            variant="outline"
            onClick={() => router.push('/catalog')}
            className="border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 hover-lift"
          >
            <Mail className="w-5 h-5 mr-2" />
            Gửi yêu cầu tư vấn
          </Button> */}
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-orange-100">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">Tư vấn miễn phí</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">Không spam</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">Bảo mật thông tin</span>
          </div>
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
    </section>
  );
}