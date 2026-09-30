import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, requireAdmin } from "@/lib/adminAuth";
import {
  begin2faSetup,
  confirm2faSetup,
  disable2fa,
  get2faState,
} from "@/lib/admin2fa";
import { rateLimit } from "@/lib/rateLimit";

/**
 * Admin 2FA enrollment + management (Correction #30).
 *
 * GET        → current state (enabled / pending)
 * POST setup → generate pending secret, return otpauth URL for the app
 * POST confirm → verify a live code, arm 2FA
 * POST disable → verify a live code, remove 2FA
 *
 * Every branch requires a valid admin session (requireAdmin pattern below).
 */

export async function GET(request: NextRequest) {
  try {
    const denied = requireAdmin(request);
    if (denied) return denied;

    const state = await get2faState();
    return NextResponse.json(state);
  } catch (error) {
    console.error("GET /api/admin/auth/2fa error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const denied = requireAdmin(request);
    if (denied) return denied;

    // Enrollment actions are one-shot per admin — blunt brute-force on codes.
    const limited = rateLimit(request, { limit: 10, windowMs: 15 * 60 * 1000 });
    if (limited) return limited;

    const body = await request.json();
    const action = typeof body?.action === "string" ? body.action : "";

    if (action === "setup") {
      const session = getAdminSession(request);
      const result = await begin2faSetup(session!.email);
      return NextResponse.json(result);
    }

    if (action === "confirm") {
      const code =
        typeof body?.code === "string" ? body.code.replace(/\s+/g, "") : "";
      if (!code) {
        return NextResponse.json(
          { error: "6-stelliger Code erforderlich" },
          { status: 400 }
        );
      }
      const result = await confirm2faSetup(code);
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ message: "2FA aktiviert" });
    }

    if (action === "disable") {
      const code =
        typeof body?.code === "string" ? body.code.replace(/\s+/g, "") : "";
      if (!code) {
        return NextResponse.json(
          { error: "6-stelliger Code erforderlich" },
          { status: 400 }
        );
      }
      const result = await disable2fa(code);
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ message: "2FA deaktiviert" });
    }

    return NextResponse.json({ error: "Unbekannte Aktion" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/admin/auth/2fa error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
