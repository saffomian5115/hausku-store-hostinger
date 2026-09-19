"use client";

import ShapeGrid from "./ShapeGrid";

/**
 * Fixed full-page animated background (light-mode variant).
 * Sits behind all storefront content with pointer-events off, so it never
 * blocks clicks. Colors are tuned for the forest/sage brand theme:
 * soft sage borders + muted sage hover fill with a trailing effect.
 */
export default function BackgroundGrid() {
  return (
    <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
      <ShapeGrid
        speed={0.14}
        squareSize={28}
        direction="diagonal"
        borderColor="#D9E3CE"
        hoverFillColor="rgba(121, 169, 127, 0.25)"
        shape="hexagon"
        hoverTrailAmount={8}
      />
    </div>
  );
}
