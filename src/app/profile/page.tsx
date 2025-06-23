'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    ShoppingBag,
    Heart,
    Clock,
    CreditCard,
    Bell,
    Shield,
    Settings,
    LogOut,
    Camera,
    Edit,
    Check,
    X,
    Package,
    TrendingUp,
    Award,
    Gift
} from 'lucide-react';

import { OrderStats } from '@/types/OrderStats';

interface UserProfile {
    full_name: string;
    email: string;
    phone: string;
    address: string;
    date_of_birth: string;
    avatar_url: string;
}


export default function ProfilePage() {
    const router = useRouter();
    const { user, logout } = useAuth();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [profile, setProfile] = useState<UserProfile>({
        full_name: '',
        email: '',
        phone: '',
        address: '',
        date_of_birth: '',
        avatar_url: ''
    });

    const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);

    const [orderStats, setOrderStats] = useState<OrderStats>({
        total_orders: 0,
        total_spent: 0,
        pending_orders: 0,
        completed_orders: 0
    });

    // Check authentication
    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

    // Fetch user profile
    useEffect(() => {
        if (user) {
            fetchUserProfile();
            fetchOrderStats();
        }
    }, [user]);

    const fetchUserProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user?.id)
                .single();

            if (error) throw error;

            if (data) {
                const profileData = {
                    full_name: data.full_name || '',
                    email: user?.email || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    date_of_birth: data.date_of_birth || '',
                    avatar_url: data.avatar_url || ''
                };
                setProfile(profileData);
                setEditedProfile(profileData);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderStats = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', user?.id);

            if (error) throw error;

            if (data) {
                const stats = {
                    total_orders: data.length,
                    total_spent: data.reduce((sum, order) => sum + (order.total || 0), 0),
                    pending_orders: data.filter(order => order.status === 'pending').length,
                    completed_orders: data.filter(order => order.status === 'completed').length
                };
                setOrderStats(stats);
            }
        } catch (error) {
            console.error('Error fetching order stats:', error);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user?.id,
                    full_name: editedProfile.full_name,
                    phone: editedProfile.phone,
                    address: editedProfile.address,
                    date_of_birth: editedProfile.date_of_birth,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            setProfile(editedProfile);
            setIsEditing(false);
            setSuccessMessage('Cập nhật thông tin thành công!');

            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setErrorMessage('Có lỗi xảy ra khi cập nhật thông tin');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setEditedProfile(profile);
        setIsEditing(false);
    };

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getMembershipLevel = () => {
        const spent = orderStats.total_spent;
        if (spent >= 10000000) return { level: 'Diamond', color: 'from-purple-500 to-pink-500', icon: '💎' };
        if (spent >= 5000000) return { level: 'Gold', color: 'from-yellow-500 to-amber-500', icon: '🏆' };
        if (spent >= 1000000) return { level: 'Silver', color: 'from-gray-400 to-gray-500', icon: '🥈' };
        return { level: 'Bronze', color: 'from-orange-400 to-orange-500', icon: '🥉' };
    };

    const membership = getMembershipLevel();

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-orange-50/30">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Tài khoản của tôi</h1>
                    <p className="text-gray-600">Quản lý thông tin cá nhân và đơn hàng của bạn</p>
                </div>

                {/* Success/Error Messages */}
                {successMessage && (
                    <Alert className="mb-6 border-green-200 bg-green-50">
                        <Check className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
                    </Alert>
                )}

                {errorMessage && (
                    <Alert className="mb-6 border-red-200 bg-red-50">
                        <X className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-700">{errorMessage}</AlertDescription>
                    </Alert>
                )}

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                            <CardContent className="p-6">
                                {/* User Avatar & Info */}
                                <div className="text-center mb-6">
                                    <div className="relative inline-block mb-4">
                                        <Avatar className="w-24 h-24">
                                            <AvatarImage src={profile.avatar_url} />
                                            <AvatarFallback className="bg-gradient-orange text-white text-2xl">
                                                {getInitials(profile.full_name || 'U')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <button className="absolute bottom-0 right-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white hover:bg-orange-600 transition-colors">
                                            <Camera className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <h3 className="font-semibold text-lg text-gray-800">{profile.full_name || 'Người dùng'}</h3>
                                    <p className="text-sm text-gray-600 mb-3">{profile.email}</p>

                                    {/* Membership Badge */}
                                    <Badge className={`bg-gradient-to-r ${membership.color} text-white px-3 py-1`}>
                                        {membership.icon} {membership.level} Member
                                    </Badge>
                                </div>

                                <Separator className="my-6" />

                                {/* Navigation Menu */}
                                <nav className="space-y-2">
                                    <button
                                        onClick={() => setActiveTab('overview')}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${activeTab === 'overview'
                                                ? 'bg-orange-100 text-orange-600'
                                                : 'hover:bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        <User className="w-4 h-4" />
                                        <span className="font-medium">Tổng quan</span>
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('orders')}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${activeTab === 'orders'
                                                ? 'bg-orange-100 text-orange-600'
                                                : 'hover:bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        <ShoppingBag className="w-4 h-4" />
                                        <span className="font-medium">Đơn hàng</span>
                                        {orderStats.pending_orders > 0 && (
                                            <Badge className="ml-auto bg-orange-500 text-white text-xs">
                                                {orderStats.pending_orders}
                                            </Badge>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('wishlist')}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${activeTab === 'wishlist'
                                                ? 'bg-orange-100 text-orange-600'
                                                : 'hover:bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        <Heart className="w-4 h-4" />
                                        <span className="font-medium">Yêu thích</span>
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('addresses')}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${activeTab === 'addresses'
                                                ? 'bg-orange-100 text-orange-600'
                                                : 'hover:bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        <MapPin className="w-4 h-4" />
                                        <span className="font-medium">Địa chỉ</span>
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('settings')}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${activeTab === 'settings'
                                                ? 'bg-orange-100 text-orange-600'
                                                : 'hover:bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        <Settings className="w-4 h-4" />
                                        <span className="font-medium">Cài đặt</span>
                                    </button>

                                    <Separator className="my-2" />

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-red-50 text-red-600 transition-all"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span className="font-medium">Đăng xuất</span>
                                    </button>
                                </nav>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* Stats Cards */}
                                <div className="grid md:grid-cols-4 gap-4">
                                    <Card className="border-0 shadow-md rounded-2xl">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                                    <ShoppingBag className="w-6 h-6 text-orange-600" />
                                                </div>
                                                <TrendingUp className="w-4 h-4 text-green-500" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-800">{orderStats.total_orders}</h3>
                                            <p className="text-sm text-gray-600">Tổng đơn hàng</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-0 shadow-md rounded-2xl">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                                    <CreditCard className="w-6 h-6 text-green-600" />
                                                </div>
                                                <TrendingUp className="w-4 h-4 text-green-500" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-800">
                                                {orderStats.total_spent.toLocaleString('vi-VN')}đ
                                            </h3>
                                            <p className="text-sm text-gray-600">Tổng chi tiêu</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-0 shadow-md rounded-2xl">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                                    <Clock className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <Badge className="bg-blue-500 text-white text-xs">
                                                    {orderStats.pending_orders}
                                                </Badge>
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-800">{orderStats.pending_orders}</h3>
                                            <p className="text-sm text-gray-600">Đang xử lý</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-0 shadow-md rounded-2xl">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                                    <Award className="w-6 h-6 text-purple-600" />
                                                </div>
                                                <Gift className="w-4 h-4 text-purple-500" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-800">2,850</h3>
                                            <p className="text-sm text-gray-600">Điểm thưởng</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Profile Information */}
                                <Card className="border-0 shadow-lg rounded-2xl">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-xl font-semibold">Thông tin cá nhân</CardTitle>
                                            {!isEditing ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setIsEditing(true)}
                                                    className="border-orange-300 text-orange-600 hover:bg-orange-50"
                                                >
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Chỉnh sửa
                                                </Button>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={handleSaveProfile}
                                                        disabled={saving}
                                                        className="bg-gradient-orange hover:bg-gradient-orange-dark text-white"
                                                    >
                                                        {saving ? (
                                                            <div className="flex items-center">
                                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                                Đang lưu...
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <Check className="w-4 h-4 mr-2" />
                                                                Lưu
                                                            </>
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleCancelEdit}
                                                        disabled={saving}
                                                    >
                                                        <X className="w-4 h-4 mr-2" />
                                                        Hủy
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700 mb-2">Họ và tên</Label>
                                                {isEditing ? (
                                                    <Input
                                                        value={editedProfile.full_name}
                                                        onChange={(e) => setEditedProfile({ ...editedProfile, full_name: e.target.value })}
                                                        className="rounded-xl border-orange-200 focus:border-orange-500"
                                                    />
                                                ) : (
                                                    <p className="text-gray-800">{profile.full_name || '-'}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label className="text-sm font-medium text-gray-700 mb-2">Email</Label>
                                                <p className="text-gray-800">{profile.email}</p>
                                            </div>

                                            <div>
                                                <Label className="text-sm font-medium text-gray-700 mb-2">Số điện thoại</Label>
                                                {isEditing ? (
                                                    <Input
                                                        value={editedProfile.phone}
                                                        onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                                                        className="rounded-xl border-orange-200 focus:border-orange-500"
                                                        placeholder="Nhập số điện thoại"
                                                    />
                                                ) : (
                                                    <p className="text-gray-800">{profile.phone || '-'}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label className="text-sm font-medium text-gray-700 mb-2">Ngày sinh</Label>
                                                {isEditing ? (
                                                    <Input
                                                        type="date"
                                                        value={editedProfile.date_of_birth}
                                                        onChange={(e) => setEditedProfile({ ...editedProfile, date_of_birth: e.target.value })}
                                                        className="rounded-xl border-orange-200 focus:border-orange-500"
                                                    />
                                                ) : (
                                                    <p className="text-gray-800">
                                                        {profile.date_of_birth
                                                            ? new Date(profile.date_of_birth).toLocaleDateString('vi-VN')
                                                            : '-'
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium text-gray-700 mb-2">Địa chỉ</Label>
                                            {isEditing ? (
                                                <Input
                                                    value={editedProfile.address}
                                                    onChange={(e) => setEditedProfile({ ...editedProfile, address: e.target.value })}
                                                    className="rounded-xl border-orange-200 focus:border-orange-500"
                                                    placeholder="Nhập địa chỉ"
                                                />
                                            ) : (
                                                <p className="text-gray-800">{profile.address || '-'}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium text-gray-700 mb-2">Ngày tham gia</Label>
                                            <p className="text-gray-800">
                                                {user?.created_at
                                                    ? new Date(user.created_at).toLocaleDateString('vi-VN')
                                                    : '-'
                                                }
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Security Settings */}
                                <Card className="border-0 shadow-lg rounded-2xl">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-orange-600" />
                                            Bảo mật tài khoản
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                            <div>
                                                <h4 className="font-medium text-gray-800">Mật khẩu</h4>
                                                <p className="text-sm text-gray-600">Đổi mật khẩu định kỳ để bảo vệ tài khoản</p>
                                            </div>
                                            <Button variant="outline" size="sm" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                                                Đổi mật khẩu
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                            <div>
                                                <h4 className="font-medium text-gray-800">Xác thực 2 bước</h4>
                                                <p className="text-sm text-gray-600">Thêm lớp bảo mật cho tài khoản của bạn</p>
                                            </div>
                                            <Button variant="outline" size="sm" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                                                Bật
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <Card className="border-0 shadow-lg rounded-2xl">
                                <CardHeader>
                                    <CardTitle>Lịch sử đơn hàng</CardTitle>
                                    <CardDescription>Xem và quản lý các đơn hàng của bạn</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-12">
                                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">Bạn chưa có đơn hàng nào</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {activeTab === 'wishlist' && (
                            <Card className="border-0 shadow-lg rounded-2xl">
                                <CardHeader>
                                    <CardTitle>Sản phẩm yêu thích</CardTitle>
                                    <CardDescription>Danh sách sản phẩm bạn đã lưu</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-12">
                                        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">Chưa có sản phẩm yêu thích</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {activeTab === 'addresses' && (
                            <Card className="border-0 shadow-lg rounded-2xl">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Sổ địa chỉ</CardTitle>
                                            <CardDescription>Quản lý địa chỉ giao hàng của bạn</CardDescription>
                                        </div>
                                        <Button className="bg-gradient-orange hover:bg-gradient-orange-dark text-white">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            Thêm địa chỉ
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-12">
                                        <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">Chưa có địa chỉ nào được lưu</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {activeTab === 'settings' && (
                            <Card className="border-0 shadow-lg rounded-2xl">
                                <CardHeader>
                                    <CardTitle>Cài đặt tài khoản</CardTitle>
                                    <CardDescription>Tùy chỉnh trải nghiệm của bạn</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                            <Bell className="w-5 h-5 text-orange-600" />
                                            Thông báo
                                        </h3>

                                        <div className="space-y-3">
                                            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                                                <div>
                                                    <p className="font-medium text-gray-800">Chia sẻ hoạt động mua sắm</p>
                                                    <p className="text-sm text-gray-600">Hiển thị sản phẩm bạn đã mua cho bạn bè</p>
                                                </div>
                                                <input type="checkbox" className="toggle" />
                                            </label>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="p-4 bg-red-50 rounded-xl">
                                        <h4 className="font-semibold text-red-700 mb-2">Xóa tài khoản</h4>
                                        <p className="text-sm text-red-600 mb-3">
                                            Sau khi xóa tài khoản, bạn sẽ không thể khôi phục lại dữ liệu.
                                        </p>
                                        <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100">
                                            Xóa tài khoản vĩnh viễn
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
        .toggle {
          position: relative;
          width: 48px;
          height: 24px;
          -webkit-appearance: none;
          appearance: none;
          background: #ddd;
          outline: none;
          border-radius: 20px;
          cursor: pointer;
          transition: 0.3s;
        }

        .toggle:checked {
          background: #f97316;
        }

        .toggle:before {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          top: 2px;
          left: 2px;
          background: white;
          transition: 0.3s;
        }

        .toggle:checked:before {
          left: 26px;
        }
      `}</style>
        </div>
    );
}