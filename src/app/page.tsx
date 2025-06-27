import { supabase } from '@/lib/supabase';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { ProductsSection } from '@/components/home/ProductsSection';
import { CTASection } from '@/components/home/CTASection';

export default async function Home() {
  // Test với query đơn giản trước
  let products = null;
  let error = null;

  try {
    const { data, error: fetchError } = await supabase
      .from('products')
      .select(`
        *,
        product_images(*),
        product_variants(*)
      `)
      .order('created_at', { ascending: false })
      .limit(8);

    products = data;
    error = fetchError;
  } catch (err) {
    console.error('Fetch error:', err);
    error = err;
  }

  if (error) {
    console.error('Error fetching products:', error);
    // Fallback với empty array
    products = [];
  }

  // Fetch danh mục hot
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name, slug')
    .limit(6);

  if (categoriesError) {
    console.error('Error fetching categories:', categoriesError);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <HeroSection />

      {/* Categories Section */}
      <CategoriesSection categories={categories || []} />

      {/* Products Section */}
      <ProductsSection products={products || []} />

      {/* CTA Section */}
      <CTASection />
    </div>
  );
}