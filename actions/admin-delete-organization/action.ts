"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { InputType, ReturnType } from "./types";
import { createActions } from "@/lib/createActions";
import { purgeOrganization } from "@/lib/dataDeletion";
import { getOperatorId, logAdminAction } from "@/lib/operator";
import { AdminDeleteOrganization } from "./schema";

// Deletes an organization in Clerk if it still exists there, then purges
// its data. Also used for organizations already gone from Clerk.
export const handler = async (data: InputType): Promise<ReturnType> => {
  const operatorId = await getOperatorId();
  if (!operatorId) {
    return { error: "Not found" };
  }
  if (data.confirmation.trim() !== data.orgId) {
    return {
      fieldErrors: { confirmation: ["Type the organization ID exactly."] },
    };
  }

  try {
    const client = await clerkClient();
    const existed = await client.organizations
      .deleteOrganization(data.orgId)
      .then(() => true)
      .catch((error: { status?: number }) => {
        if (error?.status === 404) return false;
        throw error;
      });
    const removed = await purgeOrganization(data.orgId);
    await logAdminAction(
      operatorId,
      "DELETE_ORGANIZATION",
      { type: "ORGANIZATION", id: data.orgId },
      `${existed ? "Deleted in Clerk" : "Already gone from Clerk"}; removed ${removed.boards} boards, ${removed.cards} cards, ${removed.activity} activity entries`,
    );
    return { data: { orgId: data.orgId } };
  } catch (error) {
    console.error(
      `Operator failed to delete organization ${data.orgId}`,
      error,
    );
    return { error: "Failed to delete organization" };
  }
};

export const adminDeleteOrganization = createActions(
  AdminDeleteOrganization,
  handler,
);
