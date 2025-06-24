'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, CartStore } from '@/types/cart';

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (item: Omit<CartItem, 'quantity' | 'id'> & { quantity?: number }) => {
        set((state) => {
          // Tìm item đã tồn tại dựa trên product_id và variant_id
          const existingItem = state.cart.find(
            (cartItem) => 
              cartItem.product_id === item.product_id && 
              cartItem.variant_id === item.variant_id
          );

          if (existingItem) {
            // Cập nhật quantity nếu item đã tồn tại
            return {
              ...state,
              cart: state.cart.map((cartItem) =>
                cartItem.id === existingItem.id
                  ? { 
                      ...cartItem, 
                      quantity: cartItem.quantity + (item.quantity || 1),
                      // Cập nhật thông tin mới nhất (price có thể thay đổi)
                      price: item.price,
                      original_price: item.original_price,
                      discount_percent: item.discount_percent
                    }
                  : cartItem
              ),
            };
          }

          // Tạo ID unique cho item mới
          const uniqueId = `${item.product_id}_${item.variant_id || 'no-variant'}_${Date.now()}`;
          
          // Thêm item mới vào cart
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
        set((state) => ({
          ...state,
          cart: state.cart.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeFromCart(id);
          return;
        }

        set((state) => ({
          ...state,
          cart: state.cart.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set(() => ({ 
          cart: [] 
        }));
      },

      getCartTotal: () => {
        const { cart } = get();
        return cart.reduce((total, item) => {
          // Sử dụng giá hiện tại (có thể là giá gốc hoặc giá đã giảm)
          const itemPrice = item.price;
          return total + (itemPrice * item.quantity);
        }, 0);
      },

      getCartCount: () => {
        const { cart } = get();
        return cart.reduce((count, item) => count + item.quantity, 0);
      },

      isInCart: (productId: string, variantId?: string) => {
        const { cart } = get();
        return cart.some(
          (item) => 
            item.product_id === productId && 
            item.variant_id === variantId
        );
      },
    }),
    {
      name: 'shopping-cart',
      // Thêm version để handle migration nếu cần
      version: 1,
      // Migrate function nếu cần update cart structure
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migration logic nếu cần
          return persistedState;
        }
        return persistedState;
      },
    }
  )
);

// Helper functions để sử dụng với cart
export const useCartHelpers = () => {
  const { cart, getCartTotal, getCartCount } = useCart();

  // Tính tổng tiền gốc (trước khi giảm giá)
  const getOriginalTotal = () => {
    return cart.reduce((total, item) => {
      const originalPrice = item.original_price || item.price;
      return total + (originalPrice * item.quantity);
    }, 0);
  };

  // Tính tổng tiền tiết kiệm được
  const getTotalSavings = () => {
    return cart.reduce((savings, item) => {
      if (item.original_price && item.original_price > item.price) {
        const itemSavings = (item.original_price - item.price) * item.quantity;
        return savings + itemSavings;
      }
      return savings;
    }, 0);
  };

  // Kiểm tra xem có item nào đang giảm giá không
  const hasDiscountedItems = () => {
    return cart.some(item => 
      item.original_price && item.original_price > item.price
    );
  };

  // Lấy thông tin chi tiết về cart
  const getCartSummary = () => {
    const subtotal = getOriginalTotal();
    const discount = getTotalSavings();
    const total = getCartTotal();
    const itemCount = getCartCount();

    return {
      subtotal,
      discount,
      total,
      itemCount,
      hasDiscount: hasDiscountedItems()
    };
  };

  return {
    cart,
    getOriginalTotal,
    getTotalSavings,
    hasDiscountedItems,
    getCartSummary,
  };
};

// Export types for convenience
export type { CartItem, CartStore } from '@/types/cart';