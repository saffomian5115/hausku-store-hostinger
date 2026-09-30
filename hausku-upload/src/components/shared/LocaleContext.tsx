"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

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
    // Set cookie for server components, then refresh the RSC payload so
    // server-rendered content re-renders in the new locale. No full page
    // reload — client components update instantly via state, server content
    // merges in seamlessly, and scroll position / client state is preserved.
    document.cookie = `hausku_locale=${newLocale}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
    router.refresh();
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
