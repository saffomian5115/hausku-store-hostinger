import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionCustomer, createCustomerToken, setSessionCookie } from "@/lib/customerSession";
import bcrypt from "bcryptjs";
import { rateLimit } from "@/lib/rateLimit";

// GET /api/customers/[id]/profile — current profile data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customerId = parseInt(id);

    if (isNaN(customerId)) {
      return NextResponse.json({ error: "Ungültige Kunden-ID" }, { status: 400 });
    }

    const session = getSessionCustomer(request);
    if (!session || session.id !== customerId) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true, email: true, name: true, phone: true, createdAt: true, password: true },
    });

    if (!customer) {
      return NextResponse.json({ error: "Konto nicht gefunden" }, { status: 404 });
    }

    // Never expose the hash — only tell the client whether a password exists,
    // so it can show "set password" instead of "change password" for
    // accounts created via Google (which have no password).
    const { password, ...profile } = customer;
    return NextResponse.json({
      customer: { ...profile, hasPassword: Boolean(password) },
    });
  } catch (error) {
    console.error("GET /api/customers/[id]/profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/customers/[id]/profile — update name (and phone)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customerId = parseInt(id);

    if (isNaN(customerId)) {
      return NextResponse.json({ error: "Ungültige Kunden-ID" }, { status: 400 });
    }

    const session = getSessionCustomer(request);
    if (!session || session.id !== customerId) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";

    if (!name || name.length > 100) {
      return NextResponse.json(
        { error: "Bitte geben Sie einen gültigen Namen ein" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.update({
      where: { id: customerId },
      data: { name },
      select: { id: true, email: true, name: true },
    });

    // Refresh the session cookie so the new name propagates everywhere
    const response = NextResponse.json({ customer });
    setSessionCookie(
      response,
      createCustomerToken({
        id: customer.id,
        email: customer.email,
        name: customer.name,
      })
    );
    return response;
  } catch (error) {
    console.error("PUT /api/customers/[id]/profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/customers/[id]/profile — change password (requires current password)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customerId = parseInt(id);

    if (isNaN(customerId)) {
      return NextResponse.json({ error: "Ungültige Kunden-ID" }, { status: 400 });
    }

    const session = getSessionCustomer(request);
    if (!session || session.id !== customerId) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    // Brute-force protection on password change attempts
    const limited = rateLimit(request, { limit: 5, windowMs: 15 * 60 * 1000 });
    if (limited) return limited;

    const body = await request.json();
    const currentPassword =
      typeof body?.currentPassword === "string" ? body.currentPassword : "";
    const newPassword =
      typeof body?.newPassword === "string" ? body.newPassword : "";

    if (!newPassword) {
      return NextResponse.json(
        { error: "Neues Passwort ist erforderlich" },
        { status: 400 }
      );
    }
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Das neue Passwort muss mindestens 8 Zeichen lang sein" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Konto nicht gefunden" },
        { status: 404 }
      );
    }

    // Accounts created via Google OAuth have no password. Since this request
    // is already authenticated by the session cookie, such accounts may set a
    // password directly — there is no existing password to confirm. Accounts
    // that already have a password must confirm it as before.
    const hadPassword = Boolean(customer.password);
    if (customer.password) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Aktuelles Passwort ist erforderlich" },
          { status: 400 }
        );
      }
      const valid = await bcrypt.compare(currentPassword, customer.password);
      if (!valid) {
        return NextResponse.json(
          { error: "Aktuelles Passwort ist nicht korrekt" },
          { status: 401 }
        );
      }
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.customer.update({
      where: { id: customerId },
      data: { password: hashed },
    });

    return NextResponse.json({
      message: hadPassword
        ? "Passwort erfolgreich geändert"
        : "Passwort erfolgreich gesetzt",
      hasPassword: true,
    });
  } catch (error) {
    console.error("POST /api/customers/[id]/profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/customers/[id]/profile — DSGVO account deletion.
// PII (name, email, phone, password, addresses) is overwritten / removed;
// order history is KEPT (German retention duties: tax & accounting law)
// but anonymized so it can no longer be linked to a person.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customerId = parseInt(id);

    if (isNaN(customerId)) {
      return NextResponse.json({ error: "Ungültige Kunden-ID" }, { status: 400 });
    }

    const session = getSessionCustomer(request);
    if (!session || session.id !== customerId) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    // Require the current password to confirm deletion
    const body = await request.json().catch(() => ({}));
    const password = typeof body?.password === "string" ? body.password : "";

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json({ error: "Konto nicht gefunden" }, { status: 404 });
    }

    // Google-only accounts have no password — deletion without password check
    if (customer.password) {
      if (!password) {
        return NextResponse.json(
          { error: "Bitte bestätigen Sie mit Ihrem Passwort" },
          { status: 400 }
        );
      }
      const valid = await bcrypt.compare(password, customer.password);
      if (!valid) {
        return NextResponse.json(
          { error: "Passwort ist nicht korrekt" },
          { status: 401 }
        );
      }
    }

    const anonEmail = `geloescht-${customer.id}@deleted.hausku.invalid`;
    const timestamp = new Date();

    // 1. Delete addresses (pure PII, no legal retention)
    await prisma.address.deleteMany({ where: { customerId } });

    // 2. Delete wishlist (pure PII)
    await prisma.wishlistItem.deleteMany({ where: { customerId } });

    // 3. Anonymize order history (kept for tax/accounting retention duties)
    await prisma.order.updateMany({
      where: { customerId },
      data: {
        guestEmail: anonEmail,
        guestName: "Gelöschtes Konto",
        guestPhone: null,
        shippingName: "Gelöschtes Konto",
        shippingStreet: "[gelöscht]",
        shippingCity: "[gelöscht]",
        shippingPostal: "[gelöscht]",
      },
    });

    // 4. Reviews keep their customer FK (schema requires it) — the account
    //    itself is anonymized below, so attribution is already severed

    // 6. Anonymize the account itself — orders/reviews keep a stable FK target
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        email: anonEmail,
        name: null,
        phone: null,
        password: null,
        isGuest: true,
        updatedAt: timestamp,
      },
    });

    // 7. Clear the session cookie
    const response = NextResponse.json({ message: "Konto gelöscht" });
    response.cookies.set("session", "", { maxAge: 0, path: "/", httpOnly: true });
    return response;
  } catch (error) {
    console.error("DELETE /api/customers/[id]/profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
