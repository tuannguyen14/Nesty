import { Headphones } from 'lucide-react';

export function CTASection() {
  return (
    <section className="relative px-4 py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600"></div>
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-6">
                <Headphones className="w-4 h-4 mr-2 text-white" />
                <span className="text-sm font-medium text-white">Hỗ trợ 24/7</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Cần tư vấn?
                <span className="block text-yellow-300">Chúng tôi luôn sẵn sàng!</span>
              </h2>
              
              <p className="text-lg text-orange-100 mb-8">
                Đội ngũ chuyên gia với hơn 10 năm kinh nghiệm sẽ giúp bạn chọn được sản phẩm phù hợp nhất.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-yellow-300 mb-2">98%</div>
                <div className="text-sm text-orange-100">Khách hàng hài lòng</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-yellow-300 mb-2">5 phút</div>
                <div className="text-sm text-orange-100">Thời gian phản hồi</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-yellow-300 mb-2">24/7</div>
                <div className="text-sm text-orange-100">Luôn sẵn sàng</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-yellow-300 mb-2">10+</div>
                <div className="text-sm text-orange-100">Năm kinh nghiệm</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}