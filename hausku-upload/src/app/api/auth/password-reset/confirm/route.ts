import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { rateLimit } from "@/lib/rateLimit";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

/**
 * POST /api/auth/password-reset/confirm — set a new password with a reset token.
 * Single-use: the token is cleared after a successful change.
 */
export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, { limit: 10, windowMs: 15 * 60 * 1000 });
    if (limited) return limited;

    const body = await request.json();
    const token = typeof body?.token === "string" ? body.token : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token und neues Passwort sind erforderlich" },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Das Passwort muss mindestens 8 Zeichen lang sein" },
        { status: 400 }
      );
    }

    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    const customer = await prisma.customer.findFirst({
      where: {
        resetToken: hashed,
        resetExpiry: { gt: new Date() },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Der Link ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen an." },
        { status: 400 }
      );
    }

    const newHash = await bcrypt.hash(password, 10);
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        password: newHash,
        resetToken: null,
        resetExpiry: null,
      },
    });

    return NextResponse.json({ message: "Passwort erfolgreich geändert" });
  } catch (error) {
    console.error("POST /api/auth/password-reset/confirm error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
