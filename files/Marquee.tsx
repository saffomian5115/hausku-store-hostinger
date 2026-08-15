"use client";

import { type ReactNode } from "react";

/**
 * Infinite horizontal marquee. Duplicates its children so the scroll
 * loop is seamless, and pauses on hover/focus for accessibility.
 *
 * Used in three places on the redesigned homepage:
 *  - the top announcement ticker
 *  - the "stitched tag" divider between editorial product sections
 *  - the two-row testimonial rail (pass reverse to alternate direction)
 */
export default function Marquee({
  children,
  speed = 32,
  reverse = false,
  gap = "2.5rem",
  className = "",
  pauseOnHover = true,
}: {
  children: ReactNode;
  speed?: number; // seconds for one full loop — lower = faster
  reverse?: boolean;
  gap?: string;
  className?: string;
  pauseOnHover?: boolean;
}) {
  return (
    <div
      className={`group relative overflow-hidden ${className}`}
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
      }}
    >
      <div
        className={`flex w-max items-center ${pauseOnHover ? "group-hover:[animation-play-state:paused]" : ""}`}
        style={{
          gap,
          animation: `${reverse ? "marquee-reverse" : "marquee"} ${speed}s linear infinite`,
        }}
      >
        <div className="flex items-center shrink-0" style={{ gap }}>
          {children}
        </div>
        <div className="flex items-center shrink-0" style={{ gap }} aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
