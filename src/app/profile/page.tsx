'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
    User,
    ShoppingBag,
    Heart,
    Clock,
    CreditCard,
    Shield,
    Settings,
    LogOut,
    Camera,
    Edit,
    Check,
    X,
    Package,
    TrendingUp,
} from 'lucide-react';

import { OrderStats } from '@/types/orderStats';
import { UserProfile } from '@/types/userProfile';
import { OrderInfo } from '@/types/orderInfo';
import { useSearchParams } from 'next/navigation';

export default function ProfilePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, logout, loading: authLoading } = useAuth();

    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState(() => {
        return searchParams.get('tab') || 'overview';
    });

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [orders, setOrders] = useState<OrderInfo[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    // State cho profile được chỉnh sửa
    const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({
        full_name: '',
        phone: '',
        address: '',
    });

    const [orderStats, setOrderStats] = useState<OrderStats>({
        total_orders: 0,
        total_spent: 0,
        pending_orders: 0,
        completed_orders: 0
    });

    // Helper functions - moved before useEffect hooks
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

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' },
            processing: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-800' },
            shipped: { label: 'Đã gửi hàng', color: 'bg-purple-100 text-purple-800' },
            completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
            cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        return <Badge className={`${config.color} text-xs`}>{config.label}</Badge>;
    };

    const getStatusIcon = (status: string) => {
        const icons = {
            pending: <Clock className="w-4 h-4 text-yellow-600" />,
            processing: <Package className="w-4 h-4 text-blue-600" />,
            shipped: <TrendingUp className="w-4 h-4 text-purple-600" />,
            completed: <Check className="w-4 h-4 text-green-600" />,
            cancelled: <X className="w-4 h-4 text-red-600" />,
        };
        return icons[status as keyof typeof icons] || icons.pending;
    };

    const fetchOrderStats = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', user.id);

            if (error) throw error;

            if (data) {
                const stats = {
                    total_orders: data.length,
                    total_spent: data.reduce((sum, order) => sum + (order.total_amount || 0), 0),
                    pending_orders: data.filter(order => order.status === 'pending').length,
                    completed_orders: data.filter(order => order.status === 'completed').length
                };
                setOrderStats(stats);
            }
        } catch (error) {
            console.error('Error fetching order stats:', error);
        }
    };

    // Function để fetch orders
    const fetchOrders = useCallback(async () => {
        if (!user) return;

        setLoadingOrders(true);
        setErrorMessage(''); // Reset error message

        try {
            let query = supabase
                .from('orders')
                .select(`
                *,
                order_items (
                id,
                quantity,
                price,
                product_variants (
                    id,
                    sku,
                    products (
                    id,
                    name,
                    product_images (
                        image_url,
                        sort_order
                    )
                    )
                )
                )
            `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });



            if (selectedStatus !== 'all') {
                query = query.eq('status', selectedStatus);
            }

            const { data, error } = await query;

            setLoadingOrders(false);

            if (error) throw error;

            const transformedOrders = data?.map(order => ({
                id: order.id,
                order_code: order.order_code,
                user_id: order.user_id,
                status: order.status,
                total_amount: order.total_amount,
                voucher_discount: order.voucher_discount,
                shipping_name: order.shipping_name,
                shipping_address: order.shipping_address,
                shipping_phone: order.shipping_phone,
                shipping_code: order.shipping_code,
                shipping_provider: order.shipping_provider,
                created_at: order.created_at
            })) || [];

            setOrders(transformedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setErrorMessage('Có lỗi xảy ra khi tải danh sách đơn hàng');
        } finally {
            setLoadingOrders(false);
        }
    }, [user?.id, selectedStatus]);

    // Check authentication
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    // Initialize edited profile with user data
    useEffect(() => {
        if (user) {
            setEditedProfile({
                full_name: user.full_name || '',
                phone: user.phone || '',
                address: user.address || '',
            });
            fetchOrderStats();
        }
    }, [user]);

    // Fetch orders when orders tab is active - moved to after all state initialization
    useEffect(() => {
        if (activeTab === 'orders') {
            fetchOrders();
        }
    }, [activeTab, fetchOrders]);


    const handleSaveProfile = async () => {
        if (!user) return;

        setSaving(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const { error } = await supabase
                .from('users')
                .update({
                    full_name: editedProfile.full_name,
                    phone: editedProfile.phone,
                    address: editedProfile.address,
                })
                .eq('id', user.id);

            if (error) throw error;

            setIsEditing(false);
            setSuccessMessage('Cập nhật thông tin thành công!');

            // Refresh auth context để cập nhật user data
            window.location.reload();

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
        if (user) {
            setEditedProfile({
                full_name: user.full_name || '',
                phone: user.phone || '',
                address: user.address || '',
            });
        }
        setIsEditing(false);
    };

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    const handleTabChange = (newTab: string) => {
        setActiveTab(newTab);

        // Chỉ lấy pathname + search, không truyền nguyên URL đầy đủ
        const params = new URLSearchParams(window.location.search);
        params.set('tab', newTab);
        const newPath = `${window.location.pathname}?${params.toString()}`;

        router.replace(newPath, { scroll: false });
    };

    useEffect(() => {
        const tabFromUrl = searchParams.get('tab');
        if (tabFromUrl && ['overview', 'orders', 'wishlist', 'settings'].includes(tabFromUrl)) {
            setActiveTab(tabFromUrl);
        }
    }, [searchParams]);

    const membership = getMembershipLevel();

    if (authLoading || !user) {
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
                                            <AvatarImage src="" />
                                            <AvatarFallback className="bg-gradient-orange text-white text-2xl">
                                                {getInitials(user.full_name || 'U')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <button className="absolute bottom-0 right-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white hover:bg-orange-600 transition-colors">
                                            <Camera className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <h3 className="font-semibold text-lg text-gray-800">{user.full_name || 'Người dùng'}</h3>
                                    <p className="text-sm text-gray-600 mb-3">{user.email}</p>

                                    {/* Membership Badge */}
                                    <Badge className={`bg-gradient-to-r ${membership.color} text-white px-3 py-1`}>
                                        {membership.icon} {membership.level} Member
                                    </Badge>
                                </div>

                                <Separator className="my-6" />

                                {/* Navigation Menu */}
                                <nav className="space-y-2">
                                    <button
                                        onClick={() => handleTabChange('overview')}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${activeTab === 'overview'
                                            ? 'bg-orange-100 text-orange-600'
                                            : 'hover:bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        <User className="w-4 h-4" />
                                        <span className="font-medium">Tổng quan</span>
                                    </button>

                                    <button
                                        onClick={() => handleTabChange('orders')}
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
                                        onClick={() => handleTabChange('wishlist')}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${activeTab === 'wishlist'
                                            ? 'bg-orange-100 text-orange-600'
                                            : 'hover:bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        <Heart className="w-4 h-4" />
                                        <span className="font-medium">Yêu thích</span>
                                    </button>

                                    <button
                                        onClick={() => handleTabChange('settings')}
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
                                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                                    <Check className="w-6 h-6 text-green-600" />
                                                </div>
                                                <TrendingUp className="w-4 h-4 text-green-500" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-800">{orderStats.completed_orders}</h3>
                                            <p className="text-sm text-gray-600">Hoàn thành</p>
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
                                                        value={editedProfile.full_name || ''}
                                                        onChange={(e) => setEditedProfile({ ...editedProfile, full_name: e.target.value })}
                                                        className="rounded-xl border-orange-200 focus:border-orange-500"
                                                        placeholder="Nhập họ và tên"
                                                    />
                                                ) : (
                                                    <p className="text-gray-800">{user.full_name || '-'}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label className="text-sm font-medium text-gray-700 mb-2">Email</Label>
                                                <p className="text-gray-800">{user.email}</p>
                                            </div>

                                            <div>
                                                <Label className="text-sm font-medium text-gray-700 mb-2">Số điện thoại</Label>
                                                {isEditing ? (
                                                    <Input
                                                        value={editedProfile.phone || ''}
                                                        onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                                                        className="rounded-xl border-orange-200 focus:border-orange-500"
                                                        placeholder="Nhập số điện thoại"
                                                    />
                                                ) : (
                                                    <p className="text-gray-800">{user.phone || '-'}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label className="text-sm font-medium text-gray-700 mb-2">Địa chỉ</Label>
                                                {isEditing ? (
                                                    <Input
                                                        value={editedProfile.address || ''}
                                                        onChange={(e) => setEditedProfile({ ...editedProfile, address: e.target.value })}
                                                        className="rounded-xl border-orange-200 focus:border-orange-500"
                                                        placeholder="Nhập địa chỉ"
                                                    />
                                                ) : (
                                                    <p className="text-gray-800">{user.address || '-'}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700 mb-2">Vai trò</Label>
                                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                                    {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                                                </Badge>
                                            </div>

                                            <div>
                                                <Label className="text-sm font-medium text-gray-700 mb-2">Ngày tham gia</Label>
                                                <p className="text-gray-800">
                                                    {user.created_at
                                                        ? new Date(user.created_at).toLocaleDateString('vi-VN')
                                                        : '-'
                                                    }
                                                </p>
                                            </div>
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

                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div className="space-y-6">
                                {/* Filter và Header */}
                                <Card className="border-0 shadow-lg rounded-2xl">
                                    <CardHeader>
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div>
                                                <CardTitle className="text-2xl font-bold">Lịch sử đơn hàng</CardTitle>
                                                <CardDescription>
                                                    Theo dõi trạng thái và lịch sử đơn hàng của bạn
                                                </CardDescription>
                                            </div>

                                            {/* Status Filter */}
                                            <div className="flex flex-wrap gap-2">
                                                {[
                                                    { value: 'all', label: 'Tất cả' },
                                                    { value: 'pending', label: 'Chờ xử lý' },
                                                    { value: 'processing', label: 'Đang xử lý' },
                                                    { value: 'shipped', label: 'Đã gửi' },
                                                    { value: 'completed', label: 'Hoàn thành' },
                                                    { value: 'cancelled', label: 'Đã hủy' },
                                                ].map((filter) => (
                                                    <Button
                                                        key={filter.value}
                                                        variant={selectedStatus === filter.value ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => setSelectedStatus(filter.value)}
                                                        className={
                                                            selectedStatus === filter.value
                                                                ? "bg-gradient-orange hover:bg-gradient-orange-dark text-white"
                                                                : "border-orange-200 text-orange-600 hover:bg-orange-50"
                                                        }
                                                    >
                                                        {filter.label}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </CardHeader>
                                </Card>

                                {/* Orders List */}
                                {loadingOrders ? (
                                    <Card className="border-0 shadow-lg rounded-2xl">
                                        <CardContent className="py-12">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                                                <p className="text-gray-500">Đang tải đơn hàng...</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : orders.length === 0 ? (
                                    <Card className="border-0 shadow-lg rounded-2xl">
                                        <CardContent className="py-12">
                                            <div className="text-center">
                                                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                                    {selectedStatus === 'all' ? 'Chưa có đơn hàng nào' : `Không có đơn hàng ${selectedStatus}`}
                                                </h3>
                                                <p className="text-gray-500 mb-6">
                                                    {selectedStatus === 'all'
                                                        ? 'Hãy khám phá sản phẩm và tạo đơn hàng đầu tiên của bạn'
                                                        : 'Thử thay đổi bộ lọc để xem các đơn hàng khác'
                                                    }
                                                </p>
                                                <Button
                                                    onClick={() => router.push('/products')}
                                                    className="bg-gradient-orange hover:bg-gradient-orange-dark text-white"
                                                >
                                                    <ShoppingBag className="w-4 h-4 mr-2" />
                                                    Mua sắm ngay
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <Card key={order.id} className="border-0 shadow-lg rounded-2xl hover:shadow-xl transition-shadow">
                                                <CardContent className="p-6">
                                                    {/* Order Header */}
                                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 pb-4 border-b border-gray-100">
                                                        <div className="flex items-center gap-4 mb-4 lg:mb-0">
                                                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                                                {getStatusIcon(order.status)}
                                                            </div>
                                                            <div>
                                                                <h3 className="font-semibold text-lg text-gray-800">
                                                                    Đơn hàng #{order.order_code}
                                                                </h3>
                                                                <p className="text-sm text-gray-600">
                                                                    Đặt ngày {new Date(order.created_at).toLocaleDateString('vi-VN', {
                                                                        year: 'numeric',
                                                                        month: 'long',
                                                                        day: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col lg:items-end gap-2">
                                                            {getStatusBadge(order.status)}
                                                            <p className="text-lg font-bold text-orange-600">
                                                                {order.total_amount.toLocaleString('vi-VN')}đ
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Order Details Grid */}
                                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                                                        {/* Shipping Info */}
                                                        <div className="space-y-2">
                                                            <h4 className="font-medium text-gray-700 flex items-center gap-2">
                                                                <User className="w-4 h-4" />
                                                                Thông tin giao hàng
                                                            </h4>
                                                            <div className="text-sm text-gray-600 space-y-1">
                                                                <p className="font-medium">{order.shipping_name}</p>
                                                                <p>{order.shipping_address}</p>
                                                                {order.shipping_phone && <p>📞 {order.shipping_phone}</p>}
                                                            </div>
                                                        </div>

                                                        {/* Shipping Provider */}
                                                        {order.shipping_provider && (
                                                            <div className="space-y-2">
                                                                <h4 className="font-medium text-gray-700 flex items-center gap-2">
                                                                    <Package className="w-4 h-4" />
                                                                    Đơn vị vận chuyển
                                                                </h4>
                                                                <div className="text-sm text-gray-600">
                                                                    <p className="font-medium">{order.shipping_provider}</p>
                                                                    {order.shipping_code && (
                                                                        <p className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                                                                            Mã vận chuyển: {order.shipping_code}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Payment Info */}
                                                        <div className="space-y-2">
                                                            <h4 className="font-medium text-gray-700 flex items-center gap-2">
                                                                <CreditCard className="w-4 h-4" />
                                                                Thông tin thanh toán
                                                            </h4>
                                                            <div className="text-sm text-gray-600">
                                                                <p>Tổng tiền: <span className="font-medium">{order.total_amount.toLocaleString('vi-VN')}đ</span></p>
                                                                {order.voucher_discount && order.voucher_discount > 0 && (
                                                                    <p className="text-green-600">
                                                                        Giảm giá: -{order.voucher_discount.toLocaleString('vi-VN')}đ
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Tracking Number */}
                                                    {order.shipping_code && (
                                                        <div className="bg-blue-50 rounded-xl p-4 mb-4">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Package className="w-4 h-4 text-blue-600" />
                                                                <span className="font-medium text-blue-800">Mã theo dõi đơn hàng</span>
                                                            </div>
                                                            <p className="text-blue-700 font-mono text-sm">{order.shipping_code}</p>
                                                        </div>
                                                    )}



                                                    {/* Action Buttons */}
                                                    {/* <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => router.push(`/orders/${order.id}`)}
                                                            className="border-orange-200 text-orange-600 hover:bg-orange-50"
                                                        >
                                                            Xem chi tiết
                                                        </Button>

                                                        {order.status === 'shipped' && order.shipping_code && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                                            >
                                                                Theo dõi đơn hàng
                                                            </Button>
                                                        )}

                                                        {order.status === 'pending' && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-red-200 text-red-600 hover:bg-red-50"
                                                            >
                                                                Hủy đơn hàng
                                                            </Button>
                                                        )}

                                                        {order.status === 'completed' && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-green-200 text-green-600 hover:bg-green-50"
                                                            >
                                                                Mua lại
                                                            </Button>
                                                        )}
                                                    </div> */}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
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

                        {activeTab === 'settings' && (
                            <Card className="border-0 shadow-lg rounded-2xl">
                                <CardHeader>
                                    <CardTitle>Cài đặt tài khoản</CardTitle>
                                    <CardDescription>Tùy chỉnh trải nghiệm của bạn</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
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
        </div>
    );
}