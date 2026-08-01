import { type NextRequest } from "next/server";

type SessionUser = {
  id: number;
  email: string;
  name: string | null;
};

/**
 * Extracts the current user from the session cookie.
 * Returns null if not logged in or session is expired.
 */
export function getSessionUser(request: NextRequest): SessionUser | null {
  const sessionCookie = request.cookies.get("session");

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const sessionData = JSON.parse(
      Buffer.from(sessionCookie.value, "base64").toString()
    );

    // Check if session is expired
    if (sessionData.expires < Date.now()) {
      return null;
    }

    return {
      id: sessionData.id,
      email: sessionData.email,
      name: sessionData.name,
    };
  } catch {
    return null;
  }
}
