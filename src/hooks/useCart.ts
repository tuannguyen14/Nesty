'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, CartStore } from '@/types/cart';

export const useCart = create<CartStore>()(
  persist(
    (set: (fn: (state: CartStore) => CartStore) => void, get: () => CartStore) => ({
      cart: [],

      addToCart: (item: Omit<CartItem, 'quantity' | 'id'> & { quantity?: number }) => {
        set((state: CartStore) => {
          const existingItem = state.cart.find(
            (cartItem: CartItem) => 
              cartItem.product_id === item.product_id && 
              cartItem.variant_id === item.variant_id
          );

          if (existingItem) {
            // Update quantity if item already exists
            return {
              ...state,
              cart: state.cart.map((cartItem: CartItem) =>
                cartItem.id === existingItem.id
                  ? { ...cartItem, quantity: cartItem.quantity + (item.quantity || 1) }
                  : cartItem
              ),
            };
          }

          // Generate unique ID for new item
          const uniqueId = `${item.product_id}_${item.variant_id || 'default'}_${Date.now()}`;
          
          // Add new item
          const newItem: CartItem = {
            ...item,
            id: uniqueId,
            quantity: item.quantity || 1,
          };

          return { 
            ...state,
            cart: [...state.cart, newItem] 
          };
        });
      },

      removeFromCart: (id: string) => {
        set((state: CartStore) => ({
          ...state,
          cart: state.cart.filter((item: CartItem) => item.id !== id),
        }));
      },

      updateQuantity: (id: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeFromCart(id);
          return;
        }

        set((state: CartStore) => ({
          ...state,
          cart: state.cart.map((item: CartItem) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set((state: CartStore) => ({ 
          ...state,
          cart: [] 
        }));
      },

      getCartTotal: () => {
        const { cart } = get();
        return cart.reduce((total: number, item: CartItem) => 
          total + item.price * item.quantity, 0
        );
      },

      getCartCount: () => {
        const { cart } = get();
        return cart.reduce((count: number, item: CartItem) => 
          count + item.quantity, 0
        );
      },

      isInCart: (productId: string, variantId?: string) => {
        const { cart } = get();
        return cart.some(
          (item: CartItem) => 
            item.product_id === productId && 
            (!variantId || item.variant_id === variantId)
        );
      },
    }),
    {
      name: 'shopping-cart',
    }
  )
);

// Export types for convenience
export type { CartItem, CartStore } from '@/types/cart';