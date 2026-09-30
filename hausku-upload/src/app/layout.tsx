import type { Metadata } from "next";
import { cookies } from "next/headers";
import { CartProvider } from "@/components/storefront/CartContext";
import { WishlistProvider } from "@/components/storefront/WishlistContext";
import { AuthProvider } from "@/components/storefront/AuthContext";
import { LocaleProvider } from "@/components/shared/LocaleContext";
import { FlyProvider } from "@/components/shared/FlyAnimationProvider";
import Analytics from "@/components/shared/Analytics";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://hausku.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "hausku — Haus & Küche",
    template: "%s | hausku",
  },
  description:
    "Qualitätsprodukte für Haus und Küche. Kostenloser Versand ab 30 €.",
  keywords: [
    "hausku",
    "Brotdose",
    "Edelstahl Brotdose",
    "Snackbox",
    "Lapdesk",
    "Laptopkissen",
    "Haushalt",
    "Küche",
  ],
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: siteUrl,
    siteName: "hausku",
    title: "hausku — Haus & Küche",
    description:
      "Qualitätsprodukte für Haus und Küche. Kostenloser Versand ab 30 €.",
    images: [{ url: "/images/og-default.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "hausku — Haus & Küche",
    description:
      "Qualitätsprodukte für Haus und Küche. Kostenloser Versand ab 30 €.",
    images: ["/images/og-default.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
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
        <Analytics />
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
