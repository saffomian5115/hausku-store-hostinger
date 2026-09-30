import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session");

    if (!sessionCookie?.value) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    try {
      const sessionData = JSON.parse(
        Buffer.from(sessionCookie.value, "base64").toString()
      );

      // Check if session is expired
      if (sessionData.expires < Date.now()) {
        const response = NextResponse.json({ user: null }, { status: 200 });
        response.cookies.set("session", "", { maxAge: 0, path: "/" });
        return response;
      }

      return NextResponse.json({
        user: {
          id: sessionData.id,
          email: sessionData.email,
          name: sessionData.name,
        },
      });
    } catch {
      return NextResponse.json({ user: null }, { status: 200 });
    }
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
