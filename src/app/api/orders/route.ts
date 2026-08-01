import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

type OrderItemInput = {
  variantId: number;
  productId: number;
  qty: number;
};

type CreateOrderBody = {
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  street: string;
  street2?: string;
  city: string;
  postalCode: string;
  country?: string;
  paymentMethod: string;
  notes?: string;
  items: OrderItemInput[];
};

// Generate order number: hausku-YYYYMMDD-XXXX
function generateOrderNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `hausku-${date}-${random}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          customer: true,
          invoice: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderBody = await request.json();
    const {
      email,
      phone,
      firstName,
      lastName,
      street,
      street2,
      city,
      postalCode,
      country = "DE",
      paymentMethod,
      notes,
      items,
    } = body;

    // ─── Validate required fields ─────────────────────────
    if (!email || !firstName || !lastName || !street || !city || !postalCode) {
      return NextResponse.json(
        { error: "Pflichtfelder fehlen" },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Warenkorb ist leer" },
        { status: 400 }
      );
    }

    const VALID_PAYMENT_METHODS = ["stripe", "paypal", "klarna"];
    if (!paymentMethod || !VALID_PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Ungültige Zahlungsart" },
        { status: 400 }
      );
    }

    // ─── Validate email format ─────────────────────────────
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Ungültige E-Mail-Adresse" },
        { status: 400 }
      );
    }

    // ─── Fetch variants and validate stock ─────────────────
    const variantIds = items.map((item) => item.variantId);
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds }, active: true },
      include: { product: true },
    });

    if (variants.length !== items.length) {
      return NextResponse.json(
        { error: "Einige Produkte sind nicht mehr verfügbar" },
        { status: 400 }
      );
    }

    // Check stock for each item
    for (const item of items) {
      const variant = variants.find((v) => v.id === item.variantId);
      if (!variant) {
        return NextResponse.json(
          { error: `Variante ${item.variantId} nicht gefunden` },
          { status: 400 }
        );
      }
      if (variant.stockQty < item.qty) {
        return NextResponse.json(
          {
            error: `Nur noch ${variant.stockQty} Stück von "${variant.product.name}" verfügbar`,
          },
          { status: 400 }
        );
      }
    }

    // ─── Calculate totals ──────────────────────────────────
    // TODO: Fetch VAT rate and shipping from settings table (Phase 3)
    const VAT_RATE = 19;
    const FREE_SHIPPING_THRESHOLD = 30;
    const SHIPPING_FLAT_RATE = 4.99;

    let subtotal = 0;
    const orderItems = items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId)!;
      const unitPrice = variant.priceOverride ?? variant.product.basePrice;
      const lineTotal = unitPrice * item.qty;
      subtotal += lineTotal;

      const variantLabel = [variant.size, variant.color]
        .filter(Boolean)
        .join(" / ");

      return {
        productId: variant.productId,
        variantId: variant.id,
        productName: variant.product.name,
        variantLabel: variantLabel || null,
        qty: item.qty,
        unitPrice,
      };
    });

    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
    const vatAmount = parseFloat(((subtotal * VAT_RATE) / 100).toFixed(2));
    const total = parseFloat((subtotal + shippingCost + vatAmount).toFixed(2));

    // ─── Create order in transaction ───────────────────────
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          status: "PENDING",
          subtotal,
          shippingCost,
          vatRate: VAT_RATE,
          vatAmount,
          total,
          currency: "EUR",
          guestEmail: email,
          guestName: `${firstName} ${lastName}`,
          guestPhone: phone || null,
          paymentMethod,
          notes: notes || null,
          shippingName: `${firstName} ${lastName}`,
          shippingStreet: street,
          shippingCity: city,
          shippingPostal: postalCode,
          shippingCountry: country,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
        },
      });

      // For Stripe payments, don't decrement stock immediately.
      // Stock will be decremented by the webhook after payment confirmation.
      // For other payment methods, decrement stock immediately.
      if (paymentMethod !== "stripe") {
        for (const item of items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stockQty: {
                decrement: item.qty,
              },
            },
          });
        }
      }

      return newOrder;
    });

    return NextResponse.json(
      {
        orderId: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        message: "Bestellung erfolgreich aufgegeben",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
