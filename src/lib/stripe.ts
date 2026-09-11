import "server-only";
import Stripe from "stripe";

let cached: Stripe | null = null;

// Lazy so the module can be imported (and the build can succeed) before
// STRIPE_SECRET_KEY is configured — only the webhook route needs this, and
// only once someone actually hits it.
export function getStripe(): Stripe {
  if (!cached) {
    cached = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return cached;
}
