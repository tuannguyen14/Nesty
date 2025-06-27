
'use client';

import { useState } from 'react';
import { Heart, ShoppingCart, Users, Star, Award, Truck, Shield, Headphones, CheckCircle } from 'lucide-react';

type TabKey = 'mission' | 'vision' | 'team';

export default function AboutPage() {
    const [activeTab, setActiveTab] = useState<TabKey>('mission');

    const stats = [
        { number: '10K+', label: 'Khách hàng hài lòng', icon: Users },
        { number: '5M+', label: 'Sản phẩm đã bán', icon: ShoppingCart },
        { number: '4.9/5', label: 'Đánh giá trung bình', icon: Star },
        { number: '99%', label: 'Tỷ lệ hài lòng', icon: Heart }
    ];

    const values = [
        {
            icon: Shield,
            title: 'Chất lượng đảm bảo',
            description: 'Tất cả sản phẩm đều được kiểm tra nghiêm ngặt trước khi đến tay khách hàng'
        },
        {
            icon: Truck,
            title: 'Giao hàng nhanh chóng',
            description: 'Cam kết giao hàng trong 24-48h với dịch vụ vận chuyển uy tín'
        },
        {
            icon: Headphones,
            title: 'Hỗ trợ 24/7',
            description: 'Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ bạn mọi lúc'
        },
        {
            icon: Award,
            title: 'Giá cả hợp lý',
            description: 'Cam kết mang đến sản phẩm chất lượng với mức giá tốt nhất thị trường'
        }
    ];

    const timeline = [
        {
            year: '2018',
            title: 'Khởi đầu',
            description: 'Bắt đầu với một cửa hàng nhỏ và ước mơ mang đến trải nghiệm mua sắm tốt nhất'
        },
        {
            year: '2019',
            title: 'Mở rộng',
            description: 'Ra mắt website và bắt đầu bán hàng online, phục vụ khách hàng toàn quốc'
        },
        {
            year: '2021',
            title: 'Phát triển',
            description: 'Đạt mốc 1000 đơn hàng đầu tiên và mở rộng danh mục sản phẩm'
        },
        {
            year: '2023',
            title: 'Hiện tại',
            description: 'Trở thành một trong những nền tảng thương mại điện tử uy tín với hàng nghìn sản phẩm'
        }
    ];

    const tabContent: Record<TabKey, { title: string; content: string }> = {
        mission: {
            title: 'Sứ mệnh của chúng tôi',
            content: 'Nesty muốn trở thành một công ty hàng đầu trong lĩnh vực sản xuất và thiết kế giày, dép. Chúng tôi hướng đến mục tiêu bền vững vì vậy không ngừng nâng cao chất lượng sản phẩm để mang lại những trải nghiệm tốt nhất cho khách hàng. Chúng tôi tin rằng việc duy trì một quy trình sản xuất đạt chuẩn quốc tế và và liên tục đổi mới sẽ là chìa khóa để thành công.'
        },
        vision: {
            title: 'Tầm nhìn của chúng tôi',
            content: 'Chúng tôi hướng tới việc trở thành nền tảng thương mại điện tử hàng đầu, nơi khách hàng có thể tìm thấy mọi thứ họ cần với chất lượng tốt nhất. Chúng tôi muốn xây dựng một cộng đồng mua sắm lành mạnh và bền vững.'
        },
        team: {
            title: 'Đội ngũ của chúng tôi',
            content: 'Đội ngũ của chúng tôi bao gồm những chuyên gia giàu kinh nghiệm trong lĩnh vực thương mại điện tử, công nghệ và dịch vụ khách hàng. Chúng tôi luôn nỗ lực không ngừng để mang đến trải nghiệm tốt nhất cho khách hàng.'
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
            {/* Hero Section */}
            <section className="relative py-20 px-6 text-center bg-gradient-orange text-white overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative max-w-4xl mx-auto">
                    <div className="animate-float mb-8">
                        <div className="w-24 h-24 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <Heart className="w-12 h-12 text-white animate-pulse-orange" />
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
                        Về Chúng Tôi
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 opacity-95 max-w-2xl mx-auto">
                        Chào mừng bạn đến với câu chuyện của chúng tôi - hành trình mang đến trải nghiệm mua sắm tuyệt vời nhất
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <div className="px-6 py-3 bg-white/20 rounded-full backdrop-blur-sm">
                            <span className="text-sm font-medium">✨ Uy tín</span>
                        </div>
                        <div className="px-6 py-3 bg-white/20 rounded-full backdrop-blur-sm">
                            <span className="text-sm font-medium">🚀 Chất lượng</span>
                        </div>
                        <div className="px-6 py-3 bg-white/20 rounded-full backdrop-blur-sm">
                            <span className="text-sm font-medium">💎 Dịch vụ tốt</span>
                        </div>
                    </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute top-20 left-10 w-6 h-6 bg-white/20 rounded-full animate-float" style={{ animationDelay: '0s' }}></div>
                <div className="absolute top-32 right-16 w-4 h-4 bg-white/30 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-20 left-20 w-8 h-8 bg-white/15 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-32 right-12 w-5 h-5 bg-white/25 rounded-full animate-float" style={{ animationDelay: '1.5s' }}></div>
            </section>

            {/* Stats Section */}
            <section className="py-16 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center group hover-lift">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-orange rounded-2xl flex items-center justify-center animate-glow">
                                    <stat.icon className="w-8 h-8 text-white" />
                                </div>
                                <div className="text-3xl md:text-4xl font-bold text-gradient-orange mb-2">
                                    {stat.number}
                                </div>
                                <div className="text-gray-600 font-medium">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tab Section */}
            <section className="py-16 px-6 bg-gradient-orange-light">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Tìm hiểu thêm về chúng tôi
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Khám phá câu chuyện, giá trị và con người đằng sau thành công của chúng tôi
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                        <div className="flex border-b border-orange-100">
                            {(Object.keys(tabContent) as TabKey[]).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-300 ${activeTab === tab
                                        ? 'bg-gradient-orange text-white'
                                        : 'text-gray-600 hover:bg-orange-50'
                                        }`}
                                >
                                    {tab === 'mission' && 'Sứ mệnh'}
                                    {tab === 'vision' && 'Tầm nhìn'}
                                    {tab === 'team' && 'Đội ngũ'}
                                </button>
                            ))}
                        </div>

                        <div className="p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                {tabContent[activeTab].title}
                            </h3>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                {tabContent[activeTab].content}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-16 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Giá trị cốt lõi
                        </h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Sự sáng tạo: Mỗi sản phẩm sẽ là một sự sáng tạo trong thiết kế. “DN” luôn mong muốn mang đến nhiều sự lựa chọn Biết ơn: Những góp ý, phản hồi của khách hàng sẽ mang tính xây dựng trong suốt quá trình phát triển và là tài sản quý giá mà Nesty nhận được. Chúng tôi sẽ cố gắng cải tiến và hoàn thiện mỗi ngày. Chất lượng: Sự chăm sóc đặc biệt đến các chi tiết, vật liệu và quy trình sản xuất có thể giúp doanh nghiệp tạo ra sản phẩm độc đáo và có giá trị thị trường.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <div key={index} className="bg-gradient-orange-light p-8 rounded-3xl hover-lift group">
                                <div className="w-16 h-16 mb-6 bg-gradient-orange rounded-2xl flex items-center justify-center group-hover:animate-glow">
                                    <value.icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {value.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline Section */}
            <section className="py-16 px-6 bg-gradient-to-r from-orange-50 to-orange-100">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Hành trình của chúng tôi
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Từ những bước đầu khiêm tốn đến thành công như ngày hôm nay
                        </p>
                    </div>

                    <div className="relative">
                        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-orange"></div>

                        {timeline.map((item, index) => (
                            <div key={index} className="relative flex items-start mb-12 last:mb-0">
                                <div className="flex-shrink-0 w-16 h-16 bg-gradient-orange rounded-full flex items-center justify-center animate-pulse-orange">
                                    <CheckCircle className="w-8 h-8 text-white" />
                                </div>
                                <div className="ml-8 bg-white p-6 rounded-2xl shadow-lg hover-lift flex-1">
                                    <div className="text-sm font-bold text-orange-600 mb-1">
                                        {item.year}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-600">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}