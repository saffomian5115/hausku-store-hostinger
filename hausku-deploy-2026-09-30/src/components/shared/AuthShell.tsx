import type { ReactNode } from "react";

/**
 * Shared shell for the auth pages (storefront login/register + admin login).
 *
 * Matches the redesigned homepage hero:
 *  - sand (#F6F2E7) background instead of the old dark `bg.jpg`
 *  - ambient lime + amber gradient blobs
 *  - a soft morphing HeroBlob-style blob as a decorative accent
 *  - subtle grain texture
 *
 * Children render centered in a `max-w-md` column — the pages themselves
 * provide the white card with the lime accent border.
 */
export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center px-4 py-14 overflow-hidden">
      {/* Ambient gradient blobs + grain wash (homepage hero, smaller version) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-20 w-[380px] h-[380px] bg-lime-300/40 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -right-16 w-[360px] h-[360px] bg-amber-200/50 rounded-full blur-[90px]" />
        {/* Decorative morphing blob — HeroBlob-style accent, soft + low opacity */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] animate-blob-morph bg-gradient-to-br from-lime-300/30 via-lime-400/20 to-emerald-500/25 blur-[2px]" />
        <div className="absolute inset-0 bg-grain opacity-[0.04] mix-blend-multiply" />
      </div>

      {/* Dashed orbit ring (decorative) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full border border-dashed border-gray-900/5 animate-spin-slow pointer-events-none" />

      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
