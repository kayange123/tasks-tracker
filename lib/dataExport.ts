import { clerkClient } from "@clerk/nextjs/server";
import { Table, toCsvZip } from "@/lib/csv";
import { db } from "@/lib/prisma";
import { active } from "@/lib/softDelete";

export type ExportFormat = "json" | "csv";

export const parseExportFormat = (value: string | null): ExportFormat | null =>
  value === "json" || value === "csv" ? value : null;

const ACTIVITY_COLUMNS = [
  "id",
  "createdAt",
  "orgId",
  "userId",
  "userName",
  "action",
  "entityType",
  "entityId",
  "entityTitle",
];

const activityOf = (where: { orgId: string } | { userId: string }) =>
  db.auditLog.findMany({
    where,
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      createdAt: true,
      orgId: true,
      userId: true,
      userName: true,
      action: true,
      entityType: true,
      entityId: true,
      entityTitle: true,
    },
  });

// Organizations deleted in Clerk can still have data here, so a missing
// organization isn't an error
const findOrganization = async (orgId: string) => {
  try {
    const client = await clerkClient();
    const { id, name, slug, createdAt } =
      await client.organizations.getOrganization({ organizationId: orgId });
    return { id, name, slug, createdAt: new Date(createdAt) };
  } catch {
    return { id: orgId, name: null, slug: null, createdAt: null };
  }
};

// Everything an organization keeps in Taskier, excluding soft-deleted items
export const buildOrgExport = async (orgId: string) => {
  const [organization, boards, activity, subscription] = await Promise.all([
    findOrganization(orgId),
    db.board.findMany({
      where: { orgId, ...active },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        title: true,
        imageFullUrl: true,
        imageUserName: true,
        createdAt: true,
        updatedAt: true,
        lists: {
          where: active,
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            order: true,
            createdAt: true,
            updatedAt: true,
            cards: {
              where: active,
              orderBy: { order: "asc" },
              select: {
                id: true,
                title: true,
                description: true,
                order: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    }),
    activityOf({ orgId }),
    db.orgSubscription.findUnique({ where: { orgId } }),
  ]);

  return {
    exportedAt: new Date(),
    organization,
    plan: {
      name: subscription?.stripeSubscriptionId ? "Pro" : "Free",
      currentPeriodEnd: subscription?.stripeCurrentPeriodEnd ?? null,
    },
    boards,
    activity,
  };
};

export type OrgExport = Awaited<ReturnType<typeof buildOrgExport>>;

export const orgExportTables = (data: OrgExport): Record<string, Table> => {
  const lists = data.boards.flatMap(({ lists, ...board }) =>
    lists.map((list) => ({ ...list, boardId: board.id }))
  );
  const cards = lists.flatMap(({ cards, ...list }) =>
    cards.map((card) => ({ ...card, listId: list.id, boardId: list.boardId }))
  );

  return {
    organization: {
      columns: ["id", "name", "slug", "plan", "currentPeriodEnd", "exportedAt"],
      rows: [
        {
          ...data.organization,
          plan: data.plan.name,
          currentPeriodEnd: data.plan.currentPeriodEnd,
          exportedAt: data.exportedAt,
        },
      ],
    },
    boards: {
      columns: [
        "id",
        "title",
        "imageFullUrl",
        "imageUserName",
        "createdAt",
        "updatedAt",
      ],
      rows: data.boards,
    },
    lists: {
      columns: ["id", "boardId", "title", "order", "createdAt", "updatedAt"],
      rows: lists,
    },
    cards: {
      columns: [
        "id",
        "boardId",
        "listId",
        "title",
        "description",
        "order",
        "createdAt",
        "updatedAt",
      ],
      rows: cards,
    },
    activity: { columns: ACTIVITY_COLUMNS, rows: data.activity },
  };
};

// A person's Clerk profile, memberships and the activity entries they made.
// Content records don't store who created them; the activity log does.
export const buildUserExport = async (userId: string) => {
  const client = await clerkClient();
  const [user, memberships, activity] = await Promise.all([
    client.users.getUser(userId),
    client.users.getOrganizationMembershipList({ userId, limit: 500 }),
    activityOf({ userId }),
  ]);

  return {
    exportedAt: new Date(),
    profile: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      emailAddresses: user.emailAddresses.map((email) => email.emailAddress),
      imageUrl: user.imageUrl,
      createdAt: new Date(user.createdAt),
      lastSignInAt: user.lastSignInAt ? new Date(user.lastSignInAt) : null,
    },
    memberships: memberships.data.map((membership) => ({
      organizationId: membership.organization.id,
      organizationName: membership.organization.name,
      role: membership.role,
      joinedAt: new Date(membership.createdAt),
    })),
    activity,
  };
};

export type UserExport = Awaited<ReturnType<typeof buildUserExport>>;

export const userExportTables = (data: UserExport): Record<string, Table> => ({
  profile: {
    columns: [
      "id",
      "firstName",
      "lastName",
      "username",
      "emailAddresses",
      "imageUrl",
      "createdAt",
      "lastSignInAt",
      "exportedAt",
    ],
    rows: [
      {
        ...data.profile,
        emailAddresses: data.profile.emailAddresses.join(" "),
        exportedAt: data.exportedAt,
      },
    ],
  },
  memberships: {
    columns: ["organizationId", "organizationName", "role", "joinedAt"],
    rows: data.memberships,
  },
  activity: { columns: ACTIVITY_COLUMNS, rows: data.activity },
});

// Builds the download response for either format
export const exportResponse = (
  baseName: string,
  format: ExportFormat,
  data: unknown,
  tables: Record<string, Table>
) => {
  const date = new Date().toISOString().slice(0, 10);
  const safeName = baseName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const fileName = `${safeName}-${date}.${format === "json" ? "json" : "zip"}`;
  const body =
    format === "json"
      ? JSON.stringify(data, null, 2)
      : toCsvZip(tables);

  return new Response(body, {
    headers: {
      "Content-Type": format === "json" ? "application/json" : "application/zip",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
};
