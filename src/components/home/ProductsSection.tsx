import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Package, TrendingUp, ArrowRight, Zap } from 'lucide-react';
import { ProductWithRelations } from '@/types/product';
import { ProductCard } from '@/components/products/ProductCard';

interface ProductsSectionProps {
  products: ProductWithRelations[] | null;
}

export function ProductsSection({ products }: ProductsSectionProps) {
  return (
    <section className="py-16 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-50/30 to-white pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full mb-4">
              <Zap className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-semibold text-orange-700">Sản phẩm hot</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-2">
              Sản phẩm 
              <span className="text-gradient-orange"> mới nhất</span>
            </h2>
            <p className="text-gray-600 text-lg">Cập nhật liên tục những sản phẩm trending nhất</p>
          </div>
          <Link href="/products">
            <Button 
              variant="outline" 
              className="group border-2 border-orange-300 text-orange-600 hover:bg-gradient-orange hover:text-white hover:border-transparent px-6 py-3 rounded-2xl transition-all duration-300 font-semibold hover-lift"
            >
              Xem tất cả
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {!products || products.length === 0 ? (
          <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
              <Package className="w-10 h-10 text-orange-400" />
            </div>
            <p className="text-gray-500 text-xl font-medium">Chưa có sản phẩm nào</p>
            <p className="text-gray-400 mt-2">Vui lòng quay lại sau nhé!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fade-in-up"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="text-center py-8 px-6 bg-gradient-to-r from-orange-100 to-amber-100 rounded-3xl">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  <p className="text-gray-700 font-medium">Xem thêm hàng ngàn sản phẩm khác</p>
                </div>
                <Link href="/products">
                  <Button 
                    size="sm"
                    className="bg-gradient-orange hover:bg-gradient-orange-dark text-white px-6 py-2 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Khám phá ngay
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
