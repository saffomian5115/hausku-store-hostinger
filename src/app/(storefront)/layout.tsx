import StorefrontNav from "@/components/shared/StorefrontNav";
import StorefrontFooter from "@/components/shared/StorefrontFooter";
import CookieConsent from "@/components/shared/CookieConsent";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <StorefrontNav />
      <main className="overflow-x-hidden">{children}</main>
      <StorefrontFooter />
      <CookieConsent />
    </div>
  );
}
