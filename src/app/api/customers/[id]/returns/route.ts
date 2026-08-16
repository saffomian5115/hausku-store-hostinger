import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionCustomer } from "@/lib/customerSession";
import {
  createReturnRequest,
  ReturnEligibilityError,
} from "@/lib/returns";
import { sendReturnStatusEmail } from "@/lib/email";

// GET /api/customers/[id]/returns — list the customer's return requests
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customerId = parseInt(id, 10);

    if (isNaN(customerId)) {
      return NextResponse.json(
        { error: "Ungültige Kunden-ID" },
        { status: 400 }
      );
    }

    const session = getSessionCustomer(request);
    if (!session || session.id !== customerId) {
      return NextResponse.json(
        { error: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    const returns = await prisma.returnRequest.findMany({
      where: { customerId },
      include: {
        order: { select: { orderNumber: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ returns });
  } catch (error) {
    console.error("GET /api/customers/[id]/returns error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/customers/[id]/returns — create a return request
// body: { orderId: number, reason?: string, items: [{ productName, variantLabel?, qty }] }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customerId = parseInt(id, 10);

    if (isNaN(customerId)) {
      return NextResponse.json(
        { error: "Ungültige Kunden-ID" },
        { status: 400 }
      );
    }

    const session = getSessionCustomer(request);
    if (!session || session.id !== customerId) {
      return NextResponse.json(
        { error: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const orderId = parseInt(body?.orderId, 10);
    const reason = typeof body?.reason === "string" ? body.reason : "";
    const items = Array.isArray(body?.items) ? body.items : [];

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: "Ungültige Bestell-ID" },
        { status: 400 }
      );
    }

    if (items.length === 0) {
      return NextResponse.json(
        { error: "Bitte wählen Sie mindestens einen Artikel aus." },
        { status: 400 }
      );
    }

    const sanitizedItems = items
      .slice(0, 50)
      .map((it: unknown) => {
        const item = it as { productName?: unknown; variantLabel?: unknown; qty?: unknown };
        return {
          productName: String(item?.productName || "Artikel"),
          variantLabel:
            typeof item?.variantLabel === "string" ? item.variantLabel : null,
          qty: Math.max(1, Math.min(99, parseInt(String(item?.qty ?? 1), 10) || 1)),
        };
      });

    const returnRequest = await createReturnRequest({
      orderId,
      customerId,
      reason,
      items: sanitizedItems,
    });

    // Confirmation email to the customer (best-effort)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { orderNumber: true, guestEmail: true, guestName: true },
    });
    await sendReturnStatusEmail({
      returnNumber: returnRequest.returnNumber,
      orderNumber: order?.orderNumber || String(orderId),
      customerEmail: session.email,
      customerName: session.name,
      status: "PENDING",
    });

    return NextResponse.json({ returnRequest }, { status: 201 });
  } catch (error) {
    console.error("POST /api/customers/[id]/returns error:", error);
    if (error instanceof ReturnEligibilityError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
