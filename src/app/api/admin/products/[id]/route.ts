import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// GET single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Ungültige Produkt-ID" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        variants: { orderBy: { id: "asc" } },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produkt nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("GET /api/admin/products/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update product — updates variants in place to preserve order references
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Ungültige Produkt-ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      basePrice,
      categoryId,
      imageUrl,
      active,
      featured,
      manufacturer,
      safetyWarnings,
      variants,
    } = body;

    // Check product exists
    const existing = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Produkt nicht gefunden" },
        { status: 404 }
      );
    }

    // Generate slug if name changed
    let slug = existing.slug;
    if (name && name !== existing.name) {
      slug = name
        .toLowerCase()
        .replace(/ä/g, "ae")
        .replace(/ö/g, "oe")
        .replace(/ü/g, "ue")
        .replace(/ß/g, "ss")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      // Check slug uniqueness (excluding current product)
      const slugExists = await prisma.product.findFirst({
        where: { slug, id: { not: productId } },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: "Ein Produkt mit diesem Namen existiert bereits" },
          { status: 409 }
        );
      }
    }

    // Update product (without variants)
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name: name || existing.name,
        slug,
        description: description !== undefined ? description : existing.description,
        basePrice: basePrice ? parseFloat(basePrice) : existing.basePrice,
        categoryId: categoryId ? parseInt(categoryId) : existing.categoryId,
        imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
        active: active !== undefined ? active : existing.active,
        featured: featured !== undefined ? featured : existing.featured,
        manufacturer: manufacturer !== undefined ? manufacturer : existing.manufacturer,
        safetyWarnings: safetyWarnings !== undefined ? safetyWarnings : existing.safetyWarnings,
      },
      include: {
        category: true,
        variants: { orderBy: { id: "asc" } },
      },
    });

    // Update variants in place to preserve order references
    if (variants && Array.isArray(variants)) {
      const existingVariantIds = existing.variants.map((v) => v.id);
      const submittedIds = variants
        .filter((v: Record<string, unknown>) => v.id)
        .map((v: Record<string, unknown>) => v.id as number);

      // 1. Update existing variants
      for (const v of variants) {
        if (v.id && existingVariantIds.includes(v.id as number)) {
          // Update existing variant — preserves the ID and all order_item references
          await prisma.productVariant.update({
            where: { id: v.id as number },
            data: {
              sku: v.sku as string,
              size: (v.size as string) || null,
              color: (v.color as string) || null,
              colorHex: (v.colorHex as string) || null,
              stockQty: (v.stockQty as number) || 0,
              priceOverride: v.priceOverride
                ? parseFloat(v.priceOverride as string)
                : null,
              imageUrl: (v.imageUrl as string) || null,
              active: true,
            },
          });
        } else if (!v.id) {
          // 2. Create new variant (no id = new)
          await prisma.productVariant.create({
            data: {
              productId,
              sku: v.sku as string,
              size: (v.size as string) || null,
              color: (v.color as string) || null,
              colorHex: (v.colorHex as string) || null,
              stockQty: (v.stockQty as number) || 0,
              priceOverride: v.priceOverride
                ? parseFloat(v.priceOverride as string)
                : null,
              imageUrl: (v.imageUrl as string) || null,
              active: true,
            },
          });
        }
      }

      // 3. Deactivate variants that were removed (soft delete to preserve order references)
      for (const existingId of existingVariantIds) {
        if (!submittedIds.includes(existingId)) {
          // Check if this variant is referenced by any order items
          const hasOrders = await prisma.orderItem.findFirst({
            where: { variantId: existingId },
          });

          if (hasOrders) {
            // Soft delete — deactivate but keep for order history
            await prisma.productVariant.update({
              where: { id: existingId },
              data: { active: false },
            });
          } else {
            // Hard delete — no order references
            await prisma.productVariant.delete({
              where: { id: existingId },
            });
          }
        }
      }

      // Refetch with updated variants
      const updatedProduct = await prisma.product.findUnique({
        where: { id: productId },
        include: { category: true, variants: { orderBy: { id: "asc" } } },
      });

      return NextResponse.json({ product: updatedProduct });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("PUT /api/admin/products/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Ungültige Produkt-ID" },
        { status: 400 }
      );
    }

    // Check if product has orders
    const orderItems = await prisma.orderItem.count({
      where: { productId },
    });

    if (orderItems > 0) {
      // Soft delete - just deactivate
      await prisma.product.update({
        where: { id: productId },
        data: { active: false },
      });

      return NextResponse.json({
        message: "Produkt deaktiviert (hat bestehende Bestellungen)",
      });
    }

    // Hard delete - no orders exist
    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ message: "Produkt gelöscht" });
  } catch (error) {
    console.error("DELETE /api/admin/products/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
