"use client";

import ShapeGrid from "./ShapeGrid";

export default function BackgroundGrid() {
  return (
    <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none">
      <ShapeGrid
        speed={0.14}
        squareSize={40}
        direction="diagonal"
        borderColor="#2F293A"
        hoverFillColor="#222"
        shape="hexagon"
        hoverTrailAmount={0}
      />
    </div>
  );
}
