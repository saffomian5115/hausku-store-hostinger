import { NextRequest, NextResponse } from "next/server";
import { handleStripeSuccess } from "@/lib/payments";
import { prisma } from "@/lib/db";

/**\ * GET /api/payments/stripe/verify?session_id=...
 *
 * Called by the success page after Stripe redirect.
 * If the webhook already processed the order, this is a no-op (idempotent).
 * If the webhook hasn't fired yet, this triggers order confirmation + stock decrement.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "session_id ist erforderlich" },
        { status: 400 }
      );
    }

    // handleStripeSuccess checks payment status, updates order, decrements stock
    // It's idempotent — safe to call even if webhook already processed
    const result = await handleStripeSuccess(sessionId);

    const order = await prisma.order.findUnique({
      where: { id: result.orderId },
      select: { orderNumber: true, total: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Bestellung nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      orderNumber: order.orderNumber,
      total: order.total,
      paymentStatus: result.status,
    });
  } catch (error) {
    console.error("GET /api/payments/stripe/verify error:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
