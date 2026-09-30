"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";

type Product = {
  id: number;
  name: string;
  slug: string;
  basePrice: number;
  imageUrl: string | null;
  category: { name: string; slug: string };
  variants: {
    id: number;
    color: string | null;
    colorHex: string | null;
    stockQty: number;
    size: string | null;
  }[];
};

type WishlistContextType = {
  likedProductIds: Set<number>;
  toggleLike: (productId: number) => Promise<void>;
  isLiked: (productId: number) => boolean;
  likedCount: number;
  wishlistProducts: Product[];
  loading: boolean;
  refreshWishlist: () => Promise<void>;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

const STORAGE_KEY = "hausku_wishlist";

function getWishlistFromStorage(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveWishlistToStorage(ids: number[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [likedProductIds, setLikedProductIds] = useState<Set<number>>(
    new Set()
  );
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Load wishlist from database (logged in) or localStorage (guest)
  const refreshWishlist = useCallback(async () => {
    if (user) {
      // Logged in: fetch from database
      try {
        const res = await fetch("/api/wishlist", { credentials: "include" });
        const data = await res.json();
        setLikedProductIds(new Set(data.wishlist.map((p: Product) => p.id)));
        setWishlistProducts(data.wishlist || []);
      } catch {
        // ignore
      }
    } else {
      // Guest: fetch from localStorage and get product data
      const ids = getWishlistFromStorage();
      setLikedProductIds(new Set(ids));
      if (ids.length > 0) {
        try {
          const res = await fetch(`/api/products?ids=${ids.join(",")}`, { credentials: "include" });
          const data = await res.json();
          setWishlistProducts(data.products || []);
        } catch {
          setWishlistProducts([]);
        }
      } else {
        setWishlistProducts([]);
      }
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  // When user logs in, sync localStorage wishlist to database
  useEffect(() => {
    if (user) {
      const localIds = getWishlistFromStorage();
      if (localIds.length > 0) {
        // Sync each local wishlist item to database
        Promise.all(
          localIds.map((productId) =>
            fetch("/api/wishlist/toggle", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ productId }),
            })
          )
        ).then(() => {
          // Clear localStorage after syncing
          saveWishlistToStorage([]);
          refreshWishlist();
        });
      }
    }
  }, [user, refreshWishlist]);

  const toggleLike = useCallback(
    async (productId: number) => {
      // Optimistic update
      setLikedProductIds((prev) => {
        const next = new Set(prev);
        if (next.has(productId)) {
          next.delete(productId);
        } else {
          next.add(productId);
        }
        return next;
      });

      if (user) {
        // Logged in: toggle in database
        try {
          const res = await fetch("/api/wishlist/toggle", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ productId }),
          });
          const data = await res.json();

          if (!data.liked) {
            setLikedProductIds((prev) => {
              const next = new Set(prev);
              next.delete(productId);
              return next;
            });
          }

          // Refresh full wishlist data
          refreshWishlist();
        } catch {
          // Revert optimistic update on error
          setLikedProductIds((prev) => {
            const next = new Set(prev);
            if (next.has(productId)) {
              next.delete(productId);
            } else {
              next.add(productId);
            }
            return next;
          });
        }
      } else {
        // Guest: toggle in localStorage
        const ids = getWishlistFromStorage();
        const index = ids.indexOf(productId);
        if (index > -1) {
          ids.splice(index, 1);
        } else {
          ids.push(productId);
        }
        saveWishlistToStorage(ids);
      }
    },
    [user, refreshWishlist]
  );

  const isLiked = useCallback(
    (productId: number) => likedProductIds.has(productId),
    [likedProductIds]
  );

  return (
    <WishlistContext.Provider
      value={{
        likedProductIds,
        toggleLike,
        isLiked,
        likedCount: likedProductIds.size,
        wishlistProducts,
        loading,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return ctx;
}
