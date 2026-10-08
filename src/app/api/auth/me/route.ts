import { NextRequest, NextResponse } from "next/server";
import { getSessionCustomer } from "@/lib/customerSession";

/**
 * GET /api/auth/me
 * Returns the currently logged-in customer from the signed `session` cookie,
 * or `{ user: null }` when there is no valid session.
 *
 * This must verify the signature (tokens are `payload.signature`, see
 * src/lib/customerSession.ts). The old implementation parsed the cookie as
 * plain base64 JSON, which always failed on the signed token — so a successful
 * Google OAuth redirect to /account (or any full page reload) looked logged out.
 */
export async function GET(request: NextRequest) {
  try {
    const customer = getSessionCustomer(request);

    if (!customer) {
      const response = NextResponse.json({ user: null }, { status: 200 });
      // Drop a stale/invalid cookie so the browser stops sending it.
      if (request.cookies.get("session")) {
        response.cookies.set("session", "", { maxAge: 0, path: "/" });
      }
      return response;
    }

    return NextResponse.json({ user: customer });
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
