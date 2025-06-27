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

interface Classification {
    type: 'color' | 'size' | '';
    values: string[];
}

export default function ProductForm({ product, categories, onSuccess, onCancel }: ProductFormProps) {
    const [loading, setLoading] = useState(false);
    const [uploadingImages, setUploadingImages] = useState<{ [key: number]: boolean }>({});
    const [classification1, setClassification1] = useState<Classification>({ type: '', values: [] });
    const [classification2, setClassification2] = useState<Classification>({ type: '', values: [] });
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
                    stock: variant.stock,
                    sku: variant.sku || ''
                }))
            });

            // Try to detect existing classifications
            if (product.variants.length > 0) {
                const hasColors = product.variants.some(v => v.color);
                const hasSizes = product.variants.some(v => v.size);

                if (hasColors) {
                    const colors = [...new Set(product.variants.map(v => v.color).filter((c): c is string => !!c))];
                    setClassification1({ type: 'color', values: colors });
                }

                if (hasSizes) {
                    const sizes = [...new Set(product.variants.map(v => v.size).filter((s): s is string => !!s))];
                    if (hasColors) {
                        setClassification2({ type: 'size', values: sizes });
                    } else {
                        setClassification1({ type: 'size', values: sizes });
                    }
                }
            }
        }
    }, [product]);

    const uploadImageToBucket = async (file: File): Promise<string> => {
        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new Error('File quá lớn. Kích thước tối đa 5MB.');
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error('Định dạng file không hỗ trợ. Chỉ chấp nhận JPG, PNG, GIF, WebP.');
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        const filePath = `products/${fileName}.${fileExt}`;

        try {
            console.log('Starting upload:', filePath);

            // Upload with timeout
            const uploadPromise = supabase.storage
                .from('product-images')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            // Add timeout (30 seconds)
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Upload timeout - quá 30 giây')), 30000);
            });

            const { data, error } = await Promise.race([uploadPromise, timeoutPromise]) as any;

            if (error) {
                console.error('Upload error:', error);
                throw new Error(`Upload thất bại: ${error.message}`);
            }

            console.log('Upload successful:', data);

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);

            if (!urlData.publicUrl) {
                throw new Error('Không thể lấy URL công khai');
            }

            console.log('Public URL:', urlData.publicUrl);
            return urlData.publicUrl;

        } catch (error: any) {
            console.error('Upload image error:', error);

            // Clean up failed upload
            try {
                await supabase.storage
                    .from('product-images')
                    .remove([filePath]);
            } catch (cleanupError) {
                console.error('Cleanup error:', cleanupError);
            }

            throw error;
        }
    };

    const handleMultipleImageUpload = async (files: FileList) => {
        const fileArray = Array.from(files);

        for (let i = 0; i < fileArray.length; i++) {
            const file = fileArray[i];
            const index = formData.images.length + i;

            // Add placeholder for new image
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, { image_url: '', sort_order: index + 1 }]
            }));

            // Upload image
            try {
                setUploadingImages(prev => ({ ...prev, [index]: true }));
                const url = await uploadImageToBucket(file);

                // Update with uploaded URL
                setFormData(prev => ({
                    ...prev,
                    images: prev.images.map((img, idx) =>
                        idx === index ? { ...img, image_url: url } : img
                    )
                }));
            } catch (error: any) {
                console.error(`Upload failed for image ${i + 1}:`, error);
                alert(`Lỗi upload hình ${i + 1}: ${error.message}`);

                // Remove failed placeholder
                setFormData(prev => ({
                    ...prev,
                    images: prev.images.filter((_, idx) => idx !== index)
                }));
            } finally {
                setUploadingImages(prev => {
                    const newState = { ...prev };
                    delete newState[index];
                    return newState;
                });
            }
        }
    };

    function removeVietnameseTones(str: string) {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D").toLocaleLowerCase();
    }

    const generateVariants = () => {
        const variants: any[] = [];

        if (!classification1.type || classification1.values.length === 0) {
            return;
        }

        if (classification2.type && classification2.values.length > 0) {
            // Two classifications
            classification1.values.forEach(value1 => {
                classification2.values.forEach(value2 => {
                    const variant: any = {
                        stock: 0,
                        price_override: 0,
                        sku: ''
                    };

                    if (classification1.type === 'color') {
                        variant.color = value1;
                        variant.size = value2;
                        variant.sku = `${removeVietnameseTones(value1)}-${removeVietnameseTones(value2)}`;
                    } else {
                        variant.size = value1;
                        variant.color = value2;
                        variant.sku = `${removeVietnameseTones(value1)}-${removeVietnameseTones(value2)}`;
                    }

                    variants.push(variant);
                });
            });
        } else {
            // Single classification
            classification1.values.forEach(value => {
                const variant: any = {
                    stock: 0,
                    price_override: 0,
                    sku: value
                };

                if (classification1.type === 'color') {
                    variant.color = value;
                    variant.size = '';
                } else {
                    variant.size = value;
                    variant.color = '';
                }

                variants.push(variant);
            });
        }

        setFormData(prev => ({ ...prev, variants }));
    };

    const addVariant = () => {
        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, { color: '', size: '', price_override: 0, stock: 0, sku: '' }]
        }));
    };

    const removeVariant = (index: number) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }));
    };

    const addClassificationValue = (classificationNumber: 1 | 2) => {
        const setter = classificationNumber === 1 ? setClassification1 : setClassification2;
        setter(prev => ({
            ...prev,
            values: [...prev.values, '']
        }));
    };

    const updateClassificationValue = (classificationNumber: 1 | 2, index: number, value: string) => {
        const setter = classificationNumber === 1 ? setClassification1 : setClassification2;
        setter(prev => ({
            ...prev,
            values: prev.values.map((v, i) => i === index ? value : v)
        }));
    };

    const removeClassificationValue = (classificationNumber: 1 | 2, index: number) => {
        const setter = classificationNumber === 1 ? setClassification1 : setClassification2;
        setter(prev => ({
            ...prev,
            values: prev.values.filter((_, i) => i !== index)
        }));
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
        try {
            // 1. Create product first
            const { data: productData, error: productError } = await supabase
                .from('products')
                .insert({
                    name: formData.name,
                    description: formData.description || null,
                    price: formData.price,
                    discount_price: formData.discount_price || null,
                    discount_start: formData.discount_start || null,
                    discount_end: formData.discount_end || null,
                    category_id: formData.category_id || null,
                })
                .select('id')
                .single();

            if (productError) {
                console.error('Product creation error:', productError);
                throw productError;
            }

            const productId = productData.id;
            console.log('Created product with ID:', productId);

            // 2. Create images if any
            if (formData.images.length > 0) {
                const imagesData = formData.images
                    .filter(img => img.image_url && img.image_url.trim() !== '') // Only valid images
                    .map(img => ({
                        product_id: productId,
                        image_url: img.image_url,
                        sort_order: img.sort_order || 0
                    }));

                if (imagesData.length > 0) {
                    console.log('Inserting images:', imagesData);

                    const { error: imagesError } = await supabase
                        .from('product_images')
                        .insert(imagesData);

                    if (imagesError) {
                        console.error('Images creation error:', imagesError);
                        throw new Error(`Lỗi tạo hình ảnh: ${imagesError.message}`);
                    }
                }
            }

            // 3. Create variants if any
            if (formData.variants.length > 0) {
                const variantsData = formData.variants.map(variant => ({
                    product_id: productId,
                    color: variant.color || null,
                    size: variant.size || null,
                    price_override: variant.price_override || null,
                    stock: variant.stock || 0,
                    sku: variant.sku || null
                }));

                console.log('Inserting variants:', variantsData);

                const { error: variantsError } = await supabase
                    .from('product_variants')
                    .insert(variantsData);

                if (variantsError) {
                    console.error('Variants creation error:', variantsError);
                    throw new Error(`Lỗi tạo biến thể: ${variantsError.message}`);
                }
            }

            console.log('Product created successfully');

        } catch (error) {
            console.error('Create product error:', error);
            throw error;
        }
    };

    const updateProduct = async () => {
        if (!product) return;

        try {
            // 1. Update product
            const { error: productError } = await supabase
                .from('products')
                .update({
                    name: formData.name,
                    description: formData.description || null,
                    price: formData.price,
                    discount_price: formData.discount_price || null,
                    discount_start: formData.discount_start || null,
                    discount_end: formData.discount_end || null,
                    category_id: formData.category_id || null
                })
                .eq('id', product.id);

            if (productError) {
                console.error('Product update error:', productError);
                throw productError;
            }

            // 2. Delete old images and variants
            const { error: deleteImagesError } = await supabase
                .from('product_images')
                .delete()
                .eq('product_id', product.id);

            if (deleteImagesError) {
                console.error('Delete images error:', deleteImagesError);
            }

            const { error: deleteVariantsError } = await supabase
                .from('product_variants')
                .delete()
                .eq('product_id', product.id);

            if (deleteVariantsError) {
                console.error('Delete variants error:', deleteVariantsError);
            }

            // 3. Create new images
            if (formData.images.length > 0) {
                const imagesData = formData.images
                    .filter(img => img.image_url && img.image_url.trim() !== '')
                    .map(img => ({
                        product_id: product.id,
                        image_url: img.image_url,
                        sort_order: img.sort_order || 0
                    }));

                if (imagesData.length > 0) {
                    const { error: imagesError } = await supabase
                        .from('product_images')
                        .insert(imagesData);

                    if (imagesError) {
                        console.error('Images update error:', imagesError);
                        throw new Error(`Lỗi cập nhật hình ảnh: ${imagesError.message}`);
                    }
                }
            }

            // 4. Create new variants
            if (formData.variants.length > 0) {
                const variantsData = formData.variants.map(variant => ({
                    product_id: product.id,
                    color: variant.color || null,
                    size: variant.size || null,
                    price_override: variant.price_override || null,
                    stock: variant.stock || 0,
                    sku: variant.sku || null
                }));

                const { error: variantsError } = await supabase
                    .from('product_variants')
                    .insert(variantsData);

                if (variantsError) {
                    console.error('Variants update error:', variantsError);
                    throw new Error(`Lỗi cập nhật biến thể: ${variantsError.message}`);
                }
            }

            console.log('Product updated successfully');

        } catch (error) {
            console.error('Update product error:', error);
            throw error;
        }
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
                        <div>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                    const files = e.target.files;
                                    if (files && files.length > 0) {
                                        handleMultipleImageUpload(files);
                                    }
                                }}
                                className="hidden"
                                id="image-upload"
                            />
                            <label
                                htmlFor="image-upload"
                                className="
                                    inline-flex items-center justify-center
                                    px-4 py-2 
                                    bg-green-600 text-white 
                                    rounded-md 
                                    hover:bg-green-700 
                                    cursor-pointer
                                    font-medium
                                "
                            >
                                Chọn nhiều hình ảnh
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.images.map((image, index) => (
                            <div key={index} className="relative">
                                {uploadingImages[index] ? (
                                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    </div>
                                ) : image.image_url ? (
                                    <div className="relative group">
                                        <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                                            <img
                                                src={image.image_url}
                                                alt={`Product ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Nút xóa - đặt ở góc trên phải */}
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-all duration-200 shadow-lg"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>

                                        {/* Input số thứ tự */}
                                        <input
                                            type="number"
                                            min="1"
                                            value={image.sort_order}
                                            onChange={(e) => updateImage(index, 'sort_order', Number(e.target.value))}
                                            className="absolute bottom-2 left-2 w-12 px-2 py-1 text-xs border border-gray-300 rounded bg-white shadow-sm"
                                            placeholder="STT"
                                        />
                                    </div>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Product Classifications */}
                <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Phân loại hàng</h3>

                    {/* Classification 1 */}
                    <div className="mb-6">
                        <div className="flex items-center gap-4 mb-3">
                            <label className="text-sm font-medium text-gray-700">Phân loại 1:</label>
                            <select
                                value={classification1.type}
                                onChange={(e) => {
                                    const newType = e.target.value as 'color' | 'size' | '';
                                    setClassification1({ type: newType, values: [] });
                                    if (classification2.type === newType) {
                                        setClassification2({ type: '', values: [] });
                                    }
                                }}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Không sử dụng</option>
                                <option value="color">Màu sắc</option>
                                <option value="size">Kích thước</option>
                            </select>
                            {classification1.type && (
                                <button
                                    type="button"
                                    onClick={() => addClassificationValue(1)}
                                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                                >
                                    Thêm {classification1.type === 'color' ? 'màu' : 'size'}
                                </button>
                            )}
                        </div>

                        {classification1.type && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {classification1.values.map((value, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={value}
                                            onChange={(e) => updateClassificationValue(1, index, e.target.value)}
                                            placeholder={classification1.type === 'color' ? 'Vd: Đỏ' : 'Vd: XL hoặc 21'}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeClassificationValue(1, index)}
                                            className="px-2 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Classification 2 */}
                    {classification1.type && (
                        <div className="mb-6">
                            <div className="flex items-center gap-4 mb-3">
                                <label className="text-sm font-medium text-gray-700">Phân loại 2:</label>
                                <select
                                    value={classification2.type}
                                    onChange={(e) => {
                                        const newType = e.target.value as 'color' | 'size' | '';
                                        setClassification2({ type: newType, values: [] });
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Không sử dụng</option>
                                    {classification1.type !== 'color' && <option value="color">Màu sắc</option>}
                                    {classification1.type !== 'size' && <option value="size">Kích thước</option>}
                                </select>
                                {classification2.type && (
                                    <button
                                        type="button"
                                        onClick={() => addClassificationValue(2)}
                                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                                    >
                                        Thêm {classification2.type === 'color' ? 'màu' : 'size'}
                                    </button>
                                )}
                            </div>

                            {classification2.type && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {classification2.values.map((value, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={value}
                                                onChange={(e) => updateClassificationValue(2, index, e.target.value)}
                                                placeholder={classification2.type === 'color' ? 'Vd: Đỏ' : 'Vd: XL hoặc 21'}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeClassificationValue(2, index)}
                                                className="px-2 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Generate Variants Button */}
                    {classification1.type && classification1.values.length > 0 && (
                        <button
                            type="button"
                            onClick={generateVariants}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                            Tạo biến thể
                        </button>
                    )}
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

                    {formData.variants.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            SKU
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Màu sắc
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Kích thước
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Giá
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tồn kho
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Hành động
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {formData.variants.map((variant, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <input
                                                    type="text"
                                                    value={variant.sku || ''}
                                                    onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <input
                                                    type="text"
                                                    value={variant.color || ''}
                                                    onChange={(e) => updateVariant(index, 'color', e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <input
                                                    type="text"
                                                    value={variant.size || ''}
                                                    onChange={(e) => updateVariant(index, 'size', e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={variant.price_override}
                                                    onChange={(e) => updateVariant(index, 'price_override', Number(e.target.value))}
                                                    placeholder="0 = giá gốc"
                                                    className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={variant.stock}
                                                    onChange={(e) => updateVariant(index, 'stock', Number(e.target.value))}
                                                    className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <button
                                                    type="button"
                                                    onClick={() => removeVariant(index)}
                                                    className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                                                >
                                                    Xóa
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">
                            Chưa có biến thể. Hãy thêm phân loại hàng và nhấn &quot;Tạo biến thể&quot; hoặc thêm biến thể thủ công.
                        </p>
                    )}
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-6 border-t">
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