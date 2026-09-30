import "server-only";
import { getStoreSettings } from "@/lib/settings";
export { formatPrice, formatPriceSimple } from "../format";

/**
 * Get the current VAT rate from the settings table.
 * Falls back to 19% if no setting is found.
 * NEVER hardcode the VAT rate — always read from DB.
 */
export async function getVatRate(): Promise<number> {
  const settings = await getStoreSettings();
  return settings.vatRate;
}

/**
 * Calculate VAT for a given subtotal.
 * Returns { vatRate, vatAmount, totalWithVat }
 */
export async function calculateVat(subtotal: number) {
  const vatRate = await getVatRate();
  const vatAmount = parseFloat(((subtotal * vatRate) / 100).toFixed(2));
  const totalWithVat = parseFloat((subtotal + vatAmount).toFixed(2));

  return { vatRate, vatAmount, totalWithVat };
}
