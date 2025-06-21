import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface CategoriesSectionProps {
  categories: Category[] | null;
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto py-16 px-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">Danh mục sản phẩm</h2>
        <p className="text-gray-600 text-lg">Tìm kiếm sản phẩm theo danh mục yêu thích</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {categories.map(category => (
          <Link
            key={category.id}
            href={`/categories/${category.id}`}
            className="group"
          >
            <Card className="h-full hover:shadow-2xl transition-all duration-300 border-0 bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 transform hover:-translate-y-2">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-white font-bold text-xl">
                    {category.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}