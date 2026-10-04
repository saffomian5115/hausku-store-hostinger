import { t as clientT, defaultLocale } from "@/locales";

// German-only storefront: locale is fixed.
export async function getLocale() {
  return defaultLocale;
}

// Server-side translation function
export async function t(key: string): Promise<string> {
  return clientT(defaultLocale, key);
}

// Get translations object (useful for server components)
export async function getTranslations() {
  return {
    locale: defaultLocale,
    t: (key: string) => clientT(defaultLocale, key),
  };
}
