import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("admin-session");

    if (!sessionCookie?.value) {
      return NextResponse.json({ authenticated: false });
    }

    try {
      const sessionData = JSON.parse(
        Buffer.from(sessionCookie.value, "base64").toString()
      );

      if (sessionData.expires < Date.now()) {
        return NextResponse.json({ authenticated: false });
      }

      return NextResponse.json({
        authenticated: true,
        email: sessionData.email,
      });
    } catch {
      return NextResponse.json({ authenticated: false });
    }
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
