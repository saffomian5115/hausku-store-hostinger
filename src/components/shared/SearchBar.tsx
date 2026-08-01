"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/shared/LocaleContext";

interface Suggestion {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  category: { name: string };
  basePrice: number;
}

export default function SearchBar({
  initialQuery = "",
  currentCategory,
  compact = false,
}: {
  initialQuery?: string;
  currentCategory?: string;
  compact?: boolean;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [expanded, setExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { t } = useLocale();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input when expanded
  useEffect(() => {
    if (expanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [expanded]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Click outside to close (compact mode)
  useEffect(() => {
    if (!expanded || !compact) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false);
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [expanded, compact]);

  // Click outside to close suggestions (full-width mode)
  useEffect(() => {
    if (!showSuggestions || compact) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [showSuggestions, compact]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setExpanded(true);
      }
      if (e.key === "Escape") {
        setExpanded(false);
        setShowSuggestions(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Fetch suggestions with debounce
  const fetchSuggestions = useCallback((searchTerm: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!searchTerm.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setSuggestions([]);
    debounceRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: searchTerm.trim(), limit: "6" });
        if (currentCategory) params.set("category", currentCategory);
        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        setSuggestions(data.products || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [currentCategory]);

  // Handle input change
  const handleInputChange = (value: string) => {
    setQuery(value);
    fetchSuggestions(value);
  };

  // Select a suggestion
  const handleSelectSuggestion = (slug: string) => {
    setShowSuggestions(false);
    setQuery("");
    if (compact) setExpanded(false);
    router.push(`/product/${slug}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const trimmed = query.trim();
    if (trimmed) {
      params.set("q", trimmed);
    }
    if (currentCategory) {
      params.set("category", currentCategory);
    }
    const qs = params.toString();
    router.push(qs ? `/catalog?${qs}` : "/catalog");
    setShowSuggestions(false);
    if (compact) setExpanded(false);
  };

  // Smart close: if text exists, just clear; if empty, close search
  const handleClose = () => {
    if (query.trim()) {
      setQuery("");
      setSuggestions([]);
      setShowSuggestions(false);
    } else {
      setExpanded(false);
      setQuery("");
      setShowSuggestions(false);
    }
  };

  // Compact version: icon → animated expanding search bar with suggestions
  if (compact) {
    return (
      <div ref={containerRef} className="relative flex items-center">
        {!expanded ? (
          <button
            onClick={() => setExpanded(true)}
            className="p-2.5 text-gray-900 hover:text-lime-600 rounded-xl transition-all duration-200 hover:bg-gray-50 group"
            aria-label={t("common.search")}
          >
            <svg
              className="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        ) : (
          <div className="relative">
            <form
              onSubmit={handleSubmit}
              className="flex items-center bg-gray-50 border border-gray-200 rounded-full shadow-lg z-50 overflow-hidden transition-all duration-300 ease-out"
              style={{ width: "320px" }}
            >
              {/* Search icon inside */}
              <div className="pl-4 pr-1">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                placeholder={t("search.placeholder")}
                className="flex-1 bg-transparent py-2.5 px-2 text-sm text-gray-900 placeholder-gray-400 outline-none min-w-0"
              />
              {loading && (
                <div className="px-2">
                  <svg className="w-4 h-4 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              )}
              {/* Single close/clear button — smart behavior */}
              <button
                type="button"
                onClick={handleClose}
                className="mr-1 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-all duration-200"
                aria-label={query ? t("search.clear") : t("search.close")}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </form>

            {/* Suggestions dropdown */}
            {showSuggestions && (
              <div
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-[360px] overflow-y-auto"
                style={{ animation: "slideDown 0.2s ease-out" }}
              >
                {loading && suggestions.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-gray-400">
                    <svg className="w-5 h-5 mx-auto mb-2 animate-spin text-gray-300" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t("search.searching")}
                  </div>
                ) : suggestions.length > 0 ? (
                  <>
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {suggestions.length} {suggestions.length === 1 ? t("search.result") : t("search.results")}
                      </p>
                    </div>
                    {suggestions.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleSelectSuggestion(product.slug)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="w-11 h-11 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">📷</div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.category.name}</p>
                        </div>
                        <span className="text-sm font-bold text-lime-500 shrink-0">€{product.basePrice.toFixed(2)}</span>
                      </button>
                    ))}
                    <button
                      onClick={handleSubmit}
                      className="w-full px-4 py-3 border-t border-gray-100 text-sm font-semibold text-lime-500 hover:bg-lime-50 transition-colors text-center"
                    >
                      „{query}" in Katalog suchen →
                    </button>
                  </>
                ) : (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-gray-500">Keine Ergebnisse für „{query}"</p>
                    <button
                      onClick={handleSubmit}
                      className="mt-2 text-sm font-semibold text-lime-500 hover:text-lime-600 transition-colors"
                    >
                      Im ganzen Katalog suchen →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full-width version: used in catalog sidebar
  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
          placeholder="Produkte suchen…"
          className="w-full border rounded-xl px-4 py-2.5 pl-10 text-sm outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(""); setSuggestions([]); setShowSuggestions(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </form>

      {/* Suggestions dropdown for full-width version */}
      {showSuggestions && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-[360px] overflow-y-auto"
          style={{ animation: "slideDown 0.2s ease-out" }}
        >
          {loading && suggestions.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              <svg className="w-5 h-5 mx-auto mb-2 animate-spin text-gray-300" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Suche läuft…
            </div>
          ) : suggestions.length > 0 ? (
            <>
              <div className="px-4 py-2.5 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {suggestions.length} {suggestions.length === 1 ? "Ergebnis" : "Ergebnisse"}
                </p>
              </div>
              {suggestions.map((product) => (
                <button
                  key={product.id}
                  onClick={() => { setShowSuggestions(false); setQuery(""); router.push(`/product/${product.slug}`); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-11 h-11 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">📷</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-400">{product.category.name}</p>
                  </div>
                  <span className="text-sm font-bold text-lime-500 shrink-0">€{product.basePrice.toFixed(2)}</span>
                </button>
              ))}
              <button
                onClick={handleSubmit}
                className="w-full px-4 py-3 border-t border-gray-100 text-sm font-semibold text-lime-500 hover:bg-lime-50 transition-colors text-center"
              >
                „{query}" in Katalog suchen →
              </button>
            </>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-gray-500">Keine Ergebnisse für „{query}"</p>
              <button
                onClick={handleSubmit}
                className="mt-2 text-sm font-semibold text-lime-500 hover:text-lime-600 transition-colors"
              >
                Im ganzen Katalog suchen →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
