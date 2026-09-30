import crypto from "node:crypto";

/**
 * Minimal RFC 6238 TOTP (SHA-1, 6 digits, 30 s step) — zero dependencies.
 * Compatible with Google Authenticator, Microsoft Authenticator, Authy,
 * 1Password, Bitwarden etc. (Correction #30: 2FA for admin)
 */

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
export const TOTP_PERIOD = 30;

/** Cryptographically random Base32 secret (160 bit default, as RFC 4226 recommends). */
export function generateTotpSecret(bytes = 20): string {
  const buf = crypto.randomBytes(bytes);
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return output;
}

/** HOTP digest for a counter (RFC 4226), truncated to 6 digits (RFC 6238). */
export function totpCode(secret: string, counter: number): string {
  const key = base32Decode(secret);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac("sha1", key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return String(binary % 1_000_000).padStart(6, "0");

  function base32Decode(input: string): Buffer {
    const clean = input.toUpperCase().replace(/=+$/, "").replace(/\s+/g, "");
    let bits = 0;
    let value = 0;
    const bytes: number[] = [];
    for (const char of clean) {
      const idx = BASE32_ALPHABET.indexOf(char);
      if (idx === -1) continue;
      value = (value << 5) | idx;
      bits += 5;
      if (bits >= 8) {
        bytes.push((value >>> (bits - 8)) & 0xff);
        bits -= 8;
      }
    }
    return Buffer.from(bytes);
  }
}

/**
 * Verify a user-entered code against the current time window ± `window`
 * steps (default ±1 = ±30 s clock drift tolerance). Constant-time comparison.
 */
export function verifyTotp(secret: string, code: string, window = 1): boolean {
  const cleaned = code.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(cleaned)) return false;
  const counter = Math.floor(Date.now() / 1000 / TOTP_PERIOD);
  for (let i = -window; i <= window; i++) {
    const expected = Buffer.from(totpCode(secret, counter + i));
    const actual = Buffer.from(cleaned);
    if (expected.length === actual.length && crypto.timingSafeEqual(expected, actual)) {
      return true;
    }
  }
  return false;
}

/** otpauth:// URI for authenticator apps ("key eintragen" / manual entry). */
export function otpauthUrl(
  secret: string,
  account: string,
  issuer = "hausku Admin"
): string {
  const label = encodeURIComponent(`${issuer}:${account}`);
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: "6",
    period: String(TOTP_PERIOD),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}
