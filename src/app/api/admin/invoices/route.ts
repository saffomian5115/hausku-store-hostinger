import { NextRequest, NextResponse } from "next/server";
import {
  createInvoiceForOrder,
  createCreditNoteForOrder,
  OrderNotFoundError,
} from "@/lib/invoices";

// POST /api/admin/invoices — generate an invoice or credit note for an order
// body: { orderId: number, type?: "invoice" | "credit_note", reason?: string }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orderId = parseInt(body?.orderId, 10);
    const type = body?.type === "credit_note" ? "credit_note" : "invoice";
    const reason = typeof body?.reason === "string" ? body.reason : "";

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: "Ungültige Bestell-ID" },
        { status: 400 }
      );
    }

    if (type === "credit_note") {
      const creditNote = await createCreditNoteForOrder(
        orderId,
        reason || "Erstattung"
      );
      return NextResponse.json({ creditNote }, { status: 201 });
    }

    const invoice = await createInvoiceForOrder(orderId);
    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/invoices error:", error);
    if (error instanceof OrderNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
