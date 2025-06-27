// types/product.ts
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  discount_price?: number;
  discount_start?: string;
  discount_end?: string;
  category_id?: number;
  created_at: string;
  slug: string;
  // Bỏ updated_at vì không có trong DB
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  sort_order: number;
  // Bỏ created_at vì không có trong DB
}

export interface ProductVariant {
  id: number;
  product_id: number;
  color?: string;       // Thêm ? vì có thể null trong DB
  size?: string;        // Thêm ? vì có thể null trong DB
  price_override?: number;
  stock: number;
  sku: string;
  // Bỏ created_at, updated_at vì không có trong DB
}

export interface ProductWithDetails extends Product {
  category?: Category;
  images: ProductImage[];
  variants: ProductVariant[];
  totalStock?: number;
  availableColors?: string[];
  availableSizes?: string[];
  sku: string;
}

// Sửa lại để khớp với DB
export interface ProductWithRelations {
  id: number;
  name: string;
  description?: string;
  price: number;
  slug: string;
  discount_price?: number;
  discount_start?: string;
  discount_end?: string;
  category_id?: number;
  created_at: string;
  categories?: Category;
  product_images: ProductImage[];
  product_variants: ProductVariant[];
}

export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  discount_price?: number;
  discount_start?: string;
  discount_end?: string;
  category_id?: number;
  images: Array<{
    image_url: string;
    sort_order: number;
  }>;
  variants: Array<{
    color?: string;     // Thêm ? vì có thể null
    size?: string;      // Thêm ? vì có thể null
    price_override?: number;
    stock: number;
    sku: string;
  }>;
}

// Thêm interface cho Order Item (từ orders_item.sql)
export interface OrderItem {
  id: number;
  order_id: number;
  product_variant_id: number;
  quantity: number;
  price: number;
}

// Helper types giữ nguyên
export interface ProductToCartItem {
  product: Product;
  variant?: ProductVariant;
  image?: string;
  quantity?: number;
}

export interface ProductFilters {
  category_id?: number;
  min_price?: number;
  max_price?: number;
  colors?: string[];
  sizes?: string[];
  in_stock?: boolean;
  on_sale?: boolean;
}

export interface ProductSearchParams {
  query?: string;
  filters?: ProductFilters;
  sort_by?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest' | 'popular';
  page?: number;
  limit?: number;
}