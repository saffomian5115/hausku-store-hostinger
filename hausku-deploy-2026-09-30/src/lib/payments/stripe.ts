import Stripe from "stripe";

let _stripe: Stripe | null = null;

/**
 * Lazy-initialized Stripe client — only created when first used at runtime.
 * This avoids throwing during Next.js build when env vars aren't available.
 */
export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY environment variable is required");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
      appInfo: {
        name: "hausku Store",
        version: "0.1.0",
        url: process.env.NEXT_PUBLIC_APP_URL,
      },
    });
  }
  return _stripe;
}



/**
 * Create a Stripe Checkout Session for an order.
 */
export async function createStripeCheckoutSession(params: {
  orderId: number;
  orderNumber: string;
  items: Array<{
    name: string;
    description?: string;
    unitPrice: number;
    qty: number;
    imageUrl?: string;
  }>;
  customerEmail: string;
  shippingCost: number;
  vatRate: number;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ sessionId: string; url: string }> {
  const {
    orderId,
    orderNumber,
    items,
    customerEmail,
    shippingCost,
    vatRate,
    successUrl,
    cancelUrl,
  } = params;

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
    (item) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.name,
          description: item.description,
          ...(item.imageUrl ? { images: [item.imageUrl] } : {}),
        },
        unit_amount: Math.round(item.unitPrice * 100), // Convert to cents
      },
      quantity: item.qty,
    })
  );

  // Add shipping as a line item if there's a cost
  if (shippingCost > 0) {
    lineItems.push({
      price_data: {
        currency: "eur",
        product_data: {
          name: "Versandkosten",
          description: `MwSt. (${vatRate}%) inbegriffen`,
        },
        unit_amount: Math.round(shippingCost * 100),
      },
      quantity: 1,
    });
  }

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card", "klarna"],
    customer_email: customerEmail,
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      orderId: orderId.toString(),
      orderNumber,
    },
    shipping_address_collection: {
      allowed_countries: ["DE", "AT", "CH"],
    },
    // Allow promotion codes
    allow_promotion_codes: true,
    // Collect billing address
    billing_address_collection: "auto",
  });

  if (!session.url) {
    throw new Error("Failed to create Stripe checkout session");
  }

  return { sessionId: session.id, url: session.url };
}

/**
 * Verify and construct a Stripe webhook event.
 */
export function verifyStripeWebhook(
  body: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET environment variable is required");
  }

  return getStripe().webhooks.constructEvent(body, signature, webhookSecret);
}

/**
 * Get the Stripe session by ID.
 */
export async function getStripeSession(sessionId: string) {
  return getStripe().checkout.sessions.retrieve(sessionId);
}
