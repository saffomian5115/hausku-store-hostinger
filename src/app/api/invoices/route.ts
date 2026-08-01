import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "Bestellnummer ist erforderlich" },
        { status: 400 }
      );
    }

    // TODO: Implement invoice PDF generation
    // 1. Fetch order with items
    // 2. Generate PDF using pdf-lib or similar
    // 3. Return PDF file

    return NextResponse.json(
      { error: "Rechnungsgenerierung noch nicht implementiert" },
      { status: 501 }
    );
  } catch (error) {
    console.error("GET /api/invoices error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
