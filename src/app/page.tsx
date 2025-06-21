import { supabase } from '@/lib/supabase';
import { ProductWithRelations } from '@/types/product';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { ProductsSection } from '@/components/home/ProductsSection';
import { CTASection } from '@/components/home/CTASection';

export default async function Home() {
  // Fetch products với categories, images và variants
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (
        id,
        name,
        description
      ),
      product_images (
        id,
        product_id,
        image_url,
        sort_order,
        created_at
      ),
      product_variants (
        id,
        product_id,
        color,
        size,
        price_override,
        stock,
        created_at,
        updated_at
      )
    `)
    .order('created_at', { ascending: false })
    .limit(8) as { data: ProductWithRelations[] | null, error: any };

  if (error) {
    console.error('Error fetching products:', error);
  }

  // Fetch danh mục hot
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .limit(6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <HeroSection />

      {/* Categories Section */}
      <CategoriesSection categories={categories} />

      {/* Products Section */}
      <ProductsSection products={products} />

      {/* CTA Section */}
      <CTASection />
    </div>
  );
}