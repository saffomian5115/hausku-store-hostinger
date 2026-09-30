import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = getSessionUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Anmeldung erforderlich" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "Produkt-ID erforderlich" },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produkt nicht gefunden" },
        { status: 404 }
      );
    }

    // Check if already liked
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        customerId_productId: {
          customerId: user.id,
          productId: productId,
        },
      },
    });

    if (existing) {
      // Unlike: remove from wishlist
      await prisma.wishlistItem.delete({
        where: { id: existing.id },
      });

      return NextResponse.json({ liked: false, message: "Aus Merkliste entfernt" });
    } else {
      // Like: add to wishlist
      await prisma.wishlistItem.create({
        data: {
          customerId: user.id,
          productId: productId,
        },
      });

      return NextResponse.json({ liked: true, message: "Zur Merkliste hinzugefügt" });
    }
  } catch (error) {
    console.error("POST /api/wishlist/toggle error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
