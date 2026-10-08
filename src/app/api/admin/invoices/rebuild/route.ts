import { NextRequest, NextResponse } from "next/server";
import { rebuildStoredPdfs } from "@/lib/invoices";
import { requireAdmin } from "@/lib/adminAuth";

// POST /api/admin/invoices/rebuild
// Re-renders every stored invoice / credit-note PDF with the current layout.
// PDFs are written once when a document is created, so a layout fix would
// otherwise never reach the documents that are already on disk.
export async function POST(request: NextRequest) {
  try {
    const denied = requireAdmin(request);
    if (denied) return denied;

    const result = await rebuildStoredPdfs();
    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/admin/invoices/rebuild error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
