import { supabase } from '@/lib/supabase';
import { ProductWithRelations } from '@/types/product';
import { ProductCard } from '@/components/products/ProductCard';
import { SearchPageClient } from '@/components/search/SearchPageClient';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    page?: string;
    min_price?: string;
    max_price?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // Await searchParams để tránh warning của Next.js 15
  const params = await searchParams;
  
  const {
    q = '',
    category = '',
    sort = 'relevance',
    page = '1',
    min_price = '',
    max_price = ''
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
  if (q) {
    // Search in name and description
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
  }

  // Apply category filter
  if (category) {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single();
    
    if (categoryData) {
      query = query.eq('category_id', categoryData.id);
    }
  }

  // Apply price filter
  if (min_price) {
    query = query.gte('price', parseFloat(min_price));
  }
  if (max_price) {
    query = query.lte('price', parseFloat(max_price));
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
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    default: // relevance - order by name similarity when searching
      if (q) {
        query = query.order('name', { ascending: true });
      } else {
        query = query.order('created_at', { ascending: false });
      }
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
    console.error('Error searching products:', error);
  }

  // Fetch all categories for filter
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name');

  const totalPages = count ? Math.ceil(count / itemsPerPage) : 0;

  // Get related searches (mock data for now)
  const relatedSearches = q ? [
    `${q} giá rẻ`,
    `${q} chính hãng`,
    `${q} cao cấp`,
    `${q} khuyến mãi`
  ] : [];

  return (
    <SearchPageClient
      searchQuery={q}
      products={products}
      categories={categories}
      currentPage={currentPage}
      totalPages={totalPages}
      totalCount={count || 0}
      searchParams={params}
      relatedSearches={relatedSearches}
    />
  );
}