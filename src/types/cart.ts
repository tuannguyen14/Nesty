// types/cart.ts
export interface CartItem {
  id: string;
  product_id: string;
  variant_id?: string;
  name: string;
  slug: string;
  price: number;
  original_price?: number;
  discount_percent?: number;
  quantity: number;
  image?: string;
  color?: string;
  size?: string;
  stock?: number;
}

export interface CartStore {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity' | 'id'> & { quantity?: number }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  isInCart: (productId: string, variantId?: string) => boolean;
}

export interface CouponCode {
  code: string;
  type: 'percentage' | 'fixed' | 'shipping';
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  description: string;
}

// For checkout process
export interface CartSummary {
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  appliedCoupon?: string;
}