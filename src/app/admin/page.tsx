'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

import { Category, ProductWithDetails } from '@/types/product';

import ProductForm from '@/components/admin/ProductForm';
import StatsCards from '@/components/admin/StatsCards';
import ProductsGrid from '@/components/admin/ProductsGrid';
import Loading from '@/components/ui/Loading';

export default function AdminPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [products, setProducts] = useState<ProductWithDetails[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductWithDetails | null>(null);

    // Kiểm tra role admin
    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data: profile, error } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single();

            console.log('Current user:', profile);

            if (error || profile?.role !== 'admin') {
                alert('Bạn không có quyền truy cập trang này.');
                router.push('/');
                return;
            }

            setIsAdmin(true);
            await Promise.all([fetchProducts(), fetchCategories()]);
            setLoading(false);
        };

        checkAdmin();
    }, [router]);

    // Lấy danh sách categories
    const fetchCategories = async () => {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name');

        if (!error && data) setCategories(data);
    };

    // Lấy danh sách sản phẩm với thông tin đầy đủ
    const fetchProducts = async () => {
        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                category:categories(id, name),
                images:product_images(*),
                variants:product_variants(*)
            `)
            .order('created_at', { ascending: false });

        if (!error && data) {
            // Sắp xếp images theo sort_order
            const productsWithSortedImages = data.map(product => ({
                ...product,
                images: product.images.sort((a: any, b: any) => a.sort_order - b.sort_order)
            }));
            setProducts(productsWithSortedImages as ProductWithDetails[]);
        }
    };

    // Xóa sản phẩm (cascade sẽ tự động xóa images và variants)
    const handleDeleteProduct = async (product: ProductWithDetails) => {
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', product.id);

            if (error) {
                throw error;
            }
            
            await fetchProducts();
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

    if (loading) return <Loading />;
    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
                            <p className="mt-1 text-sm text-gray-500">Thêm, sửa và quản lý các sản phẩm trong cửa hàng</p>
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
                    <ProductForm
                        product={editingProduct}
                        categories={categories}
                        onSuccess={handleFormSuccess}
                        onCancel={handleFormCancel}
                    />
                )}

                {/* Stats Cards */}
                <StatsCards products={products} />

                {/* Products Grid */}
                <ProductsGrid
                    products={products}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                    onAddProduct={handleAddProduct}
                />
            </div>
        </div>
    );
}