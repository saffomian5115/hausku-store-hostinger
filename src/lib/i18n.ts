import { cookies } from "next/headers";
import { t as clientT, type Locale, defaultLocale } from "@/locales";

// Server-side: read locale from cookie
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const saved = cookieStore.get("hausku_locale")?.value;
  if (saved === "en" || saved === "de") return saved;
  return defaultLocale;
}

// Server-side translation function
export async function t(key: string): Promise<string> {
  const locale = await getLocale();
  return clientT(locale, key);
}

// Get translations object for a locale (useful for server components)
export async function getTranslations() {
  const locale = await getLocale();
  return {
    locale,
    t: (key: string) => clientT(locale, key),
  };
}
