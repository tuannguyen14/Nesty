import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import {
  Package,
  Shirt,
  Home,
  Utensils,
  Tv,
  BookOpen,
  Heart,
  Dumbbell,
  Baby,
  ShoppingBag,
  Sparkles,
  Flower
} from 'lucide-react';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface CategoriesSectionProps {
  categories: Category[] | null;
}

// Icon mapping cho categories
const categoryIcons: { [key: string]: any } = {
  'thoi-trang': Shirt,
  'noi-that': Home,
  'do-gia-dung': Utensils,
  'dien-tu': Tv,
  'sach': BookOpen,
  'suc-khoe': Heart,
  'the-thao': Dumbbell,
  'me-be': Baby,
  'my-pham': Sparkles,
  'hoa-qua': Flower,
  'default': ShoppingBag
};

const getCategoryIcon = (slug: string) => {
  return categoryIcons[slug] || categoryIcons['default'];
};

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-white to-orange-50/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-700">Danh mục nổi bật</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Khám phá sản phẩm theo
            <span className="text-gradient-orange"> danh mục</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Dễ dàng tìm kiếm sản phẩm yêu thích với danh mục được sắp xếp khoa học
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category, index) => {
            // const Icon = getCategoryIcon(category.slug);
            return (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="group"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <Card className="h-full hover:shadow-2xl transition-all duration-300 border-0 bg-white hover:bg-gradient-to-br hover:from-orange-50 hover:to-amber-50 transform hover:-translate-y-2 overflow-hidden relative hover-lift">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                  <CardContent className="p-6 text-center relative">
                    <div className="w-24 h-24 bg-gradient-orange rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-orange-200 relative">
                      <Image
                        src={`/categories/${category.slug}.png`}
                        alt={category.name}
                        width={90}
                        height={90}
                        className="object-contain rounded-2xl"
                        style={{ width: 'auto', height: 'auto' }}
                      />
                    </div>

                    <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors text-sm">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {category.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* View All Categories Button */}
        {/* <div className="text-center mt-10">
          <Link href="/categories">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 rounded-2xl font-semibold transition-all duration-300 hover-lift shadow-md hover:shadow-lg">
              <Package className="w-5 h-5" />
              Xem tất cả danh mục
            </button>
          </Link>
        </div> */}
      </div>
    </section>
  );
}