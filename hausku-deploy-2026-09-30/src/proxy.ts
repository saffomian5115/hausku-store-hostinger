import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin pages (except login page)
  if (
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/login")
  ) {
    const session = request.cookies.get("admin-session");

    if (!session?.value) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      const sessionData = JSON.parse(
        Buffer.from(session.value, "base64").toString()
      );

      if (sessionData.expires < Date.now()) {
        const response = NextResponse.redirect(
          new URL("/admin/login", request.url)
        );
        response.cookies.set("admin-session", "", { maxAge: 0, path: "/" });
        return response;
      }
    } catch {
      const response = NextResponse.redirect(
        new URL("/admin/login", request.url)
      );
      response.cookies.set("admin-session", "", { maxAge: 0, path: "/" });
      return response;
    }
  }

  // Protect admin API routes (except login endpoint)
  if (
    pathname.startsWith("/api/admin") &&
    !pathname.startsWith("/api/admin/auth")
  ) {
    const session = request.cookies.get("admin-session");

    if (!session?.value) {
      return NextResponse.json(
        { error: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    try {
      const sessionData = JSON.parse(
        Buffer.from(session.value, "base64").toString()
      );

      if (sessionData.expires < Date.now()) {
        return NextResponse.json(
          { error: "Sitzung abgelaufen" },
          { status: 401 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Ungültige Sitzung" },
        { status: 401 }
      );
    }
  }

  // For storefront: default locale (de) doesn't have /de prefix
  // /en/* pages work directly thanks to next.config i18n
  // No need to add locale prefix for default locale

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
