import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q");

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        _count: {
          select: { orders: true },
        },
        orders: {
          select: { total: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate total revenue per customer
    const customersWithStats = customers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      isGuest: c.isGuest,
      createdAt: c.createdAt,
      orderCount: c._count.orders,
      totalRevenue: c.orders.reduce((sum, o) => sum + o.total, 0),
    }));

    return NextResponse.json({ customers: customersWithStats });
  } catch (error) {
    console.error("GET /api/admin/customers error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
