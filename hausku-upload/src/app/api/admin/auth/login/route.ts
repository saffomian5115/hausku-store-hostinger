import { NextRequest, NextResponse } from "next/server";
import { createAdminToken, setAdminCookie } from "@/lib/adminAuth";
import { rateLimit } from "@/lib/rateLimit";

// Server-side only — never exposed to the client bundle.
// TODO(client): rotate these via env before production (see docs/HANDOVER.md).
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@hausku.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "hausku-admin-2024";

export async function POST(request: NextRequest) {
  try {
    // Brute-force protection: max 5 attempts / 15 min per IP
    const limited = rateLimit(request, { limit: 5, windowMs: 15 * 60 * 1000 });
    if (limited) return limited;

    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-Mail und Passwort sind erforderlich" },
        { status: 400 }
      );
    }

    // Verify credentials — generic error so attackers learn nothing
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Ungültige Anmeldedaten" },
        { status: 401 }
      );
    }

    // Create HMAC-signed session token (see src/lib/adminAuth.ts)
    const token = createAdminToken(email);

    const response = NextResponse.json(
      { message: "Erfolgreich angemeldet" },
      { status: 200 }
    );
    setAdminCookie(response, token);

    return response;
  } catch (error) {
    console.error("POST /api/admin/auth/login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
