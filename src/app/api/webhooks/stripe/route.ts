import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { users, creditTransactions } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import type Stripe from "stripe";

// TODO: fill in once the Stripe Payment Links / credit packs are created —
// maps a Stripe Price id to how many credits that pack grants.
const CREDITS_BY_PRICE_ID: Record<string, number> = {
  // "price_XXXXXXXX": 10,
};

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Payment Links checkout sessions carry the purchased line items via the
    // session's `client_reference_id` (set to the app user id in the Payment
    // Link's success URL) — set that up when the Payment Links are created.
    const userId = session.client_reference_id;
    if (!userId) {
      return NextResponse.json({ error: "Missing client_reference_id" }, { status: 400 });
    }

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const priceId = lineItems.data[0]?.price?.id;
    const credits = priceId ? CREDITS_BY_PRICE_ID[priceId] : undefined;

    if (!credits) {
      return NextResponse.json({ error: "Unknown price id" }, { status: 400 });
    }

    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ creditBalance: sql`${users.creditBalance} + ${credits}` })
        .where(eq(users.id, userId));

      await tx.insert(creditTransactions).values({
        userId,
        amount: credits,
        type: "purchase",
        stripePaymentId: session.id,
      });
    });
  }

  return NextResponse.json({ received: true });
}
