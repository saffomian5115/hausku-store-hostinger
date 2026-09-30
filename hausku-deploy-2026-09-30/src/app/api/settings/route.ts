import { NextResponse } from "next/server";
import { getStoreSettings } from "@/lib/settings";

// GET /api/settings — public, only exposes what the storefront needs
export async function GET() {
  try {
    const settings = await getStoreSettings();
    return NextResponse.json({
      vatRate: settings.vatRate,
      freeShippingThreshold: settings.freeShippingThreshold,
      shippingFlatRate: settings.shippingFlatRate,
    });
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
