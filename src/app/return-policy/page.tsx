import React from 'react';
import { CheckCircle, Clock, MapPin, Phone, AlertCircle, Package, RotateCcw } from 'lucide-react';

const ReturnPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      {/* Header Section */}
      <div className="bg-gradient-orange text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 animate-pulse-orange">
            <RotateCcw className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-float">
            Chính Sách Đổi Trả
          </h1>
          <p className="text-xl text-orange-100 max-w-2xl mx-auto">
            Cam kết mang đến trải nghiệm mua sắm tuyệt vời với chính sách đổi trả linh hoạt
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Quick Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-2xl p-6 shadow-lg hover-lift border border-orange-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-orange rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold ml-4 text-orange-800">Thời gian</h3>
            </div>
            <p className="text-muted-foreground">
              <span className="font-semibold text-orange-600">48 giờ</span> thông báo đổi trả
            </p>
            <p className="text-muted-foreground">
              <span className="font-semibold text-orange-600">14 ngày</span> gửi sản phẩm
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover-lift border border-orange-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-orange rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold ml-4 text-orange-800">Điều kiện</h3>
            </div>
            <p className="text-muted-foreground">Sản phẩm nguyên vẹn</p>
            <p className="text-muted-foreground">Còn đầy đủ phụ kiện</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover-lift border border-orange-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-orange rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold ml-4 text-orange-800">Địa điểm</h3>
            </div>
            <p className="text-muted-foreground">Trực tiếp tại cửa hàng</p>
            <p className="text-muted-foreground">Gửi qua bưu điện</p>
          </div>
        </div>

        {/* Policy Sections */}
        <div className="space-y-12">
          {/* Section 1: Điều kiện đổi trả */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-orange-200">
            <div className="flex items-center mb-8">
              <div className="w-16 h-16 bg-gradient-orange rounded-2xl flex items-center justify-center animate-glow">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div className="ml-6">
                <h2 className="text-3xl font-bold text-orange-800 mb-2">
                  1. Điều kiện đổi trả
                </h2>
                <p className="text-orange-600 text-lg">
                  Kiểm tra và đổi trả ngay tại thời điểm giao hàng
                </p>
              </div>
            </div>

            <div className="bg-gradient-orange-light rounded-2xl p-6 mb-6">
              <p className="text-orange-800 text-lg leading-relaxed mb-4">
                Quý Khách hàng cần kiểm tra tình trạng hàng hóa và có thể đổi hàng/trả lại hàng 
                ngay tại thời điểm giao/nhận hàng trong những trường hợp sau:
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-start">
                  <AlertCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                  <div className="ml-4">
                    <h4 className="font-semibold text-red-800 mb-2">Sai sản phẩm</h4>
                    <p className="text-red-700">
                      Hàng không đúng chủng loại, mẫu mã trong đơn hàng đã đặt hoặc như trên website
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <div className="flex items-start">
                  <AlertCircle className="w-6 h-6 text-yellow-500 mt-1 flex-shrink-0" />
                  <div className="ml-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Thiếu số lượng</h4>
                    <p className="text-yellow-700">
                      Không đủ số lượng, không đủ bộ như trong đơn hàng đã đặt
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 md:col-span-2">
                <div className="flex items-start">
                  <AlertCircle className="w-6 h-6 text-orange-500 mt-1 flex-shrink-0" />
                  <div className="ml-4">
                    <h4 className="font-semibold text-orange-800 mb-2">Hư hỏng bên ngoài</h4>
                    <p className="text-orange-700">
                      Tình trạng bên ngoài bị ảnh hưởng như rách bao bì, bong tróc, bể vỡ...
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-blue-800 font-medium">
                📋 <strong>Lưu ý quan trọng:</strong> Khách hàng có trách nhiệm trình giấy tờ liên quan 
                chứng minh sự thiếu sót trên để hoàn thành việc hoàn trả/đổi trả hàng hóa.
              </p>
            </div>
          </div>

          {/* Section 2: Quy định về thời gian */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-orange-200">
            <div className="flex items-center mb-8">
              <div className="w-16 h-16 bg-gradient-orange rounded-2xl flex items-center justify-center animate-glow">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div className="ml-6">
                <h2 className="text-3xl font-bold text-orange-800 mb-2">
                  2. Quy định về thời gian
                </h2>
                <p className="text-orange-600 text-lg">
                  Thời hạn thông báo và gửi sản phẩm đổi trả
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 border border-orange-200">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-orange rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-orange">
                    <span className="text-2xl font-bold text-white">48h</span>
                  </div>
                  <h3 className="text-xl font-bold text-orange-800 mb-3">Thời gian thông báo</h3>
                  <p className="text-orange-700 leading-relaxed">
                    Trong vòng <strong>48 giờ</strong> kể từ khi nhận sản phẩm đối với trường hợp 
                    sản phẩm thiếu phụ kiện, quà tặng hoặc bể vỡ
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 border border-orange-200">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-orange rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-orange">
                    <span className="text-xl font-bold text-white">14</span>
                  </div>
                  <h3 className="text-xl font-bold text-orange-800 mb-3">Thời gian gửi trả</h3>
                  <p className="text-orange-700 leading-relaxed">
                    Trong vòng <strong>14 ngày</strong> kể từ khi nhận sản phẩm để gửi chuyển trả sản phẩm
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gradient-orange-light rounded-2xl p-6">
              <div className="flex items-start">
                <MapPin className="w-6 h-6 text-orange-600 mt-1 flex-shrink-0" />
                <div className="ml-4">
                  <h4 className="font-semibold text-orange-800 mb-2">Địa điểm đổi trả sản phẩm:</h4>
                  <div className="space-y-2 text-orange-700">
                    <p>• Mang hàng trực tiếp đến văn phòng/cửa hàng của chúng tôi</p>
                    <p>• Chuyển qua đường bưu điện</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-gradient-orange text-white rounded-3xl p-8 text-center">
          <div className="max-w-3xl mx-auto">
            <Phone className="w-12 h-12 mx-auto mb-4 animate-float" />
            <h2 className="text-2xl font-bold mb-4">Cần hỗ trợ thêm?</h2>
            <p className="text-orange-100 text-lg mb-6">
              Trong trường hợp Quý Khách hàng có ý kiến đóng góp/khiếu nại liên quan đến chất lượng sản phẩm, 
              Quý Khách hàng vui lòng liên hệ đường dây chăm sóc khách hàng của chúng tôi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicyPage;