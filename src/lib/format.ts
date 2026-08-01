/**
 * Client-safe price formatting helpers (no server dependencies).
 *
 * IMPORTANT: Import these from CLIENT components. Do NOT import from
 * "@/lib/vat" in client code — it pulls in Prisma, which can only run
 * on the server.
 */

/**
 * Format a price for display in EUR.
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

/**
 * Format a price with the € symbol (simpler version).
 */
export function formatPriceSimple(amount: number): string {
  return `€${amount.toFixed(2)}`;
}
