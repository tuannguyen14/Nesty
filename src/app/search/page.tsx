import { supabase } from '@/lib/supabase';
import { ProductWithRelations } from '@/types/product';
import { SearchPageClient } from '@/components/search/SearchPageClient';
import { Metadata } from 'next';

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

// Generate metadata for SEO
export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q || '';
  const category = params.category || '';
  
  let title = 'Tìm kiếm sản phẩm';
  if (query) {
    title = `Kết quả tìm kiếm cho "${query}"`;
  } else if (category) {
    title = `Danh mục: ${category}`;
  }
  
  return {
    title,
    description: `Tìm kiếm sản phẩm ${query} ${category}`.trim(),
  };
}

// Helper function to build search query
async function buildSearchQuery(params: any) {
  const {
    q = '',
    category = '',
    sort = 'relevance',
    page = '1',
    min_price = '',
    max_price = ''
  } = params;

  const currentPage = parseInt(page, 10);
  const itemsPerPage = 12;
  const offset = (currentPage - 1) * itemsPerPage;

  // Start with base query including all relations
  let query = supabase
    .from('products')
    .select(`
      *,
      categories!inner (
        id,
        name,
        slug
      ),
      product_images (
        id,
        product_id,
        image_url,
        sort_order
      ),
      product_variants (
        id,
        product_id,
        color,
        size,
        price_override,
        stock,
        sku
      )
    `, { count: 'exact' });

  // Apply search filter with better search logic
  if (q) {
    // Use full-text search if available, otherwise use ilike
    const searchTerm = q.trim();
    query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
  }

  // Apply category filter using the relation
  if (category) {
    query = query.eq('categories.slug', category);
  }

  // Apply price filters
  if (min_price && !isNaN(parseFloat(min_price))) {
    query = query.gte('price', parseFloat(min_price));
  }
  if (max_price && !isNaN(parseFloat(max_price))) {
    query = query.lte('price', parseFloat(max_price));
  }

  // Apply sorting with optimized logic
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
    case 'relevance':
    default:
      // For relevance, if there's a search query, order by name
      // Otherwise, show newest products first
      if (q) {
        query = query.order('name', { ascending: true });
      } else {
        query = query.order('created_at', { ascending: false });
      }
      break;
  }

  // Apply pagination
  query = query.range(offset, offset + itemsPerPage - 1);

  return { query, currentPage, itemsPerPage };
}

// Helper function to get price range from products
function getPriceRange(products: ProductWithRelations[] | null) {
  if (!products || products.length === 0) {
    return { min: 0, max: 0 };
  }

  const prices = products.map(p => p.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
}

// Helper function to generate related searches
function generateRelatedSearches(q: string, category: string): string[] {
  if (!q) return [];

  const searches = [
    `${q} giá rẻ`,
    `${q} chính hãng`,
    `${q} cao cấp`,
    `${q} khuyến mãi`
  ];

  // Add category-specific searches if applicable
  if (category) {
    searches.push(`${q} ${category}`);
  }

  return searches.slice(0, 4); // Limit to 4 related searches
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  
  try {
    // Build and execute search query
    const { query, currentPage, itemsPerPage } = await buildSearchQuery(params);
    
    const { data: products, error, count } = await query as { 
      data: ProductWithRelations[] | null, 
      error: any,
      count: number | null 
    };

    if (error) {
      console.error('Error searching products:', error);
      // You might want to handle this error more gracefully
      // Maybe return an error page or show a message to the user
    }

    // Fetch all active categories for filter
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
    }

    // Calculate pagination
    const totalPages = count ? Math.ceil(count / itemsPerPage) : 0;

    // Get price range for filters
    const priceRange = getPriceRange(products);

    // Generate related searches
    const relatedSearches = generateRelatedSearches(params.q || '', params.category || '');

    // Get current category info if filtering by category
    let currentCategory = null;
    if (params.category && categories) {
      currentCategory = categories.find(c => c.slug === params.category);
    }

    return (
      <SearchPageClient
        searchQuery={params.q || ''}
        products={products || []}
        categories={categories || []}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={count || 0}
        searchParams={params}
        relatedSearches={relatedSearches}
      />
    );
  } catch (error) {
    console.error('Unexpected error in SearchPage:', error);
    // Return error page or fallback UI
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Đã xảy ra lỗi</h1>
        <p>Xin lỗi, đã có lỗi xảy ra khi tìm kiếm sản phẩm. Vui lòng thử lại sau.</p>
      </div>
    );
  }
}