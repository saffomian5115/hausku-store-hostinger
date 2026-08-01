import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// GET all products (admin view - includes inactive)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("q");

    const where: Record<string, unknown> = {};
    if (category) {
      where.category = { slug: category };
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("GET /api/admin/products error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      basePrice,
      categoryId,
      imageUrl,
      active = true,
      featured = false,
      manufacturer,
      safetyWarnings,
      variants = [],
    } = body;

    // Validate required fields
    if (!name || !basePrice || !categoryId) {
      return NextResponse.json(
        { error: "Name, Preis und Kategorie sind erforderlich" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Check slug uniqueness
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "Ein Produkt mit diesem Namen existiert bereits" },
        { status: 409 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || null,
        basePrice: parseFloat(basePrice),
        categoryId: parseInt(categoryId),
        imageUrl: imageUrl || null,
        active,
        featured,
        manufacturer: manufacturer || null,
        safetyWarnings: safetyWarnings || null,
        variants: {
          create: variants.map((v: Record<string, unknown>) => ({
            sku: v.sku as string,
            size: (v.size as string) || null,
            color: (v.color as string) || null,
            colorHex: (v.colorHex as string) || null,
            stockQty: (v.stockQty as number) || 0,
            priceOverride: v.priceOverride ? parseFloat(v.priceOverride as string) : null,
            imageUrl: (v.imageUrl as string) || null,
            active: true,
          })),
        },
      },
      include: {
        category: true,
        variants: true,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/products error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
