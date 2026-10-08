import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { ensureCreditNotePdf } from "@/lib/invoices";

// GET /api/admin/credit-notes/[id]/download — download the credit note PDF
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const denied = requireAdmin(request);
    if (denied) return denied;

    const { id } = await params;
    const creditNote = await prisma.creditNote.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!creditNote) {
      return NextResponse.json(
        { error: "Gutschrift nicht gefunden" },
        { status: 404 }
      );
    }

    // Re-renders the document when its file was written by an older layout
    // version (or is missing).
    const filePath = await ensureCreditNotePdf(creditNote.id);
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
        "Content-Disposition": `attachment; filename="${creditNote.creditNoteNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/admin/credit-notes/[id]/download error:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
