import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionCustomer } from "@/lib/customerSession";

// POST /api/reviews — submit a review for a product (logged-in customers only)
export async function POST(request: NextRequest) {
  try {
    const customer = getSessionCustomer(request);
    if (!customer) {
      return NextResponse.json(
        { error: "Bitte melde dich an, um eine Bewertung zu schreiben" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, rating, title, body: reviewText } = body;

    const productPk = parseInt(productId, 10);
    if (isNaN(productPk)) {
      return NextResponse.json({ error: "Ungültiges Produkt" }, { status: 400 });
    }

    const parsedRating = parseInt(rating, 10);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json(
        { error: "Bewertung muss zwischen 1 und 5 Sternen liegen" },
        { status: 400 }
      );
    }

    if (!reviewText || String(reviewText).trim().length < 3) {
      return NextResponse.json(
        { error: "Bitte schreibe einen kurzen Bewertungstext" },
        { status: 400 }
      );
    }
    if (title && String(title).trim().length > 120) {
      return NextResponse.json(
        { error: "Titel ist zu lang (max. 120 Zeichen)" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productPk, active: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Produkt nicht gefunden" }, { status: 404 });
    }

    // One review per customer per product
    const existing = await prisma.review.findFirst({
      where: { customerId: customer.id, productId: productPk },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Du hast dieses Produkt bereits bewertet" },
        { status: 409 }
      );
    }

    const review = await prisma.review.create({
      data: {
        productId: productPk,
        customerId: customer.id,
        rating: parsedRating,
        title: title ? String(title).trim() : null,
        body: String(reviewText).trim(),
        approved: false, // moderated before going live
      },
    });

    return NextResponse.json(
      {
        review,
        message: "Danke! Deine Bewertung wird nach Freigabe veröffentlicht.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
