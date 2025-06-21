import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ProductWithRelations } from "@/types/product";
import Image from "next/image";
import dayjs from "dayjs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ShoppingCart,
    Heart,
    Share2,
    Star,
    Clock,
    Package,
    Shield,
    Truck,
    Zap,
    TrendingUp,
    Palette,
    Ruler
} from "lucide-react";

// Hàm fetch product detail từ Supabase
async function getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
    const { data, error } = await supabase
        .from("products")
        .select(
            `
        *,
        categories:categories(*),
        product_images(*),
        product_variants(*)
      `
        )
        .eq("slug", slug)
        .single();
    if (error || !data) return null;
    return data as ProductWithRelations;
}

// Trang chi tiết sản phẩm
export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
    const { slug } = params;
    const product = await getProductBySlug(slug);

    if (!product) return notFound();

    // Logic tính toán thông tin sản phẩm
    const variants = product.product_variants || [];
    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
    const availableColors = [...new Set(variants.map(v => v.color))];
    const availableSizes = [...new Set(variants.map(v => v.size))];

    const now = dayjs();
    const isDiscount =
        product.discount_price &&
        product.discount_start &&
        product.discount_end &&
        now.isAfter(dayjs(product.discount_start)) &&
        now.isBefore(dayjs(product.discount_end));

    const sortedImages = (product.product_images ?? []).sort((a, b) => a.sort_order - b.sort_order);
    const mainImage = sortedImages[0]?.image_url ?? "/placeholder-image.jpg";
    const otherImages = sortedImages.slice(1);

    const discountPercent = isDiscount && product.discount_price
        ? Math.round(((product.price - product.discount_price) / product.price) * 100)
        : 0;

    const savedAmount = isDiscount && product.discount_price
        ? product.price - product.discount_price
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            {/* Header với breadcrumb effect */}
            <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
                <div className="relative max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <span>Trang chủ</span>
                        <span>/</span>
                        <span>Sản phẩm</span>
                        <span>/</span>
                        <span className="text-blue-600 font-medium">{product.name}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Gallery Section */}
                    <div className="space-y-6">
                        {/* Main Image */}
                        <Card className="overflow-hidden rounded-3xl shadow-2xl border-0 bg-white/50 backdrop-blur-sm">
                            <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100">
                                <Image
                                    src={mainImage}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-700 hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />

                                {/* Floating badges */}
                                <div className="absolute top-6 left-6 flex flex-col gap-3">
                                    {isDiscount && (
                                        <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-2xl px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                                            <Zap className="w-4 h-4 mr-1" />
                                            -{discountPercent}%
                                        </Badge>
                                    )}
                                    {totalStock <= 5 && totalStock > 0 && (
                                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg px-3 py-1.5 rounded-full text-xs">
                                            <TrendingUp className="w-3 h-3 mr-1" />
                                            Còn {totalStock} sản phẩm
                                        </Badge>
                                    )}
                                </div>

                                {/* Action buttons */}
                                <div className="absolute top-6 right-6 flex flex-col gap-3">
                                    <Button size="icon" variant="secondary" className="rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg">
                                        <Heart className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="secondary" className="rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg">
                                        <Share2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        {/* Thumbnail Gallery */}
                        {otherImages.length > 0 && (
                            <div className="grid grid-cols-4 gap-3">
                                {otherImages.map((img, index) => (
                                    <Card key={img.id} className="overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1">
                                        <div className="relative aspect-square">
                                            <Image
                                                src={img.image_url}
                                                alt={`${product.name} ${index + 2}`}
                                                fill
                                                className="object-cover hover:scale-110 transition-transform duration-300"
                                            />
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info Section */}
                    <div className="space-y-8">
                        {/* Header Info */}
                        <div className="space-y-4">
                            {product.categories && (
                                <Badge variant="outline" className="rounded-full px-4 py-1.5 text-sm border-blue-200 text-blue-700 bg-blue-50">
                                    {product.categories.name}
                                </Badge>
                            )}

                            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent leading-tight">
                                {product.name}
                            </h1>

                            {/* Rating stars (mock data) */}
                            <div className="flex items-center gap-2">
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-current" />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-600">(148 đánh giá)</span>
                            </div>
                        </div>

                        {/* Price Section */}
                        <Card className="p-6 rounded-3xl border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
                            <div className="space-y-3">
                                {isDiscount ? (
                                    <>
                                        <div className="flex items-center gap-4">
                                            <span className="text-4xl font-bold text-red-600">
                                                {product.discount_price?.toLocaleString("vi-VN")}đ
                                            </span>
                                            <Badge className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                                                Tiết kiệm {savedAmount.toLocaleString("vi-VN")}đ
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="line-through text-gray-400 text-xl">
                                                {product.price.toLocaleString("vi-VN")}đ
                                            </span>
                                            {product.discount_end && (
                                                <div className="flex items-center gap-1 text-red-600 text-sm">
                                                    <Clock className="w-4 h-4" />
                                                    <span>Kết thúc {dayjs(product.discount_end).format('DD/MM/YYYY')}</span>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        {product.price.toLocaleString("vi-VN")}đ
                                    </span>
                                )}
                            </div>
                        </Card>

                        {/* Variants Selection */}
                        <div className="space-y-6">
                            {availableColors.length > 0 && (
                                <div className="flex items-center gap-1 mt-3">
                                    {availableColors.slice(0, 4).map((color, index) => (
                                        <div
                                            key={index}
                                            className="w-6 h-6 rounded-full border border-gray-200 shadow-sm"
                                            style={{
                                                backgroundColor: color.toLowerCase().includes('đỏ') ? '#ef4444' :
                                                    color.toLowerCase().includes('xanh') ? '#3b82f6' :
                                                        color.toLowerCase().includes('vàng') ? '#eab308' :
                                                            color.toLowerCase().includes('đen') ? '#1f2937' :
                                                                color.toLowerCase().includes('trắng') ? '#f9fafb' :
                                                                    '#6b7280'
                                            }}
                                        />
                                    ))}
                                    {availableColors.length > 4 && (
                                        <span className="text-xs text-gray-400 ml-1">
                                            +{availableColors.length - 4}
                                        </span>
                                    )}
                                </div>
                            )}

                            {availableSizes.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Ruler className="w-5 h-5 text-gray-600" />
                                        <h3 className="font-semibold text-lg">Size</h3>
                                    </div>
                                    <div className="grid grid-cols-4 gap-3">
                                        {availableSizes.map((size, idx) => (
                                            <Button
                                                key={idx}
                                                variant="outline"
                                                className="h-12 rounded-2xl border-2 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 hover:scale-105"
                                            >
                                                {size}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Stock Status */}
                        <Card className="p-4 rounded-2xl border-0 bg-gradient-to-r from-green-50 to-emerald-50 shadow-md">
                            <div className="flex items-center gap-3">
                                <Package className="w-5 h-5 text-green-600" />
                                {totalStock > 0 ? (
                                    <span className="text-green-700 font-medium">
                                        Còn {totalStock} sản phẩm trong kho
                                    </span>
                                ) : (
                                    <span className="text-red-600 font-bold">Tạm hết hàng</span>
                                )}
                            </div>
                        </Card>

                        {/* Action Buttons */}
                        <div className="space-y-4">
                            <Button
                                size="lg"
                                className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
                                disabled={totalStock === 0}
                            >
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                Thêm vào giỏ hàng
                            </Button>

                            <Button
                                variant="outline"
                                size="lg"
                                className="w-full h-12 rounded-2xl border-2 border-blue-200 hover:bg-blue-50 transition-all duration-200"
                            >
                                Mua ngay
                            </Button>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="p-4 rounded-2xl border-0 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-md">
                                <div className="flex items-center gap-3">
                                    <Truck className="w-6 h-6 text-blue-600" />
                                    <div>
                                        <div className="font-semibold text-sm">Miễn phí vận chuyển</div>
                                        <div className="text-xs text-gray-600">Đơn hàng t00kừ 300k</div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4 rounded-2xl border-0 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-6 h-6 text-green-600" />
                                    <div>
                                        <div className="font-semibold text-sm">Bảo hành 12 tháng</div>
                                        <div className="text-xs text-gray-600">Chính hãng 100%</div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Product Details Tabs */}
                <div className="mt-16">
                    <Tabs defaultValue="description" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 rounded-2xl p-1 bg-gray-100/50 backdrop-blur-sm h-14">
                            <TabsTrigger value="description" className="rounded-xl font-medium">Mô tả sản phẩm</TabsTrigger>
                            <TabsTrigger value="specifications" className="rounded-xl font-medium">Thông số kỹ thuật</TabsTrigger>
                            <TabsTrigger value="reviews" className="rounded-xl font-medium">Đánh giá (148)</TabsTrigger>
                        </TabsList>

                        <TabsContent value="description" className="mt-8">
                            <Card className="p-8 rounded-3xl border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                                <CardContent className="p-0">
                                    <div className="prose prose-lg max-w-none">
                                        <p className="text-gray-700 leading-relaxed text-lg">
                                            {product.description || "Sản phẩm chất lượng cao, được thiết kế với công nghệ hiện đại và chất liệu cao cấp. Đem lại trải nghiệm tuyệt vời cho người sử dụng."}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="specifications" className="mt-8">
                            <Card className="p-8 rounded-3xl border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                                <CardContent className="p-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-semibold mb-2">Thông tin cơ bản</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span>Danh mục:</span>
                                                    <span className="font-medium">{product.categories?.name || "Chưa phân loại"}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Màu sắc:</span>
                                                    <span className="font-medium">{availableColors.length} màu</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Size:</span>
                                                    <span className="font-medium">{availableSizes.length} size</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="reviews" className="mt-8">
                            <Card className="p-8 rounded-3xl border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                                <CardContent className="p-0">
                                    <div className="text-center py-12">
                                        <Star className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold mb-2">Đánh giá sẽ sớm có mặt</h3>
                                        <p className="text-gray-600">Chúng tôi đang phát triển tính năng đánh giá sản phẩm</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}