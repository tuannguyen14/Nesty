import { supabase } from '@/lib/supabase';
import { ProductWithRelations } from '@/types/product';
import { ProductsPageClient } from '@/components/products/ProductsPageClient';

interface SearchParams {
  search?: string;
  category?: string;
  sort?: string;
  page?: string;
}

interface ProductsPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // Await searchParams để tránh warning của Next.js 15
  const params = await searchParams;
  
  const {
    search = '',
    category = '',
    sort = 'newest',
    page = '1'
  } = params;

  const currentPage = parseInt(page);
  const itemsPerPage = 12;
  const offset = (currentPage - 1) * itemsPerPage;

  // Build query
  let query = supabase
    .from('products')
    .select(`
      *,
      categories (
        id,
        name,
        description,
        slug
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
    `, { count: 'exact' });

  // Apply search filter
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  // Apply category filter
  if (category) {
    // First get category id by slug
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single();
    
    if (categoryData) {
      query = query.eq('category_id', categoryData.id);
    }
  }

  // Apply sorting
  switch (sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('price', { ascending: false });
      break;
    case 'name_asc':
      query = query.order('name', { ascending: true });
      break;
    case 'name_desc':
      query = query.order('name', { ascending: false });
      break;
    case 'oldest':
      query = query.order('created_at', { ascending: true });
      break;
    default: // newest
      query = query.order('created_at', { ascending: false });
      break;
  }

  // Apply pagination
  query = query.range(offset, offset + itemsPerPage - 1);

  const { data: products, error, count } = await query as { 
    data: ProductWithRelations[] | null, 
    error: any,
    count: number | null 
  };

  if (error) {
    console.error('Error fetching products:', error);
  }

  // Fetch all categories for filter
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  const totalPages = count ? Math.ceil(count / itemsPerPage) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <ProductsPageClient
        products={products}
        categories={categories}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={count || 0}
        searchParams={params}
      />
    </div>
  );
}