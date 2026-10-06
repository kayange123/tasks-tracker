import ExportButtons from "@/components/ExportButtons";
import { db } from "@/lib/prisma";
import { active } from "@/lib/softDelete";
import { clerkClient } from "@clerk/nextjs/server";
import DeleteOrganizationDialog from "./DeleteOrganizationDialog";

interface OrganizationDataProps {
  orgId: string;
  isAdmin: boolean;
  isPro: boolean;
}

const OrganizationData = async ({
  orgId,
  isAdmin,
  isPro,
}: OrganizationDataProps) => {
  // Only admins see the deletion summary, so only they pay for the lookups
  const [organization, boards, cards] = isAdmin
    ? await Promise.all([
        clerkClient().then((client) =>
          client.organizations.getOrganization({ organizationId: orgId }),
        ),
        db.board.count({ where: { orgId, ...active } }),
        db.card.count({ where: { list: { board: { orgId } }, ...active } }),
      ])
    : [null, 0, 0];

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-[15px] font-semibold">Data</h2>
        <p className="text-[13px] text-muted-foreground">
          Export or permanently delete this organization’s boards, lists, cards
          and activity.
        </p>
      </div>
      {!isAdmin && (
        <p className="rounded-lg bg-muted px-4 py-3 text-[13px] text-muted-foreground">
          Only organization admins can export or delete this organization.
        </p>
      )}
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-5">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-medium">Export data</h3>
          <p className="text-[13px] text-muted-foreground">
            Everything in the organization, except items in the 7-day undo
            window. JSON keeps boards, lists and cards nested; the zip has a CSV
            file per table for spreadsheets.
          </p>
        </div>
        <ExportButtons
          url={`/api/organizations/${orgId}/export`}
          disabled={!isAdmin}
        />
      </div>
      <div className="flex flex-col gap-4 rounded-xl border border-destructive/40 bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-medium text-destructive-text">
            Delete organization
          </h3>
          <p className="text-[13px] text-muted-foreground">
            Permanently removes the organization and its data for every member
            {isPro ? " and cancels the Pro subscription" : ""}. This can’t be
            undone.
          </p>
        </div>
        <DeleteOrganizationDialog
          organizationId={orgId}
          name={organization?.name ?? ""}
          boards={boards}
          cards={cards}
          isPro={isPro}
          disabled={!isAdmin}
        />
      </div>
    </section>
  );
};

export default OrganizationData;
