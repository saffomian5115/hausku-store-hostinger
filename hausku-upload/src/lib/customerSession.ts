import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

export type SessionCustomer = {
  id: number;
  email: string;
  name: string | null;
};

/**
 * Reads the storefront `session` cookie (signed token set by /api/auth/login,
 * /api/auth/register and the Google OAuth callback) and returns the logged-in
 * customer, or null when the session is missing/expired/invalid.
 *
 * Tokens are HMAC-signed with AUTH_SECRET — the previous plain base64 JSON
 * could be forged by anyone to read another customer's orders/addresses.
 */

const CUSTOMER_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

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
    // Must match the fallback in adminAuth.ts so tokens survive across modules.
    return "hausku-dev-only-secret-change-me";
  }
  return secret;
}

function sign(payload: string): string {
  return crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
}

/** Creates a signed customer session token (payload.signature). */
export function createCustomerToken(customer: {
  id: number;
  email: string;
  name: string | null;
}): string {
  const payload = Buffer.from(
    JSON.stringify({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      expires: Date.now() + CUSTOMER_SESSION_TTL_MS,
    })
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

/** Sets the signed session cookie on a response (30 days). */
export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: CUSTOMER_SESSION_TTL_MS / 1000,
    path: "/",
  });
}

/** Reads and verifies the customer session from the request cookie. */
export function getSessionCustomer(request: NextRequest): SessionCustomer | null {
  const sessionCookie = request.cookies.get("session");

  if (!sessionCookie?.value) {
    return null;
  }

  const token = sessionCookie.value;
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
    const sessionData = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      id?: number;
      email?: string;
      name?: string | null;
      expires?: number;
    };

    if (
      typeof sessionData?.id !== "number" ||
      typeof sessionData.expires !== "number" ||
      sessionData.expires < Date.now()
    ) {
      return null;
    }

    return {
      id: sessionData.id,
      email: sessionData.email ?? "",
      name: sessionData.name ?? null,
    };
  } catch {
    return null;
  }
}
