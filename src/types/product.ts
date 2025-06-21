// types/product.ts
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  updated_at: string;
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
  updated_at: string;
  slug: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  color: string;
  size: string;
  price_override?: number;
  stock: number;
  created_at: string;
  updated_at: string;
}

export interface ProductWithDetails extends Product {
  category?: Category;
  images: ProductImage[];
  variants: ProductVariant[];
  totalStock?: number; // Calculated field
  availableColors?: string[]; // Calculated field
  availableSizes?: string[]; // Calculated field
}

// Extended type for Supabase query result with variants
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
    color: string;
    size: string;
    price_override?: number;
    stock: number;
  }>;
}