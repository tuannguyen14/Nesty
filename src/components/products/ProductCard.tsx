import Link from 'next/link';
import Image from 'next/image';
import dayjs from 'dayjs';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Package, Palette, Ruler } from 'lucide-react';
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
      className="group relative"
      style={{
        animationDelay: `${animationDelay}ms`
      }}
    >
      <Link href={`/products/${slug}`}>
        <Card className={`h-full rounded-3xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-0 overflow-hidden bg-white group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-blue-50 ${viewMode === 'list' ? 'flex' : ''
          }`}>
          {/* Image Container */}
          <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-48 h-48 flex-shrink-0' : 'aspect-square'
            }`}>
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />

            {/* Enhanced Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {isDiscount && (
                <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-xl px-3 py-1.5 text-sm rounded-full font-bold">
                  🔥 -{discountPercent}%
                </Badge>
              )}
              {categories && (
                <Badge variant="secondary" className="bg-white/95 text-gray-700 shadow-lg px-3 py-1 text-xs rounded-full backdrop-blur-sm">
                  {categories.name}
                </Badge>
              )}
              {totalStock <= 5 && totalStock > 0 && (
                <Badge className="bg-orange-500 text-white shadow-lg px-2 py-1 text-xs rounded-full">
                  Còn {totalStock}
                </Badge>
              )}
            </div>

            {/* Stock status overlay */}
            {totalStock === 0 && (
              <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                <Badge className="bg-gray-800 text-white px-4 py-2 text-sm rounded-full">
                  Hết hàng
                </Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <CardContent className="p-6 flex-1">
            <h3 className="font-bold text-lg mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
              {name}
            </h3>

            {/* Color and Size indicators */}
            <div className="flex items-center gap-4 mb-3">
              {availableColors.length > 0 && (
                <div className="flex items-center gap-1">
                  <Palette className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {availableColors.length} màu
                  </span>
                </div>
              )}
              {availableSizes.length > 0 && (
                <div className="flex items-center gap-1">
                  <Ruler className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {availableSizes.length} size
                  </span>
                </div>
              )}
            </div>

            {/* Price Section */}
            <div className="flex flex-col mb-3">
              {isDiscount ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-red-600">
                      {discount_price?.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="line-through text-gray-400 text-sm">
                      {price.toLocaleString('vi-VN')}đ
                    </span>
                    <Badge className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                      Tiết kiệm {savedAmount.toLocaleString('vi-VN')}đ
                    </Badge>
                  </div>
                </>
              ) : (
                <span className="text-2xl font-bold text-blue-600">
                  {price.toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>

            {/* Stock and Time info */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                <span>Kho: {totalStock}</span>
              </div>

              {isDiscount && discount_end && (
                <div className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-full">
                  <Clock className="w-3 h-3" />
                  <span>{dayjs(discount_end).format('DD/MM')}</span>
                </div>
              )}
            </div>

            {/* Color swatches preview */}
            {availableColors.length > 0 && (
              <div className="flex items-center gap-1 mt-3">
                {availableColors.slice(0, 4).map((color, index) => (
                  <div
                    key={index}
                    className="w-4 h-4 rounded-full border border-gray-200 shadow-sm"
                    style={{ backgroundColor: getColorStyle(color) }}
                  />
                ))}
                {availableColors.length > 4 && (
                  <span className="text-xs text-gray-400 ml-1">
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