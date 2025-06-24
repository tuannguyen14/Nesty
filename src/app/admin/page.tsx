'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

import { Category, ProductWithDetails } from '@/types/product';

import ProductForm from '@/components/admin/ProductForm';
import StatsCards from '@/components/admin/StatsCards';
import ProductsGrid from '@/components/admin/ProductsGrid';
import Loading from '@/components/ui/Loading';

import { useAuth } from '@/hooks/useAuth';

export default function AdminPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [loadingUI, setLoadingUI] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [products, setProducts] = useState<ProductWithDetails[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductWithDetails | null>(null);

    // Kiểm tra role admin
    useEffect(() => {
        if (loading) return;

        const checkAdmin = async () => {
            console.log('Checking admin role...');
            console.log('Current user:', user);
            
            if (!user) {
                router.push('/login');
                return;
            }

            if (user?.role !== 'admin') {
                alert('Bạn không có quyền truy cập trang này.');
                router.push('/');
                return;
            }

            setIsAdmin(true);
            await Promise.all([fetchProducts(), fetchCategories()]);
            setLoadingUI(false);
        };

        checkAdmin();
    }, [user, loading, router]);

    // Lấy danh sách categories
    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name');

            if (error) {
                console.error('Error fetching categories:', error);
                return;
            }

            if (data) setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    // Lấy danh sách sản phẩm với thông tin đầy đủ
    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
                    id,
                    name,
                    description,
                    price,
                    discount_price,
                    discount_start,
                    discount_end,
                    category_id,
                    slug,
                    created_at,
                    category:categories(
                        id,
                        name,
                        slug
                    ),
                    images:product_images(
                        id,
                        product_id,
                        image_url,
                        sort_order
                    ),
                    variants:product_variants(
                        id,
                        product_id,
                        color,
                        size,
                        price_override,
                        stock
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching products:', error);
                return;
            }

            if (data) {
                // Transform data to match ProductWithDetails interface
                const transformedProducts = data.map((product: any) => {
                    const variants = product.variants || [];
                    const images = product.images || [];
                    
                    return {
                        id: product.id,
                        name: product.name,
                        description: product.description || undefined,
                        price: product.price,
                        discount_price: product.discount_price || undefined,
                        discount_start: product.discount_start || undefined,
                        discount_end: product.discount_end || undefined,
                        category_id: product.category_id || undefined,
                        slug: product.slug,
                        created_at: product.created_at,
                        category: product.category || undefined,
                        images: images.sort((a: any, b: any) => a.sort_order - b.sort_order),
                        variants: variants,
                        // Calculate additional fields
                        totalStock: variants.reduce((sum: number, variant: any) => sum + (variant.stock || 0), 0),
                        availableColors: [...new Set(variants.map((v: any) => v.color).filter(Boolean))] as string[],
                        availableSizes: [...new Set(variants.map((v: any) => v.size).filter(Boolean))] as string[]
                    } as ProductWithDetails;
                });

                setProducts(transformedProducts);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    // Xóa sản phẩm (cascade sẽ tự động xóa images và variants)
    const handleDeleteProduct = async (product: ProductWithDetails) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"? Hành động này không thể hoàn tác.`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', product.id);

            if (error) {
                throw error;
            }

            // Refresh products list
            await fetchProducts();
            
            // Show success message
            alert('Xóa sản phẩm thành công!');
        } catch (error: any) {
            console.error('Lỗi xóa sản phẩm:', error);
            alert('Có lỗi xảy ra khi xóa sản phẩm: ' + error.message);
        }
    };

    // Mở form thêm sản phẩm
    const handleAddProduct = () => {
        setEditingProduct(null);
        setShowForm(true);
    };

    // Mở form sửa sản phẩm
    const handleEditProduct = (product: ProductWithDetails) => {
        setEditingProduct(product);
        setShowForm(true);
    };

    // Xử lý sau khi form thành công
    const handleFormSuccess = async () => {
        setShowForm(false);
        setEditingProduct(null);
        await fetchProducts();
    };

    // Hủy form
    const handleFormCancel = () => {
        setShowForm(false);
        setEditingProduct(null);
    };

    // Loading state
    if (loading || loadingUI) {
        return <Loading />;
    }

    // Unauthorized access
    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Không có quyền truy cập</h2>
                    <p className="text-gray-600 mb-4">Bạn cần quyền admin để truy cập trang này.</p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Thêm, sửa và quản lý các sản phẩm trong cửa hàng
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Tổng: {products.length} sản phẩm
                            </p>
                        </div>
                        <button
                            onClick={showForm ? handleFormCancel : handleAddProduct}
                            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                                showForm
                                    ? 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'
                                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                            }`}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {showForm ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                )}
                            </svg>
                            {showForm ? 'Hủy' : 'Thêm sản phẩm'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Form thêm/sửa sản phẩm */}
                {showForm && (
                    <div className="mb-8">
                        <ProductForm
                            product={editingProduct}
                            categories={categories}
                            onSuccess={handleFormSuccess}
                            onCancel={handleFormCancel}
                        />
                    </div>
                )}

                {/* Stats Cards */}
                {!showForm && <StatsCards products={products} />}

                {/* Products Grid */}
                {!showForm && (
                    <ProductsGrid
                        products={products}
                        onEdit={handleEditProduct}
                        onDelete={handleDeleteProduct}
                        onAddProduct={handleAddProduct}
                    />
                )}
            </div>
        </div>
    );
}