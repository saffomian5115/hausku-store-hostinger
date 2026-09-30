"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/storefront/AuthContext";
import GoogleSignInButton from "@/components/storefront/GoogleSignInButton";
import AuthShell from "@/components/shared/AuthShell";
import { useLocale } from "@/components/shared/LocaleContext";
import { Mail, Lock, Eye, EyeOff, User, Leaf } from "lucide-react";

export default function RegisterPage() {
  const { t } = useLocale();
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await register(email, password, name);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.push("/account");
    }
  };

  return (
    <AuthShell>
      {/* White card with lime accent border */}
      <div className="relative w-full bg-white rounded-3xl border border-lime-200 shadow-xl shadow-lime-900/5 p-8 md:p-10 auth-card-anim">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-2 text-gray-900">
            <span className="w-10 h-10 rounded-2xl bg-lime-500 flex items-center justify-center shadow-lg shadow-lime-500/25">
              <Leaf className="w-5 h-5 text-white" />
            </span>
            <span className="text-2xl font-bold tracking-tight">hausku</span>
          </Link>
          <p className="text-gray-500 text-sm mt-3">{t("auth.registerTitle")}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-6 text-sm text-center">
            {error}
          </div>
        )}

        {/* Continue with Google */}
        <GoogleSignInButton />

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-xs uppercase tracking-wider">{t("common.or")}</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          <div className="auth-field-anim auth-field-1">
            <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700 mb-1.5">
              {t("auth.fullName")}
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                id="reg-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                placeholder={t("auth.fullName")}
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="auth-field-anim auth-field-2">
            <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1.5">
              {t("auth.email")}
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="email"
                id="reg-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="auth-field-anim auth-field-3">
            <label htmlFor="reg-pass" className="block text-sm font-medium text-gray-700 mb-1.5">
              {t("auth.passwordMin")}
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                id="reg-pass"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
                minLength={8}
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
            className={`auth-field-anim auth-field-4 w-full font-semibold py-3.5 rounded-full transition-all duration-200 text-sm ${
              loading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-lime-500 hover:bg-lime-600 text-white hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-lime-500/25"
            }`}
          >
            {loading ? t("auth.creating") : t("auth.createAccount")}
          </button>

          {/* Login link */}
          <p className="text-center text-gray-500 text-sm auth-field-anim auth-field-5">
            {t("auth.alreadyAccount")}{" "}
            <Link href="/login" className="text-lime-600 font-medium hover:text-lime-700 hover:underline">
              {t("auth.signInNow")}
            </Link>
          </p>
        </form>
      </div>
    </AuthShell>
  );
}
