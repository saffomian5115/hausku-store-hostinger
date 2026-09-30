import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Erfolgreich abgemeldet" });
  response.cookies.set("session", "", {
    maxAge: 0,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  return response;
}
