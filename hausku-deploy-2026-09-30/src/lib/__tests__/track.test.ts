import { describe, it, expect, vi } from "vitest";
import { trackAddToCart, trackPurchase } from "@/lib/track";

describe("tracking helpers", () => {
  it("trackAddToCart is a safe no-op without a tracking library", () => {
    // In Node (no window / gtag / fbq) the helpers must not throw.
    expect(() =>
      trackAddToCart({
        itemId: 42,
        name: "Brotdose",
        quantity: 2,
        price: 14.95,
      })
    ).not.toThrow();
  });

  it("trackPurchase is a safe no-op without a tracking library", () => {
    expect(() =>
      trackPurchase({
        transactionId: "hausku-1234",
        value: 39.9,
        currency: "EUR",
        items: [{ itemId: 7, name: "Snackbox", quantity: 1, price: 39.9 }],
      })
    ).not.toThrow();
  });

  it("calls gtag and fbq when they exist on window", () => {
    const gtag = vi.fn();
    const fbq = vi.fn();
    (globalThis as Record<string, unknown>).window = {
      gtag,
      fbq,
    } as unknown as Window;

    trackAddToCart({ itemId: 1, name: "Test", quantity: 1, price: 10 });

    expect(gtag).toHaveBeenCalledWith(
      "event",
      "add_to_cart",
      expect.objectContaining({ currency: "EUR", value: 10 })
    );
    expect(fbq).toHaveBeenCalledWith(
      "track",
      "AddToCart",
      expect.objectContaining({ value: 10, currency: "EUR" })
    );

    delete (globalThis as Record<string, unknown>).window;
  });
});
