"use client";

import { useState, useEffect, useRef } from "react";
import { useCart } from "@/components/storefront/CartContext";
import { useFly } from "@/components/shared/FlyAnimationProvider";
import { getCutoutUrl } from "@/lib/cutouts";

type AddToCartButtonProps = {
  variantId: number;
  productId: number;
  name: string;
  slug: string;
  size: string | null;
  color: string | null;
  colorHex: string | null;
  imageUrl: string | null;
  unitPrice: number;
  stockQty: number;
  sku: string;
};

export default function AddToCartButton(props: AddToCartButtonProps) {
  const { addItem } = useCart();
  const { flyToCart } = useFly();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isInStock = props.stockQty > 0;

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleAdd = () => {
    if (!isInStock) return;

    // Try to find the product image element for fly animation
    const imageEl = document.getElementById("product-main-image");
    const cutoutUrl = getCutoutUrl(props.slug);
    if (imageEl) {
      const rect = imageEl.getBoundingClientRect();
      flyToCart(rect, props.imageUrl, () => {
        addItem(
          {
            variantId: props.variantId,
            productId: props.productId,
            name: props.name,
            slug: props.slug,
            size: props.size,
            color: props.color,
            colorHex: props.colorHex,
            imageUrl: props.imageUrl,
            unitPrice: props.unitPrice,
            stockQty: props.stockQty,
            sku: props.sku,
          },
          qty
        );
      }, cutoutUrl);
    } else {
      // Fallback: add directly without animation
      addItem(
        {
          variantId: props.variantId,
          productId: props.productId,
          name: props.name,
          slug: props.slug,
          size: props.size,
          color: props.color,
          colorHex: props.colorHex,
          imageUrl: props.imageUrl,
          unitPrice: props.unitPrice,
          stockQty: props.stockQty,
          sku: props.sku,
        },
        qty
      );
    }

    setAdded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      {/* Quantity */}
      <div className="flex items-center gap-4">
        <div className="flex items-center border rounded-lg">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-4 py-3 text-gray-600 hover:text-gray-900 transition-colors"
          >
            −
          </button>
          <span className="px-4 py-3 font-medium min-w-[3rem] text-center">
            {qty}
          </span>
          <button
            onClick={() => setQty((q) => Math.min(props.stockQty, q + 1))}
            className="px-4 py-3 text-gray-600 hover:text-gray-900 transition-colors"
          >
            +
          </button>
        </div>
        <button
          onClick={handleAdd}
          disabled={!isInStock}
          className={`flex-1 font-semibold py-3 rounded-lg transition-colors ${
            added
              ? "bg-green-500 text-white"
              : isInStock
              ? "bg-lime-500 hover:bg-lime-600 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {added
            ? "✓ Hinzugefügt!"
            : isInStock
            ? "In den Warenkorb"
            : "Nicht verfügbar"}
        </button>
      </div>

      {/* Stock warning */}
      {isInStock && props.stockQty <= 5 && (
        <p className="text-xs text-orange-500 mt-2">
          Nur noch {props.stockQty} verfügbar — schnell bestellen!
        </p>
      )}
    </>
  );
}
