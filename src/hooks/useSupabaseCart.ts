'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

// Types cho Supabase Cart
export interface CartItemWithDetails {
  id: number;
  user_id: string;
  product_variant_id: number;
  quantity: number;
  added_at: string;
  product_variants: {
    id: number;
    product_id: number;
    color?: string;
    size?: string;
    price_override?: number;
    stock: number;
    products: {
      id: number;
      name: string;
      price: number;
      discount_price?: number;
      slug: string;
      product_images: Array<{
        id: number;
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

export interface UseSupabaseCartReturn {
  items: CartItemWithDetails[];
  totalItems: number;
  subtotal: number;
  loading: boolean;
  error: string | null;
  addToCart: (productVariantId: number, quantity?: number) => Promise<boolean>;
  removeFromCart: (cartItemId: number) => Promise<boolean>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  refreshCart: () => Promise<void>;
  isInCart: (productVariantId: number) => boolean;
  getCartItem: (productVariantId: number) => CartItemWithDetails | undefined;
}

export const useSupabaseCart = (): UseSupabaseCartReturn => {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItemWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Stable refs để tránh infinite re-renders
  const userIdRef = useRef<string | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const isInitializedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // FIXED: Stable fetch function với proper dependencies
  const fetchCartItems = useCallback(async (force = false) => {
    // Prevent multiple simultaneous fetches
    if (loading && !force) {
      console.log('Fetch already in progress, skipping...');
      return;
    }

    // Wait for auth to complete
    if (authLoading) {
      console.log('Auth loading, waiting...');
      return;
    }

    // Clear items if no user
    if (!user) {
      setItems([]);
      setError(null);
      isInitializedRef.current = true;
      return;
    }

    // Check if user changed
    const userChanged = userIdRef.current !== user.id;
    if (userChanged) {
      console.log('User changed, forcing refresh');
      userIdRef.current = user.id;
      isInitializedRef.current = false;
      force = true;
    }

    // Debounce non-forced requests
    const now = Date.now();
    if (!force && now - lastFetchTimeRef.current < 1000) {
      console.log('Request debounced');
      return;
    }

    // Skip if already initialized and not forced
    if (!force && isInitializedRef.current) {
      console.log('Already initialized, skipping fetch');
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    lastFetchTimeRef.current = now;

    console.log('Fetching cart items for user:', user.id);
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('cart_items')
        .select(`
          id,
          user_id,
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
                id,
                image_url,
                sort_order
              )
            )
          )
        `)
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      // Check if request was cancelled
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      if (fetchError) throw fetchError;

      // FIXED: Proper type assertion with validation
      const validItems = (data || []).filter(item => 
        item.product_variants
      ) as unknown as CartItemWithDetails[];

      console.log(`Cart loaded: ${validItems.length} items`);
      setItems(validItems);
      isInitializedRef.current = true;

    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Fetch cancelled');
        return;
      }
      console.error('Cart fetch error:', err);
      setError('Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  }, [user?.id, authLoading, loading]); // Minimal dependencies

  // FIXED: Initialize only once when user is ready
  useEffect(() => {
    if (!authLoading && user && !isInitializedRef.current) {
      console.log('Initializing cart for user:', user.id);
      fetchCartItems(true);
    }
  }, [user?.id, authLoading]); // Only depend on user ID and auth loading

  // FIXED: Manual refresh function - return Promise<void>
  const refreshCart = useCallback(async (): Promise<void> => {
    console.log('Manual cart refresh requested');
    await fetchCartItems(true);
  }, [fetchCartItems]);

  // OPTIMIZED: Add to cart với minimal re-renders
  const addToCart = useCallback(async (productVariantId: number, quantity: number = 1): Promise<boolean> => {
    if (!user) {
      setError('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return false;
    }

    setError(null);

    try {
      // Check stock and existing item in parallel
      const [stockResult, existingResult] = await Promise.all([
        supabase
          .from('product_variants')
          .select('stock')
          .eq('id', productVariantId)
          .single(),
        supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('user_id', user.id)
          .eq('product_variant_id', productVariantId)
          .maybeSingle() // Use maybeSingle instead of single to avoid error when not found
      ]);

      const { data: variant, error: stockError } = stockResult;
      const { data: existingItem, error: existingError } = existingResult;

      if (stockError) throw stockError;
      if (existingError) throw existingError;

      if (!variant) {
        setError('Sản phẩm không tồn tại');
        return false;
      }

      const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;

      if (variant.stock < newQuantity) {
        setError('Không đủ số lượng trong kho');
        return false;
      }

      // Update or insert
      if (existingItem) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_variant_id: productVariantId,
            quantity: quantity
          });
        if (error) throw error;
      }

      // Refresh cart after successful operation
      await fetchCartItems(true);
      return true;

    } catch (err: any) {
      console.error('Add to cart error:', err);
      setError('Không thể thêm sản phẩm vào giỏ hàng');
      return false;
    }
  }, [user, fetchCartItems]);

  // OPTIMIZED: Remove from cart
  const removeFromCart = useCallback(async (cartItemId: number): Promise<boolean> => {
    if (!user) return false;

    setError(null);

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Optimistic update
      setItems(prev => prev.filter(item => item.id !== cartItemId));
      return true;

    } catch (err: any) {
      console.error('Remove from cart error:', err);
      setError('Không thể xóa sản phẩm khỏi giỏ hàng');
      // Refresh on error to sync state
      fetchCartItems(true);
      return false;
    }
  }, [user, fetchCartItems]);

  // OPTIMIZED: Update quantity
  const updateQuantity = useCallback(async (cartItemId: number, quantity: number): Promise<boolean> => {
    if (!user) return false;

    if (quantity <= 0) {
      return await removeFromCart(cartItemId);
    }

    setError(null);

    // Find item in current state
    const item = items.find(i => i.id === cartItemId);
    if (!item) {
      setError('Không tìm thấy sản phẩm trong giỏ hàng');
      return false;
    }

    if (item.product_variants.stock < quantity) {
      setError('Không đủ số lượng trong kho');
      return false;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Optimistic update
      setItems(prev => prev.map(item => 
        item.id === cartItemId ? { ...item, quantity } : item
      ));
      return true;

    } catch (err: any) {
      console.error('Update quantity error:', err);
      setError('Không thể cập nhật số lượng');
      // Refresh on error
      fetchCartItems(true);
      return false;
    }
  }, [user, items, removeFromCart, fetchCartItems]);

  // OPTIMIZED: Clear cart
  const clearCart = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    setError(null);

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      // Clear state immediately
      setItems([]);
      return true;

    } catch (err: any) {
      console.error('Clear cart error:', err);
      setError('Không thể xóa giỏ hàng');
      return false;
    }
  }, [user]);

  // MEMOIZED helper functions để tránh re-renders
  const isInCart = useCallback((productVariantId: number): boolean => {
    return items.some(item => item.product_variant_id === productVariantId);
  }, [items]);

  const getCartItem = useCallback((productVariantId: number): CartItemWithDetails | undefined => {
    return items.find(item => item.product_variant_id === productVariantId);
  }, [items]);

  // MEMOIZED calculations
  const { subtotal, totalItems } = useMemo(() => {
    const subtotal = items.reduce((total, item) => {
      const product = item.product_variants.products;
      const finalPrice = item.product_variants.price_override ?? 
                        product.discount_price ?? 
                        product.price;
      return total + (finalPrice * item.quantity);
    }, 0);

    const totalItems = items.reduce((total, item) => total + item.quantity, 0);

    return { subtotal, totalItems };
  }, [items]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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
    refreshCart,
    isInCart,
    getCartItem,
  };
};