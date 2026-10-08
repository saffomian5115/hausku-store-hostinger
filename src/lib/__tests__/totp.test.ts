import { describe, it, expect } from "vitest";
import {
  generateTotpSecret,
  totpCode,
  verifyTotp,
  otpauthUrl,
  TOTP_PERIOD,
} from "@/lib/totp";

describe("TOTP", () => {
  it("generates a Base32 secret", () => {
    const secret = generateTotpSecret();
    expect(secret).toMatch(/^[A-Z2-7]+$/);
    expect(secret.length).toBeGreaterThanOrEqual(32);
  });

  it("verifies a current code and rejects a wrong one", () => {
    const secret = generateTotpSecret();
    const code = totpCode(secret, Math.floor(Date.now() / 1000 / TOTP_PERIOD));
    expect(verifyTotp(secret, code)).toBe(true);
    expect(verifyTotp(secret, "000000")).toBe(false);
    expect(verifyTotp(secret, "12345")).toBe(false); // not 6 digits
  });
});

describe("otpauthUrl (2FA QR payload)", () => {
  it("builds a scannable otpauth URI with RFC 3986 encoded issuer", () => {
    const url = otpauthUrl("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567", "admin@hausku.com");
    expect(url.startsWith("otpauth://totp/")).toBe(true);
    // Space must be %20, never "+", for authenticator compatibility.
    expect(url).toContain("issuer=hausku%20Admin");
    expect(url).not.toContain("issuer=hausku+Admin");
    expect(url).toContain("secret=ABCDEFGHIJKLMNOPQRSTUVWXYZ234567");
    expect(url).toContain("digits=6");
    expect(url).toContain("period=30");
    expect(url).toContain(encodeURIComponent("hausku Admin:admin@hausku.com"));
  });
});
