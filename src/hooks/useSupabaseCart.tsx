'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

// Types cho Supabase Cart
export interface CartItemWithDetails {
  id: number;
  cart_id: string;
  product_variant_id: number;
  quantity: number;
  added_at: string;
  // Joined data từ các bảng khác
  product_variants: {
    id: number;
    product_id: number;
    color: string;
    size: string;
    price_override?: number;
    stock: number;
    products: {
      id: number;
      name: string;
      price: number;
      discount_price?: number;
      slug: string;
      product_images: Array<{
        image_url: string;
        sort_order: number;
      }>;
    };
  };
}

export interface CartSummary {
  items: CartItemWithDetails[];
  totalItems: number;
  subtotal: number;
  loading: boolean;
  error: string | null;
}

export interface UseSupabaseCartReturn extends CartSummary {
  addToCart: (productVariantId: number, quantity?: number) => Promise<boolean>;
  removeFromCart: (cartItemId: number) => Promise<boolean>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  refreshCart: () => Promise<void>;
  isInCart: (productVariantId: number) => boolean;
}

export const useSupabaseCart = (): UseSupabaseCartReturn => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItemWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch cart items từ database
  const fetchCartItems = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          cart_id,
          product_variant_id,
          quantity,
          added_at,
          product_variants (
            id,
            product_id,
            color,
            size,
            price_override,
            stock,
            products (
              id,
              name,
              price,
              discount_price,
              slug,
              product_images (
                image_url,
                sort_order
              )
            )
          )
        `)
        .eq('cart_id', user.id)
        .order('added_at', { ascending: false });

      if (error) throw error;

      setItems(data as CartItemWithDetails[] || []);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Tạo cart cho user nếu chưa có
  const ensureCartExists = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      // Kiểm tra xem cart đã tồn tại chưa
      const { data: existingCart } = await supabase
        .from('cart')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (!existingCart) {
        // Tạo cart mới
        const { error } = await supabase
          .from('cart')
          .insert({ user_id: user.id });

        if (error) throw error;
      }

      return true;
    } catch (err) {
      console.error('Error ensuring cart exists:', err);
      setError('Không thể tạo giỏ hàng');
      return false;
    }
  };

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = async (productVariantId: number, quantity: number = 1): Promise<boolean> => {
    if (!user) {
      setError('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Đảm bảo cart tồn tại
      const cartCreated = await ensureCartExists();
      if (!cartCreated) return false;

      // Kiểm tra xem sản phẩm đã có trong giỏ chưa
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', user.id)
        .eq('product_variant_id', productVariantId)
        .single();

      if (existingItem) {
        // Cập nhật số lượng nếu đã có
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        // Thêm mới nếu chưa có
        const { error } = await supabase
          .from('cart_items')
          .insert({
            cart_id: user.id,
            product_variant_id: productVariantId,
            quantity: quantity
          });

        if (error) throw error;
      }

      // Refresh cart
      await fetchCartItems();
      return true;
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Không thể thêm sản phẩm vào giỏ hàng');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = async (cartItemId: number): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId)
        .eq('cart_id', user.id); // Đảm bảo chỉ xóa item của user hiện tại

      if (error) throw error;

      // Refresh cart
      await fetchCartItems();
      return true;
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError('Không thể xóa sản phẩm khỏi giỏ hàng');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật số lượng sản phẩm
  const updateQuantity = async (cartItemId: number, quantity: number): Promise<boolean> => {
    if (!user) return false;

    if (quantity <= 0) {
      return await removeFromCart(cartItemId);
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId)
        .eq('cart_id', user.id); // Đảm bảo chỉ cập nhật item của user hiện tại

      if (error) throw error;

      // Refresh cart
      await fetchCartItems();
      return true;
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError('Không thể cập nhật số lượng');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = async (): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', user.id);

      if (error) throw error;

      setItems([]);
      return true;
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError('Không thể xóa giỏ hàng');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra sản phẩm có trong giỏ hàng không
  const isInCart = (productVariantId: number): boolean => {
    return items.some(item => item.product_variant_id === productVariantId);
  };

  // Tính tổng tiền
  const subtotal = items.reduce((total, item) => {
    const product = item.product_variants.products;
    const price = item.product_variants.price_override || 
                  product.discount_price || 
                  product.price;
    return total + (price * item.quantity);
  }, 0);

  // Tính tổng số lượng
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  // Load cart khi user thay đổi
  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  return {
    items,
    totalItems,
    subtotal,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart: fetchCartItems,
    isInCart,
  };
};