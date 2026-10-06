"use client";

import { deleteOrganization } from "@/actions/delete-organization/action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAction } from "@/hooks/useActions";
import { notify } from "@/lib/notify";
import { submitForm } from "@/lib/submitForm";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

// Rendered only while open, so every open starts with an empty confirmation
const DeleteOrganizationForm = ({
  organizationId,
  name,
  boards,
  cards,
  isPro,
}: DeleteOrganizationDialogProps) => {
  const router = useRouter();
  const { setActive } = useClerk();
  const [confirmation, setConfirmation] = useState("");

  const { execute, fieldErrors, isLoading } = useAction(deleteOrganization, {
    onSuccess: async (data) => {
      notify.success("Organization deleted", {
        description: `${data.name} and all of its data were removed.`,
      });
      await setActive({ organization: null });
      router.replace("/select-org");
    },
    onError: (error) => notify.error(error),
  });

  const error = fieldErrors?.confirmation?.[0];
  const matches = confirmation.trim() === name;

  return (
    <form
      onSubmit={submitForm(() => execute({ organizationId, confirmation }))}
      className="flex flex-col gap-5"
    >
      <div className="flex flex-col gap-2">
        <DialogTitle className="text-lg font-semibold">
          Delete {name}?
        </DialogTitle>
        <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
          This permanently deletes the organization for every member. It
          can’t be undone.
        </DialogDescription>
      </div>

      <ul className="flex list-disc flex-col gap-1.5 rounded-lg bg-destructive-soft py-3 pr-4 pl-8 text-sm">
        <li>
          {plural(boards, "board")} and {plural(cards, "card")}
        </li>
        <li>All lists and the activity history</li>
        <li>Members lose access immediately</li>
        {isPro && <li>The Pro subscription is cancelled right away</li>}
      </ul>

      <p className="text-sm text-muted-foreground">
        Download an export first if you want to keep a copy.
      </p>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmation" className="text-[13px] font-medium">
          Type <span className="font-semibold">{name}</span> to confirm
        </Label>
        <Input
          id="confirmation"
          name="confirmation"
          autoComplete="off"
          disabled={isLoading}
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? "confirmation-error" : undefined}
        />
        {error && (
          <p id="confirmation-error" className="text-xs text-destructive-text">
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isLoading}>
            Cancel
          </Button>
        </DialogClose>
        <Button
          type="submit"
          variant="destructive"
          disabled={!matches || isLoading}
        >
          {isLoading ? "Deleting…" : "Delete organization"}
        </Button>
      </div>
    </form>
  );
};

const DeleteOrganizationDialog = (props: DeleteOrganizationDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" disabled={props.disabled}>
          Delete organization
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl bg-card p-6 sm:max-w-110">
        {open && <DeleteOrganizationForm {...props} />}
      </DialogContent>
    </Dialog>
  );
};

export default DeleteOrganizationDialog;
