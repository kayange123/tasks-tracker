import { clerkClient } from "@clerk/nextjs/server";
import { getAccountDeletionPlan } from "@/lib/accountDeletion";
import { db } from "@/lib/prisma";
import { active } from "@/lib/softDelete";

// Clerk answers 404 for deleted users and organizations
const orNull = <T>(promise: Promise<T>) =>
  promise.catch((error: { status?: number }) => {
    if (error?.status === 404) return null;
    throw error;
  });

const primaryEmail = (user: {
  primaryEmailAddress: { emailAddress: string } | null;
  emailAddresses: { emailAddress: string }[];
}) =>
  user.primaryEmailAddress?.emailAddress ??
  user.emailAddresses[0]?.emailAddress ??
  null;

export type SearchResult = {
  type: "user" | "organization";
  id: string;
  title: string;
  subtitle: string | null;
};

// Finds users by email, name or id, and organizations by name, slug or id
export const searchDirectory = async (
  rawQuery: string,
): Promise<SearchResult[]> => {
  const query = rawQuery.trim();
  if (!query) return [];
  const client = await clerkClient();

  const [users, organizations] = await Promise.all([
    query.startsWith("org_")
      ? { data: [] }
      : client.users.getUserList(
          query.startsWith("user_")
            ? { userId: [query] }
            : query.includes("@")
              ? { emailAddress: [query] }
              : { query, limit: 20 },
        ),
    query.startsWith("user_")
      ? { data: [] }
      : client.organizations.getOrganizationList({ query, limit: 20 }),
  ]);

  return [
    ...users.data.map((user) => ({
      type: "user" as const,
      id: user.id,
      title:
        [user.firstName, user.lastName].filter(Boolean).join(" ") ||
        user.username ||
        primaryEmail(user) ||
        user.id,
      subtitle: primaryEmail(user),
    })),
    ...organizations.data.map((organization) => ({
      type: "organization" as const,
      id: organization.id,
      title: organization.name,
      subtitle: organization.slug,
    })),
  ];
};

export const getUserOverview = async (userId: string) => {
  const client = await clerkClient();
  const user = await orNull(client.users.getUser(userId));
  const activityCount = await db.auditLog.count({ where: { userId } });
  if (!user) return { user: null, activityCount };

  const [memberships, plan] = await Promise.all([
    client.users.getOrganizationMembershipList({ userId, limit: 100 }),
    getAccountDeletionPlan(userId),
  ]);

  return {
    user: {
      id: user.id,
      name: [user.firstName, user.lastName].filter(Boolean).join(" ") || null,
      email: primaryEmail(user),
      imageUrl: user.imageUrl,
      createdAt: new Date(user.createdAt),
      lastSignInAt: user.lastSignInAt ? new Date(user.lastSignInAt) : null,
    },
    memberships: memberships.data.map((membership) => ({
      id: membership.organization.id,
      name: membership.organization.name,
      role: membership.role,
    })),
    plan,
    activityCount,
  };
};

export const getOrganizationOverview = async (orgId: string) => {
  const client = await clerkClient();
  const [organization, boards, cards, activity, subscription] =
    await Promise.all([
      orNull(client.organizations.getOrganization({ organizationId: orgId })),
      db.board.count({ where: { orgId, ...active } }),
      db.card.count({ where: { list: { board: { orgId } }, ...active } }),
      db.auditLog.count({ where: { orgId } }),
      db.orgSubscription.findUnique({ where: { orgId } }),
    ]);
  const members = organization
    ? (
        await client.organizations.getOrganizationMembershipList({
          organizationId: orgId,
          limit: 100,
        })
      ).data.map((membership) => ({
        userId: membership.publicUserData?.userId ?? null,
        name:
          [
            membership.publicUserData?.firstName,
            membership.publicUserData?.lastName,
          ]
            .filter(Boolean)
            .join(" ") ||
          membership.publicUserData?.identifier ||
          "Unknown",
        role: membership.role,
      }))
    : [];

  return {
    organization: organization
      ? {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          imageUrl: organization.imageUrl,
          createdAt: new Date(organization.createdAt),
        }
      : null,
    members,
    counts: { boards, cards, activity },
    plan: {
      isPro: !!subscription?.stripeSubscriptionId,
      currentPeriodEnd: subscription?.stripeCurrentPeriodEnd ?? null,
    },
  };
};

// Organizations that still have data here but no longer exist in Clerk,
// e.g. deleted while the webhook wasn't set up
export const findOrphanedOrganizations = async () => {
  const sources = await Promise.all([
    db.board.findMany({ distinct: ["orgId"], select: { orgId: true } }),
    db.auditLog.findMany({ distinct: ["orgId"], select: { orgId: true } }),
    db.orgLimit.findMany({ select: { orgId: true } }),
    db.orgSubscription.findMany({ select: { orgId: true } }),
  ]);
  const orgIds = Array.from(
    new Set(sources.flat().map((row) => row.orgId)),
  ).sort();

  const client = await clerkClient();
  const existing = new Set<string>();
  for (let start = 0; start < orgIds.length; start += 100) {
    const batch = orgIds.slice(start, start + 100);
    const { data } = await client.organizations.getOrganizationList({
      organizationId: batch,
      limit: 100,
    });
    data.forEach((organization) => existing.add(organization.id));
  }

  const orphans = orgIds.filter((orgId) => !existing.has(orgId));
  return Promise.all(
    orphans.map(async (orgId) => ({
      orgId,
      boards: await db.board.count({ where: { orgId } }),
      activity: await db.auditLog.count({ where: { orgId } }),
    })),
  );
};
