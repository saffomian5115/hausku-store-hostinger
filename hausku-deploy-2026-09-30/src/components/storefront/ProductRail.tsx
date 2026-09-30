"use client";

import { useRef, useState } from "react";
import ProductCard from "./ProductCard";

type ProductWithVariants = Parameters<typeof ProductCard>[0]["product"];

export default function ProductRail({
  products,
}: {
  products: ProductWithVariants[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const handleScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 0);
  };

  const scrollByCards = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="snap-start shrink-0 w-[78%] sm:w-[46%] lg:w-[31%]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Scroll progress + arrow controls */}
      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={() => scrollByCards(-1)}
          aria-label="Zurück"
          className="w-9 h-9 shrink-0 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-lime-500 hover:text-lime-600 transition-colors"
        >
          ←
        </button>
        <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-lime-500 rounded-full transition-[width] duration-150"
            style={{ width: `${Math.max(8, progress * 100)}%` }}
          />
        </div>
        <button
          onClick={() => scrollByCards(1)}
          aria-label="Weiter"
          className="w-9 h-9 shrink-0 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-lime-500 hover:text-lime-600 transition-colors"
        >
          →
        </button>
      </div>
    </div>
  );
}
