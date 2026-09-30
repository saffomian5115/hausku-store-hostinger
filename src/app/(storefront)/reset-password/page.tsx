"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/components/shared/LocaleContext";

function ResetPasswordForm() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError(t("account.passwordsMatch"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Fehler");
        setLoading(false);
        return;
      }
      setDone(true);
    } catch {
      setError("Netzwerkfehler");
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-sm text-red-700">
        {t("account.resetInvalidLink")}
        <p className="mt-4">
          <Link href="/forgot-password" className="font-medium underline">
            {t("account.forgotPassword")}
          </Link>
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="bg-lime-50 border border-lime-200 rounded-xl p-6 text-sm text-lime-800">
        {t("account.resetSuccess")}
        <p className="mt-4">
          <Link href="/login" className="font-medium underline">
            {t("account.backToLogin")}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium mb-1">{t("account.newPassword")}</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg px-4 py-3"
          minLength={8}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">{t("account.confirmPassword")}</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full border rounded-lg px-4 py-3"
          minLength={8}
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-lime-500 hover:bg-lime-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
      >
        {loading ? t("common.loading") : t("account.resetSubmit")}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Passwort neu setzen</h1>
      <Suspense fallback={<div className="animate-pulse h-40 bg-gray-100 rounded-xl" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
