'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductWithRelations, Category } from '@/types/product';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search,
  Grid3x3, 
  List, 
  Package, 
  ChevronLeft, 
  ChevronRight,
  X
} from 'lucide-react';

interface SearchParams {
  search?: string;
  category?: string;
  sort?: string;
  page?: string;
}

interface ProductsPageClientProps {
  products: ProductWithRelations[] | null;
  categories: Category[] | null;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  searchParams: SearchParams;
}

export function ProductsPageClient({
  products,
  categories,
  currentPage,
  totalPages,
  totalCount,
  searchParams
}: ProductsPageClientProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchValue, setSearchValue] = useState(searchParams.search || '');

  const updateURL = (newParams: Partial<SearchParams>) => {
    const params = new URLSearchParams();
    
    // Keep existing params and update with new ones
    const updatedParams = { ...searchParams, ...newParams };
    
    Object.entries(updatedParams).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value);
      }
    });

    // Reset page when changing filters
    if (newParams.search !== undefined || newParams.category !== undefined || newParams.sort !== undefined) {
      params.delete('page');
    }

    router.push(`/products?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL({ search: searchValue });
  };

  const clearFilters = () => {
    setSearchValue('');
    router.push('/products');
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const hasActiveFilters = searchParams.search || searchParams.category || (searchParams.sort && searchParams.sort !== 'newest');
  const selectedCategory = categories?.find(cat => cat.slug === searchParams.category);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Tất cả sản phẩm</h1>
        <p className="text-gray-600">
          Tìm thấy {totalCount} sản phẩm
          {selectedCategory && ` trong danh mục "${selectedCategory.name}"`}
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8 border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-gray-200 focus:border-blue-500"
                />
              </div>
            </form>

            {/* Category Filter */}
            <Select
              value={searchParams.category || 'all'}
              onValueChange={(value) => updateURL({ category: value === 'all' ? undefined : value })}
            >
              <SelectTrigger className="w-full lg:w-48 h-12 rounded-xl">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select
              value={searchParams.sort || 'newest'}
              onValueChange={(value) => updateURL({ sort: value })}
            >
              <SelectTrigger className="w-full lg:w-48 h-12 rounded-xl">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="oldest">Cũ nhất</SelectItem>
                <SelectItem value="price_asc">Giá tăng dần</SelectItem>
                <SelectItem value="price_desc">Giá giảm dần</SelectItem>
                <SelectItem value="name_asc">Tên A-Z</SelectItem>
                <SelectItem value="name_desc">Tên Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-gray-600">Bộ lọc:</span>
              {searchParams.search && (
                <Badge variant="secondary" className="gap-1">
                  Tìm kiếm: {searchParams.search}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateURL({ search: undefined })}
                  />
                </Badge>
              )}
              {selectedCategory && (
                <Badge variant="secondary" className="gap-1">
                  {selectedCategory.name}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateURL({ category: undefined })}
                  />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-700"
              >
                Xóa tất cả
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-gray-600">
          Hiển thị {((currentPage - 1) * 12) + 1}-{Math.min(currentPage * 12, totalCount)} của {totalCount} sản phẩm
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="px-3 py-2 rounded-lg"
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="px-3 py-2 rounded-lg"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Products Grid/List */}
      {!products || products.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">Không tìm thấy sản phẩm nào</h3>
          <p className="text-gray-400 mb-6">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          <Button onClick={clearFilters} variant="outline">
            Xóa bộ lọc
          </Button>
        </div>
      ) : (
        <div className={`grid gap-6 mb-8 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              viewMode={viewMode}
              animationDelay={index * 100}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateURL({ page: String(currentPage - 1) })}
            disabled={currentPage <= 1}
            className="rounded-xl"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {generatePageNumbers().map((page, index) => (
            <div key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-gray-400">...</span>
              ) : (
                <Button
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateURL({ page: String(page) })}
                  className="rounded-xl min-w-[40px]"
                >
                  {page}
                </Button>
              )}
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => updateURL({ page: String(currentPage + 1) })}
            disabled={currentPage >= totalPages}
            className="rounded-xl"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}