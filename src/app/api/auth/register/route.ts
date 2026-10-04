import { NextRequest, NextResponse } from "next/server";
import { createCustomerToken, setSessionCookie } from "@/lib/customerSession";
import { sendWelcomeEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    // Spam protection: max 10 registrations / hour per IP
    const limited = rateLimit(request, { limit: 10, windowMs: 60 * 60 * 1000 });
    if (limited) return limited;

    const body = await request.json();
    const { email, password, name, phone } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "E-Mail und Passwort sind erforderlich" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Ungültige E-Mail-Adresse" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Passwort muss mindestens 8 Zeichen lang sein" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await prisma.customer.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ein Konto mit dieser E-Mail existiert bereits" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || null,
        phone: phone || null,
        isGuest: false,
      },
    });

    // Create session token (HMAC-signed — see src/lib/customerSession.ts)
    const token = createCustomerToken({
      id: customer.id,
      email: customer.email,
      name: customer.name,
    });

    // Set session cookie
    const response = NextResponse.json(
      {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        message: "Konto erfolgreich erstellt",
      },
      { status: 201 }
    );

    setSessionCookie(response, token);

    // Welcome email (Correction #20) — fire-and-forget, never blocks signup
    void sendWelcomeEmail({
      email: customer.email,
      name: customer.name,
    }).catch((err) => console.error("[email] welcome email failed:", err));

    return response;
  } catch (error) {
    console.error("POST /api/auth/register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
