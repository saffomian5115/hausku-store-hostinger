"use client";

import { useEffect, useState } from "react";

export interface PublicStoreSettings {
  vatRate: number;
  freeShippingThreshold: number;
  shippingFlatRate: number;
}

export const DEFAULT_STORE_SETTINGS: PublicStoreSettings = {
  vatRate: 19,
  freeShippingThreshold: 30,
  shippingFlatRate: 4.99,
};

// Module-level cache so cart + checkout share one fetch per session
let cache: PublicStoreSettings | null = null;
let inflight: Promise<PublicStoreSettings> | null = null;

function loadSettings(): Promise<PublicStoreSettings> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const result: PublicStoreSettings =
          data && typeof data.vatRate === "number"
            ? (data as PublicStoreSettings)
            : DEFAULT_STORE_SETTINGS;
        cache = result;
        return result;
      })
      .catch(() => DEFAULT_STORE_SETTINGS)
      .finally(() => {
        inflight = null;
      });
  }
  return inflight as Promise<PublicStoreSettings>;
}

/**
 * Returns the public store settings (VAT + shipping). Starts with defaults and
 * updates as soon as the fetch resolves — safe to use in client cart/checkout.
 */
export function useStoreSettings(): PublicStoreSettings {
  const [settings, setSettings] =
    useState<PublicStoreSettings>(DEFAULT_STORE_SETTINGS);

  useEffect(() => {
    let cancelled = false;
    loadSettings().then((s) => {
      if (!cancelled) setSettings(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return settings;
}
