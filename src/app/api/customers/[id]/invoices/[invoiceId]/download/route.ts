import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import { prisma } from "@/lib/db/prisma";
import { getSessionCustomer } from "@/lib/customerSession";
import { ensureInvoicePdf } from "@/lib/invoices";

// GET /api/customers/[id]/invoices/[invoiceId]/download
// Downloads an invoice PDF, but only if the invoice belongs to an order of
// the logged-in customer (session ownership check).
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; invoiceId: string }> }
) {
  try {
    const { id, invoiceId } = await params;
    const customerId = parseInt(id, 10);
    const invoicePk = parseInt(invoiceId, 10);

    if (isNaN(customerId) || isNaN(invoicePk)) {
      return NextResponse.json(
        { error: "Ungültige ID" },
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

    // Invoice must belong to an order of this customer
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoicePk,
        order: { customerId },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Rechnung nicht gefunden" },
        { status: 404 }
      );
    }

    // Re-renders the document when its file was written by an older layout
    // version (or is missing), so customers always get the current layout.
    const filePath = await ensureInvoicePdf(invoice.id);
    if (!filePath) {
      return NextResponse.json(
        { error: "PDF-Datei nicht gefunden" },
        { status: 404 }
      );
    }

    const bytes = fs.readFileSync(filePath);
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("GET /api/customers/[id]/invoices/[invoiceId]/download error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
