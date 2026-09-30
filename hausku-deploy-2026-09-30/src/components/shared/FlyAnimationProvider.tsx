"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
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
  const elRef = useRef<HTMLDivElement | null>(null);
  const doneRef = useRef(false);

  // Land exactly once: triggers the caller's action + removes the fly.
  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  }, [onDone]);

  // Find the header icon to fly towards. If it's not on screen (e.g. mobile
  // before the target got rendered), land immediately so the add-to-cart /
  // like action still happens — never silently swallow the click.
  useEffect(() => {
    const selector =
      fly.type === "cart"
        ? '[data-fly-target="cart-icon"]'
        : '[data-fly-target="wishlist-icon"]';
    // Pick the first VISIBLE target — hidden (display:none) duplicates exist
    // for the other breakpoint (desktop button vs mobile link), and their
    // getBoundingClientRect() would be all zeros.
    let target: Element | null = null;
    for (const el of document.querySelectorAll(selector)) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        target = el;
        break;
      }
    }
    if (target) {
      setTargetRect(target.getBoundingClientRect());
    } else {
      finish();
    }
  }, [fly.type, finish]);

  // Run the flight with the Web Animations API instead of a CSS transition.
  // CSS transition-duration can be overridden globally (e.g. a
  // prefers-reduced-motion media query sets it to 0.01ms !important, which
  // made the fly teleport instantly and become invisible). el.animate() is
  // not affected by those overrides, so the float always plays.
  useEffect(() => {
    const el = elRef.current;
    if (!targetRect || !el) return;

    // Center-to-center offset
    const dx =
      targetRect.left +
      targetRect.width / 2 -
      (fly.sourceRect.left + fly.sourceRect.width / 2);
    const dy =
      targetRect.top +
      targetRect.height / 2 -
      (fly.sourceRect.top + fly.sourceRect.height / 2);

    const anim = el.animate(
      [
        { transform: "translate(0, 0) scale(1)", opacity: 1 },
        {
          transform: `translate(${dx}px, ${dy}px) scale(0.25)`,
          opacity: 0.5,
        },
      ],
      {
        duration: 600,
        easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        fill: "forwards",
      }
    );
    anim.onfinish = finish;

    // Safety net: if onfinish never fires (hidden tab, paused browser), land
    // anyway so the cart item is never lost.
    const safety = setTimeout(finish, 900);
    return () => {
      clearTimeout(safety);
      anim.cancel();
    };
  }, [targetRect, fly.sourceRect, finish]);

  if (!targetRect) return null;

  return (
    <div
      ref={elRef}
      style={{
        position: "fixed",
        left: fly.sourceRect.left,
        top: fly.sourceRect.top,
        width: fly.sourceRect.width,
        height: fly.sourceRect.height,
        zIndex: 9999,
        pointerEvents: "none",
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
            <div className="w-full h-full bg-gradient-to-br from-lime-100 to-lime-200 flex items-center justify-center text-lime-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <svg
            className="w-7 h-7 text-lime-500 drop-shadow-lg"
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
