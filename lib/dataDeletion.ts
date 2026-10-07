import Stripe from "stripe";
import { db } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export const DELETED_USER = {
  userId: "deleted-user",
  userName: "Deleted user",
  userImage: "",
} as const;

// Stripe objects already gone count as done, so purges can be retried
const ignoreMissing = (error: unknown) => {
  if (
    error instanceof Stripe.errors.StripeError &&
    error.code === "resource_missing"
  ) {
    return;
  }
  throw error;
};

// Permanently removes an organization's data and ends its billing. Safe to
// run more than once: the Clerk webhook may repeat it after a direct delete.
export const purgeOrganization = async (orgId: string) => {
  const subscription = await db.orgSubscription.findUnique({
    where: { orgId },
  });

  // Billing ends before any record is removed, so a Stripe failure leaves the
  // subscription record in place for the retry
  if (subscription?.stripeSubscriptionId) {
    await stripe.subscriptions
      .cancel(subscription.stripeSubscriptionId)
      .catch(ignoreMissing);
  }
  if (subscription?.stripeCustomerId) {
    await stripe.customers
      .del(subscription.stripeCustomerId)
      .catch(ignoreMissing);
  }

  const boards = await db.board.findMany({
    where: { orgId },
    select: { id: true },
  });
  const boardIds = boards.map((board) => board.id);

  // Children first, so no removal relies on cascading from a parent
  const cards = await db.card.deleteMany({
    where: { list: { boardId: { in: boardIds } } },
  });
  const lists = await db.list.deleteMany({
    where: { boardId: { in: boardIds } },
  });
  const removedBoards = await db.board.deleteMany({ where: { orgId } });
  const activity = await db.auditLog.deleteMany({ where: { orgId } });
  await db.orgLimit.deleteMany({ where: { orgId } });
  await db.orgSubscription.deleteMany({ where: { orgId } });

  return {
    boards: removedBoards.count,
    lists: lists.count,
    cards: cards.count,
    activity: activity.count,
  };
};

// Activity entries stay so organizations keep their history, but no longer
// identify the person
export const anonymizeUser = async (userId: string) => {
  const { count } = await db.auditLog.updateMany({
    where: { userId },
    data: DELETED_USER,
  });
  return { activity: count };
};
