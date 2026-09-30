import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/db/prisma";
import { getSessionCustomer } from "@/lib/customerSession";

// GET /api/customers/[id]/credit-notes/[creditNoteId]/download
// Downloads a credit note PDF, but only if it belongs to an order of the
// logged-in customer (session ownership check).
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; creditNoteId: string }> }
) {
  try {
    const { id, creditNoteId } = await params;
    const customerId = parseInt(id, 10);
    const creditNotePk = parseInt(creditNoteId, 10);

    if (isNaN(customerId) || isNaN(creditNotePk)) {
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

    // Credit note must belong to an order of this customer
    const creditNote = await prisma.creditNote.findFirst({
      where: {
        id: creditNotePk,
        order: { customerId },
      },
    });

    if (!creditNote?.pdfPath) {
      return NextResponse.json(
        { error: "Gutschrift nicht gefunden" },
        { status: 404 }
      );
    }

    const filePath = path.join(process.cwd(), "public", creditNote.pdfPath);
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
        "Content-Disposition": `attachment; filename="${creditNote.creditNoteNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/customers/[id]/credit-notes/[creditNoteId]/download error:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
