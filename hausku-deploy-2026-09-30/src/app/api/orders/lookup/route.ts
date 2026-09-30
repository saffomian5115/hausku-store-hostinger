import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// POST /api/orders/lookup — guest order tracking
// body: { orderNumber, email }
// Returns a safe subset of order data (no PII beyond what the caller supplied).
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderNumber, email } = body || {};

    if (!orderNumber || !email) {
      return NextResponse.json(
        { error: "Bestellnummer und E-Mail sind erforderlich" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber: String(orderNumber).trim() },
      include: { items: true, customer: { select: { email: true } } },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Keine Bestellung mit dieser Bestellnummer gefunden" },
        { status: 404 }
      );
    }

    // Only reveal details when the email matches the guest email (or the
    // customer account email) used for the order.
    const normalized = String(email).trim().toLowerCase();
    const emailMatch =
      order.guestEmail?.toLowerCase() === normalized ||
      order.customer?.email?.toLowerCase() === normalized;
    if (!emailMatch) {
      return NextResponse.json(
        { error: "E-Mail passt nicht zu dieser Bestellung" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        currency: order.currency,
        createdAt: order.createdAt,
        paidAt: order.paidAt,
        paymentMethod: order.paymentMethod,
        trackingNumber: order.trackingNumber,
        trackingCarrier: order.trackingCarrier,
        shippingName: order.shippingName,
        items: order.items.map((item) => ({
          productName: item.productName,
          variantLabel: item.variantLabel,
          qty: item.qty,
          unitPrice: item.unitPrice,
        })),
      },
    });
  } catch (error) {
    console.error("POST /api/orders/lookup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
