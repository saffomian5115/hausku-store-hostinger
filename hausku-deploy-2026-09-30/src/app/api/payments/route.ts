import { NextRequest, NextResponse } from "next/server";
import { createPayment } from "@/lib/payments";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, orderId } = body;

    if (!provider || !orderId) {
      return NextResponse.json(
        { error: "provider und orderId sind erforderlich" },
        { status: 400 }
      );
    }

    if (provider !== "stripe") {
      return NextResponse.json(
        { error: `Zahlungsanbieter ${provider} noch nicht implementiert` },
        { status: 501 }
      );
    }

    const result = await createPayment(provider, orderId);

    return NextResponse.json({
      url: result.redirectUrl,
      sessionId: result.paymentId,
    });
  } catch (error) {
    console.error("POST /api/payments error:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
