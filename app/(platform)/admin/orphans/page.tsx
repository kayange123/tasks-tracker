import AdminDeleteOrganizationDialog from "@/components/admin/AdminDeleteOrganizationDialog";
import { findOrphanedOrganizations } from "@/lib/operatorData";
import Link from "next/link";
import PageHeader from "../_components/PageHeader";
import Section from "../_components/Section";

const OrphansPage = async () => {
  const orphans = await findOrphanedOrganizations();

  return (
    <>
      <PageHeader
        title="Orphaned organizations"
        back
        description="These organizations were deleted in Clerk, but their data is still here, for example because the webhook wasn’t set up yet."
      />
      <Section
        title={`${orphans.length} ${orphans.length === 1 ? "organization" : "organizations"}`}
      >
        {orphans.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">
            Nothing to clean up. Every organization with data still exists in
            Clerk.
          </p>
        ) : (
          <ul className="flex flex-col divide-y rounded-lg border text-sm">
            {orphans.map((orphan) => (
              <li
                key={orphan.orgId}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="flex min-w-0 flex-col">
                  <Link
                    href={`/admin/organizations/${orphan.orgId}`}
                    className="truncate font-medium hover:underline"
                  >
                    {orphan.orgId}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {orphan.boards} boards · {orphan.activity} activity entries
                  </span>
                </span>
                <AdminDeleteOrganizationDialog
                  orgId={orphan.orgId}
                  name={null}
                  boards={orphan.boards}
                  activity={orphan.activity}
                  isPro={false}
                  triggerLabel="Purge"
                />
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
};

export default OrphansPage;
