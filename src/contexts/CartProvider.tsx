'use client';

import React, { createContext, useContext, useCallback, useRef, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { CartItemWithDetails, UseSupabaseCartReturn } from '@/hooks/useSupabaseCart';

// Tạo Context cho Cart
const CartContext = createContext<UseSupabaseCartReturn | null>(null);

// Provider Component với enhanced state management
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItemWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for stability
  const userIdRef = useRef<string | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const isInitializedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Enhanced fetch function with better error handling
  const fetchCartItems = useCallback(async (force = false) => {
    if (loading && !force) {
      console.log('🔄 Fetch already in progress, skipping...');
      return;
    }

    if (authLoading) {
      console.log('🔐 Auth loading, waiting...');
      return;
    }

    if (!user) {
      console.log('👤 No user, clearing cart items');
      setItems([]);
      setError(null);
      isInitializedRef.current = true;
      return;
    }

    const userChanged = userIdRef.current !== user.id;
    if (userChanged) {
      console.log('🔄 User changed, forcing refresh');
      userIdRef.current = user.id;
      isInitializedRef.current = false;
      force = true;
    }

    const now = Date.now();
    if (!force && now - lastFetchTimeRef.current < 1000) {
      console.log('⏱️ Request debounced');
      return;
    }

    if (!force && isInitializedRef.current) {
      console.log('✅ Already initialized, skipping fetch');
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    lastFetchTimeRef.current = now;

    console.log('🛒 Fetching cart items for user:', user.id);
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

      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      if (fetchError) throw fetchError;

      const validItems = (data || []).filter(item => 
        item.product_variants
      ) as unknown as CartItemWithDetails[];

      console.log(`✅ Cart loaded: ${validItems.length} items`);
      setItems(validItems);
      isInitializedRef.current = true;

    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('❌ Fetch cancelled');
        return;
      }
      console.error('❌ Cart fetch error:', err);
      setError('Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  }, [user?.id, authLoading, loading]);

  // Initialize cart when user is ready
  useEffect(() => {
    if (!authLoading && user && !isInitializedRef.current) {
      console.log('🚀 Initializing cart for user:', user.id);
      fetchCartItems(true);
    }
  }, [user?.id, authLoading, fetchCartItems]);

  // Manual refresh function
  const refreshCart = useCallback(async (): Promise<void> => {
    console.log('🔄 Manual cart refresh requested');
    await fetchCartItems(true);
  }, [fetchCartItems]);

  // Enhanced add to cart with immediate UI feedback
  const addToCart = useCallback(async (productVariantId: number, quantity: number = 1): Promise<boolean> => {
    if (!user) {
      setError('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return false;
    }

    console.log('➕ Adding to cart:', { productVariantId, quantity });
    setError(null);

    try {
      const [stockResult, existingResult] = await Promise.all([
        supabase
          .from('product_variants')
          .select('stock, products(name)')
          .eq('id', productVariantId)
          .single(),
        supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('user_id', user.id)
          .eq('product_variant_id', productVariantId)
          .maybeSingle()
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

      // Perform database operation
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

      // Force refresh to get updated data
      console.log('✅ Add to cart successful, refreshing...');
      await fetchCartItems(true);
      return true;

    } catch (err: any) {
      console.error('❌ Add to cart error:', err);
      setError('Không thể thêm sản phẩm vào giỏ hàng');
      return false;
    }
  }, [user, fetchCartItems]);

  // Enhanced remove with immediate UI feedback
  const removeFromCart = useCallback(async (cartItemId: number): Promise<boolean> => {
    if (!user) return false;

    console.log('🗑️ Removing from cart:', cartItemId);
    setError(null);

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Immediate optimistic update
      setItems(prev => {
        const updated = prev.filter(item => item.id !== cartItemId);
        console.log('🔄 Optimistic update - removed item, new count:', updated.length);
        return updated;
      });

      // Also refresh to ensure sync
      setTimeout(() => fetchCartItems(true), 100);
      
      console.log('✅ Remove from cart successful');
      return true;

    } catch (err: any) {
      console.error('❌ Remove from cart error:', err);
      setError('Không thể xóa sản phẩm khỏi giỏ hàng');
      // Refresh on error to sync state
      fetchCartItems(true);
      return false;
    }
  }, [user, fetchCartItems]);

  // Enhanced update quantity
  const updateQuantity = useCallback(async (cartItemId: number, quantity: number): Promise<boolean> => {
    if (!user) return false;

    if (quantity <= 0) {
      return await removeFromCart(cartItemId);
    }

    console.log('📝 Updating quantity:', { cartItemId, quantity });
    setError(null);

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

      // Immediate optimistic update
      setItems(prev => {
        const updated = prev.map(item => 
          item.id === cartItemId ? { ...item, quantity } : item
        );
        console.log('🔄 Optimistic update - quantity changed');
        return updated;
      });

      // Also refresh to ensure sync
      setTimeout(() => fetchCartItems(true), 100);

      console.log('✅ Update quantity successful');
      return true;

    } catch (err: any) {
      console.error('❌ Update quantity error:', err);
      setError('Không thể cập nhật số lượng');
      fetchCartItems(true);
      return false;
    }
  }, [user, items, removeFromCart, fetchCartItems]);

  // Enhanced clear cart
  const clearCart = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    console.log('🧹 Clearing cart');
    setError(null);

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      // Immediate UI update
      setItems([]);
      console.log('✅ Clear cart successful');
      return true;

    } catch (err: any) {
      console.error('❌ Clear cart error:', err);
      setError('Không thể xóa giỏ hàng');
      return false;
    }
  }, [user]);

  // Helper functions
  const isInCart = useCallback((productVariantId: number): boolean => {
    const result = items.some(item => item.product_variant_id === productVariantId);
    return result;
  }, [items]);

  const getCartItem = useCallback((productVariantId: number): CartItemWithDetails | undefined => {
    return items.find(item => item.product_variant_id === productVariantId);
  }, [items]);

  // Memoized calculations
  const subtotal = React.useMemo(() => {
    return items.reduce((total, item) => {
      const product = item.product_variants.products;
      const finalPrice = item.product_variants.price_override ?? 
                        product.discount_price ?? 
                        product.price;
      return total + (finalPrice * item.quantity);
    }, 0);
  }, [items]);

  const totalItems = React.useMemo(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('🛒 Cart state updated:', {
      itemCount: items.length,
      totalItems,
      subtotal,
      loading,
      error
    });
  }, [items, totalItems, subtotal, loading, error]);

  const contextValue: UseSupabaseCartReturn = {
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

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Hook để sử dụng Cart Context
export const useCart = (): UseSupabaseCartReturn => {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
};