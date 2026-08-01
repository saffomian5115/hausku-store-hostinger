/**
 * Cutout image URLs for HAUSKU products.
 * These are transparent/isolated product images used in:
 * - "Fly to cart" animation (instead of regular thumbnail)
 * - Hero section decorative display
 */

export const CUTOUT_MAP: Record<string, string> = {
  "couchbar-snackbox": "/images/products/cutouts/snackbox.png",
  "brotdose-850ml": "/images/products/cutouts/lunchbox.png",
  "brotdose-1200ml": "/images/products/cutouts/lunchbox.png",
  "brotdose-1400ml": "/images/products/cutouts/lunchbox.png",
  "laptopkissen-grau": "/images/products/cutouts/laptop-kissen.png",
  "laptopkissen-schwarz": "/images/products/cutouts/laptop-kissen.png",
};

/**
 * Returns the cutout image URL for a given product slug.
 * Falls back to the regular image URL if no cutout is available.
 */
export function getCutoutUrl(slug: string): string | null {
  return CUTOUT_MAP[slug] ?? null;
}
