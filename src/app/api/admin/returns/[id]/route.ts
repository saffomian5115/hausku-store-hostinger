import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sendReturnStatusEmail } from "@/lib/email";
import { createCreditNoteForOrder } from "@/lib/invoices";
import { RETURN_STATUSES, type ReturnStatus } from "@/lib/returns";

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["APPROVED", "REJECTED"],
  APPROVED: ["REJECTED", "RECEIVED"],
  REJECTED: ["APPROVED"],
  RECEIVED: ["REFUNDED", "REJECTED"],
  REFUNDED: [],
};

// GET /api/admin/returns/[id] — single return request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const returnId = parseInt(id, 10);

    if (isNaN(returnId)) {
      return NextResponse.json(
        { error: "Ungültige ID" },
        { status: 400 }
      );
    }

    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id: returnId },
      include: {
        order: {
          include: { items: true, invoice: true, creditNotes: true },
        },
        customer: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    if (!returnRequest) {
      return NextResponse.json(
        { error: "Retoure nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json({ returnRequest });
  } catch (error) {
    console.error("GET /api/admin/returns/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/returns/[id] — update status + admin note
// body: { status?: string, adminNote?: string }
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const returnId = parseInt(id, 10);

    if (isNaN(returnId)) {
      return NextResponse.json(
        { error: "Ungültige ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, adminNote } = body;

    const existing = await prisma.returnRequest.findUnique({
      where: { id: returnId },
      include: {
        order: {
          select: {
            orderNumber: true,
            guestEmail: true,
            guestName: true,
            status: true,
          },
        },
        customer: { select: { email: true, name: true } },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Retoure nicht gefunden" },
        { status: 404 }
      );
    }

    const data: {
      status?: string;
      adminNote?: string | null;
    } = {};

    if (status !== undefined) {
      if (!(RETURN_STATUSES as readonly string[]).includes(status)) {
        return NextResponse.json(
          { error: "Ungültiger Status" },
          { status: 400 }
        );
      }
      if (status !== existing.status) {
        const allowed = VALID_TRANSITIONS[existing.status] || [];
        if (!allowed.includes(status)) {
          return NextResponse.json(
            {
              error: `Status-Wechsel von "${existing.status}" zu "${status}" ist nicht erlaubt`,
            },
            { status: 400 }
          );
        }
      }
      data.status = status;
    }

    if (adminNote !== undefined) {
      data.adminNote = adminNote || null;
    }

    const returnRequest = await prisma.returnRequest.update({
      where: { id: returnId },
      data,
    });

    // Notify the customer when the status actually changed
    const changed = status !== undefined && status !== existing.status;
    if (changed) {
      const customerEmail =
        existing.customer?.email || existing.order?.guestEmail || "";
      await sendReturnStatusEmail({
        returnNumber: returnRequest.returnNumber,
        orderNumber: existing.order?.orderNumber || "",
        customerEmail,
        customerName: existing.customer?.name || existing.order?.guestName,
        status: status as ReturnStatus,
        adminNote: adminNote !== undefined ? data.adminNote : undefined,
      });

      // Auto-generate a credit note once a return is refunded (best-effort)
      if (status === "REFUNDED") {
        try {
          await createCreditNoteForOrder(
            returnRequest.orderId,
            `Retoure ${returnRequest.returnNumber}`
          );
        } catch (error) {
          console.error(
            "[returns] Auto credit note failed for return",
            returnId,
            error
          );
        }
      }
    }

    return NextResponse.json({ returnRequest });
  } catch (error) {
    console.error("PUT /api/admin/returns/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
