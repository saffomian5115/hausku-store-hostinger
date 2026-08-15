"use client";

import ShapeGrid from "./ShapeGrid";

/**
 * Fixed full-page animated background (light-mode variant).
 * Sits behind all storefront content with pointer-events off, so it never
 * blocks clicks. Colors are tuned for the sand/cream (#fafaf9 / #F6F2E7)
 * theme: soft sage borders + lime hover fill with a trailing effect.
 */
export default function BackgroundGrid() {
  return (
    <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
      <ShapeGrid
        speed={0.14}
        squareSize={28}
        direction="diagonal"
        borderColor="#D9E3CE"
        hoverFillColor="rgba(132, 204, 22, 0.3)"
        shape="hexagon"
        hoverTrailAmount={8}
      />
    </div>
  );
}
