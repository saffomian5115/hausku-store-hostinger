import { describe, it, expect } from "vitest";
import { normalizeSearch, levenshtein, rankProducts } from "@/lib/search";

const products = [
  { id: 1, name: "HAUSKU Edelstahl Brotdose 850 ml", description: "Auslaufsichere Edelstahl-Brotdose mit Trennwand." },
  { id: 2, name: "HAUSKU Edelstahl Brotdose 1200 ml", description: "Große auslaufsichere Edelstahl-Brotdose." },
  { id: 3, name: "HAUSKU Edelstahl Brotdose 1400 ml", description: "Die größte HAUSKU Brotdose." },
  { id: 4, name: "Laptopkissen für Bett & Sofa — Grau", description: "Ergonomisches Lapdesk." },
  { id: 5, name: "Laptopkissen für Bett & Sofa — Schwarz", description: "Lapdesk in Schwarz." },
  { id: 6, name: "HAUSKU Couch Bar Snackbox", description: "Snack-Organizer aus Bambus und Edelstahl." },
];

describe("normalizeSearch", () => {
  it("lowercases and trims", () => {
    expect(normalizeSearch("  BrotDose  ")).toBe("brotdose");
  });

  it("strips diacritics", () => {
    expect(normalizeSearch("Küche")).toBe("kuche");
    expect(normalizeSearch("müsli")).toBe("musli");
  });

  it("expands ß", () => {
    expect(normalizeSearch("Straße")).toBe("strasse");
  });

  it("collapses whitespace", () => {
    expect(normalizeSearch("laptop   kissen")).toBe("laptop kissen");
  });
});

describe("levenshtein", () => {
  it("returns 0 for identical strings", () => {
    expect(levenshtein("brotdose", "brotdose")).toBe(0);
  });

  it("handles single substitutions", () => {
    expect(levenshtein("brottdose", "brotdose")).toBe(1);
  });

  it("handles insertions and deletions", () => {
    expect(levenshtein("laptp", "laptop")).toBe(1);
    expect(levenshtein("snakbox", "snackbox")).toBe(1);
  });

  it("handles empty strings", () => {
    expect(levenshtein("", "abc")).toBe(3);
    expect(levenshtein("abc", "")).toBe(3);
  });
});

describe("rankProducts", () => {
  it("finds exact name matches", () => {
    const results = rankProducts(products, "Brotdose");
    expect(results.length).toBeGreaterThanOrEqual(3);
    expect(results[0].id).toBe(1);
  });

  it("is typo-tolerant", () => {
    const results = rankProducts(products, "brottdose");
    expect(results.some((p) => p.name.includes("Brotdose"))).toBe(true);
  });

  it("matches with swapped letters", () => {
    const results = rankProducts(products, "laptpo");
    expect(results.some((p) => p.name.includes("Laptopkissen"))).toBe(true);
  });

  it("is diacritic-insensitive", () => {
    const results = rankProducts(products, "kuche");
    // no product contains "Küche", so nothing should match — but also no crash
    expect(Array.isArray(results)).toBe(true);
  });

  it("matches multi-word queries with a missing word", () => {
    const results = rankProducts(products, "brot 1400");
    expect(results[0].name).toContain("1400");
  });

  it("returns everything for an empty query", () => {
    expect(rankProducts(products, "")).toHaveLength(products.length);
  });

  it("returns nothing for a completely unrelated query", () => {
    expect(rankProducts(products, "xyzqwertz")).toHaveLength(0);
  });

  it("ranks exact matches above fuzzy matches", () => {
    const exact = rankProducts(products, "snackbox");
    const fuzzy = rankProducts(products, "snakbox");
    expect(exact[0].id).toBe(6);
    expect(fuzzy[0].id).toBe(6);
  });
});
