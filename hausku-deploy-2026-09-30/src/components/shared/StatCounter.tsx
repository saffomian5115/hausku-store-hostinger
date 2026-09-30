"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "motion/react";

/**
 * Server-receives the real `value` prop (SSR-friendly): the first paint shows
 * the actual number, so SEO, no-JS visitors and screen readers get the real
 * content. Once scrolled into view, the number animates from 0 up to the
 * value — purely cosmetic, content never flashes to zero.
 */
export default function StatCounter({
  value,
  suffix = "",
  prefix = "",
  decimals = 0,
  label,
  className = "",
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [display, setDisplay] = useState(value.toFixed(decimals));
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    // Skip re-animating when already in view on hydration (e.g. mobile fold)
    if (!inView || animated) return;
    setAnimated(true);
    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v.toFixed(decimals)),
    });
    return () => controls.stop();
  }, [inView, value, decimals, animated]);

  return (
    <div className={className}>
      <p className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-gray-900">
        {prefix}
        <span ref={ref}>{display}</span>
        {suffix}
      </p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}
