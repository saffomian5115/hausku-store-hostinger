import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "node:crypto";

/**
 * POST /api/auth/password-reset — request a reset link.
 *
 * Always responds with the same generic message so attackers cannot probe
 * which emails are registered (no user enumeration). Emails are skipped
 * silently in dev without SMTP — the response stays identical.
 */
export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, { limit: 5, windowMs: 15 * 60 * 1000 });
    if (limited) return limited;

    const body = await request.json();
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    const GENERIC = {
      message:
        "Wenn ein Konto mit dieser E-Mail existiert, haben wir soeben einen Reset-Link gesendet.",
    };

    if (!email) {
      return NextResponse.json(GENERIC);
    }

    const customer = await prisma.customer.findUnique({ where: { email } });

    if (customer && customer.password) {
      // Store only a hash of the token — a DB leak must not expose valid links
      const rawToken = crypto.randomBytes(32).toString("base64url");
      const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");

      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          resetToken: hashed,
          resetExpiry: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const locale = request.cookies.get("hausku_locale")?.value;

      const sent = await sendPasswordResetEmail({
        email: customer.email,
        name: customer.name,
        resetUrl: `${appUrl}/reset-password?token=${rawToken}`,
        locale,
      });

      if (!sent) {
        console.warn(
          `[password-reset] SMTP not configured — token for ${email}: ${rawToken}`
        );
      }
    }

    // Identical response either way
    return NextResponse.json(GENERIC);
  } catch (error) {
    console.error("POST /api/auth/password-reset error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
