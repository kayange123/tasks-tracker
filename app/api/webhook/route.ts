import Stripe from "stripe";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
  } catch (error) {
    return new NextResponse("Webhook Error", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (!session?.metadata?.orgId) {
      return new NextResponse("No Org ID", { status: 400 });
    }

    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string,
    );
    const subscriptionData = {
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      stripePriceId: subscription.items.data[0].price.id,
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    };

    // Upsert so an org that resubscribes after a lapse doesn't hit the
    // unique orgId constraint
    await db.orgSubscription.upsert({
      where: { orgId: session.metadata.orgId },
      create: { orgId: session.metadata.orgId, ...subscriptionData },
      update: subscriptionData,
    });
  }

  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;

    if (invoice.subscription) {
      const subscription = await stripe.subscriptions.retrieve(
        typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription.id,
      );

      // updateMany doesn't throw when the first invoice arrives before
      // checkout.session.completed has created the record
      await db.orgSubscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000,
          ),
        },
      });
    }
  }

  return new NextResponse(null, { status: 200 });
}
