"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Leaf, Recycle, ShieldCheck } from "lucide-react";
import { getCutoutUrl } from "@/lib/cutouts";

const HERO_PRODUCT_SLUG = "couchbar-snackbox";

/**
 * Replaces the old stacked/static hero visual. The product sits inside a
 * slowly-morphing organic blob (grounded in the brand's "handmade, natural
 * materials" story), with a subtle grain overlay and two floating fabric-tag
 * style badges that reference the real product details (cotton bag,
 * recyclability, 2-year warranty) instead of decorative filler.
 */
export default function HeroBlob() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cutout = getCutoutUrl(HERO_PRODUCT_SLUG);
  const img = cutout ?? "/images/products/couchbar-snackbox.jpg";

  const handleMove = (e: React.MouseEvent) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: px * 10, y: py * -8 });
  };

  const handleLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <div
      ref={wrapRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative w-full h-full flex items-center justify-center"
      style={{ perspective: "1000px" }}
    >
      {/* Morphing blob backdrop */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="absolute w-[440px] h-[440px] sm:w-[520px] sm:h-[520px] animate-blob-morph bg-gradient-to-br from-lime-300 via-lime-400 to-emerald-500"
        style={{
          filter: "blur(0.5px)",
        }}
      />
      {/* Grain overlay on the blob for texture */}
      <div className="absolute w-[440px] h-[440px] sm:w-[520px] sm:h-[520px] animate-blob-morph opacity-[0.15] mix-blend-overlay bg-grain" />

      {/* Dashed orbit ring */}
      <div className="absolute w-[560px] h-[560px] sm:w-[640px] sm:h-[640px] rounded-full border border-dashed border-gray-900/10 animate-spin-slow" />

      {/* Product */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{
          opacity: 1,
          y: 0,
          rotateX: tilt.y,
          rotateY: tilt.x,
        }}
        transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative animate-hero-float"
        style={{ transformStyle: "preserve-3d" }}
      >
        <Link href={`/product/${HERO_PRODUCT_SLUG}`} className="block group cursor-pointer">
          <img
            src={img}
            alt="Couchbar Snackbox"
            className="w-auto h-auto max-w-[300px] sm:max-w-[360px] max-h-[300px] sm:max-h-[360px] object-contain drop-shadow-[0_30px_50px_rgba(15,42,28,0.35)] transition-transform duration-500 group-hover:scale-[1.05]"
            draggable={false}
          />
        </Link>
      </motion.div>

      {/* Floating fabric-tag badge — top left */}
      <motion.div
        initial={{ opacity: 0, x: -20, rotate: -8 }}
        animate={{ opacity: 1, x: 0, rotate: -6 }}
        transition={{ duration: 0.7, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute -left-2 sm:left-2 top-6 animate-badge-float"
      >
        <div className="flex items-center gap-1.5 bg-white shadow-lg shadow-black/10 rounded-full pl-2 pr-3 py-1.5 border border-gray-100 -rotate-3">
          <span className="w-6 h-6 rounded-full bg-lime-100 flex items-center justify-center shrink-0">
            <Recycle className="w-3.5 h-3.5 text-lime-600" />
          </span>
          <span className="text-[11px] font-semibold text-gray-800 whitespace-nowrap">
            100% recycelbar
          </span>
        </div>
      </motion.div>

      {/* Floating fabric-tag badge — bottom right */}
      <motion.div
        initial={{ opacity: 0, x: 20, rotate: 8 }}
        animate={{ opacity: 1, x: 0, rotate: 4 }}
        transition={{ duration: 0.7, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute right-0 sm:right-4 bottom-10 animate-badge-float"
        style={{ animationDelay: "1.2s" }}
      >
        <div className="flex items-center gap-1.5 bg-[#0F2A1C] shadow-lg shadow-black/20 rounded-full pl-2 pr-3 py-1.5 rotate-3">
          <span className="w-6 h-6 rounded-full bg-lime-400/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-lime-300" />
          </span>
          <span className="text-[11px] font-semibold text-lime-100 whitespace-nowrap">
            2 Jahre Garantie
          </span>
        </div>
      </motion.div>

      {/* Small leaf accent */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1, ease: "backOut" }}
        className="absolute left-1/2 -translate-x-1/2 -bottom-4 flex items-center gap-1.5 bg-lime-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg shadow-lime-500/30"
      >
        <Leaf className="w-3 h-3" />
        Handverlesene Materialien
      </motion.div>
    </div>
  );
}
