'use client';

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    LogIn,
    ShoppingBag,
    Star,
    Sparkles,
    ArrowRight,
    AlertCircle
} from "lucide-react";

import Lottie from "lottie-react";
import shoppingAnimation from "@/data/animations/shopping.json";


export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        } else {
            router.push("/");
        }

        setIsLoading(false);
    };

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        });

        if (error) {
            setError(error.message);
        }
    };

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

            <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center mb-21">
                {/* Left Side - Branding */}
                <div className="hidden lg:block relative">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-16 h-16 bg-gradient-orange rounded-2xl flex items-center justify-center shadow-lg">
                                <ShoppingBag className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-800">Nesty</h1>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-4xl font-bold text-gray-800 leading-tight">
                                Chào mừng trở lại!
                                <span className="block text-gradient-orange">Mua sắm thỏa thích</span>
                            </h2>
                            <p className="text-gray-600 text-lg">
                                Đăng nhập để tiếp tục hành trình mua sắm với hàng ngàn sản phẩm chất lượng và ưu đãi hấp dẫn.
                            </p>
                        </div>

                        {/* Features */}
                        <div className="space-y-4 pt-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">Ưu đãi độc quyền</p>
                                    <p className="text-sm text-gray-600">Giảm giá lên đến 50% cho thành viên</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                                    <Star className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">Tích điểm thưởng</p>
                                    <p className="text-sm text-gray-600">Đổi điểm lấy quà hấp dẫn</p>
                                </div>
                            </div>
                        </div>

                        {/* Illustration */}
                        <div className="relative h-64 mt-8">
                            <Lottie animationData={shoppingAnimation} loop={true} style={{ width: 210, height: 210 }} />
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <Card className="w-full max-w-md mx-auto relative backdrop-blur-sm bg-white/90 border-0 shadow-2xl">
                    <CardHeader className="space-y-1 text-center pb-6">
                        <div className="lg:hidden flex justify-center mb-4">
                            <div className="w-16 h-16 bg-gradient-orange rounded-2xl flex items-center justify-center shadow-lg">
                                <ShoppingBag className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-800">
                            Đăng nhập
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                            Nhập thông tin tài khoản để tiếp tục
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {error && (
                            <Alert className="border-red-200 bg-red-50">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <AlertDescription className="text-red-700">
                                    {error}
                                </AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleLogin} className="space-y-4">
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
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 h-12 rounded-xl border-orange-200 focus:border-orange-500 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                        Mật khẩu
                                    </Label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
                                    >
                                        Quên mật khẩu?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Nhập mật khẩu"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
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
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="remember"
                                        checked={rememberMe}
                                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="text-sm text-gray-600 cursor-pointer select-none"
                                    >
                                        Ghi nhớ đăng nhập
                                    </Label>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-gradient-orange hover:bg-gradient-orange-dark text-white font-semibold text-base rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Đang đăng nhập...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <LogIn className="w-4 h-4" />
                                        <span>Đăng nhập</span>
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
                                onClick={handleGoogleLogin}
                                className="w-full h-12 border-gray-200 hover:bg-gray-50 rounded-xl transition-all font-medium"
                            >
                                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Đăng nhập với Google
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-12 border-gray-200 hover:bg-gray-50 rounded-xl transition-all font-medium"
                            >
                                <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                Đăng nhập với Facebook
                            </Button>
                        </div>

                        <div className="text-center space-y-2">
                            <p className="text-sm text-gray-600">
                                Chưa có tài khoản?{" "}
                                <Link
                                    href="/register"
                                    className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                                >
                                    Đăng ký ngay
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