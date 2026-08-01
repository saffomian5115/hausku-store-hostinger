"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
      {/* Full-screen background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat auth-bg-anim"
        style={{ backgroundImage: "url('/bg.jpg')" }}
      />

      {/* Darker overlay for admin readability */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Glassmorphism Card */}
      <div className="relative w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/30 rounded-2xl shadow-2xl p-8 md:p-10 auth-card-anim">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm mb-4">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">hausku Admin</h1>
          <p className="text-white/60 text-sm mt-1">Bitte melden Sie sich an</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/40 text-red-200 rounded-xl p-3 mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="login__box auth-field-anim auth-field-1">
            <svg className="w-5 h-5 text-white/70 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <path d="M22 6l-10 7L2 6" />
            </svg>
            <div className="login__box-input relative flex-1">
              <input
                type="email"
                id="admin-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login__input w-full bg-transparent text-white pt-5 pb-1 outline-none"
                placeholder=" "
                required
              />
              <label
                htmlFor="admin-email"
                className="absolute left-0 top-4 text-white/60 text-sm transition-all duration-300 pointer-events-none"
              >
                E-Mail
              </label>
            </div>
          </div>

          {/* Password Field */}
          <div className="login__box auth-field-anim auth-field-2">
            <svg className="w-5 h-5 text-white/70 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <div className="login__box-input relative flex-1">
              <input
                type={showPassword ? "text" : "password"}
                id="admin-pass"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login__input w-full bg-transparent text-white pt-5 pb-1 pr-8 outline-none"
                placeholder=" "
                required
              />
              <label
                htmlFor="admin-pass"
                className="absolute left-0 top-4 text-white/60 text-sm transition-all duration-300 pointer-events-none"
              >
                Passwort
              </label>
              {/* Eye toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-4 text-white/60 hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                    <path d="M14.12 14.12a3 3 0 11-4.24-4.24" />
                    <path d="M1 1l22 22" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`auth-field-anim auth-field-3 w-full font-semibold py-3.5 rounded-xl transition-all duration-200 text-sm ${
              loading
                ? "bg-white/30 text-white/60 cursor-not-allowed"
                : "bg-white text-gray-900 hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            }`}
          >
            {loading ? "Wird angemeldet..." : "Anmelden"}
          </button>
        </form>

        {/* Back to store link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-white/50 hover:text-white text-xs transition-colors inline-flex items-center gap-1"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            Zurück zum Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
