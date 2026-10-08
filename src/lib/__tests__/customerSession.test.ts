import { describe, it, expect, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";
import {
  createCustomerToken,
  verifyCustomerToken,
  getSessionCustomer,
} from "@/lib/customerSession";
import { getSessionUser } from "@/lib/auth";
import { GET as me } from "@/app/api/auth/me/route";

const customer = { id: 42, email: "demo@hausku.com", name: "Demo Kunde" };

function requestWith(session?: string): NextRequest {
  return new NextRequest("http://localhost/api/auth/me", {
    headers: session ? { cookie: `session=${session}` } : {},
  });
}

afterEach(() => {
  vi.useRealTimers();
});

describe("customer session tokens", () => {
  it("round-trips a signed token from login/register/Google callback", () => {
    const token = createCustomerToken(customer);
    expect(token).toContain("."); // payload.signature, not plain base64 JSON
    expect(verifyCustomerToken(token)).toEqual(customer);
  });

  it("reads the session from a request cookie", () => {
    const token = createCustomerToken(customer);
    expect(getSessionCustomer(requestWith(token))).toEqual(customer);
  });

  it("rejects a tampered payload", () => {
    const token = createCustomerToken(customer);
    const [, sig] = token.split(".");
    const forged = Buffer.from(
      JSON.stringify({ id: 1, email: "attacker@evil.com", name: null, expires: Date.now() + 1e9 })
    ).toString("base64url");
    expect(verifyCustomerToken(`${forged}.${sig}`)).toBeNull();
  });

  it("rejects a tampered signature", () => {
    const token = createCustomerToken(customer);
    expect(verifyCustomerToken(`${token}x`)).toBeNull();
  });

  it("rejects an expired token", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2020-01-01T00:00:00Z"));
    const token = createCustomerToken(customer);
    vi.setSystemTime(new Date("2020-03-01T00:00:00Z")); // > 30 day TTL
    expect(verifyCustomerToken(token)).toBeNull();
  });

  it("returns null for missing/garbage tokens", () => {
    expect(verifyCustomerToken(undefined)).toBeNull();
    expect(verifyCustomerToken("")).toBeNull();
    expect(verifyCustomerToken("not-a-token")).toBeNull();
  });

  it("exposes the same session via getSessionUser (wishlist APIs)", () => {
    const token = createCustomerToken(customer);
    expect(getSessionUser(requestWith(token))).toEqual(customer);
  });
});

describe("GET /api/auth/me", () => {
  it("returns the logged-in user for a valid signed session cookie", async () => {
    const token = createCustomerToken(customer);
    const res = await me(requestWith(token));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ user: customer });
  });

  it("returns user:null when no session cookie is present", async () => {
    const res = await me(requestWith());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ user: null });
  });

  it("returns user:null for a malformed cookie and clears it", async () => {
    const res = await me(requestWith("stale-plain-base64-token"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ user: null });
    expect(res.cookies.get("session")?.value).toBe("");
  });
});
