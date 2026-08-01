"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/storefront/AuthContext";
import { useLocale } from "@/components/shared/LocaleContext";

export default function LoginPage() {
  const { t } = useLocale();
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.push("/account");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
      {/* Full-screen background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat auth-bg-anim"
        style={{ backgroundImage: "url('/bg.jpg')" }}
      />

      {/* Glassmorphism Card */}
      <div className="relative w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/30 rounded-2xl shadow-2xl p-8 md:p-10 auth-card-anim">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-white text-2xl font-bold tracking-tight">
            hausku
          </Link>
          <p className="text-white/70 text-sm mt-1">{t("auth.signInTitle")}</p>
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
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <div className="login__box-input relative flex-1">
              <input
                type="email"
                id="login-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login__input w-full bg-transparent text-white pt-5 pb-1 outline-none"
                placeholder=" "
                required
              />
              <label
                htmlFor="login-email"
                className="absolute left-0 top-4 text-white/60 text-sm transition-all duration-300 pointer-events-none"
              >
                {t("auth.email")}
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
                id="login-pass"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login__input w-full bg-transparent text-white pt-5 pb-1 pr-8 outline-none"
                placeholder=" "
                required
                minLength={8}
              />
              <label
                htmlFor="login-pass"
                className="absolute left-0 top-4 text-white/60 text-sm transition-all duration-300 pointer-events-none"
              >
                {t("auth.password")}
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

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between text-sm auth-field-anim auth-field-3">
            <label className="flex items-center gap-2 text-white/70 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-white/30 bg-transparent accent-lime-400"
              />
              {t("auth.rememberMe")}
            </label>
            <Link href="#" className="text-white/70 hover:text-white transition-colors">
              {t("auth.forgotPassword")}
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`auth-field-anim auth-field-4 w-full font-semibold py-3.5 rounded-xl transition-all duration-200 text-sm ${
              loading
                ? "bg-white/30 text-white/60 cursor-not-allowed"
                : "bg-white text-gray-900 hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            }`}
          >
            {loading ? t("auth.signingIn") : t("auth.signIn")}
          </button>

          {/* Register link */}
          <p className="text-center text-white/60 text-sm auth-field-anim auth-field-5">
            {t("auth.noAccount")}{" "}
            <Link href="/register" className="text-white font-medium hover:underline">
              {t("auth.registerNow")}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
