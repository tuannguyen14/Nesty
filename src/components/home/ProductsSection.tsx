import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Package } from 'lucide-react';
import { ProductWithRelations } from '@/types/product';
import { ProductCard } from '@/components/products/ProductCard';

interface ProductsSectionProps {
  products: ProductWithRelations[] | null;
}

export function ProductsSection({ products }: ProductsSectionProps) {
  return (
    <section className="max-w-7xl mx-auto py-16 px-4">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h2 className="text-4xl font-bold text-gray-800 mb-2">Sản phẩm mới nhất</h2>
          <p className="text-gray-600">Những sản phẩm hot nhất được cập nhật liên tục</p>
        </div>
        <Link href="/products">
          <Button variant="outline" className="border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white px-6 py-3 rounded-xl transition-all duration-300">
            Xem tất cả
          </Button>
        </Link>
      </div>

      {!products || products.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-xl">Chưa có sản phẩm nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}