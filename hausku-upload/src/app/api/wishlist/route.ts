import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = getSessionUser(request);

    if (!user) {
      return NextResponse.json({ wishlist: [], count: 0 });
    }

    const items = await prisma.wishlistItem.findMany({
      where: { customerId: user.id },
      include: {
        product: {
          include: {
            category: true,
            variants: { where: { active: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      wishlist: items.map((item) => item.product),
      count: items.length,
    });
  } catch (error) {
    console.error("GET /api/wishlist error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
