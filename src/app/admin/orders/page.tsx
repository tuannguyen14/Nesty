// app/admin/orders/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { format } from 'date-fns'
import {
  Search,
  Download,
  Eye,
  Edit,
  Truck,
  CheckCircle,
  XCircle,
  Package,
  Clock,
  CalendarIcon,
  RefreshCw,
  DollarSign,
  User,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  CreditCard,
  Clipboard,
  Gift,
  FileText,
  TrendingUp,
  AlertCircle,
  Copy,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DateRange } from 'react-day-picker'

import { Order } from "@/types/orderFullInfor";

const orderStatusConfig = {
  pending: { label: 'Chờ xử lý', color: 'bg-yellow-500', icon: Clock, textColor: 'text-yellow-700', bgLight: 'bg-yellow-50' },
  processing: { label: 'Đang xử lý', color: 'bg-blue-500', icon: Package, textColor: 'text-blue-700', bgLight: 'bg-blue-50' },
  shipped: { label: 'Đang giao', color: 'bg-purple-500', icon: Truck, textColor: 'text-purple-700', bgLight: 'bg-purple-50' },
  completed: { label: 'Đã giao', color: 'bg-green-500', icon: CheckCircle, textColor: 'text-green-700', bgLight: 'bg-green-50' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-500', icon: XCircle, textColor: 'text-red-700', bgLight: 'bg-red-50' }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const [showStatusUpdate, setShowStatusUpdate] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipping: 0,
    delivered: 0,
    cancelled: 0,
    revenue: 0
  })

  const ordersPerPage = 10

  const [newStatus, setNewStatus] = useState('')
  const [shippingProvider, setShippingProvider] = useState('')
  const [shippingCode, setShippingCode] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    fetchOrders()
    fetchStatistics()
  }, [currentPage, statusFilter, searchTerm, dateRange])

  useEffect(() => {
    if (selectedOrder) {
      setNewStatus(selectedOrder.status)
      setShippingProvider(selectedOrder.shipping_provider || '')
      setShippingCode(selectedOrder.shipping_code || '')
      setNote(selectedOrder.note || '')
    }
  }, [selectedOrder])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('orders')
        .select(`
        *,
        users (full_name, email),
        vouchers (code, discount_type, discount_value),
        order_items (
          id,
          quantity,
          price,
          product_variants (
            id,
            sku,
            color,
            size,
            products (
              name,
              product_images (image_url, sort_order)
            )
          )
        )
      `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage - 1)

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      if (searchTerm) {
        query = query.or(`order_code.ilike.%${searchTerm}%,shipping_name.ilike.%${searchTerm}%,shipping_phone.ilike.%${searchTerm}%,shipping_code.ilike.%${searchTerm}%`)
      }

      if (dateRange?.from) {
        query = query.gte('created_at', dateRange.from.toISOString())
      }

      if (dateRange?.to) {
        query = query.lte('created_at', dateRange.to.toISOString())
      }

      const { data, error, count } = await query

      if (error) throw error

      const ordersWithDiscountAmount = (data || []).map(order => ({
        ...order,
        discount_amount: order.voucher_discount || 0
      }))

      setOrders(ordersWithDiscountAmount || [])
      setTotalPages(Math.ceil((count || 0) / ordersPerPage))
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Không thể tải danh sách đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('status, total_amount')

      if (error) throw error

      const stats = {
        total: 0,
        pending: 0,
        processing: 0,
        shipping: 0,
        delivered: 0,
        cancelled: 0,
        revenue: 0
      }

      data?.forEach(order => {
        stats.total++
        stats[order.status as keyof typeof stats]++
        if (order.status === 'completed') {
          stats.revenue += order.total_amount
        }
      })

      setStatistics(stats)
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  const updateOrderStatus = async (orderId: number, newStatus: string, newShippingCode: string, newShippingProvider: string, note?: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          note: note || null,
          updated_at: new Date().toISOString(),
          shipping_provider: newShippingProvider,
          shipping_code: newShippingCode
        })
        .eq('id', orderId)

      if (error) throw error

      toast.success('Cập nhật trạng thái đơn hàng thành công')
      fetchOrders()
      fetchStatistics()
      setShowStatusUpdate(false)
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Không thể cập nhật trạng thái đơn hàng')
    }
  }

  const exportOrders = () => {
    const csvContent = [
      ['Mã đơn', 'Khách hàng', 'Email', 'Số điện thoại', 'Địa chỉ', 'Tổng tiền', 'Giảm giá', 'Trạng thái', 'Đơn vị vận chuyển', 'Mã vận chuyển', 'Ngày đặt'],
      ...orders.map(order => [
        order.order_code,
        order.users.full_name,
        order.users.email,
        order.shipping_phone,
        order.shipping_address,
        formatCurrency(order.total_amount),
        formatCurrency(order.discount_amount),
        orderStatusConfig[order.status].label,
        order.shipping_provider || '',
        order.shipping_code || '',
        format(new Date(order.created_at), 'dd/MM/yyyy HH:mm')
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `orders_${format(new Date(), 'yyyyMMdd')}.csv`
    link.click()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Đã sao chép vào clipboard')
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Quản lý đơn hàng</h1>
          <p className="text-lg text-muted-foreground">Quản lý và theo dõi tất cả đơn hàng của cửa hàng</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={exportOrders} variant="outline" className="h-11">
            <Download className="mr-2 h-4 w-4" />
            Xuất báo cáo Excel
          </Button>
          <Button onClick={fetchOrders} className="h-11">
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng đơn hàng</CardTitle>
            <Package className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{statistics.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              Tất cả đơn hàng
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/10 rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Đang xử lý</CardTitle>
            <Clock className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{statistics.pending + statistics.processing}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <AlertCircle className="inline h-3 w-3 mr-1" />
              Cần xử lý
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Đang giao</CardTitle>
            <Truck className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{statistics.shipping}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Truck className="inline h-3 w-3 mr-1" />
              Đang vận chuyển
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Doanh thu</CardTitle>
            <DollarSign className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(statistics.revenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <CheckCircle className="inline h-3 w-3 mr-1" />
              Từ đơn hoàn thành
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Search className="h-5 w-5" />
            Bộ lọc tìm kiếm
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo mã đơn, SĐT, mã vận chuyển..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-11"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Trạng thái đơn hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {Object.entries(orderStatusConfig).map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      <config.icon className="h-4 w-4" />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("h-11 justify-start text-left font-normal")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                        {format(dateRange.to, "dd/MM/yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "dd/MM/yyyy")
                    )
                  ) : (
                    <span>Chọn khoảng thời gian</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setDateRange(undefined)
              }}
              className="h-11"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Đặt lại bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Orders Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Danh sách đơn hàng ({orders.length})</CardTitle>
            <Badge variant="secondary" className="text-sm">
              Trang {currentPage}/{totalPages}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin" />
                Đang tải dữ liệu...
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Không có đơn hàng nào</p>
              <p className="text-muted-foreground">Thử thay đổi bộ lọc để xem thêm đơn hàng</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Mã đơn</TableHead>
                    <TableHead className="font-semibold">Khách hàng</TableHead>
                    <TableHead className="font-semibold">Sản phẩm</TableHead>
                    <TableHead className="font-semibold">Vận chuyển</TableHead>
                    <TableHead className="font-semibold">Tổng tiền</TableHead>
                    <TableHead className="font-semibold">Trạng thái</TableHead>
                    <TableHead className="font-semibold">Ngày đặt</TableHead>
                    <TableHead className="text-right font-semibold">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const StatusIcon = orderStatusConfig[order.status].icon
                    return (
                      <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                              #{order.order_code}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(order.order_code)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {order.users.full_name}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {order.shipping_phone}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {order.users.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                              {order.order_items.slice(0, 3).map((item, index) => (
                                <img
                                  key={index}
                                  src={item.product_variants.products.product_images[0]?.image_url}
                                  alt=""
                                  className="w-8 h-8 object-cover rounded-full border-2 border-background"
                                />
                              ))}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{order.order_items.length} sản phẩm</p>
                              <p className="text-xs text-muted-foreground">
                                {order.order_items.reduce((sum, item) => sum + item.quantity, 0)} món
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {order.shipping_provider ? (
                              <p className="text-sm font-medium flex items-center gap-1">
                                <Truck className="h-3 w-3" />
                                {order.shipping_provider}
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground">Chưa có</p>
                            )}
                            {order.shipping_code && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                                  {order.shipping_code}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(order.shipping_code!)}
                                  className="h-5 w-5 p-0"
                                >
                                  <Copy className="h-2.5 w-2.5" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-bold text-lg">{formatCurrency(order.total_amount)}</p>
                            {order.discount_amount > 0 && (
                              <div className="flex items-center gap-1">
                                <Gift className="h-3 w-3 text-green-600" />
                                <span className="text-sm text-green-600 font-medium">
                                  -{formatCurrency(order.discount_amount)}
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "text-white shadow-sm",
                              orderStatusConfig[order.status].color
                            )}
                          >
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {orderStatusConfig[order.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              {format(new Date(order.created_at), 'dd/MM/yyyy')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(order.created_at), 'HH:mm')}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order)
                                setShowOrderDetail(true)
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order)
                                setShowStatusUpdate(true)
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                Hiển thị {(currentPage - 1) * ordersPerPage + 1} - {Math.min(currentPage * ordersPerPage, orders.length)}
                trong tổng số {orders.length} đơn hàng
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-9"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Trước
                </Button>
                <span className="text-sm font-medium px-3">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-9"
                >
                  Sau
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Order Detail Dialog */}
      <Dialog open={showOrderDetail} onOpenChange={setShowOrderDetail}>
        <DialogContent style={{ maxWidth: '85vw', maxHeight: '90vh', overflowY: 'auto' }}>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl">Chi tiết đơn hàng #{selectedOrder?.order_code}</DialogTitle>
                <DialogDescription className="text-base mt-1">
                  Đặt lúc: {selectedOrder && format(new Date(selectedOrder.created_at), 'dd/MM/yyyy HH:mm')}
                </DialogDescription>
              </div>
              {selectedOrder && (
                <Badge
                  className={cn(
                    "text-white text-sm",
                    orderStatusConfig[selectedOrder.status].color
                  )}
                >
                  {(() => {
                    const StatusIcon = orderStatusConfig[selectedOrder.status].icon;
                    return <StatusIcon className="mr-1 h-4 w-4" />;
                  })()}
                  {orderStatusConfig[selectedOrder.status].label}
                </Badge>
              )}
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto max-h-[70vh] pr-2">
            {selectedOrder && (
              <div className="space-y-6 pb-6">
                {/* Customer & Shipping Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-500" />
                        Thông tin khách hàng
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Họ tên:</span>
                        <span>{selectedOrder.users.full_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Email:</span>
                        <span>{selectedOrder.users.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">SĐT:</span>
                        <span>{selectedOrder.shipping_phone}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-green-500" />
                        Địa chỉ giao hàng
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Địa chỉ:</p>
                          <p className="text-sm text-muted-foreground">{selectedOrder.shipping_address}</p>
                        </div>
                      </div>
                      {selectedOrder.note && (
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">Ghi chú:</p>
                            <p className="text-sm text-muted-foreground">{selectedOrder.note}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Shipping Information */}
                {(selectedOrder.shipping_provider || selectedOrder.shipping_code) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Truck className="h-5 w-5 text-purple-500" />
                        Thông tin vận chuyển
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedOrder.shipping_provider && (
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Đơn vị vận chuyển:</span>
                            <Badge variant="outline" className="font-normal">
                              {selectedOrder.shipping_provider}
                            </Badge>
                          </div>
                        )}
                        {selectedOrder.shipping_code && (
                          <div className="flex items-center gap-2">
                            <Clipboard className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Mã vận chuyển:</span>
                            <div className="flex items-center gap-1">
                              <Badge variant="secondary" className="font-mono">
                                {selectedOrder.shipping_code}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(selectedOrder.shipping_code!)}
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Order Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5 text-orange-500" />
                      Sản phẩm đã đặt ({selectedOrder.order_items.length} sản phẩm)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedOrder.order_items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          <img
                            src={item.product_variants.products.product_images[0]?.image_url}
                            alt={item.product_variants.products.name}
                            className="w-16 h-16 object-cover rounded-lg border"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{item.product_variants.products.name}</h4>
                            <div className="flex items-center gap-4 mt-1">
                              <Badge variant="outline" className="text-xs">
                                SKU: {item.product_variants.sku}
                              </Badge>
                              {item.product_variants.color && (
                                <span className="text-sm text-muted-foreground">
                                  Màu: {item.product_variants.color}
                                </span>
                              )}
                              {item.product_variants.size && (
                                <span className="text-sm text-muted-foreground">
                                  Size: {item.product_variants.size}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="text-lg font-bold">{formatCurrency(item.price)}</p>
                            <p className="text-sm text-muted-foreground">x {item.quantity}</p>
                            <p className="text-lg font-bold text-blue-600">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-6" />

                    {/* Order Summary */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Tóm tắt đơn hàng
                      </h4>
                      <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                        <div className="flex justify-between text-base">
                          <span>Tạm tính:</span>
                          <span>{formatCurrency(selectedOrder.total_amount + selectedOrder.discount_amount)}</span>
                        </div>
                        {selectedOrder.vouchers && selectedOrder.discount_amount > 0 && (
                          <div className="flex justify-between text-base text-green-600">
                            <span className="flex items-center gap-2">
                              <Gift className="h-4 w-4" />
                              Mã giảm giá ({selectedOrder.vouchers.code}):
                            </span>
                            <span>-{formatCurrency(selectedOrder.discount_amount)}</span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between text-xl font-bold">
                          <span>Tổng cộng:</span>
                          <span className="text-blue-600">{formatCurrency(selectedOrder.total_amount)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Update Status Dialog */}
      <Dialog open={showStatusUpdate} onOpenChange={setShowStatusUpdate}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Cập nhật trạng thái đơn hàng</DialogTitle>
            <DialogDescription>
              Đơn hàng #{selectedOrder?.order_code} - {selectedOrder && format(new Date(selectedOrder.created_at), 'dd/MM/yyyy HH:mm')}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Current Status */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Trạng thái hiện tại</Label>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <Badge
                    className={cn(
                      "text-white text-sm",
                      orderStatusConfig[selectedOrder.status].color
                    )}
                  >
                    {(() => {
                      const StatusIcon = orderStatusConfig[selectedOrder.status].icon;
                      return <StatusIcon className="mr-1 h-4 w-4" />;
                    })()}
                    {orderStatusConfig[selectedOrder.status].label}
                  </Badge>
                </div>
              </div>

              {/* New Status */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Trạng thái mới</Label>
                <Select
                  value={newStatus}
                  onValueChange={(value) => setNewStatus(value)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(orderStatusConfig).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <config.icon className="h-4 w-4" />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Shipping Provider */}
                <div className="space-y-3">
                  <Label htmlFor="shipping-provider" className="text-base font-semibold flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Đơn vị vận chuyển
                  </Label>
                  <Input
                    id="shipping-provider"
                    placeholder="VD: Giao hàng nhanh, Viettel Post..."
                    value={shippingProvider}
                    onChange={(e) => setShippingProvider(e.target.value)}
                    className="h-11"
                  />
                </div>

                {/* Shipping Code */}
                <div className="space-y-3">
                  <Label htmlFor="shipping-code" className="text-base font-semibold flex items-center gap-2">
                    <Clipboard className="h-4 w-4" />
                    Mã vận chuyển
                  </Label>
                  <Input
                    id="shipping-code"
                    placeholder="VD: GHN123456789..."
                    value={shippingCode}
                    onChange={(e) => setShippingCode(e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>

              {/* Note */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Ghi chú (tùy chọn)
                </Label>
                <Textarea
                  placeholder="Nhập ghi chú về việc cập nhật trạng thái..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <DialogFooter className="gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowStatusUpdate(false)}
                  className="h-11"
                >
                  Hủy bỏ
                </Button>
                <Button
                  onClick={() => {
                    updateOrderStatus(
                      selectedOrder.id,
                      newStatus,
                      shippingCode,
                      shippingProvider,
                      note
                    )
                  }}
                  className="h-11 min-w-[120px]"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Cập nhật
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}