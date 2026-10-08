import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { ensureInvoicePdf } from "@/lib/invoices";

// GET /api/admin/invoices/[id]/download — download the invoice PDF
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const denied = requireAdmin(request);
    if (denied) return denied;

    const { id } = await params;
    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Rechnung nicht gefunden" },
        { status: 404 }
      );
    }

    // Re-renders the document when its file was written by an older layout
    // version (or is missing), so a layout fix reaches stored invoices too.
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
    console.error("GET /api/admin/invoices/[id]/download error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
