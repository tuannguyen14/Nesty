import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
    return (
        <footer className="bg-card border-t border-border mt-auto">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-foreground">
                            Về Chúng Tôi
                        </h3>
                        <div className="text-muted-foreground space-y-2 text-sm">
                            <p>Nesty là một thương hiệu giày chính hãng được thiết kế và sản xuất tại Việt Nam</p>
                            <p>Chuyên cung cấp các sản phẩm chất lượng cao</p>
                            <p>Phục vụ khách hàng từ năm 2020</p>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-foreground">
                            Thông Tin Liên Hệ
                        </h3>
                        <div className="text-muted-foreground space-y-2 text-sm">
                            <div className="flex items-start space-x-2">
                                <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                <span>Lô A9,A10,A11 đường N5 KCN Nam Tân Uyên mở rộng, P. Hội Nghĩa, TP Tân Uyên, Bình Dương</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                                <span>1800 282 279</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                                <span>marketing@taiyangshoes.com.vn</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6s.792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.285 1.625 0 2.1C7.721 9.216 8.768 10 10 10s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029C11.792 7.807 11.304 8 11 8s-.792-.193-1.264-.979a1 1 0 00-1.715 1.029C8.721 9.216 9.768 10 10 10z" clipRule="evenodd" />
                                </svg>
                                <span>https://www.nesty.com.vn/</span>
                            </div>
                        </div>
                    </div>

                    {/* Customer Support */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-foreground">
                            Hỗ Trợ Khách Hàng
                        </h3>
                        <div className="space-y-2">
                            <Link
                                href="/return-policy"
                                className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                            >
                                Chính Sách Đổi Trả
                            </Link>
                        </div>
                    </div>

                    {/* Legal & Social */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-foreground">
                            Pháp Lý & Kết Nối
                        </h3>
                        <div className="space-y-2">
                            <Link
                                href="/terms"
                                className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                            >
                                Điều Khoản Sử Dụng
                            </Link>
                            <Link
                                href="/privacy"
                                className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                            >
                                Chính Sách Bảo Mật
                            </Link>
                        </div>

                        {/* Social Media */}
                        <div className="flex space-x-3 mt-4">
                            <Link
                                href="https://facebook.com"
                                className="p-2 bg-secondary hover:bg-primary text-secondary-foreground hover:text-primary-foreground rounded-lg transition-all duration-200 hover-lift"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </Link>
                            <Link
                                href="https://instagram.com"
                                className="p-2 bg-secondary hover:bg-primary text-secondary-foreground hover:text-primary-foreground rounded-lg transition-all duration-200 hover-lift"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.988 11.988 11.988s11.987-5.367 11.987-11.988C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.291C3.85 14.408 3.014 12.748 3.014 10.5c0-2.249.836-3.908 2.112-5.197.875-.801 2.026-1.291 3.323-1.291 1.297 0 2.448.49 3.323 1.291 1.276 1.289 2.112 2.948 2.112 5.197 0 2.248-.836 3.908-2.112 5.197-.875.801-2.026 1.291-3.323 1.291z" />
                                </svg>
                            </Link>
                            <Link
                                href="https://youtube.com"
                                className="p-2 bg-secondary hover:bg-primary text-secondary-foreground hover:text-primary-foreground rounded-lg transition-all duration-200 hover-lift"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Ministry Certification */}
                <div className="mt-8 pt-8 border-t border-border">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-4 md:mb-0">
                            <Link
                                href="http://online.gov.vn/Home/WebDetails/113259"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block hover-lift"
                            >
                                <Image
                                    src="/bocongthuong/logoSaleNoti.png"
                                    alt="Đã thông báo với Bộ Công Thương"
                                    width={150}
                                    height={60}
                                    className="h-auto"
                                    priority={false}
                                    style={{ width: "auto", height: "auto" }}
                                />
                            </Link>
                        </div>

                        <div className="text-center md:text-right">
                            <p className="text-sm text-muted-foreground mb-1">
                                Mã số thuế: 3703093370
                            </p>
                            <p className="text-sm text-muted-foreground mb-1">
                                Giấy phép kinh doanh số: 0340890020
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Copyright */}
            <div className="bg-secondary border-t border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
                        <p>
                            Copyright © 2025 Cửa Hàng Giày Dép Nesty.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;