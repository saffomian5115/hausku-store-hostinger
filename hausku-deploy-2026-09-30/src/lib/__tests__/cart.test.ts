import { describe, it, expect } from "vitest";
import {
  addToCart,
  updateQuantity,
  removeFromCart,
  getCartTotal,
  getCartItemCount,
  emptyCart,
  type CartItem,
} from "@/lib/cart";

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    variantId: 1,
    productId: 1,
    name: "Testprodukt",
    slug: "testprodukt",
    size: null,
    color: null,
    colorHex: null,
    imageUrl: null,
    unitPrice: 10,
    qty: 1,
    stockQty: 5,
    sku: "SKU-1",
    ...overrides,
  };
}

describe("addToCart", () => {
  it("adds a new item with quantity 1", () => {
    const cart = addToCart(emptyCart, makeItem(), 1);
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].qty).toBe(1);
  });

  it("adds a new item with a custom quantity", () => {
    const cart = addToCart(emptyCart, makeItem(), 3);
    expect(cart.items[0].qty).toBe(3);
  });

  it("merges quantities when the same variant is added again", () => {
    let cart = addToCart(emptyCart, makeItem(), 1);
    cart = addToCart(cart, makeItem(), 2);
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].qty).toBe(3);
  });

  it("never exceeds stock quantity", () => {
    const cart = addToCart(emptyCart, makeItem({ stockQty: 5 }), 10);
    expect(cart.items[0].qty).toBe(5);
  });
});

describe("updateQuantity", () => {
  it("updates the quantity of an existing item", () => {
    let cart = addToCart(emptyCart, makeItem(), 1);
    cart = updateQuantity(cart, 1, 4);
    expect(cart.items[0].qty).toBe(4);
  });

  it("caps quantity at stock level", () => {
    let cart = addToCart(emptyCart, makeItem({ stockQty: 5 }), 1);
    cart = updateQuantity(cart, 1, 99);
    expect(cart.items[0].qty).toBe(5);
  });

  it("removes the item when quantity drops to zero or below", () => {
    let cart = addToCart(emptyCart, makeItem(), 2);
    cart = updateQuantity(cart, 1, 0);
    expect(cart.items).toHaveLength(0);
  });
});

describe("removeFromCart", () => {
  it("removes the item with the given variantId", () => {
    let cart = addToCart(emptyCart, makeItem(), 1);
    cart = addToCart(cart, makeItem({ variantId: 2, sku: "SKU-2" }), 1);
    cart = removeFromCart(cart, 1);
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].variantId).toBe(2);
  });
});

describe("getCartTotal", () => {
  it("sums unitPrice × qty across all items", () => {
    let cart = addToCart(emptyCart, makeItem({ unitPrice: 10 }), 2);
    cart = addToCart(cart, makeItem({ variantId: 2, unitPrice: 5, sku: "SKU-2" }), 3);
    expect(getCartTotal(cart)).toBe(10 * 2 + 5 * 3); // 35
  });

  it("returns 0 for an empty cart", () => {
    expect(getCartTotal(emptyCart)).toBe(0);
  });
});

describe("getCartItemCount", () => {
  it("counts total quantity of all items", () => {
    let cart = addToCart(emptyCart, makeItem(), 2);
    cart = addToCart(cart, makeItem({ variantId: 2, sku: "SKU-2" }), 3);
    expect(getCartItemCount(cart)).toBe(5);
  });
});
