import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export type AdminActionType =
  "EXPORT_USER" | "DELETE_USER" | "EXPORT_ORGANIZATION" | "DELETE_ORGANIZATION";

// Operators are Clerk users whose public metadata has { "role": "admin" }.
// Public metadata can only be changed from the Clerk dashboard or backend,
// never by users themselves.
export const OPERATOR_ROLE = "admin";

export const isOperatorRole = (metadata: unknown) =>
  (metadata as { role?: unknown } | null | undefined)?.role === OPERATOR_ROLE;

// The signed-in operator's id, or null for everyone else. Every console
// page, route and action checks this; outsiders get a 404. Reads the role
// from the session token when it carries the metadata, otherwise from Clerk.
export const getOperatorId = async () => {
  const { userId, sessionClaims } = await auth();
  if (!userId) return null;

  if (sessionClaims?.metadata !== undefined) {
    return isOperatorRole(sessionClaims.metadata) ? userId : null;
  }

  const user = await currentUser();
  return user && isOperatorRole(user.publicMetadata) ? userId : null;
};

export const logAdminAction = (
  adminUserId: string,
  action: AdminActionType,
  target: { type: "USER" | "ORGANIZATION"; id: string },
  details?: string,
) =>
  db.adminAction.create({
    data: {
      adminUserId,
      action,
      targetType: target.type,
      targetId: target.id,
      details,
    },
  });
