import { Router, Request, Response } from "express";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import {
  db,
  bookingsTable,
  customTourRequestsTable,
  invoicesTable,
  usersTable,
} from "@workspace/db";
import { stripe } from "../../lib/stripe.js";
import { sendBookingConfirmation } from "../../lib/email.js";

const router = Router();

// Raw body needed for Stripe signature verification
router.post(
  "/",
  // express.raw is applied in app.ts for this route
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not set");
      res.status(500).send("Webhook secret not configured");
      return;
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error("Stripe webhook signature verification failed:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const bookingId = session.metadata?.bookingId;
          const customRequestId = session.metadata?.customRequestId;

          if (bookingId) {
            await handleBookingPaid(bookingId, session);
          } else if (customRequestId) {
            await handleCustomRequestPaid(customRequestId, session);
          }
          break;
        }

        case "payment_intent.payment_failed": {
          const pi = event.data.object as Stripe.PaymentIntent;
          const bookingId = pi.metadata?.bookingId;
          if (bookingId) {
            await db
              .update(bookingsTable)
              .set({ paymentStatus: "FAILED", updatedAt: new Date() })
              .where(eq(bookingsTable.id, bookingId));
          }
          break;
        }

        case "charge.refunded": {
          const charge = event.data.object as Stripe.Charge;
          const bookingId = (charge.metadata as any)?.bookingId;
          if (bookingId) {
            const refundAmount = charge.amount_refunded / 100;
            await db
              .update(bookingsTable)
              .set({
                paymentStatus: "REFUNDED",
                refundAmountGBP: refundAmount,
                updatedAt: new Date(),
              })
              .where(eq(bookingsTable.id, bookingId));
          }
          break;
        }

        default:
          // Unhandled event — ignore
          break;
      }

      res.json({ received: true });
    } catch (err) {
      console.error("Webhook handler error:", err);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  }
);

async function handleBookingPaid(
  bookingId: string,
  session: Stripe.Checkout.Session
) {
  const [booking] = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.id, bookingId))
    .limit(1);

  if (!booking) return;

  // Update booking to confirmed + paid
  const [updated] = await db
    .update(bookingsTable)
    .set({
      status: "CONFIRMED",
      paymentStatus: "PAID",
      stripePaymentIntentId: session.payment_intent as string,
      updatedAt: new Date(),
    })
    .where(eq(bookingsTable.id, bookingId))
    .returning();

  // Generate invoice
  const invoice = await generateInvoice(updated);

  // Send confirmation email
  const [customer] = await db
    .select({
      email: usersTable.email,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
    })
    .from(usersTable)
    .where(eq(usersTable.id, booking.customerId))
    .limit(1);

  if (customer) {
    const serviceDescription = booking.tourId
      ? "Tour Booking"
      : booking.transferRouteId
      ? "Transfer Booking"
      : "Custom Tour";

    sendBookingConfirmation({
      to: customer.email,
      firstName: customer.firstName || "there",
      referenceCode: booking.referenceCode,
      tourOrService: serviceDescription,
      startDate: booking.startDate.toDateString(),
      vehicleType: booking.vehicleType,
      passengers: booking.passengers,
      totalGBP: booking.totalGBP,
    }).catch(console.error);
  }
}

async function handleCustomRequestPaid(
  requestId: string,
  session: Stripe.Checkout.Session
) {
  const [request] = await db
    .select()
    .from(customTourRequestsTable)
    .where(eq(customTourRequestsTable.id, requestId))
    .limit(1);

  if (!request) return;

  await db
    .update(customTourRequestsTable)
    .set({ status: "PAID", updatedAt: new Date() })
    .where(eq(customTourRequestsTable.id, requestId));
}

async function generateInvoice(booking: typeof bookingsTable.$inferSelect) {
  // Build sequential invoice number
  const count = await db
    .select({ id: invoicesTable.id })
    .from(invoicesTable);
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count.length + 1).padStart(4, "0")}`;

  const pricingBreakdown = (booking.pricingBreakdown as any) || {};
  const lineItems = [
    {
      description: booking.tourId
        ? "Tour Package"
        : booking.transferRouteId
        ? "Transfer Service"
        : "Custom Tour",
      quantity: 1,
      unitPriceGBP: booking.totalGBP,
    },
    ...(booking.addOns
      ? (booking.addOns as any[]).map((a) => ({
          description: a.name,
          quantity: 1,
          unitPriceGBP: a.priceGBP,
        }))
      : []),
  ];

  const [invoice] = await db
    .insert(invoicesTable)
    .values({
      invoiceNumber,
      bookingId: booking.id,
      customerId: booking.customerId,
      lineItems,
      subtotal: booking.totalGBP,
      total: booking.totalGBP,
      currency: "GBP",
    })
    .returning();

  return invoice;
}

export default router;
