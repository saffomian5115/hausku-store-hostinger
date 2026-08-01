"use client";

import { useEffect, useCallback, useState, useRef } from "react";

interface ProductImagePreviewProps {
  images: { url: string; alt: string }[];
  initialIndex?: number;
  onClose: () => void;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// ─── Gallery image config ──────────────────────────────

const GALLERY_CONFIG: Record<string, { prefix: string; count: number }> = {
  "brotdose-850ml": { prefix: "brotdose", count: 16 },
  "brotdose-1200ml": { prefix: "brotdose", count: 16 },
  "brotdose-1400ml": { prefix: "brotdose", count: 16 },
  "couchbar-snackbox": { prefix: "couchbar", count: 1 },
  "laptopkissen-grau": { prefix: "laptopkissen-grau", count: 8 },
  "laptopkissen-schwarz": { prefix: "laptopkissen-schwarz", count: 6 },
};

export function getProductGalleryImages(
  mainImage: string,
  productName: string,
  slug: string
): { url: string; alt: string }[] {
  const result: { url: string; alt: string }[] = [
    { url: mainImage, alt: `${productName} - Hauptbild` },
  ];

  const config = GALLERY_CONFIG[slug];
  if (config) {
    for (let i = 1; i <= config.count; i++) {
      result.push({
        url: `/images/products/gallery/${config.prefix}-${i}.jpg`,
        alt: `${productName} - Ansicht ${i + 1}`,
      });
    }
  }

  return result;
}

// ─── 3D Perspective Image Preview ──────────────────────

export default function ProductImagePreview({
  images,
  initialIndex = 0,
  onClose,
}: ProductImagePreviewProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [mouseX, setMouseX] = useState(0.5);
  const [mouseY, setMouseY] = useState(0.5);
  const contentRef = useRef<HTMLDivElement>(null);
  const Z_DISTANCE = 80;

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      const total = images.length;
      const newIndex = ((index % total) + total) % total;
      if (newIndex === activeIndex) return;

      setDirection(newIndex > activeIndex ? "right" : "left");
      setPrevIndex(activeIndex);
      setIsTransitioning(true);
      setActiveIndex(newIndex);

      setTimeout(() => {
        setIsTransitioning(false);
        setPrevIndex(null);
        setDirection(null);
      }, 700);
    },
    [activeIndex, images.length, isTransitioning]
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [goTo, activeIndex]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [goTo, activeIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        goNext();
      } else if (e.key === "ArrowLeft") {
        goPrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, goNext, goPrev]);

  // Mouse parallax + 3D rotation — use RAF to avoid re-render storms
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
      if (rafId.current === null) {
        rafId.current = requestAnimationFrame(() => {
          setMouseX(mouseRef.current.x);
          setMouseY(mouseRef.current.y);
          rafId.current = null;
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  // Touch/swipe support
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx > 0) goPrev();
      else goNext();
    }
  };

  if (images.length === 0) return null;

  const parallaxX = lerp(-8, 8, mouseX);
  const parallaxY = lerp(-5, 5, mouseY);
  const rotateYDeg = (mouseX - 0.5) * 4;
  const rotateXDeg = (mouseY - 0.5) * -3;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-black/95 transition-opacity duration-700"
        onClick={onClose}
      />

      {/* Background image with parallax */}
      <div
        className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
        style={{
          backgroundImage: `url(${images[activeIndex].url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.15,
          filter: "blur(8px)",
          transform: `scale(1.1) translate(${parallaxX * 0.5}px, ${parallaxY * 0.5}px)`,
        }}
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 backdrop-blur-sm group"
        aria-label="Close preview"
      >
        <svg
          className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Counter */}
      <div className="absolute top-6 left-6 z-50 text-white/70 text-sm font-mono tracking-wider">
        {String(activeIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
      </div>

      {/* Slider content */}
      <div
        ref={contentRef}
        className="relative z-10 w-[85vw] h-[60vh] max-w-5xl max-h-[80vh]"
        style={{
          transform: `translateZ(${Z_DISTANCE}px) translate(${parallaxX}px, ${parallaxY}px)`,
          transformStyle: "preserve-3d",
          transition: "transform 0.1s ease-out",
        }}
      >
        {/* Images container */}
        <div
          className="relative w-full h-full overflow-hidden rounded-2xl shadow-2xl"
          style={{ transformStyle: "preserve-3d" }}
        >
          {images.map((image, index) => {
            const isActive = index === activeIndex;
            const isPrev = index === prevIndex;
            let transform = "translateX(0)";
            let zIndex = 0;
            let visibility: "visible" | "hidden" = "hidden";
            let transition = "none";

            if (isActive) {
              transform = "translateX(0)";
              zIndex = 20;
              visibility = "visible";
              if (isTransitioning) {
                transition =
                  "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.7s ease";
              }
            } else if (isPrev) {
              zIndex = 15;
              visibility = "visible";
              transition =
                "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.7s ease";
              transform =
                direction === "right"
                  ? "translateX(-100%)"
                  : "translateX(100%)";
            } else if (index < activeIndex) {
              transform = "translateX(-100%)";
              if (!isTransitioning) visibility = "hidden";
            } else {
              transform = "translateX(100%)";
              if (!isTransitioning) visibility = "hidden";
            }

            return (
              <div
                key={index}
                className="absolute inset-0"
                style={{
                  transform,
                  zIndex,
                  visibility,
                  transition,
                  transformStyle: "preserve-3d",
                }}
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-contain bg-gray-900/50"
                  style={{
                    transform:
                      isActive
                        ? `scale(1) rotateY(${rotateYDeg}deg) rotateX(${rotateXDeg}deg)`
                        : "none",
                    transition: "transform 0.1s ease-out",
                  }}
                  draggable={false}
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
            );
          })}
        </div>

        {/* Image caption */}
        <div className="absolute -bottom-10 left-0 right-0 text-center">
          <p className="text-white/60 text-sm">{images[activeIndex].alt}</p>
        </div>
      </div>

      {/* Left arrow */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          goPrev();
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-14 h-14 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 backdrop-blur-sm group cursor-pointer"
        aria-label="Previous image"
      >
        <svg
          className="w-6 h-6 ml-[-2px] transition-transform duration-300 group-hover:scale-110"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Right arrow */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          goNext();
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-14 h-14 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 backdrop-blur-sm group cursor-pointer"
        aria-label="Next image"
      >
        <svg
          className="w-6 h-6 ml-[2px] transition-transform duration-300 group-hover:scale-110"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots */}
      {images.length > 1 && (
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-full bg-black/30 backdrop-blur-sm"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                goTo(index);
              }}
              className={`transition-all duration-500 rounded-full ${
                index === activeIndex
                  ? "w-8 h-2 bg-white"
                  : "w-2 h-2 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
