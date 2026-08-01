"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  type Cart,
  type CartItem,
  emptyCart,
  getCartFromStorage,
  saveCartToStorage,
  addToCart as _addToCart,
  updateQuantity as _updateQuantity,
  removeFromCart as _removeFromCart,
  getCartTotal,
  getCartItemCount,
} from "@/lib/cart";

type CartContextType = {
  cart: Cart;
  addItem: (item: Omit<CartItem, "qty">, quantity?: number) => void;
  updateItemQuantity: (variantId: number, qty: number) => void;
  removeItem: (variantId: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(emptyCart);
  const [loaded, setLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    setCart(getCartFromStorage());
    setLoaded(true);
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    if (loaded) {
      saveCartToStorage(cart);
    }
  }, [cart, loaded]);

  const addItem = useCallback(
    (item: Omit<CartItem, "qty">, quantity?: number) => {
      setCart((prev) => _addToCart(prev, item, quantity));
    },
    []
  );

  const updateItemQuantity = useCallback((variantId: number, qty: number) => {
    setCart((prev) => _updateQuantity(prev, variantId, qty));
  }, []);

  const removeItem = useCallback((variantId: number) => {
    setCart((prev) => _removeFromCart(prev, variantId));
  }, []);

  const clearCart = useCallback(() => {
    setCart(emptyCart);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        updateItemQuantity,
        removeItem,
        clearCart,
        total: getCartTotal(cart),
        itemCount: getCartItemCount(cart),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
