import StorefrontNav from "@/components/shared/StorefrontNav";
import StorefrontFooter from "@/components/shared/StorefrontFooter";
import CookieConsent from "@/components/shared/CookieConsent";
import BackgroundGrid from "@/components/shared/BackgroundGrid";
import SmoothScroll from "@/components/shared/SmoothScroll";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Animated light-mode background (fixed, behind everything) */}
      <BackgroundGrid />
      {/* Content stacks above the grid (z-10) — bg comes from body (#fafaf9 = stone-50) */}
      <div className="relative min-h-screen z-10">
        <SmoothScroll>
          <StorefrontNav />
          <main className="overflow-x-hidden">{children}</main>
          <StorefrontFooter />
          <CookieConsent />
        </SmoothScroll>
      </div>
    </>
  );
}
