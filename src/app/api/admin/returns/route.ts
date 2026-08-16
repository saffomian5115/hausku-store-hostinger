import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// GET /api/admin/returns — list all return requests (optional ?status= filter)
export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get("status");

    const returns = await prisma.returnRequest.findMany({
      where: status ? { status } : {},
      include: {
        order: {
          select: { orderNumber: true, total: true, createdAt: true },
        },
        customer: {
          select: { id: true, email: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ returns });
  } catch (error) {
    console.error("GET /api/admin/returns error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
