import { NextRequest, NextResponse } from "next/server";
import { createCustomerToken, setSessionCookie } from "@/lib/customerSession";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    // Brute-force protection: max 10 attempts / 15 min per IP
    const limited = rateLimit(request, { limit: 10, windowMs: 15 * 60 * 1000 });
    if (limited) return limited;

    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "E-Mail und Passwort sind erforderlich" },
        { status: 400 }
      );
    }

    // Find customer by email
    const customer = await prisma.customer.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!customer || !customer.password) {
      return NextResponse.json(
        { error: "Ungültige Anmeldedaten" },
        { status: 401 }
      );
    }

    // Compare password
    const isValid = await bcrypt.compare(password, customer.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Ungültige Anmeldedaten" },
        { status: 401 }
      );
    }

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
        message: "Erfolgreich angemeldet",
      },
      { status: 200 }
    );

    setSessionCookie(response, token);

    return response;
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
