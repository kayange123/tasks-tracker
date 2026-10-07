"use client";

import { adminDeleteUser } from "@/actions/admin-delete-user/action";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import { notify } from "@/lib/notify";
import { useRouter } from "next/navigation";

interface AdminDeleteUserDialogProps {
  userId: string;
  label: string;
  soleMemberOrganizations: string[];
  blockingOrganizations: string[];
}

const AdminDeleteUserDialog = ({
  userId,
  label,
  soleMemberOrganizations,
  blockingOrganizations,
}: AdminDeleteUserDialogProps) => {
  const router = useRouter();

  return (
    <ConfirmDeleteDialog
      triggerLabel="Delete user"
      title={`Delete ${label}?`}
      description="Deletes the account in Clerk and removes the person’s details. This can’t be undone and is recorded in the action log."
      consequences={[
        "The Clerk account and its sign-ins",
        "Name and photo on activity entries, replaced with “Deleted user”",
        ...soleMemberOrganizations.map(
          (name) => `${name}, where they are the only member, with its data`,
        ),
        ...blockingOrganizations.map(
          (name) => `${name} is left without an admin`,
        ),
      ]}
      confirmText={userId}
      submitLabel="Delete user"
      action={adminDeleteUser}
      input={{ userId }}
      onSuccess={() => {
        notify.success("User deleted", { description: userId });
        router.replace("/admin");
        router.refresh();
      }}
    />
  );
};

export default AdminDeleteUserDialog;
