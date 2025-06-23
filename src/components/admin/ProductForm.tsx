'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Category, ProductWithDetails, CreateProductData } from '@/types/product';

interface ProductFormProps {
    product?: ProductWithDetails | null;
    categories: Category[];
    onSuccess: () => void;
    onCancel: () => void;
}

export default function ProductForm({ product, categories, onSuccess, onCancel }: ProductFormProps) {
    const [loading, setLoading] = useState(false);
    const [uploadingImages, setUploadingImages] = useState<{ [key: number]: boolean }>({});
    const [formData, setFormData] = useState<CreateProductData>({
        name: '',
        description: '',
        price: 0,
        discount_price: 0,
        discount_start: '',
        discount_end: '',
        category_id: undefined,
        images: [],
        variants: []
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                description: product.description || '',
                price: product.price,
                discount_price: product.discount_price || 0,
                discount_start: product.discount_start ? new Date(product.discount_start).toISOString().slice(0, 16) : '',
                discount_end: product.discount_end ? new Date(product.discount_end).toISOString().slice(0, 16) : '',
                category_id: product.category_id,
                images: product.images.map(img => ({
                    image_url: img.image_url,
                    sort_order: img.sort_order
                })),
                variants: product.variants.map(variant => ({
                    color: variant.color,
                    size: variant.size,
                    price_override: variant.price_override || 0,
                    stock: variant.stock
                }))
            });
        }
    }, [product]);

    const uploadImageToBucket = async (file: File): Promise<string> => {
        const fileExt = file.name.split('.').pop();
        const filePath = `product-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        
        try {
            // Upload
            const { data, error } = await supabase.storage
                .from('product-images')
                .upload(filePath, file, { cacheControl: '3600', upsert: false });

            if (error) {
                console.error('Upload error:', error);
                throw new Error(`Upload failed: ${error.message}`);
            }

            // Lấy public URL
            const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
            
            if (!urlData.publicUrl) {
                throw new Error('Failed to get public URL');
            }
            
            return urlData.publicUrl;
        } catch (error) {
            console.error('Upload image error:', error);
            throw error;
        }
    };

    const handleImageUpload = async (index: number, file: File) => {
        if (!file) return;
        
        try {
            // Set loading state for specific image
            setUploadingImages(prev => ({ ...prev, [index]: true }));
            
            const url = await uploadImageToBucket(file);
            updateImage(index, 'image_url', url);
            
        } catch (error: any) {
            console.error('Upload failed:', error);
            alert(`Upload hình ảnh thất bại: ${error.message || 'Lỗi không xác định'}`);
        } finally {
            // Always reset loading state
            setUploadingImages(prev => ({ ...prev, [index]: false }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (product) {
                // Update existing product
                await updateProduct();
            } else {
                // Create new product
                await createProduct();
            }

            onSuccess();
        } catch (error: any) {
            console.error('Error saving product:', error);
            alert('Có lỗi xảy ra: ' + (error.message || 'Lỗi không xác định'));
        } finally {
            setLoading(false);
        }
    };

    const createProduct = async () => {
        // Create product
        const { data: productData, error: productError } = await supabase
            .from('products')
            .insert({
                name: formData.name,
                description: formData.description,
                price: formData.price,
                discount_price: formData.discount_price || null,
                discount_start: formData.discount_start || null,
                discount_end: formData.discount_end || null,
                category_id: formData.category_id || null,
            })
            .select()
            .single();

        if (productError) throw productError;

        const productId = productData.id;

        // Create images
        if (formData.images.length > 0) {
            const imagesData = formData.images.map(img => ({
                product_id: productId,
                image_url: img.image_url,
                sort_order: img.sort_order
            }));

            const { error: imagesError } = await supabase
                .from('product_images')
                .insert(imagesData);

            if (imagesError) throw imagesError;
        }

        // Create variants
        if (formData.variants.length > 0) {
            const variantsData = formData.variants.map(variant => ({
                product_id: productId,
                color: variant.color,
                size: variant.size,
                price_override: variant.price_override || null,
                stock: variant.stock
            }));

            const { error: variantsError } = await supabase
                .from('product_variants')
                .insert(variantsData);

            if (variantsError) throw variantsError;
        }
    };

    const updateProduct = async () => {
        if (!product) return;

        // Update product
        const { error: productError } = await supabase
            .from('products')
            .update({
                name: formData.name,
                description: formData.description,
                price: formData.price,
                discount_price: formData.discount_price || null,
                discount_start: formData.discount_start || null,
                discount_end: formData.discount_end || null,
                category_id: formData.category_id || null,
                updated_at: new Date().toISOString()
            })
            .eq('id', product.id);

        if (productError) throw productError;

        // Delete old images and variants
        await supabase.from('product_images').delete().eq('product_id', product.id);
        await supabase.from('product_variants').delete().eq('product_id', product.id);

        // Create new images
        if (formData.images.length > 0) {
            const imagesData = formData.images.map(img => ({
                product_id: product.id,
                image_url: img.image_url,
                sort_order: img.sort_order
            }));

            const { error: imagesError } = await supabase
                .from('product_images')
                .insert(imagesData);

            if (imagesError) throw imagesError;
        }

        // Create new variants
        if (formData.variants.length > 0) {
            const variantsData = formData.variants.map(variant => ({
                product_id: product.id,
                color: variant.color,
                size: variant.size,
                price_override: variant.price_override || null,
                stock: variant.stock
            }));

            const { error: variantsError } = await supabase
                .from('product_variants')
                .insert(variantsData);

            if (variantsError) throw variantsError;
        }
    };

    const addImage = () => {
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, { image_url: '', sort_order: prev.images.length + 1 }]
        }));
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
        // Clean up upload state
        setUploadingImages(prev => {
            const newState = { ...prev };
            delete newState[index];
            return newState;
        });
    };

    const updateImage = (index: number, field: keyof typeof formData.images[0], value: string | number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.map((img, i) => i === index ? { ...img, [field]: value } : img)
        }));
    };

    const addVariant = () => {
        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, { color: '', size: '', price_override: 0, stock: 0 }]
        }));
    };

    const removeVariant = (index: number) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }));
    };

    const updateVariant = (index: number, field: keyof typeof formData.variants[0], value: string | number) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.map((variant, i) => i === index ? { ...variant, [field]: value } : variant)
        }));
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên sản phẩm *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Danh mục
                        </label>
                        <select
                            value={formData.category_id || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value ? Number(e.target.value) : undefined }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Chọn danh mục</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mô tả
                    </label>
                    <textarea
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Giá gốc *
                        </label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Giá giảm
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.discount_price}
                            onChange={(e) => setFormData(prev => ({ ...prev, discount_price: Number(e.target.value) }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bắt đầu giảm giá
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.discount_start}
                            onChange={(e) => setFormData(prev => ({ ...prev, discount_start: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Kết thúc giảm giá
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.discount_end}
                            onChange={(e) => setFormData(prev => ({ ...prev, discount_end: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Images */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Hình ảnh</h3>
                        <button
                            type="button"
                            onClick={addImage}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                            Thêm hình ảnh
                        </button>
                    </div>

                    {formData.images.map((image, index) => (
                        <div key={index} className="flex gap-4 items-center mb-4 p-4 border rounded-md">
                            {/* Preview */}
                            {image.image_url && (
                                <img
                                    src={image.image_url}
                                    alt="preview"
                                    className="w-16 h-16 object-cover rounded"
                                />
                            )}

                            {/* Upload file */}
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    disabled={uploadingImages[index]}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            handleImageUpload(index, file);
                                        }
                                    }}
                                    className="w-full"
                                />
                                {uploadingImages[index] && (
                                    <div className="text-sm text-blue-600 mt-1">
                                        Đang upload...
                                    </div>
                                )}
                                {image.image_url && (
                                    <input
                                        type="text"
                                        value={image.image_url}
                                        readOnly
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2 bg-gray-50"
                                    />
                                )}
                            </div>
                            <div className="w-24">
                                <input
                                    type="number"
                                    placeholder="Thứ tự"
                                    min="1"
                                    value={image.sort_order}
                                    onChange={(e) => updateImage(index, 'sort_order', Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                disabled={uploadingImages[index]}
                                className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Xóa
                            </button>
                        </div>
                    ))}
                </div>

                {/* Variants */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Biến thể</h3>
                        <button
                            type="button"
                            onClick={addVariant}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                            Thêm biến thể
                        </button>
                    </div>

                    {formData.variants.map((variant, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center mb-4 p-4 border rounded-md">
                            <div>
                                <div>Màu sắc</div>
                                <input
                                    type="text"
                                    value={variant.color}
                                    onChange={(e) => updateVariant(index, 'color', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <div>Size</div>
                                <input
                                    type="text"
                                    value={variant.size}
                                    onChange={(e) => updateVariant(index, 'size', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <div>Tồn kho</div>
                                <input
                                    type="number"
                                    min="0"
                                    value={variant.stock}
                                    onChange={(e) => updateVariant(index, 'stock', Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <button
                                    type="button"
                                    onClick={() => removeVariant(index)}
                                    className="w-full px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-6">
                    <button
                        type="submit"
                        disabled={loading || Object.values(uploadingImages).some(Boolean)}
                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Đang lưu...' : (product ? 'Cập nhật' : 'Thêm sản phẩm')}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="px-6 py-3 bg-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
}