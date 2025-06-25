'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    UserPlus,
    User,
    CheckCircle,
    Gift,
    Zap,
    ShieldCheck,
    ArrowRight,
    AlertCircle,
} from "lucide-react";

import Lottie from "lottie-react";
import shoppingAnimation from "@/data/animations/shopping.json";
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && user) {
            router.push('/');
        }
    }, [user, loading, router]);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [agreeTerms, setAgreeTerms] = useState(false);

    const checkPasswordStrength = (password: string) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return Math.min(strength, 5);
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (field === 'password') {
            setPasswordStrength(checkPasswordStrength(value));
        }

        // Clear errors when user starts typing
        if (error) setError('');
        if (success) setSuccess('');
    };

    const validateForm = () => {
        if (!formData.fullName.trim()) {
            setError('Vui lòng nhập họ và tên');
            return false;
        }

        if (!formData.email) {
            setError('Vui lòng nhập email');
            return false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Email không hợp lệ');
            return false;
        }

        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return false;
        }

        if (!agreeTerms) {
            setError('Vui lòng đồng ý với điều khoản sử dụng');
            return false;
        }

        return true;
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            // Đăng ký với Supabase Auth
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName
                    }
                }
            });

            if (error) {
                // Handle specific Supabase errors
                if (error.message.includes('User already registered')) {
                    setError('Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.');
                } else if (error.message.includes('Invalid email')) {
                    setError('Email không hợp lệ');
                } else if (error.message.includes('Password')) {
                    setError('Mật khẩu không đủ mạnh');
                } else {
                    setError(error.message || 'Có lỗi xảy ra khi đăng ký');
                }
                return;
            }

            if (data.user) {
                if (data.user.email_confirmed_at) {
                    // Auto confirmed - redirect to login
                    setSuccess('Đăng ký thành công! Đang chuyển hướng...');
                    setTimeout(() => {
                        // router.push('/login?message=Đăng ký thành công! Vui lòng đăng nhập.');
                        router.push('/');
                    }, 2000);
                } else {
                    // Email confirmation required
                    setSuccess('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');

                    // Reset form
                    setFormData({
                        fullName: '',
                        email: '',
                        password: '',
                        confirmPassword: ''
                    });
                    setAgreeTerms(false);
                }
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError('Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setError('');

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            });

            if (error) {
                setError('Không thể đăng ký với Google. Vui lòng thử lại.');
            }
        } catch (err) {
            console.error('Google signup error:', err);
            setError('Có lỗi xảy ra với đăng ký Google');
        }
    };

    const handleFacebookSignUp = async () => {
        setError('');

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'facebook',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            });

            if (error) {
                setError('Không thể đăng ký với Facebook. Vui lòng thử lại.');
            }
        } catch (err) {
            console.error('Facebook signup error:', err);
            setError('Có lỗi xảy ra với đăng ký Facebook');
        }
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength <= 2) return 'bg-red-500';
        if (passwordStrength <= 3) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength === 0) return '';
        if (passwordStrength <= 2) return 'Yếu';
        if (passwordStrength <= 3) return 'Trung bình';
        return 'Mạnh';
    };

    // Show loading while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
                <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600">Đang tải...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 p-4">
            {/* Background decorative elements */}
            <div className="fixed inset-0 overflow-hidden -z-10">
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-r from-orange-300 to-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-r from-amber-300 to-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-orange-200 to-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500"></div>
                <div className="absolute top-1/4 -right-32 w-64 h-64 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse delay-300"></div>
                <div className="absolute bottom-1/4 -left-32 w-64 h-64 bg-gradient-to-r from-amber-300 to-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse delay-700"></div>
            </div>

            <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
                {/* Left Side - Branding */}
                <div className="hidden lg:block relative">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-16 h-16 bg-gradient-orange rounded-2xl flex items-center justify-center shadow-lg">
                                <UserPlus className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-800">Nesty</h1>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-4xl font-bold text-gray-800 leading-tight">
                                Tham gia cùng chúng tôi
                                <span className="block text-gradient-orange">Khởi đầu hành trình mua sắm</span>
                            </h2>
                            <p className="text-gray-600 text-lg">
                                Đăng ký thành viên để nhận được những ưu đãi độc quyền và trải nghiệm mua sắm tuyệt vời nhất.
                            </p>
                        </div>

                        {/* Benefits */}
                        <div className="space-y-4 pt-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                                    <Gift className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">Quà tặng chào mừng</p>
                                    <p className="text-sm text-gray-600">Voucher 100k cho đơn hàng đầu tiên</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">Ưu đãi sớm</p>
                                    <p className="text-sm text-gray-600">Nhận thông báo sale trước 24h</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                                    <ShieldCheck className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">Bảo mật tuyệt đối</p>
                                    <p className="text-sm text-gray-600">Thông tin được mã hóa an toàn</p>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 pt-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600">50K+</div>
                                <div className="text-sm text-gray-600">Thành viên</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600">1000+</div>
                                <div className="text-sm text-gray-600">Sản phẩm</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600">99%</div>
                                <div className="text-sm text-gray-600">Hài lòng</div>
                            </div>
                        </div>

                        {/* Illustration */}
                        <div className="relative h-64 mt-8">
                            <Lottie animationData={shoppingAnimation} loop={true} style={{ width: 210, height: 210 }} />
                        </div>
                    </div>
                </div>

                {/* Right Side - Register Form */}
                <Card className="w-full max-w-md mx-auto relative backdrop-blur-sm bg-white/90 border-0 shadow-2xl">
                    <CardHeader className="space-y-1 text-center pb-6">
                        <div className="lg:hidden flex justify-center mb-4">
                            <div className="w-16 h-16 bg-gradient-orange rounded-2xl flex items-center justify-center shadow-lg">
                                <UserPlus className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-800">
                            Tạo tài khoản mới
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                            Điền thông tin để bắt đầu
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Error Alert */}
                        {error && (
                            <Alert className="border-red-200 bg-red-50">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <AlertDescription className="text-red-700">
                                    {error}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Success Alert */}
                        {success && (
                            <Alert className="border-green-200 bg-green-50">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-700">
                                    {success}
                                </AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                                    Họ và tên
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="fullName"
                                        type="text"
                                        placeholder="Nhập họ và tên"
                                        value={formData.fullName}
                                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                                        className="pl-10 h-12 rounded-xl border-orange-200 focus:border-orange-500 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                    Email
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className="pl-10 h-12 rounded-xl border-orange-200 focus:border-orange-500 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                    Mật khẩu
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Tối thiểu 6 ký tự"
                                        value={formData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        className="pl-10 pr-10 h-12 rounded-xl border-orange-200 focus:border-orange-500 transition-all"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>

                                {/* Password Strength Indicator */}
                                {formData.password && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-500">Độ mạnh mật khẩu:</span>
                                            <span className={`font-medium ${passwordStrength <= 2 ? 'text-red-500' :
                                                passwordStrength <= 3 ? 'text-yellow-500' :
                                                    'text-green-500'
                                                }`}>
                                                {getPasswordStrengthText()}
                                            </span>
                                        </div>
                                        <Progress
                                            value={(passwordStrength / 5) * 100}
                                            className="h-2"
                                            indicatorClassName={getPasswordStrengthColor()}
                                        />
                                        <div className="text-xs text-gray-500 space-y-1">
                                            <p className={passwordStrength >= 1 ? 'text-green-600' : ''}>
                                                <CheckCircle className={`inline w-3 h-3 mr-1 ${passwordStrength >= 1 ? 'text-green-600' : 'text-gray-400'}`} />
                                                Ít nhất 8 ký tự
                                            </p>
                                            <p className={/[A-Za-z]/.test(formData.password) && /[0-9]/.test(formData.password) ? 'text-green-600' : ''}>
                                                <CheckCircle className={`inline w-3 h-3 mr-1 ${/[A-Za-z]/.test(formData.password) && /[0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`} />
                                                Chữ cái và số
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                                    Xác nhận mật khẩu
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Nhập lại mật khẩu"
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                        className="pl-10 pr-10 h-12 rounded-xl border-orange-200 focus:border-orange-500 transition-all"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                        <CheckCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start space-x-2">
                                <Checkbox
                                    id="terms"
                                    checked={agreeTerms}
                                    onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                                    className="mt-1 flex-shrink-0"
                                />
                                <Label
                                    htmlFor="terms"
                                    className="text-sm text-gray-600 cursor-pointer leading-relaxed whitespace-nowrap"
                                >
                                    Tôi đồng ý với{" "}
                                    <Link href="/terms" className="text-orange-600 hover:text-orange-700 font-medium">
                                        Điều khoản sử dụng
                                    </Link>
                                    {" "}và{" "}
                                    <Link href="/privacy" className="text-orange-600 hover:text-orange-700 font-medium">
                                        Chính sách bảo mật
                                    </Link>
                                </Label>
                            </div>


                            <Button
                                type="submit"
                                className="w-full h-12 bg-gradient-orange hover:bg-gradient-orange-dark text-white font-semibold text-base rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                                disabled={isLoading || !agreeTerms}
                            >
                                {isLoading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Đang tạo tài khoản...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <UserPlus className="w-4 h-4" />
                                        <span>Tạo tài khoản</span>
                                    </div>
                                )}
                            </Button>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">hoặc</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleGoogleSignUp}
                                disabled={isLoading}
                                className="w-full h-12 border-gray-200 hover:bg-gray-50 rounded-xl transition-all font-medium"
                            >
                                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Đăng ký với Google
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleFacebookSignUp}
                                disabled={isLoading}
                                className="w-full h-12 border-gray-200 hover:bg-gray-50 rounded-xl transition-all font-medium"
                            >
                                <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                Đăng ký với Facebook
                            </Button>
                        </div>

                        <div className="text-center space-y-2">
                            <p className="text-sm text-gray-600">
                                Đã có tài khoản?{" "}
                                <Link
                                    href="/login"
                                    className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                                >
                                    Đăng nhập ngay
                                </Link>
                            </p>
                            <Link
                                href="/"
                                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <ArrowRight className="w-3 h-3 mr-1 rotate-180" />
                                Quay lại trang chủ
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}