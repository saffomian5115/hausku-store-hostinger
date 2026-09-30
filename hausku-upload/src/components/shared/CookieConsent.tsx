"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/components/shared/LocaleContext";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-white p-4 md:p-6 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-300">
          {t("legal.cookieConsent")}{" "}
          <a href="/privacy" className="underline hover:text-white">
            {t("legal.cookieLink")}
          </a>
          .
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={accept}
            className="bg-lime-500 hover:bg-lime-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors text-sm"
          >
            {t("legal.cookieAccept")}
          </button>
          <button
            onClick={accept}
            className="border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white px-6 py-2 rounded-lg transition-colors text-sm"
          >
            {t("legal.cookieOnlyNecessary")}
          </button>
        </div>
      </div>
    </div>
  );
}
