"use client";

import Link from "next/link";
import { useWishlist } from "@/components/storefront/WishlistContext";
import { useAuth } from "@/components/storefront/AuthContext";
import { useCart } from "@/components/storefront/CartContext";
import { formatPrice } from "@/lib/format";
import { useLocale } from "@/components/shared/LocaleContext";

export default function WishlistPage() {
  const { t } = useLocale();
  const { user, loading: authLoading } = useAuth();
  const { wishlistProducts, toggleLike, loading: wishlistLoading } = useWishlist();
  const { addItem } = useCart();

  // If not logged in
  if (!authLoading && !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <svg
            className="w-20 h-20 mx-auto text-gray-300 mb-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Merkliste</h1>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Melde dich an, um Produkte zu merken und deine persönliche Merkliste zu sehen.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/account"
              className="px-6 py-3 bg-lime-500 hover:bg-lime-600 text-white font-semibold rounded-lg transition-colors"
            >
              Anmelden
            </Link>
            <Link
              href="/catalog"
              className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-colors"
            >
              Produkte durchstöbern
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (authLoading || wishlistLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Merkliste wird geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Meine Merkliste
        </h1>
        <p className="text-gray-500 mt-1">
          {wishlistProducts.length} {wishlistProducts.length === 1 ? "Produkt" : "Produkte"} gespeichert
        </p>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="text-center py-16">
          <svg
            className="w-20 h-20 mx-auto text-gray-300 mb-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <p className="text-lg font-medium text-gray-500 mb-2">
            Deine Merkliste ist leer
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Klicke auf das Herz-Symbol bei Produkten, um sie hier zu speichern.
          </p>
          <Link
            href="/catalog"
            className="inline-flex items-center px-6 py-3 bg-lime-500 hover:bg-lime-600 text-white font-semibold rounded-lg transition-colors"
          >
            Produkte entdecken
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistProducts.map((product) => {
            const totalStock = product.variants.reduce((sum, v) => sum + v.stockQty, 0);
            const firstVariant = product.variants[0];

            return (
              <div
                key={product.id}
                className="group border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                <div className="relative">
                  <Link href={`/product/${product.slug}`} className="block">
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
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
                      {totalStock === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm px-3 py-1 bg-gray-900 rounded">
                            Ausverkauft
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Remove from wishlist button */}
                  <button
                    onClick={() => toggleLike(product.id)}
                    className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 hover:scale-110"
                    aria-label="Aus Merkliste entfernen"
                  >
                    <svg
                      className="w-5 h-5 text-lime-500 fill-lime-500 transition-all duration-300 hover:scale-125"
                      fill="currentColor"
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
                </div>

                <div className="p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    {product.category.name}
                  </p>
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="font-medium text-gray-900 group-hover:text-lime-500 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-lg font-bold text-gray-900">
                      {formatPrice(product.basePrice)}
                    </p>
                    {firstVariant && firstVariant.stockQty > 0 && (
                      <button
                        onClick={() => {
                          addItem({
                            productId: product.id,
                            variantId: firstVariant.id,
                            name: product.name,
                            slug: product.slug,
                            imageUrl: product.imageUrl,
                            unitPrice: product.basePrice,
                            colorHex: firstVariant.colorHex,
                            color: firstVariant.color,
                            size: firstVariant.size,
                            stockQty: firstVariant.stockQty,
                            sku: '',
                          });
                        }}
                        className="px-4 py-2 bg-lime-500 hover:bg-lime-600 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        In den Warenkorb
                      </button>
                    )}
                    {totalStock === 0 && (
                      <span className="text-sm text-gray-400">Nicht verfügbar</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
