import type { Metadata } from "next";
import { cookies } from "next/headers";
import { CartProvider } from "@/components/storefront/CartContext";
import { WishlistProvider } from "@/components/storefront/WishlistContext";
import { AuthProvider } from "@/components/storefront/AuthContext";
import { LocaleProvider } from "@/components/shared/LocaleContext";
import { FlyProvider } from "@/components/shared/FlyAnimationProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "hausku — Haus & Küche",
  description:
    "Qualitätsprodukte für Haus und Küche. Kostenloser Versand ab 30 €.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("hausku_locale")?.value === "en" ? "en" : "de";
  return (
    <html lang={locale}>
      <body>
        <AuthProvider>
          <FlyProvider>
          <CartProvider>
            <WishlistProvider>
              <LocaleProvider>{children}</LocaleProvider>
            </WishlistProvider>
          </CartProvider>
          </FlyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
