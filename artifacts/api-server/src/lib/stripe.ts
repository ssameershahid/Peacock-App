import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY must be set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
});

export async function createCheckoutSession(params: {
  referenceCode: string;
  bookingId: string;
  customerId: string;
  customerEmail: string;
  description: string;
  amountGBP: number;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  return stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: params.customerEmail,
    line_items: [
      {
        price_data: {
          currency: "gbp",
          product_data: {
            name: params.description,
            metadata: { bookingId: params.bookingId },
          },
          unit_amount: Math.round(params.amountGBP * 100),
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      metadata: {
        bookingId: params.bookingId,
        referenceCode: params.referenceCode,
        ...params.metadata,
      },
    },
    metadata: {
      bookingId: params.bookingId,
      referenceCode: params.referenceCode,
      ...params.metadata,
    },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  });
}

export async function createPaymentLink(params: {
  requestId: string;
  referenceCode: string;
  customerEmail: string;
  description: string;
  amountGBP: number;
}) {
  const price = await stripe.prices.create({
    currency: "gbp",
    unit_amount: Math.round(params.amountGBP * 100),
    product_data: {
      name: params.description,
    },
  });

  return stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    metadata: {
      customRequestId: params.requestId,
      referenceCode: params.referenceCode,
    },
    after_completion: {
      type: "redirect",
      redirect: {
        url: `${process.env.FRONTEND_URL}/account/trips?ref=${params.referenceCode}`,
      },
    },
  });
}
