"use client";

import { useRef, useCallback, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { useWishlist } from "./WishlistContext";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";
import { useFly } from "@/components/shared/FlyAnimationProvider";

type ProductWithVariants = {
  id: number;
  name: string;
  slug: string;
  basePrice: number;
  imageUrl: string | null;
  category: { name: string; slug: string };
  variants: {
    id: number;
    color: string | null;
    colorHex: string | null;
    stockQty: number;
    size: string | null;
  }[];
};

export default function ProductCard({ product }: { product: ProductWithVariants }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const heartBtnRef = useRef<HTMLButtonElement>(null);
  const [addedToCart, setAddedToCart] = useState(false);

  const { isLiked, toggleLike } = useWishlist();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { flyToCart, flyToWishlist } = useFly();

  const totalStock = product.variants.reduce((sum, v) => sum + v.stockQty, 0);
  const inStock = totalStock > 0;
  const firstVariant = product.variants[0];
  const colors = product.variants
    .filter((v) => v.colorHex !== null)
    .map((v) => v.colorHex as string)
    .filter((hex, i, arr) => arr.indexOf(hex) === i);
  const liked = isLiked(product.id);

  // 3D Tilt on hover
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    cardRef.current.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  }, []);

  // ── Add to Cart with fly animation ──
  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!inStock || !firstVariant) return;

      const sourceEl = imgRef.current;
      if (!sourceEl) {
        // Fallback: add directly without fly
        addItem(
          {
            variantId: firstVariant.id,
            productId: product.id,
            name: product.name,
            slug: product.slug,
            size: firstVariant.size,
            color: firstVariant.color,
            colorHex: firstVariant.colorHex,
            imageUrl: product.imageUrl,
            unitPrice: product.basePrice,
            stockQty: firstVariant.stockQty,
            sku: `sku-${firstVariant.id}`,
          },
          1
        );
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 1500);
        return;
      }

      const rect = sourceEl.getBoundingClientRect();

      flyToCart(rect, product.imageUrl, () => {
        addItem(
          {
            variantId: firstVariant.id,
            productId: product.id,
            name: product.name,
            slug: product.slug,
            size: firstVariant.size,
            color: firstVariant.color,
            colorHex: firstVariant.colorHex,
            imageUrl: product.imageUrl,
            unitPrice: product.basePrice,
            stockQty: firstVariant.stockQty,
            sku: `sku-${firstVariant.id}`,
          },
          1
        );
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 1500);
      });
    },
    [inStock, firstVariant, product, addItem, flyToCart]
  );

  // ── Wishlist like with fly animation ──
  const handleLikeClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const sourceEl = heartBtnRef.current;
      if (sourceEl) {
        const rect = sourceEl.getBoundingClientRect();
        flyToWishlist(rect, async () => {
          await toggleLike(product.id);
        });
      } else {
        await toggleLike(product.id);
      }
    },
    [flyToWishlist, toggleLike, product.id]
  );

  return (
    <div
      ref={cardRef}
      className="group relative border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200 card-3d"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Heart / Like Button */}
      <button
        ref={heartBtnRef}
        onClick={handleLikeClick}
        className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 hover:scale-110"
        aria-label={liked ? "Aus Merkliste entfernen" : "Zur Merkliste hinzufügen"}
        title={
          !user
            ? "Anmelden um Produkte zu merken"
            : liked
            ? "Aus Merkliste entfernen"
            : "Zur Merkliste hinzufügen"
        }
      >
        <svg
          className={`w-5 h-5 transition-all duration-300 ${
            liked
              ? "text-lime-500 fill-lime-500 scale-110"
              : "text-gray-400 hover:text-lime-400"
          }`}
          fill={liked ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>

      {/* Out of stock overlay */}
      {!inStock && (
        <div className="absolute inset-0 z-10 bg-black/40 flex items-center justify-center rounded-lg">
          <span className="bg-white text-gray-900 font-bold text-sm px-4 py-2 rounded-full shadow-lg">
            Ausverkauft
          </span>
        </div>
      )}

      <Link href={`/product/${product.slug}`} className="block">
        <div
          ref={imgRef}
          className="aspect-square bg-gray-100 relative overflow-hidden"
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        <div className="p-4 pb-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {product.category.name}
          </p>
          <h3 className="font-medium text-gray-900 group-hover:text-lime-500 transition-colors line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center justify-between mt-3">
            <div>
              <p className="text-lg font-bold text-gray-900">
                {formatPrice(product.basePrice)}
              </p>
              <p className="text-[10px] text-gray-400">inkl. 19% MwSt.</p>
            </div>
            {colors.length > 0 && (
              <div className="flex gap-1">
                {colors.slice(0, 3).map((hex) => (
                  <span
                    key={hex}
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: hex }}
                  />
                ))}
                {colors.length > 3 && (
                  <span className="text-xs text-gray-400">+{colors.length - 3}</span>
                )}
              </div>
            )}
          </div>
          {inStock && totalStock <= 5 && (
            <p className="text-xs text-orange-500 mt-1">Nur noch {totalStock} verfügbar</p>
          )}
        </div>
      </Link>

      {/* ═══ Add to Cart Button ═══ */}
      <div className="px-4 pb-4">
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className={`w-full flex items-center justify-center gap-2 font-semibold py-2.5 rounded-lg transition-all duration-200 text-sm ${
            addedToCart
              ? "bg-green-500 text-white"
              : inStock
              ? "bg-lime-500 hover:bg-lime-600 text-white hover:shadow-lg hover:shadow-lime-500/30 active:scale-[0.98]"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {addedToCart ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Hinzugefügt
            </>
          ) : inStock ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              In den Warenkorb
            </>
          ) : (
            "Nicht verfügbar"
          )}
        </button>
      </div>
    </div>
  );
}
