"use server";

import { InputType, ReturnType } from "./types";
import { createActions } from "@/lib/createActions";
import { deleteAccount } from "@/lib/accountDeletion";
import { getOperatorId, logAdminAction } from "@/lib/operator";
import { AdminDeleteUser } from "./schema";

export const handler = async (data: InputType): Promise<ReturnType> => {
  const operatorId = await getOperatorId();
  if (!operatorId) {
    return { error: "Not found" };
  }
  if (data.confirmation.trim() !== data.userId) {
    return { fieldErrors: { confirmation: ["Type the user ID exactly."] } };
  }
  if (data.userId === operatorId) {
    return { error: "Delete your own account from Data & privacy instead." };
  }

  try {
    // A privacy request goes ahead even if organizations lose their only admin
    const result = await deleteAccount(data.userId, { allowBlocked: true });
    await logAdminAction(
      operatorId,
      "DELETE_USER",
      { type: "USER", id: data.userId },
      result.deletedOrganizations.length
        ? `Also deleted ${result.deletedOrganizations.map((o) => o.id).join(", ")}`
        : undefined,
    );
    return { data: result };
  } catch (error) {
    console.error(`Operator failed to delete user ${data.userId}`, error);
    return { error: "Failed to delete user" };
  }
};

export const adminDeleteUser = createActions(AdminDeleteUser, handler);
