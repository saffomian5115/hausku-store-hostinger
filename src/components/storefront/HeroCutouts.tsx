"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CUTOUT_MAP } from "@/lib/cutouts";

interface CutoutItem {
  slug: string;
  name: string;
  img: string;
  offsetX: number;
  offsetY: number;
  rotation: number;
  scale: number;
  delay: number;
}

const CUTOUTS: CutoutItem[] = [
  {
    slug: "couchbar-snackbox",
    name: "Couchbar Snackbox",
    img: CUTOUT_MAP["couchbar-snackbox"],
    offsetX: -20,
    offsetY: -150,
    rotation: -8,
    scale: 1.0,
    delay: 200,
  },
  {
    slug: "brotdose-1400ml",
    name: "Lunch Box 1400ml",
    img: CUTOUT_MAP["brotdose-1400ml"],
    offsetX: -100,
    offsetY: -20,
    rotation: 5,
    scale: 0.9,
    delay: 400,
  },
  {
    slug: "laptopkissen-grau",
    name: "Laptop Cushion",
    img: CUTOUT_MAP["laptopkissen-grau"],
    offsetX: 30,
    offsetY: 40,
    rotation: -4,
    scale: 0.85,
    delay: 600,
  },
];

export default function HeroCutouts() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Entrance animation after mount
    const enterTimer = setTimeout(() => setVisible(true), 100);

    // Scroll-based exit animation
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            // Only trigger exit if we were visible before
            setExiting(true);
          } else {
            setExiting(false);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      clearTimeout(enterTimer);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      className="relative w-full h-full hidden lg:block"
      aria-hidden="true"
    >
      {CUTOUTS.map((cutout, i) => (
        <Link
          key={cutout.slug}
          href={`/product/${cutout.slug}`}
          className="absolute block"
          style={{
            left: `calc(50% + ${cutout.offsetX}px)`,
            top: `calc(50% + ${cutout.offsetY}px)`,
            transform: `
              translate(
                ${visible && !exiting ? "0" : exiting ? `${i % 2 === 0 ? "-120" : "120"}px` : `${cutout.offsetX > 0 ? "80" : "-80"}px`},
                ${visible && !exiting ? "0" : exiting ? "80px" : "40px"}
              )
              scale(${visible && !exiting ? cutout.scale : "0.3"})
              rotate(${visible && !exiting ? `${cutout.rotation}deg` : "0deg"})
            `,
            opacity: visible && !exiting ? 1 : 0,
            transition: `all ${exiting ? "0.5s" : "0.8s"} cubic-bezier(0.34, 1.56, 0.64, 1) ${cutout.delay}ms`,
            zIndex: 30 - i,
            filter: visible && !exiting
              ? "drop-shadow(0 20px 40px rgba(0,0,0,0.3))"
              : "drop-shadow(0 0px 0px rgba(0,0,0,0))",
          }}
        >
          <div className="relative group cursor-pointer">
            <img
              src={cutout.img}
              alt={cutout.name}
              className="w-auto h-auto max-w-[360px] max-h-[360px] object-contain transition-transform duration-500 group-hover:scale-110"
              style={{
                filter: visible && !exiting
                  ? "drop-shadow(0 20px 40px rgba(0,0,0,0.35)) drop-shadow(0 0 60px rgba(132, 204, 22, 0.1))"
                  : "none",
              }}
            />
            {/* Hover glow effect */}
            <div
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(132, 204, 22, 0.15) 0%, transparent 70%)",
                transform: "scale(1.3)",
              }}
            />
          </div>
        </Link>
      ))}

      {/* Floating particles / sparkles behind cutouts */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-lime-400/40 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${15 + (i % 3) * 30}%`,
              animation: `hero-sparkle ${2 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
              opacity: visible && !exiting ? 0.6 : 0,
              transition: "opacity 0.8s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}
