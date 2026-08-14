"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Leaf } from "lucide-react";
import { getCutoutUrl } from "@/lib/cutouts";

/**
 * Single-product hero visual — replaces the old stacked cutouts.
 * One product, one soft glow, one badge. Keeps the hero calm and premium.
 */
const HERO_PRODUCT_SLUG = "couchbar-snackbox";

export default function HeroProduct() {
  const cutout = getCutoutUrl(HERO_PRODUCT_SLUG);
  const img = cutout ?? "/images/products/couchbar-snackbox.jpg";

  return (
    <div className="relative w-full h-full hidden lg:flex items-center justify-center" aria-hidden="true">
      {/* Soft glow disc behind the product */}
      <div
        className="absolute w-[480px] h-[480px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, rgba(163, 230, 53, 0.22) 0%, rgba(16, 185, 129, 0.10) 45%, transparent 70%)",
        }}
      />

      {/* Faint ring for depth */}
      <div className="absolute w-[560px] h-[560px] rounded-full border border-white/5" />

      {/* The product */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative animate-hero-float"
      >
        <Link href={`/product/${HERO_PRODUCT_SLUG}`} className="block group cursor-pointer">
          <img
            src={img}
            alt="Couchbar Snackbox"
            className="w-auto h-auto max-w-[380px] max-h-[380px] object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.45)] transition-transform duration-500 group-hover:scale-[1.04]"
            draggable={false}
          />
        </Link>
      </motion.div>

      {/* Minimal eco badge */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-2 text-lime-200 text-xs font-medium"
      >
        <Leaf className="w-3.5 h-3.5" />
        <span>100% recycelbar</span>
      </motion.div>
    </div>
  );
}
