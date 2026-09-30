"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/components/shared/LocaleContext";

export default function ForgotPasswordPage() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Always show success (no user enumeration)
    } catch {
      // Same behavior on network errors
    }
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {t("account.forgotPassword")}
      </h1>
      <p className="text-gray-500 mb-8 text-sm">{t("account.forgotPasswordHint")}</p>

      {sent ? (
        <div className="bg-lime-50 border border-lime-200 rounded-xl p-6 text-sm text-lime-800">
          {t("account.forgotPasswordSent")}
          <p className="mt-4">
            <Link href="/login" className="font-medium underline">
              {t("account.backToLogin")}
            </Link>
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t("account.email")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-4 py-3"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-lime-500 hover:bg-lime-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? t("common.loading") : t("account.sendResetLink")}
          </button>
          <p className="text-center text-sm">
            <Link href="/login" className="text-gray-500 hover:text-gray-700">
              {t("account.backToLogin")}
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
