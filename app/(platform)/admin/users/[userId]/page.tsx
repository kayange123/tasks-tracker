import { isOrgAdmin } from "@/lib/orgAdmin";
import AdminDeleteUserDialog from "@/components/admin/AdminDeleteUserDialog";
import ExportButtons from "@/components/ExportButtons";
import { getUserOverview } from "@/lib/operatorData";
import { format } from "date-fns";
import Link from "next/link";
import Facts from "../../_components/Facts";
import PageHeader from "../../_components/PageHeader";
import Section from "../../_components/Section";

const AdminUserPage = async ({
  params,
}: {
  params: Promise<{ userId: string }>;
}) => {
  const { userId } = await params;
  const overview = await getUserOverview(userId);

  if (!overview.user) {
    return (
      <>
        <PageHeader
          title={userId}
          back
          description="This user doesn’t exist in Clerk."
        />
        <Section title="Remaining data">
          <p className="text-[13px] text-muted-foreground">
            {overview.activityCount
              ? `${overview.activityCount} activity entries still name this user. The Clerk webhook anonymizes them when a deletion is delivered; if it never was, they’ll stay until the organization is deleted.`
              : "No activity entries name this user."}
          </p>
        </Section>
      </>
    );
  }

  const { user, memberships, plan, activityCount } = overview;
  const label = user.name ?? user.email ?? user.id;

  return (
    <>
      <PageHeader title={label} back description={user.id} />
      <Section title="Account">
        <Facts
          items={[
            ["Email", user.email ?? "None"],
            ["Signed up", format(user.createdAt, "MMMM d, yyyy")],
            [
              "Last sign-in",
              user.lastSignInAt
                ? format(user.lastSignInAt, "MMMM d, yyyy")
                : "Never",
            ],
            ["Activity entries", activityCount],
          ]}
        />
      </Section>
      <Section title="Organizations">
        {memberships.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">
            Not a member of any organization.
          </p>
        ) : (
          <ul className="flex flex-col divide-y rounded-lg border text-sm">
            {memberships.map((membership) => (
              <li key={membership.id}>
                <Link
                  href={`/admin/organizations/${membership.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-accent"
                >
                  <span className="truncate font-medium">
                    {membership.name}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {isOrgAdmin(membership.role) ? "Admin" : "Member"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>
      <Section
        title="Export data"
        description="Profile, memberships and activity entries. Each export is recorded in the action log."
      >
        <ExportButtons url={`/api/admin/users/${user.id}/export`} />
      </Section>
      <Section
        tone="danger"
        title="Delete user"
        description={
          plan.blockingOrganizations.length
            ? `They’re the only admin of ${plan.blockingOrganizations.map((o) => o.name).join(", ")}. Deleting them leaves ${plan.blockingOrganizations.length === 1 ? "it" : "those organizations"} without an admin.`
            : "Deletes the Clerk account and anonymizes their activity entries."
        }
      >
        <div>
          <AdminDeleteUserDialog
            userId={user.id}
            label={label}
            soleMemberOrganizations={plan.soleMemberOrganizations.map(
              (o) => o.name,
            )}
            blockingOrganizations={plan.blockingOrganizations.map(
              (o) => o.name,
            )}
          />
        </div>
      </Section>
    </>
  );
};

export default AdminUserPage;
