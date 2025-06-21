import { useState, useEffect } from 'react';

type CartItem = {
  id: number
  name: string
  price: number
  image_url: string
  quantity: number
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('cart')
    if (stored) setCart(JSON.parse(stored))
  }, []);

  useEffect(() => {
    
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const found = prev.find(p => p.id === item.id);
      if (found) {
        return prev.map(p => p.id === item.id ? { ...p, quantity: p.quantity + item.quantity } : p);
      } else {
        return [...prev, item];
      }
    })
  }

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter(p => p.id !== id));
  }

  const clearCart = () => setCart([]);

  return { cart, addToCart, removeFromCart, clearCart }
}
