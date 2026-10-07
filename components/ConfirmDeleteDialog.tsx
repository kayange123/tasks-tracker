"use client";

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
import { ActionState } from "@/lib/createActions";
import { notify } from "@/lib/notify";
import { submitForm } from "@/lib/submitForm";
import { useId, useState } from "react";

type ConfirmInput = { confirmation: string };

interface ConfirmDeleteDialogProps<TInput extends ConfirmInput, TOutput> {
  triggerLabel: string;
  disabled?: boolean;
  title: string;
  description: string;
  // What will be removed, shown as a list
  consequences: string[];
  note?: string;
  // Text the person must type to enable the delete button
  confirmText: string;
  submitLabel: string;
  action: (input: TInput) => Promise<ActionState<TInput, TOutput>>;
  // The action's input apart from the typed confirmation
  input: Omit<TInput, "confirmation">;
  onSuccess: (data: TOutput) => void | Promise<void>;
}

// Rendered only while open, so every open starts empty with no old errors
const ConfirmDeleteForm = <TInput extends ConfirmInput, TOutput>({
  title,
  description,
  consequences,
  note,
  confirmText,
  submitLabel,
  action,
  input,
  onSuccess,
}: ConfirmDeleteDialogProps<TInput, TOutput>) => {
  const id = useId();
  const [confirmation, setConfirmation] = useState("");
  const { execute, fieldErrors, isLoading } = useAction(action, {
    onSuccess,
    onError: (error) => notify.error(error),
  });

  const error = fieldErrors?.confirmation?.[0];
  const matches = confirmation.trim() === confirmText;

  return (
    <form
      onSubmit={submitForm(() => execute({ ...input, confirmation } as TInput))}
      className="flex flex-col gap-5"
    >
      <div className="flex flex-col gap-2">
        <DialogTitle className="text-lg font-semibold break-words">
          {title}
        </DialogTitle>
        <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </DialogDescription>
      </div>

      <ul className="flex list-disc flex-col gap-1.5 rounded-lg bg-destructive-soft py-3 pr-4 pl-8 text-sm">
        {consequences.map((consequence) => (
          <li key={consequence}>{consequence}</li>
        ))}
      </ul>

      {note && <p className="text-sm text-muted-foreground">{note}</p>}

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor={id}
          className="block text-[13px] leading-snug font-medium"
        >
          Type <span className="font-semibold break-all">{confirmText}</span> to
          confirm
        </Label>
        <Input
          id={id}
          name="confirmation"
          autoComplete="off"
          disabled={isLoading}
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {error && (
          <p id={`${id}-error`} className="text-xs text-destructive-text">
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
          {isLoading ? "Deleting…" : submitLabel}
        </Button>
      </div>
    </form>
  );
};

// A permanent deletion confirmed by typing a name or id
const ConfirmDeleteDialog = <TInput extends ConfirmInput, TOutput>(
  props: ConfirmDeleteDialogProps<TInput, TOutput>,
) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" disabled={props.disabled}>
          {props.triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl bg-card p-6 sm:max-w-110">
        {open && <ConfirmDeleteForm {...props} />}
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;
