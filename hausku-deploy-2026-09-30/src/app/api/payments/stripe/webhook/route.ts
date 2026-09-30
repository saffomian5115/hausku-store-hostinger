import { NextRequest, NextResponse } from "next/server";
import { handleWebhook } from "@/lib/payments";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    const result = await handleWebhook("stripe", body, {
      "stripe-signature": signature,
    });

    console.log(
      `Stripe webhook processed: orderId=${result.orderId}, status=${result.status}`
    );

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// App Router: request.text() already returns raw body — no deprecated config needed
export const runtime = "nodejs";
