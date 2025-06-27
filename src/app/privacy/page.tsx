import React from 'react';
import { Shield, Lock, Eye, FileText, Phone, Mail, MapPin, Clock, Users, AlertTriangle } from 'lucide-react';

const PrivacyPolicyPage = () => {
  const sections = [
    {
      id: 'purpose',
      title: 'Mục đích và phạm vi thu thập',
      icon: <FileText className="w-6 h-6" />,
      content: `Để truy cập và sử dụng một số dịch vụ tại Nesty (tạo đơn hàng, để lại comment đánh giá, liên hệ với chúng tôi...), bạn có thể sẽ được yêu cầu để lại thông tin cho chúng tôi (Email, Họ tên, Số ĐT, địa chỉ liên lạc…). Mọi thông tin khai báo phải đảm bảo tính chính xác và hợp pháp.

Nesty cũng có thể thu thập thông tin về số lần truy cập, bao gồm số trang bạn xem, số links (liên kết) bạn click và những thông tin khác liên quan đến việc kết nối đến site Nesty. Chúng tôi cũng thu thập các thông tin mà trình duyệt Web (Browser) bạn sử dụng mỗi khi truy cập vào Nesty, bao gồm: địa chỉ IP, loại Browser, ngôn ngữ sử dụng, thời gian và những địa chỉ mà Browser truy xuất đến.`
    },
    {
      id: 'usage',
      title: 'Phạm vi sử dụng thông tin',
      icon: <Eye className="w-6 h-6" />,
      content: `Nesty thu thập và sử dụng thông tin cá nhân bạn với mục đích để liên hệ trực tiếp với bạn bằng hình thức: gửi thư ngỏ, lên đơn đặt hàng, gửi sms, gửi thông tin sản phẩm, bảo mật, giải quyết khiếu nại, trao thưởng khi cần thiết và hoàn toàn tuân thủ nội dung của "Chính sách bảo mật" này.`
    },
    {
      id: 'storage',
      title: 'Thời gian lưu trữ thông tin',
      icon: <Clock className="w-6 h-6" />,
      content: `Dữ liệu sẽ được lưu trữ cho đến khi có yêu cầu hủy bỏ. Còn lại trong mọi trường hợp thông tin cá nhân người dùng sẽ được bảo mật trên máy chủ của Nesty.`
    },
    {
      id: 'contact',
      title: 'Địa chỉ của đơn vị thu thập và quản lý thông tin cá nhân',
      icon: <MapPin className="w-6 h-6" />,
      content: `CÔNG TY TNHH SẢN XUẤT TNT VIỆT NAM

Địa chỉ đăng ký kinh doanh: ô A9-A10-A11, Đường N5, KCN Nam Tân Uyên Mở Rộng, Phường Hội Nghĩa, Thành phố Tân Uyên, Tỉnh Bình Dương, Việt Nam

Điện thoại hỗ trợ: 0969 979 333
Email: hai.nguyendai@thaiduongpaint.vn`
    },
    {
      id: 'access',
      title: 'Phương tiện và công cụ để người dùng tiếp cận và chỉnh sửa dữ liệu cá nhân',
      icon: <Users className="w-6 h-6" />,
      content: `Việc tiếp cận và chỉnh sửa dữ liệu cá nhân dựa vào yêu cầu của khách hàng bằng các hình thức sau:

• Đăng nhập vào trang quản lý thông tin thành viên và chỉnh sửa lại thông tin của mình
• Gọi điện thoại đến tổng đài chăm sóc khách hàng 0926.682.682
• Để lại bình luận hoặc gửi góp ý trực tiếp từ website Nesty.com.vn`
    },
    {
      id: 'commitment',
      title: 'Cam kết bảo mật thông tin cá nhân khách hàng',
      icon: <Shield className="w-6 h-6" />,
      content: `Thông tin cá nhân của người dùng trên Nesty.com.vn được Nesty cam kết bảo mật tuyệt đối theo chính sách bảo vệ thông tin cá nhân của Nesty. Việc thu thập và sử dụng thông tin của mỗi người dùng chỉ được thực hiện khi có sự đồng ý của khách hàng đó trừ những trường hợp pháp luật có quy định khác.

Không sử dụng, không chuyển giao, cung cấp hay tiết lộ cho bên thứ 3 nào về thông tin cá nhân của người dùng khi không có sự cho phép đồng ý từ người dùng đó.

Trong trường hợp máy chủ lưu trữ thông tin bị hacker tấn công dẫn đến mất mát dữ liệu cá nhân thành viên, Nesty sẽ có trách nhiệm thông báo vụ việc cho cơ quan chức năng điều tra xử lý kịp thời và thông báo cho người dùng được biết.`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-background to-orange-100">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-orange text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/20 rounded-full animate-pulse-orange">
                <Shield className="w-16 h-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-float">
              Chính Sách Bảo Mật
            </h1>
            <p className="text-xl md:text-2xl text-orange-100 max-w-3xl mx-auto leading-relaxed">
              Bảo vệ thông tin cá nhân khách hàng là ưu tiên hàng đầu của chúng tôi
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-white/10 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 border border-orange-200 hover-lift">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-orange rounded-full mr-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gradient-orange">Cam kết của chúng tôi</h2>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">
            Nesty cam kết sẽ bảo mật những thông tin mang tính riêng tư của bạn. Bạn vui lòng đọc bản &quot;Chính sách bảo mật&quot; dưới đây để hiểu hơn những cam kết mà chúng tôi thực hiện, nhằm tôn trọng và bảo vệ quyền lợi của người truy cập.
          </p>

        </div>

        {/* Policy Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <div key={section.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-orange-200 hover-lift">
              <div className="bg-gradient-orange-light p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-orange rounded-full mr-4 animate-glow">
                    {section.icon}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-orange-600 mb-1 block">
                      {index + 1}.
                    </span>
                    <h3 className="text-xl font-bold text-gray-800">
                      {section.title}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="prose prose-orange max-w-none">
                  {section.content.split('\n\n').map((paragraph, pIndex) => (
                    <p key={pIndex} className="text-gray-700 leading-relaxed mb-4 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Information */}
        <div className="mt-16 bg-gradient-orange rounded-2xl p-8 text-white">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/20 rounded-full">
                <Phone className="w-12 h-12 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-6">Liên hệ với chúng tôi</h3>
            <p className="text-lg text-orange-100 mb-8">
              Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật này, vui lòng liên hệ với chúng tôi
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/10 rounded-xl p-6 hover-lift">
                <Phone className="w-8 h-8 text-white mb-4 mx-auto" />
                <h4 className="font-semibold mb-2">Điện thoại hỗ trợ</h4>
                <p className="text-orange-100">0969 979 333</p>
                <p className="text-orange-100">0926.682.682</p>
              </div>
              <div className="bg-white/10 rounded-xl p-6 hover-lift">
                <Mail className="w-8 h-8 text-white mb-4 mx-auto" />
                <h4 className="font-semibold mb-2">Email</h4>
                <p className="text-orange-100">hai.nguyendai@thaiduongpaint.vn</p>
              </div>
            </div>
          </div>
        </div>

        {/* Warning Notice */}
        <div className="mt-12 bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-semibold text-red-800 mb-2">Lưu ý quan trọng</h4>
              <p className="text-red-700">
                Ban quản lý Nesty không chịu trách nhiệm cũng như không giải quyết mọi khiếu nại có liên quan đến quyền lợi của người dùng nếu xét thấy tất cả thông tin cá nhân cung cấp ban đầu là không chính xác.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;