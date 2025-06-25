'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ArrowLeft,
  Search,
  Filter,
  Calendar,
  Eye,
  Download,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';

interface OrderItem {
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
  color?: string;
  size?: string;
}

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: 'pending' | 'processing' | 'shipping' | 'completed' | 'cancelled';
  total: number;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  payment_method: string;
  shipping_address: string;
  items: OrderItem[];
}

const statusConfig = {
  pending: {
    label: 'Chờ xác nhận',
    color: 'bg-yellow-100 text-yellow-700',
    icon: Clock
  },
  processing: {
    label: 'Đang xử lý',
    color: 'bg-blue-100 text-blue-700',
    icon: Package
  },
  shipping: {
    label: 'Đang giao hàng',
    color: 'bg-purple-100 text-purple-700',
    icon: Truck
  },
  completed: {
    label: 'Hoàn thành',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle
  },
  cancelled: {
    label: 'Đã hủy',
    color: 'bg-red-100 text-red-700',
    icon: XCircle
  }
};

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    } else {
      fetchOrders();
    }
  }, [user, router]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Fetched orders:', data);

      // Mock order items for demonstration
      const ordersWithItems = (data || []).map(order => ({
        ...order,
        order_number: `ORD${order.id.slice(0, 8).toUpperCase()}`,
        items: [
          {
            product_id: '1',
            product_name: 'Áo thun cotton cao cấp',
            product_image: '/placeholder-image.jpg',
            quantity: 2,
            price: 299000,
            color: 'Trắng',
            size: 'L'
          }
        ]
      }));

      setOrders(ordersWithItems);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredOrders = () => {
    let filtered = orders;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.order_number.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort orders
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }

    return filtered;
  };

  const getOrdersByStatus = (status: string) => {
    if (status === 'all') return orders;
    return orders.filter(order => order.status === status);
  };

  const renderOrderCard = (order: Order) => {
    const StatusIcon = statusConfig[order.status].icon;

    return (
      <Card key={order.id} className="border-0 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-lg">{order.order_number}</h3>
                <Badge className={`${statusConfig[order.status].color} rounded-full px-3`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusConfig[order.status].label}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(order.created_at).toLocaleDateString('vi-VN')}
                </span>
                <span>{order.payment_method === 'cod' ? 'COD' : 'Đã thanh toán'}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-600">
                {order.total.toLocaleString('vi-VN')}đ
              </p>
              <p className="text-sm text-gray-600">{order.items.length} sản phẩm</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Order Items */}
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <Image
                    src={item.product_image}
                    alt={item.product_name}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 truncate">{item.product_name}</h4>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    {item.color && <span>Màu: {item.color}</span>}
                    {item.size && <span>Size: {item.size}</span>}
                    <span>x{item.quantity}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">
                    {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Actions */}
          <div className="flex gap-3 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 rounded-xl border-orange-300 text-orange-600 hover:bg-orange-50"
              onClick={() => router.push(`/profile/orders/${order.id}`)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Chi tiết
            </Button>

            {order.status === 'completed' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Mua lại
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Hóa đơn
                </Button>
              </>
            )}

            {order.status === 'pending' && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 rounded-xl border-red-300 text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Hủy đơn
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
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
          <Link
            href="/profile"
            className="inline-flex items-center text-gray-600 hover:text-orange-600 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại tài khoản
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Lịch sử đơn hàng</h1>
              <p className="text-gray-600">
                Bạn có {orders.length} đơn hàng
              </p>
            </div>

            <Button
              onClick={() => router.push('/products')}
              className="bg-gradient-orange hover:bg-gradient-orange-dark text-white rounded-xl"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Tiếp tục mua sắm
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-md rounded-2xl mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm theo mã đơn hàng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl border-orange-200 focus:border-orange-500"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 rounded-xl border-orange-200">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="pending">Chờ xác nhận</SelectItem>
                  <SelectItem value="processing">Đang xử lý</SelectItem>
                  <SelectItem value="shipping">Đang giao hàng</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48 rounded-xl border-orange-200">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="oldest">Cũ nhất</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-6 rounded-xl bg-white shadow-md h-12 p-1 mb-6">
            <TabsTrigger
              value="all"
              className="rounded-lg data-[state=active]:bg-gradient-orange data-[state=active]:text-white"
            >
              Tất cả ({orders.length})
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="rounded-lg data-[state=active]:bg-gradient-orange data-[state=active]:text-white"
            >
              Chờ xác nhận ({getOrdersByStatus('pending').length})
            </TabsTrigger>
            <TabsTrigger
              value="processing"
              className="rounded-lg data-[state=active]:bg-gradient-orange data-[state=active]:text-white"
            >
              Đang xử lý ({getOrdersByStatus('processing').length})
            </TabsTrigger>
            <TabsTrigger
              value="shipping"
              className="rounded-lg data-[state=active]:bg-gradient-orange data-[state=active]:text-white"
            >
              Đang giao ({getOrdersByStatus('shipping').length})
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="rounded-lg data-[state=active]:bg-gradient-orange data-[state=active]:text-white"
            >
              Hoàn thành ({getOrdersByStatus('completed').length})
            </TabsTrigger>
            <TabsTrigger
              value="cancelled"
              className="rounded-lg data-[state=active]:bg-gradient-orange data-[state=active]:text-white"
            >
              Đã hủy ({getOrdersByStatus('cancelled').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {getFilteredOrders().filter(order =>
              activeTab === 'all' || order.status === activeTab
            ).length === 0 ? (
              <Card className="border-0 shadow-md rounded-2xl">
                <CardContent className="text-center py-16">
                  <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Không có đơn hàng nào
                  </h3>
                  <p className="text-gray-500">
                    {activeTab === 'all'
                      ? 'Bạn chưa có đơn hàng nào'
                      : `Không có đơn hàng ${statusConfig[activeTab as keyof typeof statusConfig]?.label.toLowerCase()}`
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              getFilteredOrders()
                .filter(order => activeTab === 'all' || order.status === activeTab)
                .map(order => renderOrderCard(order))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}