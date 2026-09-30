import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionCustomer } from "@/lib/customerSession";

// Only the logged-in customer may modify their own addresses
function authorize(request: NextRequest, customerId: number): NextResponse | null {
  const session = getSessionCustomer(request);
  if (!session || session.id !== customerId) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  return null;
}

// PUT /api/customers/[id]/addresses/[addressId] — update an address
export async function PUT(
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

    const denied = authorize(request, customerId);
    if (denied) return denied;

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

    const body = await request.json();
    const { label, firstName, lastName, street, street2, city, postalCode, country, isDefault } = body;

    if (!firstName || !lastName || !street || !city || !postalCode) {
      return NextResponse.json(
        { error: "Pflichtfelder fehlen" },
        { status: 400 }
      );
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { customerId, isDefault: true, id: { not: addrId } },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id: addrId },
      data: {
        label: label || address.label,
        firstName,
        lastName,
        street,
        street2: street2 || null,
        city,
        postalCode,
        country: country || address.country,
        isDefault: isDefault !== undefined ? isDefault : address.isDefault,
      },
    });

    return NextResponse.json({ address: updated });
  } catch (error) {
    console.error("PUT /api/customers/[id]/addresses/[addressId] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    const denied = authorize(request, customerId);
    if (denied) return denied;

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
