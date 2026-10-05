import { auth } from "@clerk/nextjs/server";
import { db } from "./prisma";

const DAY_IN_MS = 86_400_000;

// The active organization's plan. A subscription counts as active until a
// day after its current period ends, to absorb webhook delays.
export const getSubscription = async () => {
  const { orgId } = await auth();

  if (!orgId) {
    return { isPro: false, periodEnd: null };
  }

  const subscription = await db.orgSubscription.findUnique({
    where: { orgId },
    select: {
      stripeCurrentPeriodEnd: true,
      stripePriceId: true,
    },
  });

  const periodEnd = subscription?.stripeCurrentPeriodEnd ?? null;
  const isPro =
    !!subscription?.stripePriceId &&
    !!periodEnd &&
    periodEnd.getTime() + DAY_IN_MS > Date.now();

  return { isPro, periodEnd: isPro ? periodEnd : null };
};

export const checkSubscription = async () => {
  return (await getSubscription()).isPro;
};
