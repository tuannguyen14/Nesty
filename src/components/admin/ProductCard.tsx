import Link from 'next/link';
import Image from 'next/image';
import dayjs from 'dayjs';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Package, Palette, Ruler, Zap, TrendingUp, Star } from 'lucide-react';
import { ProductWithRelations, ProductImage } from '@/types/product';
import { useProductInfo } from '@/hooks/useProductInfo';
import { getColorStyle } from '@/utils/colorUtils';

interface ProductCardProps {
  product: ProductWithRelations;
  viewMode?: 'grid' | 'list';
  animationDelay?: number;
}

export function ProductCard({ 
  product, 
  viewMode = 'grid',
  animationDelay = 0 
}: ProductCardProps) {
  const {
    id, slug, name, price, discount_price,
    discount_start, discount_end, categories, product_images
  } = product;

  const { totalStock, availableColors, availableSizes } = useProductInfo(product);
  const now = dayjs();

  // Check if discount is valid
  const isDiscount =
    discount_price &&
    discount_start &&
    discount_end &&
    now.isAfter(dayjs(discount_start)) &&
    now.isBefore(dayjs(discount_end));

  // Get first image
  const firstImage = product_images?.length > 0
    ? [...product_images].sort((a: ProductImage, b: ProductImage) => a.sort_order - b.sort_order)[0]
    : null;
  const imageUrl = firstImage?.image_url || '/placeholder-image.jpg';

  // Calculate discount percentage and saved amount
  const discountPercent = isDiscount && discount_price
    ? Math.round(((price - discount_price) / price) * 100)
    : 0;

  const savedAmount = isDiscount && discount_price
    ? price - discount_price
    : 0;

  return (
    <div
      className="group relative h-full"
      style={{
        animationDelay: `${animationDelay}ms`
      }}
    >
      <Link href={`/products/${slug}`} className="block h-full">
        <Card className={`h-full rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 overflow-hidden bg-white group-hover:bg-gradient-to-br group-hover:from-orange-50 group-hover:to-amber-50 ${
          viewMode === 'list' ? 'flex' : 'flex flex-col'
        }`}>
          {/* Image Container */}
          <div className={`relative overflow-hidden bg-gray-50 ${
            viewMode === 'list' ? 'w-48 h-48 flex-shrink-0' : 'aspect-square'
          }`}>
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />

            {/* Enhanced Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
              {isDiscount && (
                <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg px-3 py-1.5 text-sm rounded-full font-bold animate-pulse-orange">
                  <Zap className="w-3 h-3 mr-1" />
                  -{discountPercent}%
                </Badge>
              )}
              {totalStock <= 5 && totalStock > 0 && (
                <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg px-2 py-1 text-xs rounded-full">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Còn {totalStock}
                </Badge>
              )}
            </div>

            {/* Category Badge */}
            {categories && (
              <div className="absolute top-3 right-3 z-10">
                <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-gray-700 shadow-md px-3 py-1 text-xs rounded-full">
                  {categories.name}
                </Badge>
              </div>
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <button className="bg-white/90 backdrop-blur-sm text-orange-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white transition-colors">
                Xem chi tiết
              </button>
            </div>

            {/* Stock status overlay */}
            {totalStock === 0 && (
              <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center">
                <Badge className="bg-gray-800 text-white px-4 py-2 text-sm rounded-full">
                  Hết hàng
                </Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <CardContent className="p-5 flex-1 flex flex-col">
            {/* Rating */}
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-orange-400 text-orange-400" />
              ))}
              <span className="text-xs text-gray-500 ml-1">(4.5)</span>
            </div>

            <h3 className="font-semibold text-base mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors leading-tight text-gray-800">
              {name}
            </h3>

            {/* Features */}
            <div className="flex items-center gap-3 mb-3">
              {availableColors.length > 0 && (
                <div className="flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-xs text-gray-600">
                    {availableColors.length} màu
                  </span>
                </div>
              )}
              {availableSizes.length > 0 && (
                <div className="flex items-center gap-1">
                  <Ruler className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-xs text-gray-600">
                    {availableSizes.length} size
                  </span>
                </div>
              )}
            </div>

            {/* Price Section */}
            <div className="mt-auto">
              {isDiscount ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl font-bold text-gradient-orange">
                      {discount_price?.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="line-through text-gray-400 text-sm">
                      {price.toLocaleString('vi-VN')}đ
                    </span>
                    <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                      Tiết kiệm {savedAmount.toLocaleString('vi-VN')}đ
                    </Badge>
                  </div>
                </>
              ) : (
                <span className="text-2xl font-bold text-gradient-orange">
                  {price.toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>

            {/* Stock and Time info */}
            <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-orange-100">
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                <span>Kho: {totalStock}</span>
              </div>

              {isDiscount && discount_end && (
                <div className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                  <Clock className="w-3 h-3" />
                  <span>Còn {dayjs(discount_end).diff(now, 'day')} ngày</span>
                </div>
              )}
            </div>

            {/* Color swatches preview */}
            {availableColors.length > 0 && (
              <div className="flex items-center gap-1 mt-3">
                {availableColors.slice(0, 4).map((color, index) => (
                  <div
                    key={index}
                    className="w-5 h-5 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform"
                    style={{ backgroundColor: getColorStyle(color) }}
                  />
                ))}
                {availableColors.length > 4 && (
                  <span className="text-xs text-gray-400 ml-1 font-medium">
                    +{availableColors.length - 4}
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}