import "server-only";
import { prisma } from "@/lib/db/prisma";

/**
 * Store settings — persisted as key/value rows in the `settings` table.
 * This is the single source of truth for VAT, shipping, and shop info.
 * NEVER hardcode these values in cart/checkout/order code — read from here.
 */

export const SETTING_KEYS = {
  vatRate: "vat_rate",
  vatId: "vat_id",
  freeShippingThreshold: "free_shipping_threshold",
  shippingFlatRate: "shipping_flat_rate",
  shopName: "shop_name",
  defaultLanguage: "default_language",
  shopDescription: "shop_description",
  companyName: "company_name",
  companyEmail: "company_email",
  companyPhone: "company_phone",
  companyAddress: "company_address",
  companyManager: "company_manager",
} as const;

export interface StoreSettings {
  vatRate: number;
  vatId: string;
  freeShippingThreshold: number;
  shippingFlatRate: number;
  shopName: string;
  defaultLanguage: string;
  shopDescription: string;
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  /** Geschäftsführer(in) — printed on invoices (§ 35a EGBGB / Impressum data). */
  companyManager: string;
}

// Real company data (from client-provided Impressum, 2026-09) — used as fallback
// so invoices/legal docs always carry correct details even before admin saves settings.
/** Fallback settings when the DB has no rows (also used by the email footer). */
export const DEFAULTS: StoreSettings = {
  vatRate: 19,
  vatId: "DE367665227",
  freeShippingThreshold: 30,
  shippingFlatRate: 4.99,
  shopName: "hausku",
  defaultLanguage: "de",
  shopDescription: "",
  companyName: "NI Intellect UG (haftungsbeschränkt)",
  companyEmail: "saleshub@niintellect.de",
  companyPhone: "+49 176 45972009",
  companyAddress: "Roggenring 26, 23619 Hamberge, Deutschland",
  companyManager: "Nazia Iqbal",
};

/** Read all store settings from the DB, falling back to defaults. */
export async function getStoreSettings(): Promise<StoreSettings> {
  const rows = await prisma.setting.findMany();
  const map = new Map(rows.map((row) => [row.key, row.value]));

  return {
    vatRate: parseFloat(
      map.get(SETTING_KEYS.vatRate) ?? String(DEFAULTS.vatRate)
    ),
    vatId: map.get(SETTING_KEYS.vatId) ?? DEFAULTS.vatId,
    freeShippingThreshold: parseFloat(
      map.get(SETTING_KEYS.freeShippingThreshold) ??
        String(DEFAULTS.freeShippingThreshold)
    ),
    shippingFlatRate: parseFloat(
      map.get(SETTING_KEYS.shippingFlatRate) ?? String(DEFAULTS.shippingFlatRate)
    ),
    shopName: map.get(SETTING_KEYS.shopName) ?? DEFAULTS.shopName,
    defaultLanguage:
      map.get(SETTING_KEYS.defaultLanguage) ?? DEFAULTS.defaultLanguage,
    shopDescription:
      map.get(SETTING_KEYS.shopDescription) ?? DEFAULTS.shopDescription,
    companyName: map.get(SETTING_KEYS.companyName) ?? DEFAULTS.companyName,
    companyEmail: map.get(SETTING_KEYS.companyEmail) ?? DEFAULTS.companyEmail,
    companyPhone: map.get(SETTING_KEYS.companyPhone) ?? DEFAULTS.companyPhone,
    companyAddress: map.get(SETTING_KEYS.companyAddress) ?? DEFAULTS.companyAddress,
    companyManager: map.get(SETTING_KEYS.companyManager) ?? DEFAULTS.companyManager,
  };
}

/** Upsert the provided settings (partial updates allowed). */
export async function saveStoreSettings(
  input: Partial<StoreSettings>
): Promise<StoreSettings> {
  const entries = Object.entries(input) as [keyof StoreSettings, unknown][];

  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.setting.upsert({
        where: { key: SETTING_KEYS[key] },
        update: { value: String(value ?? "") },
        create: { key: SETTING_KEYS[key], value: String(value ?? "") },
      })
    )
  );

  return getStoreSettings();
}
