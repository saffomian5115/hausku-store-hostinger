import { NextRequest, NextResponse } from "next/server";
import { getStoreSettings, saveStoreSettings } from "@/lib/settings";
import { requireAdmin } from "@/lib/adminAuth";

// GET /api/admin/settings — return all store settings
export async function GET(request: NextRequest) {
  try {
    const denied = requireAdmin(request);
    if (denied) return denied;

    const settings = await getStoreSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("GET /api/admin/settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings — save (partial) settings
export async function PUT(request: NextRequest) {
  try {
    const denied = requireAdmin(request);
    if (denied) return denied;

    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Ungültige Anfrage" },
        { status: 400 }
      );
    }

    const settings = await saveStoreSettings(body);
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("PUT /api/admin/settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
