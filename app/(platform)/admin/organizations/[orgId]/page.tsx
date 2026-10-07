import { isOrgAdmin } from "@/lib/orgAdmin";
import AdminDeleteOrganizationDialog from "@/components/admin/AdminDeleteOrganizationDialog";
import ExportButtons from "@/components/ExportButtons";
import { getOrganizationOverview } from "@/lib/operatorData";
import { format } from "date-fns";
import Link from "next/link";
import Facts from "../../_components/Facts";
import PageHeader from "../../_components/PageHeader";
import Section from "../../_components/Section";

const AdminOrganizationPage = async ({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) => {
  const { orgId } = await params;
  const { organization, members, counts, plan } =
    await getOrganizationOverview(orgId);

  return (
    <>
      <PageHeader
        title={organization?.name ?? orgId}
        back
        description={
          organization
            ? `${orgId}${organization.slug ? ` · ${organization.slug}` : ""}`
            : "This organization no longer exists in Clerk; only its data remains."
        }
      />
      <Section title="Overview">
        <Facts
          items={[
            [
              "Plan",
              plan.isPro
                ? `Pro${plan.currentPeriodEnd ? `, renews ${format(plan.currentPeriodEnd, "MMMM d, yyyy")}` : ""}`
                : "Free",
            ],
            [
              "Created",
              organization
                ? format(organization.createdAt, "MMMM d, yyyy")
                : "Unknown",
            ],
            ["Boards", counts.boards],
            ["Cards", counts.cards],
            ["Activity entries", counts.activity],
            ["Members", organization ? members.length : "None"],
          ]}
        />
      </Section>
      {members.length > 0 && (
        <Section title="Members">
          <ul className="flex flex-col divide-y rounded-lg border text-sm">
            {members.map((member) => {
              const content = (
                <>
                  <span className="truncate font-medium">{member.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {isOrgAdmin(member.role) ? "Admin" : "Member"}
                  </span>
                </>
              );
              const className =
                "flex items-center justify-between gap-3 px-4 py-3";
              return (
                <li key={member.userId ?? member.name}>
                  {member.userId ? (
                    <Link
                      href={`/admin/users/${member.userId}`}
                      className={`${className} hover:bg-accent`}
                    >
                      {content}
                    </Link>
                  ) : (
                    <div className={className}>{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </Section>
      )}
      <Section
        title="Export data"
        description="Boards, lists, cards and activity, excluding items in the undo window. Each export is recorded in the action log."
      >
        <ExportButtons url={`/api/admin/organizations/${orgId}/export`} />
      </Section>
      <Section
        tone="danger"
        title="Delete organization"
        description={
          organization
            ? "Deletes the organization in Clerk for every member, removes its data and cancels any subscription."
            : "Removes the data left behind and cancels any subscription."
        }
      >
        <div>
          <AdminDeleteOrganizationDialog
            orgId={orgId}
            name={organization?.name ?? null}
            boards={counts.boards}
            activity={counts.activity}
            isPro={plan.isPro}
            redirectTo="/admin"
          />
        </div>
      </Section>
    </>
  );
};

export default AdminOrganizationPage;
