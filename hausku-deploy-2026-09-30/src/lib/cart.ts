export type CartItem = {
  variantId: number;
  productId: number;
  name: string;
  slug: string;
  size: string | null;
  color: string | null;
  colorHex: string | null;
  imageUrl: string | null;
  unitPrice: number;
  qty: number;
  stockQty: number;
  sku: string;
};

export type Cart = {
  items: CartItem[];
};

export const emptyCart: Cart = { items: [] };

export function getCartFromStorage(): Cart {
  if (typeof window === "undefined") return emptyCart;
  try {
    const raw = localStorage.getItem("hausku-cart");
    if (!raw) return emptyCart;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.items)) return emptyCart;
    return parsed as Cart;
  } catch {
    return emptyCart;
  }
}

export function saveCartToStorage(cart: Cart): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("hausku-cart", JSON.stringify(cart));
  } catch {
    // Silently fail if storage is full
  }
}

export function addToCart(
  cart: Cart,
  item: Omit<CartItem, "qty">,
  quantity: number = 1
): Cart {
  const existing = cart.items.find((i) => i.variantId === item.variantId);
  if (existing) {
    return {
      items: cart.items.map((i) =>
        i.variantId === item.variantId
          ? { ...i, qty: Math.min(i.qty + quantity, i.stockQty) }
          : i
      ),
    };
  }
  return {
    items: [...cart.items, { ...item, qty: Math.min(quantity, item.stockQty) }],
  };
}

export function updateQuantity(
  cart: Cart,
  variantId: number,
  qty: number
): Cart {
  if (qty <= 0) {
    return { items: cart.items.filter((i) => i.variantId !== variantId) };
  }
  return {
    items: cart.items.map((i) =>
      i.variantId === variantId
        ? { ...i, qty: Math.min(qty, i.stockQty) }
        : i
    ),
  };
}

export function removeFromCart(cart: Cart, variantId: number): Cart {
  return { items: cart.items.filter((i) => i.variantId !== variantId) };
}

export function getCartTotal(cart: Cart): number {
  return cart.items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
}

export function getCartItemCount(cart: Cart): number {
  return cart.items.reduce((sum, item) => sum + item.qty, 0);
}
