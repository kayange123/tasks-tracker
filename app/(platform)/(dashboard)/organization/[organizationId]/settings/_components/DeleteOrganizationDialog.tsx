"use client";

import { deleteOrganization } from "@/actions/delete-organization/action";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import { notify } from "@/lib/notify";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface DeleteOrganizationDialogProps {
  organizationId: string;
  name: string;
  boards: number;
  cards: number;
  isPro: boolean;
  disabled?: boolean;
}

const plural = (count: number, word: string) =>
  `${count} ${count === 1 ? word : `${word}s`}`;

const DeleteOrganizationDialog = ({
  organizationId,
  name,
  boards,
  cards,
  isPro,
  disabled,
}: DeleteOrganizationDialogProps) => {
  const router = useRouter();
  const { setActive } = useClerk();

  return (
    <ConfirmDeleteDialog
      triggerLabel="Delete organization"
      disabled={disabled}
      title={`Delete ${name}?`}
      description="This permanently deletes the organization for every member. It can’t be undone."
      consequences={[
        `${plural(boards, "board")} and ${plural(cards, "card")}`,
        "All lists and the activity history",
        "Members lose access immediately",
        ...(isPro ? ["The Pro subscription is cancelled right away"] : []),
      ]}
      note="Download an export first if you want to keep a copy."
      confirmText={name}
      submitLabel="Delete organization"
      action={deleteOrganization}
      input={{ organizationId }}
      onSuccess={async (data) => {
        notify.success("Organization deleted", {
          description: `${data.name} and all of its data were removed.`,
        });
        await setActive({ organization: null });
        router.replace("/select-org");
      }}
    />
  );
};

export default DeleteOrganizationDialog;
