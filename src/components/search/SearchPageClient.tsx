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
import { Slider } from '@/components/ui/slider';

import { 
  Search, 
  Filter, 
  Grid3x3, 
  List, 
  Package, 
  ChevronLeft, 
  ChevronRight,
  X,
  SlidersHorizontal,
  TrendingUp,
  Sparkles,
  Tag
} from 'lucide-react';

interface SearchParams {
  q?: string;
  category?: string;
  sort?: string;
  page?: string;
  min_price?: string;
  max_price?: string;
}

interface SearchPageClientProps {
  searchQuery: string;
  products: ProductWithRelations[] | null;
  categories: Category[] | null;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  searchParams: SearchParams;
  relatedSearches: string[];
}

export function SearchPageClient({
  searchQuery,
  products,
  categories,
  currentPage,
  totalPages,
  totalCount,
  searchParams,
  relatedSearches
}: SearchPageClientProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchValue, setSearchValue] = useState(searchQuery);
  const [priceRange, setPriceRange] = useState([
    searchParams.min_price ? parseInt(searchParams.min_price) : 0,
    searchParams.max_price ? parseInt(searchParams.max_price) : 10000000
  ]);

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
    if (newParams.q !== undefined || newParams.category !== undefined || newParams.sort !== undefined || newParams.min_price !== undefined || newParams.max_price !== undefined) {
      params.delete('page');
    }

    router.push(`/search?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL({ q: searchValue });
  };

  const clearFilters = () => {
    setSearchValue('');
    setPriceRange([0, 10000000]);
    router.push('/search');
  };

  const applyPriceFilter = () => {
    updateURL({
      min_price: priceRange[0].toString(),
      max_price: priceRange[1].toString()
    });
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

  const hasActiveFilters = searchParams.category || (searchParams.sort && searchParams.sort !== 'relevance') || searchParams.min_price || searchParams.max_price;
  const selectedCategory = categories?.find(cat => cat.slug === searchParams.category);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-orange-50/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-orange rounded-xl">
              <Search className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">
              Kết quả tìm kiếm
              {searchQuery && (
                <span className="text-orange-600"> &quot;{searchQuery}&quot;</span>
              )}
            </h1>
          </div>
          <p className="text-gray-600">
            Tìm thấy <span className="font-semibold text-orange-600">{totalCount}</span> sản phẩm
            {selectedCategory && ` trong danh mục "${selectedCategory.name}"`}
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6 border-0 shadow-lg bg-white">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-orange-200 focus:border-orange-500 text-lg"
                />
              </div>
              <Button 
                type="submit"
                className="h-12 px-8 rounded-xl bg-gradient-orange hover:bg-gradient-orange-dark text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Tìm kiếm
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Related Searches */}
        {relatedSearches.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">Tìm kiếm liên quan:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {relatedSearches.map((search, index) => (
                <Badge 
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-orange-50 hover:border-orange-300 transition-all"
                  onClick={() => {
                    setSearchValue(search);
                    updateURL({ q: search });
                  }}
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {search}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 space-y-6`}>
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-orange-500" />
                    Bộ lọc
                  </h3>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-orange-600 hover:text-orange-700"
                    >
                      Xóa tất cả
                    </Button>
                  )}
                </div>

                {/* Category Filter */}
                <div className="space-y-3 mb-6">
                  <label className="font-medium text-sm text-gray-700">Danh mục</label>
                  <Select
                    value={searchParams.category || 'all'}
                    onValueChange={(value) => updateURL({ category: value === 'all' ? undefined : value })}
                  >
                    <SelectTrigger className="rounded-xl border-orange-200">
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
                </div>

                {/* Price Range Filter */}
                <div className="space-y-3 mb-6">
                  <label className="font-medium text-sm text-gray-700">Khoảng giá</label>
                  <div className="px-2">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={10000000}
                      step={100000}
                      className="mb-4"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{priceRange[0].toLocaleString('vi-VN')}đ</span>
                      <span className="text-gray-600">{priceRange[1].toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>
                  <Button
                    onClick={applyPriceFilter}
                    size="sm"
                    className="w-full rounded-xl bg-gradient-orange hover:bg-gradient-orange-dark text-white"
                  >
                    Áp dụng
                  </Button>
                </div>

                {/* Sort */}
                <div className="space-y-3">
                  <label className="font-medium text-sm text-gray-700">Sắp xếp</label>
                  <Select
                    value={searchParams.sort || 'relevance'}
                    onValueChange={(value) => updateURL({ sort: value })}
                  >
                    <SelectTrigger className="rounded-xl border-orange-200">
                      <SelectValue placeholder="Sắp xếp" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Liên quan nhất</SelectItem>
                      <SelectItem value="newest">Mới nhất</SelectItem>
                      <SelectItem value="price_asc">Giá tăng dần</SelectItem>
                      <SelectItem value="price_desc">Giá giảm dần</SelectItem>
                      <SelectItem value="name_asc">Tên A-Z</SelectItem>
                      <SelectItem value="name_desc">Tên Z-A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Popular Tags */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-500" />
                  Từ khóa phổ biến
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['Giảm giá', 'Mới nhất', 'Bán chạy', 'Chính hãng', 'Free ship'].map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-orange-200 transition-all"
                      onClick={() => {
                        setSearchValue(tag);
                        updateURL({ q: tag });
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-gray-600">
                Hiển thị {((currentPage - 1) * 12) + 1}-{Math.min(currentPage * 12, totalCount)} của {totalCount} sản phẩm
              </div>

              <div className="flex items-center gap-4">
                {/* Mobile Filter Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Bộ lọc
                </Button>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 bg-orange-100 rounded-xl p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 rounded-lg ${
                      viewMode === 'grid' 
                        ? 'bg-gradient-orange text-white shadow-md' 
                        : 'hover:bg-orange-200'
                    }`}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 rounded-lg ${
                      viewMode === 'list' 
                        ? 'bg-gradient-orange text-white shadow-md' 
                        : 'hover:bg-orange-200'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-6 p-4 bg-orange-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">Đang lọc:</span>
                {selectedCategory && (
                  <Badge variant="secondary" className="gap-1 bg-white">
                    {selectedCategory.name}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-orange-600" 
                      onClick={() => updateURL({ category: undefined })}
                    />
                  </Badge>
                )}
                {searchParams.min_price && searchParams.max_price && (
                  <Badge variant="secondary" className="gap-1 bg-white">
                    {parseInt(searchParams.min_price).toLocaleString('vi-VN')}đ - {parseInt(searchParams.max_price).toLocaleString('vi-VN')}đ
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-orange-600" 
                      onClick={() => updateURL({ min_price: undefined, max_price: undefined })}
                    />
                  </Badge>
                )}
              </div>
            )}

            {/* Products Grid/List */}
            {!products || products.length === 0 ? (
              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="text-center py-20">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
                    <Package className="w-10 h-10 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy sản phẩm nào</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc để tìm thấy sản phẩm phù hợp
                  </p>
                  <Button 
                    onClick={clearFilters} 
                    variant="outline"
                    className="border-orange-300 text-orange-600 hover:bg-orange-50"
                  >
                    Xóa bộ lọc
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className={`grid gap-6 mb-8 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3' 
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
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateURL({ page: String(currentPage - 1) })}
                  disabled={currentPage <= 1}
                  className="rounded-xl border-orange-300 text-orange-600 hover:bg-orange-50"
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
                        className={`rounded-xl min-w-[40px] ${
                          currentPage === page
                            ? 'bg-gradient-orange text-white shadow-md'
                            : 'border-orange-300 text-orange-600 hover:bg-orange-50'
                        }`}
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
                  className="rounded-xl border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}