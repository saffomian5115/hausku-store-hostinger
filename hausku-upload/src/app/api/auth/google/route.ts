import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

/**
 * GET /api/auth/google
 * Starts the Google OAuth 2.0 authorization-code flow.
 * Redirects the user to Google's consent screen.
 */
export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("Google OAuth is not configured (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET missing)");
    return NextResponse.redirect(new URL("/login?error=google_not_configured", request.url));
  }

  // Build the redirect URI from the configured app URL so it matches the
  // registered Google redirect URI even behind a reverse proxy (Hostinger).
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const redirectUri = `${appUrl.replace(/\/$/, "")}/api/auth/google/callback`;

  // CSRF protection: random state, stored in a short-lived cookie.
  const state = randomBytes(32).toString("hex");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
    state,
  });

  const authUrl = `https://accounts.google.com/o/oauth2/auth?${params.toString()}`;

  const response = NextResponse.redirect(authUrl);
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60, // 10 minutes
  });

  return response;
}
