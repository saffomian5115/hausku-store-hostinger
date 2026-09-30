"use client";

import { ReactLenis } from "lenis/react";

/**
 * Lenis-powered smooth scrolling for the storefront.
 *
 * - root mode: drives the native window scroll (no wrapper div), so sticky
 *   nav, scroll-triggered sections and the fixed background grid keep working.
 * - lerp 0.08: gentle, buttery inertia on wheel/trackpad.
 * - anchors: anchor links scroll smoothly instead of jumping.
 * - allowNestedScroll: dropdowns/rails with their own overflow scroll natively.
 * - respectReducedMotion (Lenis default): disables smoothing for users who
 *   prefer reduced motion.
 */
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.08,
        anchors: true,
        allowNestedScroll: true,
        stopInertiaOnNavigate: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
