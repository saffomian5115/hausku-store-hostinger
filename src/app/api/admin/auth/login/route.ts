import { NextRequest, NextResponse } from "next/server";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@hausku.de";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "hausku-admin-2024";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-Mail und Passwort sind erforderlich" },
        { status: 400 }
      );
    }

    // Verify credentials
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Ungültige Anmeldedaten" },
        { status: 401 }
      );
    }

    // Create session token
    const sessionData = {
      role: "admin",
      email,
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };
    const token = Buffer.from(JSON.stringify(sessionData)).toString("base64");

    // Set session cookie
    const response = NextResponse.json(
      { message: "Erfolgreich angemeldet" },
      { status: 200 }
    );

    response.cookies.set("admin-session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("POST /api/admin/auth/login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
