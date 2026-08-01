"use client";

import { useCart } from "@/components/storefront/CartContext";
import { formatPrice } from "@/lib/format";
import type { CartItem } from "@/lib/cart";

export default function CartItemRow({ item }: { item: CartItem }) {
  const { updateItemQuantity, removeItem } = useCart();

  return (
    <div className="p-4 flex items-center gap-4">
      {/* Image */}
      <div className="w-20 h-20 bg-gray-100 rounded shrink-0 flex items-center justify-center text-gray-400 text-xs">
        Bild
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <a
          href={`/product/${item.slug}`}
          className="font-medium text-gray-900 hover:text-lime-500 transition-colors line-clamp-1"
        >
          {item.name}
        </a>
        <p className="text-sm text-gray-500 mt-0.5">
          {[item.size, item.color].filter(Boolean).join(" / ")}
        </p>
        <p className="text-sm font-bold text-gray-900 mt-1">
          {formatPrice(item.unitPrice)}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center border rounded-lg">
        <button
          onClick={() => updateItemQuantity(item.variantId, item.qty - 1)}
          className="px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          −
        </button>
        <span className="px-3 py-2 font-medium min-w-[2.5rem] text-center">
          {item.qty}
        </span>
        <button
          onClick={() => updateItemQuantity(item.variantId, item.qty + 1)}
          className="px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          +
        </button>
      </div>

      {/* Line Total */}
      <p className="font-bold text-gray-900 w-24 text-right">
        {formatPrice(item.unitPrice * item.qty)}
      </p>

      {/* Remove */}
      <button
        onClick={() => removeItem(item.variantId)}
        className="p-2 text-gray-400 hover:text-lime-500 transition-colors"
        aria-label="Entfernen"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}
