"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { t as translate, type Locale, defaultLocale } from "@/locales";

type LocaleContextType = {
  locale: Locale;
  t: (key: string) => string;
  switchLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextType | null>(null);
const STORAGE_KEY = "hausku_locale";

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "de") {
        setLocale(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const t = (key: string) => translate(locale, key);

  const switchLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {
      // ignore
    }
    // Set cookie for server components
    document.cookie = `hausku_locale=${newLocale}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
    // Reload page so server components re-render with new locale
    window.location.reload();
  };

  return (
    <LocaleContext.Provider value={{ locale, t, switchLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return ctx;
}
