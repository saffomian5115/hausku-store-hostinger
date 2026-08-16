import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  sendOrderStatusEmail,
  getTrackingUrl,
  type OrderStatusEmailData,
} from "@/lib/email";
import { createCreditNoteForOrder } from "@/lib/invoices";

const VALID_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
  "REFUNDED",
];

// GET single order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: "Ungültige Bestell-ID" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        invoice: true,
        creditNotes: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Bestellung nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("GET /api/admin/orders/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: "Ungültige Bestell-ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, trackingNumber, trackingCarrier } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Ungültiger Status" },
        { status: 400 }
      );
    }

    // Check order exists
    const existing = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Bestellung nicht gefunden" },
        { status: 404 }
      );
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["PROCESSING", "CANCELLED"],
      PROCESSING: ["SHIPPED", "CANCELLED"],
      SHIPPED: ["DELIVERED", "RETURNED"],
      DELIVERED: ["RETURNED", "REFUNDED"],
      CANCELLED: [],
      RETURNED: ["REFUNDED"],
      REFUNDED: [],
    };

    // Same-status updates are allowed (e.g. saving tracking info) — only
    // enforce the transition rules when the status actually changes.
    if (status !== existing.status) {
      const allowed = validTransitions[existing.status] || [];
      if (!allowed.includes(status)) {
        return NextResponse.json(
          {
            error: `Status-Wechsel von "${existing.status}" zu "${status}" ist nicht erlaubt`,
          },
          { status: 400 }
        );
      }
    }

    // Update status + tracking info (if provided)
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(trackingNumber !== undefined
          ? { trackingNumber: trackingNumber || null }
          : {}),
        ...(trackingCarrier !== undefined
          ? { trackingCarrier: trackingCarrier || null }
          : {}),
      },
      include: {
        items: true,
      },
    });

    // If cancelled, restore stock (skip if variant was deleted)
    if (status === "CANCELLED" && existing.status !== "CANCELLED") {
      for (const item of order.items) {
        if (item.variantId) {
          try {
            await prisma.productVariant.update({
              where: { id: item.variantId },
              data: { stockQty: { increment: item.qty } },
            });
          } catch {
            // Variant was deleted — skip stock restoration
          }
        }
      }
    }

    // Auto-generate a credit note when an order is refunded (best-effort)
    if (status === "REFUNDED" && existing.status !== "REFUNDED") {
      try {
        await createCreditNoteForOrder(orderId);
      } catch (error) {
        console.error(
          "[invoices] Auto credit note failed for order",
          orderId,
          error
        );
      }
    }

    // Send a status email to the customer for statuses that matter
    // (shipped / delivered / cancelled / refunded) — only on actual changes.
    const NOTIFY_STATUSES = [
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "REFUNDED",
    ] as const;
    if (
      existing.guestEmail &&
      (NOTIFY_STATUSES as readonly string[]).includes(status) &&
      status !== existing.status
    ) {
      await sendOrderStatusEmail({
        orderNumber: order.orderNumber,
        customerEmail: existing.guestEmail,
        customerName: existing.guestName,
        status: status as OrderStatusEmailData["status"],
        trackingNumber: order.trackingNumber,
        trackingUrl: getTrackingUrl(
          order.trackingCarrier,
          order.trackingNumber
        ),
      });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("PUT /api/admin/orders/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
