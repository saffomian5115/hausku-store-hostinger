/**
 * Client-side conversion tracking — Google Analytics 4 + Meta (Facebook) Pixel.
 *
 * Safe to import from client components: every call checks that the tracking
 * library actually loaded (IDs set via NEXT_PUBLIC_GA_MEASUREMENT_ID /
 * NEXT_PUBLIC_META_PIXEL_ID) before touching the global.
 */

export interface TrackedItem {
  itemId?: string | number; // product/variant id
  name: string;
  quantity: number;
  price: number;
}

function gtag(...args: unknown[]) {
  if (typeof window === "undefined") return;
  const fn = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
  if (typeof fn === "function") fn(...args);
}

function fbq(...args: unknown[]) {
  if (typeof window === "undefined") return;
  const fn = (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq;
  if (typeof fn === "function") fn(...args);
}

/** Fired whenever an item lands in the cart. */
export function trackAddToCart(item: TrackedItem) {
  const eventItem = {
    item_id: String(item.itemId ?? item.name),
    item_name: item.name,
    quantity: item.quantity,
    price: item.price,
  };

  // GA4 enhanced ecommerce
  gtag("event", "add_to_cart", {
    currency: "EUR",
    value: item.price * item.quantity,
    items: [eventItem],
  });

  // Meta Pixel
  fbq("track", "AddToCart", {
    value: item.price * item.quantity,
    currency: "EUR",
    content_ids: [String(item.itemId ?? item.name)],
    content_type: "product",
    contents: [
      {
        id: String(item.itemId ?? item.name),
        quantity: item.quantity,
        item_price: item.price,
      },
    ],
  });
}

/** Fired once per completed order on the checkout success page. */
export function trackPurchase(opts: {
  transactionId: string;
  value: number;
  currency?: string;
  items?: TrackedItem[];
}) {
  const { transactionId, value, currency = "EUR", items = [] } = opts;

  const mappedItems = items.map((item) => ({
    item_id: String(item.itemId ?? item.name),
    item_name: item.name,
    quantity: item.quantity,
    price: item.price,
  }));

  // GA4 enhanced ecommerce
  gtag("event", "purchase", {
    transaction_id: transactionId,
    value,
    currency,
    items: mappedItems,
  });

  // Meta Pixel
  fbq("track", "Purchase", {
    value,
    currency,
    content_ids: mappedItems.map((item) => item.item_id),
    content_type: "product",
    contents: mappedItems.map((item) => ({
      id: item.item_id,
      quantity: item.quantity,
      item_price: item.price,
    })),
  });
}
