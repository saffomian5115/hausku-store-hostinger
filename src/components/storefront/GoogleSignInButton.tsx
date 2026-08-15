"use client";

import { useState } from "react";
import { useLocale } from "@/components/shared/LocaleContext";

/**
 * "Continue with Google" button for the login/register pages.
 * Redirects to /api/auth/google which starts the OAuth flow.
 */
export default function GoogleSignInButton() {
  const { t } = useLocale();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    // Full page navigation — Google redirects back to /api/auth/google/callback.
    // window.location is used (not router.push) so OAuth always does a real
    // browser redirect that the Google callback can follow.
    window.location.assign("/api/auth/google");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="auth-field-anim auth-field-0 w-full flex items-center justify-center gap-3 py-3.5 rounded-full border border-gray-200 bg-white text-gray-800 font-semibold text-sm transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:scale-[1.02] active:scale-[0.98] shadow-sm disabled:opacity-60 disabled:cursor-wait"
    >
      {loading ? (
        <>
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
            <path d="M22 12a10 10 0 01-10 10" strokeLinecap="round" />
          </svg>
          <span>{t("auth.signingIn")}</span>
        </>
      ) : (
        <>
          {/* Google "G" logo */}
          <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.7l6.2 5.2C36.9 40.3 44 35 44 24c0-1.3-.1-2.6-.4-3.9z" />
          </svg>
          <span>{t("auth.continueWithGoogle")}</span>
        </>
      )}
    </button>
  );
}
