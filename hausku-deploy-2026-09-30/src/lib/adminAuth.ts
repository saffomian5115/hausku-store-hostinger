import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

/**
 * Central admin session handling with HMAC-signed tokens.
 *
 * The old scheme stored plain base64 JSON in the cookie — anyone could forge
 * {"role":"admin"} and gain full admin API access. Tokens are now signed with
 * AUTH_SECRET (HMAC-SHA256), so they can only be created by the server.
 *
 * AUTH_SECRET must be set in production (see docs/HANDOVER.md). A development
 * fallback keeps local dev working; a warning is logged once so a missing
 * secret is visible in server logs.
 */

const DEV_FALLBACK_SECRET = "hausku-dev-only-secret-change-me";
const ADMIN_SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

let warnedAboutSecret = false;

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (!warnedAboutSecret) {
      console.warn(
        "[auth] AUTH_SECRET not set — using INSECURE dev fallback. Set AUTH_SECRET before production!"
      );
      warnedAboutSecret = true;
    }
    return DEV_FALLBACK_SECRET;
  }
  return secret;
}

function sign(payload: string): string {
  return crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
}

/** Creates a signed admin session token (payload.signature). */
export function createAdminToken(email: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      role: "admin",
      email,
      expires: Date.now() + ADMIN_SESSION_TTL_MS,
    })
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

/** Verifies signature + expiry. Returns the session or null. */
export function verifyAdminToken(
  token: string
): { email: string; expires: number } | null {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;

  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(sig);
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      role?: string;
      email?: string;
      expires?: number;
    };
    if (data.role !== "admin" || typeof data.email !== "string") return null;
    if (typeof data.expires !== "number" || data.expires < Date.now()) return null;
    return { email: data.email, expires: data.expires };
  } catch {
    return null;
  }
}

/** Reads and verifies the admin session from the request cookie. */
export function getAdminSession(
  request: NextRequest
): { email: string; expires: number } | null {
  const cookie = request.cookies.get(ADMIN_COOKIE);
  if (!cookie?.value) return null;
  return verifyAdminToken(cookie.value);
}

/**
 * Guard for admin API route handlers. Returns a 401 response when the caller
 * is not a verified admin, or null when the request may proceed.
 */
export function requireAdmin(request: NextRequest): NextResponse | null {
  if (getAdminSession(request)) return null;
  return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
}

/** Convenience for admin auth routes that set/clear the cookie. */
export const ADMIN_COOKIE = "admin-session";

export function setAdminCookie(response: NextResponse, token: string): void {
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ADMIN_SESSION_TTL_MS / 1000,
    path: "/",
  });
}

export function clearAdminCookie(response: NextResponse): void {
  response.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}
