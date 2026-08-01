"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

// ─── Types ────────────────────────────────────────────────

type FlyEntry = {
  id: string;
  type: "cart" | "heart";
  imageUrl: string | null;
  cutoutUrl: string | null;
  sourceRect: { left: number; top: number; width: number; height: number };
  onLand: () => void;
};

type FlyContextType = {
  flyToCart: (
    sourceRect: DOMRect,
    imageUrl: string | null,
    onLand?: () => void,
    cutoutUrl?: string | null
  ) => void;
  flyToWishlist: (sourceRect: DOMRect, onLand?: () => void) => void;
};

const FlyContext = createContext<FlyContextType | null>(null);

// ─── Flying element (handles its own lifecycle) ──────────

function FlyItem({
  fly,
  onDone,
}: {
  fly: FlyEntry;
  onDone: () => void;
}) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [animating, setAnimating] = useState(false);
  const flyRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    // After first paint, trigger the fly
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimating(true);
      });
    });
  }, []);

  useEffect(() => {
    const selector =
      fly.type === "cart"
        ? '[data-fly-target="cart-icon"]'
        : '[data-fly-target="wishlist-icon"]';
    const target = document.querySelector(selector);
    if (target) {
      setTargetRect(target.getBoundingClientRect());
    }
  }, [fly.type]);

  if (!targetRect) return null;

  // Center-to-center offset
  const dx =
    targetRect.left +
    targetRect.width / 2 -
    (fly.sourceRect.left + fly.sourceRect.width / 2);
  const dy =
    targetRect.top +
    targetRect.height / 2 -
    (fly.sourceRect.top + fly.sourceRect.height / 2);

  return (
    <div
      ref={flyRef}
      style={{
        position: "fixed",
        left: fly.sourceRect.left,
        top: fly.sourceRect.top,
        width: fly.sourceRect.width,
        height: fly.sourceRect.height,
        zIndex: 9999,
        pointerEvents: "none",
        transition: "all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        transform: animating
          ? `translate(${dx}px, ${dy}px) scale(0.25)`
          : "translate(0, 0) scale(1)",
        opacity: animating ? 0.5 : 1,
      }}
      onTransitionEnd={(e) => {
        // Only fire when the main transform completes (prevent double-fire from opacity)
        if (e.propertyName === "transform") {
          onDone();
        }
      }}
    >
      {fly.type === "cart" ? (
        <div className="w-full h-full rounded-lg overflow-hidden shadow-2xl border-2 border-lime-400 bg-white flex items-center justify-center">
          {(fly.cutoutUrl || fly.imageUrl) ? (
            <img
              src={fly.cutoutUrl || fly.imageUrl || ""}
              alt=""
              className="w-full h-full object-contain p-1"
              style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))" }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-lime-100 to-lime-200 flex items-center justify-center text-lime-500 text-xl">
              🛒
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <svg
            className="w-7 h-7 text-red-500 drop-shadow-lg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
      )}
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────

export function FlyProvider({ children }: { children: ReactNode }) {
  const [flies, setFlies] = useState<FlyEntry[]>([]);

  const removeFly = useCallback((id: string) => {
    setFlies((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const flyToCart = useCallback(
    (
      sourceRect: DOMRect,
      imageUrl: string | null,
      onLand?: () => void,
      cutoutUrl?: string | null
    ) => {
      const id = `fly-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const fly: FlyEntry = {
        id,
        type: "cart",
        imageUrl,
        cutoutUrl: cutoutUrl ?? null,
        sourceRect: {
          left: sourceRect.left,
          top: sourceRect.top,
          width: sourceRect.width,
          height: sourceRect.height,
        },
        onLand: () => {
          onLand?.();
          removeFly(id);
        },
      };
      setFlies((prev) => [...prev, fly]);
    },
    [removeFly]
  );

  const flyToWishlist = useCallback(
    (sourceRect: DOMRect, onLand?: () => void) => {
      const id = `fly-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const fly: FlyEntry = {
        id,
        type: "heart",
        imageUrl: null,
        cutoutUrl: null,
        sourceRect: {
          left: sourceRect.left,
          top: sourceRect.top,
          width: sourceRect.width,
          height: sourceRect.height,
        },
        onLand: () => {
          onLand?.();
          removeFly(id);
        },
      };
      setFlies((prev) => [...prev, fly]);
    },
    [removeFly]
  );

  return (
    <FlyContext.Provider value={{ flyToCart, flyToWishlist }}>
      {children}
      {flies.map((fly) => (
        <FlyItem
          key={fly.id}
          fly={fly}
          onDone={() => {
            fly.onLand();
          }}
        />
      ))}
    </FlyContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────

export function useFly() {
  const ctx = useContext(FlyContext);
  if (!ctx) {
    throw new Error("useFly must be used within a FlyProvider");
  }
  return ctx;
}
