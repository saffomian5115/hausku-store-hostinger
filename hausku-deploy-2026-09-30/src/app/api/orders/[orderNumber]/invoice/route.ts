import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/db/prisma";
import { createInvoiceForOrder } from "@/lib/invoices";
import { getSessionCustomer } from "@/lib/customerSession";

// GET /api/orders/[orderNumber]/invoice?email=...
// Downloads the invoice PDF for an order. Access is granted when the caller
// is either the logged-in customer who owns the order, or the guest who
// placed it (matching orderNumber + guestEmail).
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const email = new URL(request.url).searchParams.get("email") || "";

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { invoice: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Bestellung nicht gefunden" },
        { status: 404 }
      );
    }

    // Authorize: logged-in customer owns the order, or guest email matches
    const session = getSessionCustomer(request);
    const isOwner = session !== null && order.customerId === session.id;
    const isGuest =
      email.trim().length > 0 &&
      order.guestEmail?.toLowerCase() === email.trim().toLowerCase();
    if (!isOwner && !isGuest) {
      return NextResponse.json(
        { error: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    // Invoice is created automatically after a successful payment; generate
    // it on demand if missing (only for paid orders).
    let invoice = order.invoice;
    if (!invoice && order.paidAt) {
      invoice = await createInvoiceForOrder(order.id);
    }

    if (!invoice?.pdfPath) {
      return NextResponse.json(
        {
          error: "Rechnung ist noch nicht verfügbar (Bestellung noch nicht bezahlt)",
        },
        { status: 404 }
      );
    }

    const filePath = path.join(process.cwd(), "public", invoice.pdfPath);
    if (!fs.existsSync(filePath)) {
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
    console.error("GET /api/orders/[orderNumber]/invoice error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
