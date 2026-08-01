"use client";

import Link from "next/link";
import { useLocale } from "@/components/shared/LocaleContext";

export default function StorefrontFooter() {
  const { t } = useLocale();
  return (
    <footer className="bg-gray-900 text-gray-400">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <h3 className="text-white font-bold text-2xl mb-4">hausku</h3>
            </Link>
            <p className="text-sm leading-relaxed mb-6 max-w-sm">
              {t("footer.brandDesc")}
            </p>
            {/* Payment Icons Placeholder */}
            <div>
              <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-medium">
                {t("footer.securePayments")}
              </p>
              <div className="flex items-center gap-2">
                {[
                  { name: "Visa", bg: "bg-blue-900/50" },
                  { name: "MC", bg: "bg-lime-900/50" },
                  { name: "PayPal", bg: "bg-blue-800/50" },
                  { name: "Klarna", bg: "bg-pink-900/50" },
                  { name: "Apple Pay", bg: "bg-gray-700/50" },
                ].map((p) => (
                  <span
                    key={p.name}
                    className={`${p.bg} text-gray-300 text-xs font-medium px-2.5 py-1.5 rounded border border-white/10`}
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {t("footer.shop")}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/catalog" className="hover:text-white transition-colors">
                  {t("footer.allProducts")}
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=kueche" className="hover:text-white transition-colors">
                  {t("footer.kitchen")}
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=haushalt" className="hover:text-white transition-colors">
                  {t("footer.household")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  {t("nav.contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Kundenservice Column */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {t("footer.customerService")}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  {t("footer.myAccount")}
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-white transition-colors">
                  {t("footer.orders")}
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white transition-colors">
                  {t("footer.returns")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  {t("footer.shipping")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Rechtliches Column */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {t("footer.legal")}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/imprint" className="hover:text-white transition-colors">
                  {t("footer.imprint")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  {t("footer.terms")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>
              {t("footer.copyright")}
            </p>
            <p className="text-xs">
              {t("footer.legalNote")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
