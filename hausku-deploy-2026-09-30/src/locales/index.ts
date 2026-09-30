import de from "./de.json";
import en from "./en.json";

export type Locale = "de" | "en";

export const defaultLocale: Locale = "de";

const locales: Record<Locale, typeof de> = { de, en };

export function t(locale: Locale, key: string): string {
  const keys = key.split(".");
  let result: unknown = locales[locale] ?? locales[defaultLocale];
  for (const k of keys) {
    if (result && typeof result === "object" && k in result) {
      result = (result as Record<string, unknown>)[k];
    } else {
      // fallback to default locale
      result = locales[defaultLocale];
      for (const fk of keys) {
        if (result && typeof result === "object" && fk in result) {
          result = (result as Record<string, unknown>)[fk];
        } else {
          return key;
        }
      }
      return typeof result === "string" ? result : key;
    }
  }
  return typeof result === "string" ? result : key;
}

export function getLocaleFromParams(params?: { lang?: string }): Locale {
  if (params?.lang === "en") return "en";
  return defaultLocale;
}

export function getTranslations(locale: Locale) {
  return locales[locale] ?? locales[defaultLocale];
}
