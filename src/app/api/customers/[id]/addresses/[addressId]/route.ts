import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; addressId: string }> }
) {
  try {
    const { id, addressId } = await params;
    const customerId = parseInt(id);
    const addrId = parseInt(addressId);

    if (isNaN(customerId) || isNaN(addrId)) {
      return NextResponse.json(
        { error: "Ungültige ID" },
        { status: 400 }
      );
    }

    // Verify address belongs to customer
    const address = await prisma.address.findFirst({
      where: { id: addrId, customerId },
    });

    if (!address) {
      return NextResponse.json(
        { error: "Adresse nicht gefunden" },
        { status: 404 }
      );
    }

    await prisma.address.delete({ where: { id: addrId } });

    return NextResponse.json({ message: "Adresse gelöscht" });
  } catch (error) {
    console.error("DELETE /api/customers/[id]/addresses/[addressId] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
