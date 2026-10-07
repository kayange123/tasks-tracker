import { clerkClient } from "@clerk/nextjs/server";
import { anonymizeUser, purgeOrganization } from "@/lib/dataDeletion";
import { isOrgAdmin } from "@/lib/orgAdmin";

export type OrganizationSummary = { id: string; name: string };

export type AccountDeletionPlan = {
  // The person is the only member; these are deleted with the account
  soleMemberOrganizations: OrganizationSummary[];
  // The person is the only admin of an organization with other members;
  // the account can't be deleted until that changes
  blockingOrganizations: OrganizationSummary[];
};

// Works out what deleting a person's account would do to their organizations
export const getAccountDeletionPlan = async (
  userId: string,
): Promise<AccountDeletionPlan> => {
  const client = await clerkClient();
  const { data: memberships } =
    await client.users.getOrganizationMembershipList({ userId, limit: 500 });

  const plan: AccountDeletionPlan = {
    soleMemberOrganizations: [],
    blockingOrganizations: [],
  };

  for (const { organization, role } of memberships) {
    const summary = { id: organization.id, name: organization.name };
    const { data: members } =
      await client.organizations.getOrganizationMembershipList({
        organizationId: organization.id,
        limit: 500,
      });
    const others = members.filter(
      (member) => member.publicUserData?.userId !== userId,
    );

    if (others.length === 0) {
      plan.soleMemberOrganizations.push(summary);
    } else if (
      isOrgAdmin(role) &&
      !others.some((member) => isOrgAdmin(member.role))
    ) {
      plan.blockingOrganizations.push(summary);
    }
  }

  return plan;
};

export class AccountDeletionBlockedError extends Error {
  constructor(readonly organizations: OrganizationSummary[]) {
    super(
      `Make someone else an admin of ${organizations
        .map((organization) => organization.name)
        .join(", ")} first, or delete ${
        organizations.length === 1 ? "it" : "them"
      }.`,
    );
  }
}

// Deletes a person's account: the organizations only they belong to, their
// identity on activity entries, and finally the Clerk user. Re-checks the
// plan so nothing changed since the person confirmed. Operators handling a
// privacy request can go ahead even if organizations are left without an
// admin.
export const deleteAccount = async (
  userId: string,
  { allowBlocked = false }: { allowBlocked?: boolean } = {},
) => {
  const plan = await getAccountDeletionPlan(userId);
  if (!allowBlocked && plan.blockingOrganizations.length > 0) {
    throw new AccountDeletionBlockedError(plan.blockingOrganizations);
  }

  const client = await clerkClient();
  for (const organization of plan.soleMemberOrganizations) {
    await client.organizations.deleteOrganization(organization.id);
    await purgeOrganization(organization.id);
  }
  await anonymizeUser(userId);
  await client.users.deleteUser(userId);

  return { deletedOrganizations: plan.soleMemberOrganizations };
};
