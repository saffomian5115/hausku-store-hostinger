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
    // Check if already processed (idempotent)
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (existingOrder && existingOrder.status !== "paid") {
      // Mark order as paid
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "paid",
          paymentId: (session.payment_intent as string) || sessionId,
        },
      });

      // Decrement stock for each item
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (order) {
        for (const item of order.items) {
          if (item.variantId) {
            await prisma.productVariant.update({
              where: { id: item.variantId },
              data: { stockQty: { decrement: item.qty } },
            });
          }
        }
      }
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

      // Check if already processed (idempotent)
      const existingOrder = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (existingOrder && existingOrder.status !== "paid") {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "paid" },
        });

        // Decrement stock
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { items: true },
        });

        if (order) {
          for (const item of order.items) {
            if (item.variantId) {
              await prisma.productVariant.update({
                where: { id: item.variantId },
                data: { stockQty: { decrement: item.qty } },
              });
            }
          }
        }

        return { orderId, status: "completed" };
      }
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as { metadata?: { orderId?: string } };

    if (session.metadata?.orderId) {
      const orderId = parseInt(session.metadata.orderId, 10);
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "cancelled" },
      });
      return { orderId, status: "failed" };
    }
  }

  // Default: return a dummy result for unhandled events
  return { orderId: 0, status: "failed" };
}
