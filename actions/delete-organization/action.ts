"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { InputType, ReturnType } from "./types";
import { createActions } from "@/lib/createActions";
import { purgeOrganization } from "@/lib/dataDeletion";
import { isOrgAdmin } from "@/lib/orgAdmin";
import { DeleteOrganization } from "./schema";

export const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId, orgRole } = await auth();
  if (!userId || !orgId) {
    return { error: "Unauthorized" };
  }
  if (orgId !== data.organizationId) {
    return { error: "Switch to this organization and try again." };
  }
  if (!isOrgAdmin(orgRole)) {
    return { error: "Only organization admins can delete this organization." };
  }

  const client = await clerkClient();
  let name: string;
  try {
    ({ name } = await client.organizations.getOrganization({
      organizationId: orgId,
    }));
  } catch (error) {
    return { error: "Failed to delete organization" };
  }

  if (data.confirmation.trim() !== name) {
    return {
      fieldErrors: { confirmation: ["Type the organization’s name exactly."] },
    };
  }

  try {
    await client.organizations.deleteOrganization(orgId);
  } catch (error) {
    return { error: "Failed to delete organization" };
  }

  // Clerk's organization.deleted webhook repeats this if it fails here
  try {
    await purgeOrganization(orgId);
  } catch (error) {
    console.error(`Failed to purge organization ${orgId}`, error);
  }

  return { data: { name } };
};

export const deleteOrganization = createActions(DeleteOrganization, handler);
