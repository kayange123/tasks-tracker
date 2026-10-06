"use server";

import { InputType } from "./types";
import { createActions } from "@/lib/createActions";
import { StripeRedirect } from "./schema";
import { absoluteUrl } from "@/lib/utils";
import { db } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { currentUser, auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { checkSubscription } from "@/lib/subscription";

export const handler = async () => {
  const user = await currentUser();
  const { orgId } = await auth();
  if (!user || !orgId) {
    return {
      error: "Unauthorized",
    };
  }
  const settingsUrl = absoluteUrl(`/organization/${orgId}`);

  let url = "";

  try {
    const orgSubscription = await db.orgSubscription.findUnique({
      where: { orgId },
    });

    const isPro = await checkSubscription();

    // The billing portal only manages existing subscriptions, so a lapsed
    // org goes back through checkout (reusing its Stripe customer)
    if (isPro && orgSubscription?.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: orgSubscription.stripeCustomerId,
        return_url: settingsUrl,
      });
      url = stripeSession.url;
    } else {
      const stripeSession = await stripe.checkout.sessions.create({
        success_url: settingsUrl,
        cancel_url: settingsUrl,
        payment_method_types: ["card"],
        mode: "subscription",
        billing_address_collection: "auto",
        ...(orgSubscription?.stripeCustomerId
          ? { customer: orgSubscription.stripeCustomerId }
          : { customer_email: user?.emailAddresses?.[0]?.emailAddress }),
        line_items: [
          {
            price_data: {
              currency: "USD",
              product_data: {
                name: "Taskier Pro",
                description: "Monthly Subscription",
              },
              unit_amount: 2000,
              recurring: {
                interval: "month",
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          orgId,
        },
      });

      url = stripeSession?.url || "";
    }
  } catch (error) {
    // Usually a missing or invalid STRIPE_API_KEY; keep the cause in logs
    console.error("Stripe redirect failed", error);
    return { error: "Couldn’t open Stripe. Try again in a moment." };
  }
  revalidatePath(`/organization/${orgId}`);

  return { data: url };
};
export const stripeRedirect = createActions(StripeRedirect, handler);
