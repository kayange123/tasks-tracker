import { auth, currentUser } from "@clerk/nextjs/server";
import { ACTION, ENTITY_TYPE } from "@prisma/client";
import { db } from "./prisma";

interface AuditProps {
  entityId: string;
  entityType: ENTITY_TYPE;
  entityTitle: string;
  action: ACTION;
}

export const createAuditLog = async (props: AuditProps) => {
  try {
    const { orgId } = await auth();
    const user = await currentUser();

    if (!orgId || !user) {
      throw new Error("User not found");
    }
    const { entityId, entityTitle, entityType, action } = props;
    await db.auditLog.create({
      data: {
        entityId,
        orgId,
        entityTitle,
        entityType,
        action,
        userId: user.id,
        userName:
          [user.firstName, user.lastName].filter(Boolean).join(" ") ||
          user.username ||
          "Unknown user",
        userImage: user.imageUrl,
      },
    });
  } catch (error) {
    // Audit logging must never fail the mutation that already succeeded
    console.error("Failed to create audit log", error);
  }
};
