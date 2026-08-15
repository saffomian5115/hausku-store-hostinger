"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthShell from "@/components/shared/AuthShell";
import { Mail, Lock, Eye, EyeOff, Layers } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Anmeldung fehlgeschlagen");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Netzwerkfehler");
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      {/* White card with lime accent border */}
      <div className="relative w-full bg-white rounded-3xl border border-lime-200 shadow-xl shadow-lime-900/5 p-8 md:p-10 auth-card-anim">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-lime-500 shadow-lg shadow-lime-500/25 mb-4">
            <Layers className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">hausku Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Bitte melden Sie sich an</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div className="auth-field-anim auth-field-1">
            <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 mb-1.5">
              E-Mail
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="email"
                id="admin-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                placeholder="admin@hausku.de"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="auth-field-anim auth-field-2">
            <label htmlFor="admin-pass" className="block text-sm font-medium text-gray-700 mb-1.5">
              Passwort
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                id="admin-pass"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
              {/* Eye toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1"
                tabIndex={-1}
                aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`auth-field-anim auth-field-3 w-full font-semibold py-3.5 rounded-full transition-all duration-200 text-sm ${
              loading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-lime-500 hover:bg-lime-600 text-white hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-lime-500/25"
            }`}
          >
            {loading ? "Wird angemeldet..." : "Anmelden"}
          </button>
        </form>

        {/* Back to store link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-gray-400 hover:text-lime-600 text-xs transition-colors inline-flex items-center gap-1"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            Zurück zum Shop
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
