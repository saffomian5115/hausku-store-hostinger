import { NextRequest } from "next/server";

export type SessionCustomer = {
  id: number;
  email: string;
  name: string | null;
};

/**
 * Reads the storefront `session` cookie (base64 JSON set by /api/auth/login,
 * /api/auth/register and the Google OAuth callback) and returns the logged-in
 * customer, or null when the session is missing/expired/invalid.
 */
export function getSessionCustomer(request: NextRequest): SessionCustomer | null {
  const sessionCookie = request.cookies.get("session");

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const sessionData = JSON.parse(
      Buffer.from(sessionCookie.value, "base64").toString()
    );

    if (
      typeof sessionData?.id !== "number" ||
      sessionData.expires < Date.now()
    ) {
      return null;
    }

    return {
      id: sessionData.id,
      email: sessionData.email,
      name: sessionData.name ?? null,
    };
  } catch {
    return null;
  }
}
