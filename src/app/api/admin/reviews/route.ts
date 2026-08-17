import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

function isAdmin(request: NextRequest): boolean {
  const session = request.cookies.get("admin-session");
  if (!session?.value) return false;
  try {
    const sessionData = JSON.parse(
      Buffer.from(session.value, "base64").toString()
    );
    return sessionData.expires > Date.now();
  } catch {
    return false;
  }
}

function unauthorized() {
  return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
}

// GET /api/admin/reviews — list all reviews (pending first)
export async function GET(request: NextRequest) {
  try {
    if (!isAdmin(request)) return unauthorized();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // pending | approved | rejected

    const where: Record<string, unknown> = {};
    if (status === "pending") where.approved = false;
    if (status === "approved") where.approved = true;
    if (status === "rejected") where.rejected = true;

    const reviews = await prisma.review.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, slug: true, imageUrl: true } },
        customer: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("GET /api/admin/reviews error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/admin/reviews — { id, action: "approve" | "reject" | "reset" }
export async function PATCH(request: NextRequest) {
  try {
    if (!isAdmin(request)) return unauthorized();

    const body = await request.json();
    const id = parseInt(body?.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Ungültige ID" }, { status: 400 });
    }

    const action = body?.action;
    let data: { approved?: boolean; rejected?: boolean } = {};
    if (action === "approve") data = { approved: true, rejected: false };
    else if (action === "reject") data = { approved: false, rejected: true };
    else if (action === "reset") data = { approved: false, rejected: false };
    else {
      return NextResponse.json(
        { error: "Ungültige Aktion" },
        { status: 400 }
      );
    }

    const review = await prisma.review.update({ where: { id }, data });
    return NextResponse.json({ review });
  } catch (error) {
    console.error("PATCH /api/admin/reviews error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/reviews?id=...
export async function DELETE(request: NextRequest) {
  try {
    if (!isAdmin(request)) return unauthorized();

    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "", 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Ungültige ID" }, { status: 400 });
    }

    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/reviews error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
