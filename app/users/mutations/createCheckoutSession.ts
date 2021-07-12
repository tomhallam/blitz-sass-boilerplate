import stripe, { env } from "integrations/stripe";
import Guard from "app/guard/ability";

import { Ctx } from "blitz";
import db from "db";

type CreateCheckoutSessionInput = {
  priceId: string;
};

// Step 4: Create a Checkout Session
// https://stripe.com/docs/billing/subscriptions/checkout#create-session
async function createCheckoutSession({ priceId }: CreateCheckoutSessionInput, ctx: Ctx) {
  ctx.session.$authorize();

  const organization = await db.organization.findFirst({
    where: {
      id: ctx.session.organizationId,
    },
    select: {
      stripeCustomerId: true,
      subscriptionStatus: true,
    },
  });

  const user = await db.user.findFirst({
    where: {
      id: ctx.session.userId,
    },
    select: {
      email: true,
    },
  });

  if (!organization || !user) {
    throw new Error("Organization or User not found");
  }

  const customer = await stripe.customers.create({
    email: user.email,
  });

  await db.organization.update({
    where: { id: ctx.session.organizationId },
    data: {
      stripeCustomerId: customer.id,
    },
  });

  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    subscription_data: {
      // TODO
      trial_period_days: 30,
    },
    success_url: `${env.DOMAIN}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.DOMAIN}/billing/cancelled`,
  });

  return {
    sessionId: session.id,
  };
}

export default Guard.authorize("update", "organization", createCheckoutSession);
