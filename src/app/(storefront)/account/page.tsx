"use client";

import Link from "next/link";
import { useAuth } from "@/components/storefront/AuthContext";
import { useLocale } from "@/components/shared/LocaleContext";

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const { t } = useLocale();

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-64 bg-gray-100 rounded-lg" />
        </div>
      </div>
    );
  }

  // Logged in — show dashboard
  if (user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t("account.title")}</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <nav className="space-y-1">
              <Link
                href="/account"
                className="block px-4 py-3 bg-gray-900 text-white rounded-lg font-medium"
              >
                {t("account.overview")}
              </Link>
              <Link
                href="/account/orders"
                className="block px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {t("account.orders")}
              </Link>
              <Link
                href="/account/addresses"
                className="block px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {t("account.addresses")}
              </Link>
              <button
                onClick={logout}
                className="block w-full text-left px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {t("common.logout")}
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="md:col-span-3">
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">{t("account.welcome")}</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium text-gray-900">{t("account.name")}</span>{" "}
                  {user.name || "—"}
                </p>
                <p>
                  <span className="font-medium text-gray-900">{t("account.email")}</span>{" "}
                  {user.email}
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <Link
                  href="/account/orders"
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  {t("account.viewOrders")}
                </Link>
                <Link
                  href="/account/addresses"
                  className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  {t("account.manageAddresses")}
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Logged out — redirect to login
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{t("account.title")}</h1>
      <p className="text-gray-500 mb-8">{t("account.loginRequired")}</p>
      <div className="flex gap-4 justify-center">
        <Link
          href="/login"
          className="inline-flex items-center bg-gray-900 hover:bg-gray-800 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg"
        >
          {t("account.signIn")}
        </Link>
        <Link
          href="/register"
          className="inline-flex items-center bg-lime-500 hover:bg-lime-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-lime-500/25"
        >
          {t("account.createAccount")}
        </Link>
      </div>
    </div>
  );
}
