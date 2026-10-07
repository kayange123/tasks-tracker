"use client";

import { adminDeleteOrganization } from "@/actions/admin-delete-organization/action";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import { notify } from "@/lib/notify";
import { useRouter } from "next/navigation";

interface AdminDeleteOrganizationDialogProps {
  orgId: string;
  name: string | null;
  boards: number;
  activity: number;
  isPro: boolean;
  // Where to go afterwards; the orphans list stays on its page
  redirectTo?: string;
  triggerLabel?: string;
}

const AdminDeleteOrganizationDialog = ({
  orgId,
  name,
  boards,
  activity,
  isPro,
  redirectTo,
  triggerLabel = "Delete organization",
}: AdminDeleteOrganizationDialogProps) => {
  const router = useRouter();

  return (
    <ConfirmDeleteDialog
      triggerLabel={triggerLabel}
      title={`Delete ${name ?? orgId}?`}
      description={
        name
          ? "Deletes the organization in Clerk for every member and removes its data. This can’t be undone and is recorded in the action log."
          : "This organization no longer exists in Clerk. Its remaining data is removed. This can’t be undone and is recorded in the action log."
      }
      consequences={[
        `${boards} ${boards === 1 ? "board" : "boards"} with their lists and cards`,
        `${activity} activity ${activity === 1 ? "entry" : "entries"}`,
        ...(isPro ? ["The Pro subscription, cancelled right away"] : []),
      ]}
      confirmText={orgId}
      submitLabel="Delete organization"
      action={adminDeleteOrganization}
      input={{ orgId }}
      onSuccess={() => {
        notify.success("Organization deleted", { description: orgId });
        if (redirectTo) router.replace(redirectTo);
        router.refresh();
      }}
    />
  );
};

export default AdminDeleteOrganizationDialog;
