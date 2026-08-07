import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/auth/google/callback
 * Handles the Google OAuth redirect back to our app:
 * 1. Verifies the CSRF state cookie
 * 2. Exchanges the authorization code for tokens
 * 3. Fetches the Google user profile
 * 4. Creates the customer if new, or logs in an existing one
 * 5. Sets the same session cookie used by /api/auth/login & /register
 * 6. Redirects to /account
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

function failRedirect(request: NextRequest, code = "google") {
  const response = NextResponse.redirect(new URL(`/login?error=${code}`, request.url));
  response.cookies.set("oauth_state", "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const errorParam = searchParams.get("error");

    // User denied or something failed on Google's side
    if (errorParam) {
      console.error("Google OAuth error:", errorParam);
      return failRedirect(request);
    }

    if (!code || !state) {
      return failRedirect(request);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("Google OAuth is not configured (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET missing)");
      return failRedirect(request, "google_not_configured");
    }

    // Verify CSRF state against the cookie we set in /api/auth/google
    const stateCookie = request.cookies.get("oauth_state")?.value;
    if (!stateCookie || stateCookie !== state) {
      console.error("Google OAuth CSRF check failed: state mismatch");
      return failRedirect(request);
    }

    // Must match the redirect_uri registered in Google Console
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const redirectUri = `${appUrl.replace(/\/$/, "")}/api/auth/google/callback`;

    // 1. Exchange authorization code for tokens
    const tokenRes = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("Google token exchange failed:", tokenRes.status, errText);
      return failRedirect(request);
    }

    const tokenData = (await tokenRes.json()) as { access_token?: string; id_token?: string };

    // 2. Fetch user profile with the access token
    const userRes = await fetch(USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      console.error("Google userinfo request failed:", userRes.status);
      return failRedirect(request);
    }

    const profile = (await userRes.json()) as {
      sub: string;
      email?: string;
      email_verified?: boolean;
      name?: string;
      picture?: string;
    };

    // Only trust Google accounts with a verified email (prevents account takeover)
    if (!profile.email || profile.email_verified !== true) {
      console.error("Google account has no verified email");
      return failRedirect(request);
    }

    const email = profile.email.toLowerCase();

    // 3. Find existing customer or create a new one (atomic upsert on email)
    let customer = await prisma.customer.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: profile.name || email.split("@")[0] || null,
        isGuest: false,
      },
    });

    // Fill in the display name from Google only if we don't have one yet
    if (!customer.name && profile.name) {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: { name: profile.name },
      });
    }

    console.log(`Google OAuth: customer ${email} (id ${customer.id}) logged in`);

    // 4. Create the same session token used by email login/register
    const sessionData = {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      expires: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    };
    const token = Buffer.from(JSON.stringify(sessionData)).toString("base64");

    // 5. Set session cookie + clear the OAuth state cookie, then redirect
    const response = NextResponse.redirect(new URL("/account", request.url));
    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });
    response.cookies.set("oauth_state", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("GET /api/auth/google/callback error:", error);
    return failRedirect(request);
  }
}
