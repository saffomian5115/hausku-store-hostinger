import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { createCustomerToken } from "@/lib/customerSession";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    customer: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db/prisma";
import { GET, POST } from "@/app/api/customers/[id]/profile/route";

const findUnique = prisma.customer.findUnique as unknown as Mock;
const update = prisma.customer.update as unknown as Mock;

const ID = 5;
const sessionToken = createCustomerToken({
  id: ID,
  email: "demo@hausku.com",
  name: "Demo",
});

let ipCounter = 0;
function makeRequest({
  method,
  body,
  withSession = true,
}: {
  method: "GET" | "POST";
  body?: unknown;
  withSession?: boolean;
} = { method: "GET" }): NextRequest {
  return new NextRequest(`http://localhost/api/customers/${ID}/profile`, {
    method,
    headers: {
      ...(body !== undefined ? { "content-type": "application/json" } : {}),
      // Unique IP per call so the in-memory rate limiter never trips in tests.
      "x-forwarded-for": `10.0.0.${++ipCounter}`,
      ...(withSession ? { cookie: `session=${sessionToken}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

function context() {
  return { params: Promise.resolve({ id: String(ID) }) };
}

const baseCustomer = {
  id: ID,
  email: "demo@hausku.com",
  name: "Demo",
  phone: null,
  createdAt: new Date("2026-01-01"),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/customers/[id]/profile", () => {
  it("reports hasPassword:false for a Google account and never leaks the hash", async () => {
    findUnique.mockResolvedValue({ ...baseCustomer, password: null });
    const res = await GET(makeRequest(), context());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.customer.hasPassword).toBe(false);
    expect("password" in data.customer).toBe(false);
  });

  it("reports hasPassword:true for an email account", async () => {
    findUnique.mockResolvedValue({ ...baseCustomer, password: "$2a$10$hash" });
    const res = await GET(makeRequest(), context());
    const data = await res.json();
    expect(data.customer.hasPassword).toBe(true);
    expect("password" in data.customer).toBe(false);
  });

  it("rejects requests without a matching session", async () => {
    const res = await GET(makeRequest({ method: "GET", withSession: false }), context());
    expect(res.status).toBe(401);
  });
});

describe("POST /api/customers/[id]/profile — password", () => {
  it("sets a password without a current password for Google accounts", async () => {
    findUnique.mockResolvedValue({ id: ID, password: null });
    update.mockResolvedValue({ id: ID });

    const res = await POST(
      makeRequest({ method: "POST", body: { newPassword: "newpass123" } }),
      context()
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.hasPassword).toBe(true);
    expect(data.message).toContain("gesetzt");

    const stored = update.mock.calls[0][0].data.password as string;
    expect(await bcrypt.compare("newpass123", stored)).toBe(true);
  });

  it("requires the current password when the account already has one", async () => {
    findUnique.mockResolvedValue({ id: ID, password: await bcrypt.hash("oldpass123", 10) });
    const res = await POST(
      makeRequest({ method: "POST", body: { newPassword: "newpass123" } }),
      context()
    );
    expect(res.status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });

  it("rejects a wrong current password", async () => {
    findUnique.mockResolvedValue({ id: ID, password: await bcrypt.hash("oldpass123", 10) });
    const res = await POST(
      makeRequest({
        method: "POST",
        body: { currentPassword: "wrongpass", newPassword: "newpass123" },
      }),
      context()
    );
    expect(res.status).toBe(401);
    expect(update).not.toHaveBeenCalled();
  });

  it("changes the password when the current password is correct", async () => {
    findUnique.mockResolvedValue({ id: ID, password: await bcrypt.hash("oldpass123", 10) });
    update.mockResolvedValue({ id: ID });
    const res = await POST(
      makeRequest({
        method: "POST",
        body: { currentPassword: "oldpass123", newPassword: "newpass123" },
      }),
      context()
    );
    expect(res.status).toBe(200);
    expect((await res.json()).message).toContain("geändert");
  });

  it("rejects a too-short new password", async () => {
    findUnique.mockResolvedValue({ id: ID, password: null });
    const res = await POST(
      makeRequest({ method: "POST", body: { newPassword: "short" } }),
      context()
    );
    expect(res.status).toBe(400);
  });
});
