import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionCustomer } from "@/lib/customerSession";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customerId = parseInt(id);

    if (isNaN(customerId)) {
      return NextResponse.json(
        { error: "Ungültige Kunden-ID" },
        { status: 400 }
      );
    }

    // Only the logged-in customer may read their own orders
    const session = getSessionCustomer(request);
    if (!session || session.id !== customerId) {
      return NextResponse.json(
        { error: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: { customerId },
      include: {
        items: {
          select: {
            productName: true,
            variantLabel: true,
            qty: true,
            unitPrice: true,
          },
        },
        invoice: {
          select: { id: true, invoiceNumber: true, pdfPath: true, issuedAt: true },
        },
        creditNotes: {
          select: {
            id: true,
            creditNoteNumber: true,
            pdfPath: true,
            amount: true,
            issuedAt: true,
          },
        },
        returnRequests: {
          select: {
            id: true,
            returnNumber: true,
            status: true,
            reason: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("GET /api/customers/[id]/orders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
