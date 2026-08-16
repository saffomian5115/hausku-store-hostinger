/**
 * Payment gateway integration helpers.
 *
 * This module provides a unified interface for:
 * - Stripe checkout session creation
 * - PayPal payment creation (TODO)
 * - Klarna order creation (TODO)
 * - Webhook verification for each provider
 *
 * All payment gateway keys MUST be read from environment variables.
 * Never commit keys to source code.
 */

import { createStripeCheckoutSession, getStripeSession } from "./stripe";
import { prisma } from "@/lib/db";
import {
  sendOrderConfirmationEmail,
  sendNewOrderAdminAlert,
} from "@/lib/email";
import { createInvoiceForOrder } from "@/lib/invoices";

export type PaymentProvider = "stripe" | "paypal" | "klarna";

export interface PaymentResult {
  provider: PaymentProvider;
  paymentId: string;
  status: "pending" | "completed" | "failed";
  redirectUrl?: string;
}

/**
 * Create a checkout session for the given order.
 * Returns a PaymentResult with redirect URL for the customer.
 */
export async function createPayment(
  provider: PaymentProvider,
  orderId: number
): Promise<PaymentResult> {
  if (provider !== "stripe") {
    throw new Error(`Payment provider ${provider} not yet implemented`);
  }

  // Fetch the order with items and product details
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          productVariant: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new Error(`Order ${orderId} not found`);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Build line items for Stripe
  const items = order.items.map((item) => ({
    name: item.productVariant?.product.name || item.productName,
    description: [
      item.productVariant?.size,
      item.productVariant?.color,
      item.productVariant?.sku ? `SKU: ${item.productVariant.sku}` : "",
    ]
      .filter(Boolean)
      .join(" — "),
    unitPrice: Number(item.unitPrice),
    qty: item.qty,
  }));

  const { sessionId, url } = await createStripeCheckoutSession({
    orderId: order.id,
    orderNumber: order.orderNumber,
    items,
    customerEmail: order.guestEmail || "",
    shippingCost: Number(order.shippingCost),
    vatRate: Number(order.vatRate),
    successUrl: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${appUrl}/checkout?cancelled=true`,
  });

  // Update order with payment session ID
  await prisma.order.update({
    where: { id: orderId },
    data: { paymentId: sessionId },
  });

  return {
    provider: "stripe",
    paymentId: sessionId,
    status: "pending",
    redirectUrl: url,
  };
}

/**
 * Shared post-payment processing: decrement stock + send the order
 * confirmation email. Only called once per order (guarded by the caller's
 * atomic PENDING → CONFIRMED claim).
 */
async function processPaidOrder(orderId: number): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) return;

  // Decrement stock for each item
  for (const item of order.items) {
    if (item.variantId) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stockQty: { decrement: item.qty } },
      });
    }
  }

  // Send order confirmation email (skip silently if SMTP not configured)
  await sendOrderConfirmationEmail({
    orderNumber: order.orderNumber,
    customerEmail: order.guestEmail || "",
    customerName: order.guestName,
    items: order.items.map((item) => ({
      productName: item.productName,
      variantLabel: item.variantLabel,
      qty: item.qty,
      unitPrice: Number(item.unitPrice),
    })),
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    vatAmount: Number(order.vatAmount),
    vatRate: Number(order.vatRate),
    total: Number(order.total),
    shippingName: order.shippingName,
    shippingStreet: order.shippingStreet,
    shippingCity: order.shippingCity,
    shippingPostal: order.shippingPostal,
    shippingCountry: order.shippingCountry,
  });

  // Notify the store owner about the new paid order (internal only)
  await sendNewOrderAdminAlert({
    orderNumber: order.orderNumber,
    total: Number(order.total),
    customerName: order.guestName,
    customerEmail: order.guestEmail || "",
    itemCount: order.items.reduce((sum, item) => sum + item.qty, 0),
  });

  // Generate the invoice PDF (best-effort — never block the payment flow)
  try {
    await createInvoiceForOrder(orderId);
  } catch (error) {
    console.error("[invoices] Auto-invoice failed for order", orderId, error);
  }
}

/**
 * Handle Stripe checkout completion after redirect.
 * Idempotent — safe to call even if webhook already processed the order.
 */
export async function handleStripeSuccess(sessionId: string) {
  const session = await getStripeSession(sessionId);

  if (!session.metadata?.orderId) {
    throw new Error("Session missing order metadata");
  }

  const orderId = parseInt(session.metadata.orderId, 10);

  if (session.payment_status === "paid") {
    // Atomically claim the PENDING → CONFIRMED transition so concurrent calls
    // (webhook + success-page verify) never double-process the order.
    // Only PENDING orders are claimed — an order the admin already moved
    // forward (e.g. PROCESSING) is left untouched.
    const claimed = await prisma.order.updateMany({
      where: { id: orderId, status: "PENDING" },
      data: {
        status: "CONFIRMED",
        paymentId: (session.payment_intent as string) || sessionId,
      },
    });

    if (claimed.count > 0) {
      await processPaidOrder(orderId);
    }
  }

  return { orderId, status: session.payment_status || "unknown" };
}

/**
 * Verify and process a webhook from a payment provider.
 * Must be idempotent — avoid duplicate order confirmations.
 */
export async function handleWebhook(
  provider: PaymentProvider,
  body: unknown,
  headers: Record<string, string>
): Promise<{ orderId: number; status: "completed" | "failed" }> {
  if (provider !== "stripe") {
    throw new Error(`Webhook handler for ${provider} not yet implemented`);
  }

  const { verifyStripeWebhook } = await import("./stripe");
  const event = verifyStripeWebhook(
    body as string | Buffer,
    headers["stripe-signature"] || ""
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { metadata?: { orderId?: string }; payment_status?: string };

    if (session.metadata?.orderId && session.payment_status === "paid") {
      const orderId = parseInt(session.metadata.orderId, 10);

      // Atomically claim the PENDING → CONFIRMED transition so concurrent calls
      // (webhook + success-page verify) never double-process the order.
      const claimed = await prisma.order.updateMany({
        where: { id: orderId, status: "PENDING" },
        data: { status: "CONFIRMED" },
      });

      if (claimed.count > 0) {
        await processPaidOrder(orderId);
        return { orderId, status: "completed" };
      }
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as { metadata?: { orderId?: string } };

    if (session.metadata?.orderId) {
      const orderId = parseInt(session.metadata.orderId, 10);
      await prisma.order.update({
        where: { id: orderId, status: "PENDING" },
        data: { status: "CANCELLED" },
      });
      return { orderId, status: "failed" };
    }
  }

  // Default: return a dummy result for unhandled events
  return { orderId: 0, status: "failed" };
}
