"use client";

import { createContext, useContext, type ReactNode } from "react";
import { t as translate, defaultLocale } from "@/locales";

type LocaleContextType = {
  locale: typeof defaultLocale;
  t: (key: string) => string;
};

const LocaleContext = createContext<LocaleContextType | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const t = (key: string) => translate(defaultLocale, key);

  return (
    <LocaleContext.Provider value={{ locale: defaultLocale, t }}>
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
