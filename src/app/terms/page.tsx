import React from 'react';
import { CheckCircle, Shield, CreditCard, AlertCircle, Users, Clock } from 'lucide-react';

export default function TermsOfService() {
    const sections = [
        {
            id: 'introduction',
            title: '1. Giới thiệu',
            icon: <Users className="w-6 h-6" />,
            content: `Chào mừng quý khách hàng đến với website chúng tôi.

Khi quý khách hàng truy cập vào trang website của chúng tôi có nghĩa là quý khách đồng ý với các điều khoản này. Trang web có quyền thay đổi, chỉnh sửa, thêm hoặc lược bỏ bất kỳ phần nào trong Điều khoản mua bán hàng hóa này, vào bất cứ lúc nào. Các thay đổi có hiệu lực ngay khi được đăng trên trang web mà không cần thông báo trước.

Quý khách hàng vui lòng kiểm tra thường xuyên để cập nhật những thay đổi của chúng tôi.`
        },
        {
            id: 'usage',
            title: '2. Hướng dẫn sử dụng website',
            icon: <Shield className="w-6 h-6" />,
            content: `Khi vào web của chúng tôi, khách hàng phải đảm bảo đủ 18 tuổi, hoặc truy cập dưới sự giám sát của cha mẹ hay người giám hộ hợp pháp. Khách hàng đảm bảo có đầy đủ hành vi dân sự để thực hiện các giao dịch mua bán hàng hóa theo quy định hiện hành của pháp luật Việt Nam.

Trong suốt quá trình đăng ký, quý khách đồng ý nhận email quảng cáo từ website. Nếu không muốn tiếp tục nhận mail, quý khách có thể từ chối bằng cách nhấp vào đường link ở dưới cùng trong mọi email quảng cáo.`
        },
        {
            id: 'payment',
            title: '3. Thanh toán an toàn và tiện lợi',
            icon: <CreditCard className="w-6 h-6" />,
            content: 'Người mua có thể tham khảo các phương thức thanh toán sau đây và lựa chọn áp dụng phương thức phù hợp:'
        }
    ];

    const paymentMethods = [
        {
            title: 'Thanh toán trực tiếp',
            description: 'Người mua nhận hàng tại địa chỉ người bán',
            icon: '🏪'
        },
        {
            title: 'Thanh toán COD',
            description: 'Giao hàng và thu tiền tận nơi',
            icon: '🚚'
        },
        {
            title: 'Thanh toán online',
            description: 'Qua thẻ tín dụng, chuyển khoản',
            icon: '💳'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
            {/* Header */}
            <div className="bg-gradient-orange text-white py-16 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 animate-pulse-orange">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-float">
                        Điều khoản dịch vụ
                    </h1>
                    <p className="text-xl opacity-90 max-w-2xl mx-auto">
                        Vui lòng đọc kỹ các điều khoản và điều kiện sử dụng dịch vụ của chúng tôi
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Important Notice */}
                <div className="bg-orange-100 border-l-4 border-orange-500 p-6 mb-8 rounded-r-lg hover-lift">
                    <div className="flex items-start">
                        <AlertCircle className="w-6 h-6 text-orange-600 mt-1 mr-3 flex-shrink-0" />
                        <div>
                            <h3 className="text-orange-800 font-semibold mb-2">Lưu ý quan trọng</h3>
                            <p className="text-orange-700">
                                Bằng việc sử dụng website của chúng tôi, bạn đã đồng ý tuân thủ tất cả các điều khoản và điều kiện được quy định dưới đây.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Last Updated */}
                <div className="flex items-center justify-center mb-12 text-gray-600">
                    <Clock className="w-5 h-5 mr-2" />
                    <span>Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</span>
                </div>

                {/* Sections */}
                <div className="space-y-8">
                    {sections.map((section, index) => (
                        <div key={section.id} className="bg-white rounded-xl shadow-lg p-8 hover-lift">
                            <div className="flex items-center mb-6">
                                <div className="bg-gradient-orange text-white p-3 rounded-xl mr-4 animate-glow">
                                    {section.icon}
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {section.title}
                                </h2>
                            </div>

                            <div className="prose prose-lg max-w-none">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                    {section.content}
                                </p>

                                {/* Payment Methods Section */}
                                {section.id === 'payment' && (
                                    <div className="mt-8 grid md:grid-cols-3 gap-6">
                                        {paymentMethods.map((method, idx) => (
                                            <div key={idx} className="bg-gradient-orange-light p-6 rounded-xl border-2 border-orange-200 hover:border-orange-300 transition-all duration-300 hover-lift">
                                                <div className="text-3xl mb-3">{method.icon}</div>
                                                <h4 className="font-semibold text-orange-800 mb-2">
                                                    Cách {idx + 1}: {method.title}
                                                </h4>
                                                <p className="text-orange-700 text-sm">
                                                    {method.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact Section */}
                <div className="mt-16 bg-gradient-orange-dark text-white rounded-xl p-8 text-center">
                    <h3 className="text-2xl font-bold mb-4">Có thắc mắc?</h3>
                    <p className="mb-6 opacity-90">
                        Nếu bạn có bất kỳ câu hỏi nào về các điều khoản này, vui lòng liên hệ với chúng tôi.
                    </p>
                </div>
            </div>
        </div>
    );
}