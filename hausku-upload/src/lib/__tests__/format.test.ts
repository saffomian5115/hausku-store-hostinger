import { describe, it, expect } from "vitest";
import { formatPrice, formatPriceSimple } from "@/lib/format";

describe("formatPrice", () => {
  it("formats a whole number in EUR with de-DE locale", () => {
    expect(formatPrice(10)).toBe("10,00 €");
  });

  it("formats a decimal amount", () => {
    expect(formatPrice(19.99)).toBe("19,99 €");
  });

  it("formats zero", () => {
    expect(formatPrice(0)).toBe("0,00 €");
  });
});

describe("formatPriceSimple", () => {
  it("formats with two decimals and € symbol", () => {
    expect(formatPriceSimple(10)).toBe("€10.00");
  });

  it("formats a decimal amount", () => {
    expect(formatPriceSimple(19.995)).toBe("€20.00");
  });
});
