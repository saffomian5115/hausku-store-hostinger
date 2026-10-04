import de from "./de.json";

// German-only storefront: the app ships a single locale (German).
export type Locale = "de";

export const defaultLocale: Locale = "de";

const translations = de;

export function t(_locale: Locale, key: string): string {
  const keys = key.split(".");
  let result: unknown = translations;
  for (const k of keys) {
    if (result && typeof result === "object" && k in result) {
      result = (result as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }
  return typeof result === "string" ? result : key;
}
