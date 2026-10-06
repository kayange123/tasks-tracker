"use client";

import { deleteAccountAction } from "@/actions/delete-account/action";
import { CONFIRMATION_PHRASE } from "@/actions/delete-account/schema";
import ExportButtons from "@/components/ExportButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAction } from "@/hooks/useActions";
import type { AccountDeletionPlan } from "@/lib/accountDeletion";
import { notify } from "@/lib/notify";
import { submitForm } from "@/lib/submitForm";
import { useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";

type PlanState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; plan: AccountDeletionPlan };

const names = (organizations: { name: string }[]) =>
  organizations.map((organization) => organization.name).join(", ");

const DeleteAccount = () => {
  const { signOut } = useClerk();
  const [state, setState] = useState<PlanState>({ status: "loading" });
  const [confirmation, setConfirmation] = useState("");

  // Checked each time the page opens, since memberships can change
  useEffect(() => {
    let cancelled = false;
    fetch("/api/me/deletion-plan", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((plan: AccountDeletionPlan) => {
        if (!cancelled) setState({ status: "ready", plan });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const { execute, fieldErrors, isLoading } = useAction(deleteAccountAction, {
    onSuccess: async () => {
      notify.success("Account deleted", {
        description: "Your account and personal details were removed.",
      });
      await signOut({ redirectUrl: "/" });
    },
    onError: (error) => notify.error(error),
  });

  if (state.status === "loading") {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-9 w-40" />
      </div>
    );
  }
  if (state.status === "error") {
    return (
      <p className="text-[13px] text-destructive-text">
        Couldn’t check your organizations. Close this window and try again.
      </p>
    );
  }

  const { blockingOrganizations, soleMemberOrganizations } = state.plan;
  const isBlocked = blockingOrganizations.length > 0;
  const error = fieldErrors?.confirmation?.[0];
  const matches = confirmation.trim().toLowerCase() === CONFIRMATION_PHRASE;

  return (
    <form
      onSubmit={submitForm(() => execute({ confirmation }))}
      className="flex flex-col gap-4"
    >
      <p className="text-[13px] text-muted-foreground">
        Permanently deletes your account and signs you out everywhere. Your
        activity in organizations stays, shown as “Deleted user”.
      </p>

      {isBlocked && (
        <p className="rounded-lg bg-destructive-soft px-4 py-3 text-[13px]">
          You’re the only admin of {names(blockingOrganizations)}, which{" "}
          {blockingOrganizations.length === 1 ? "has" : "have"} other members.
          Make someone else an admin or delete the organization first.
        </p>
      )}
      {!isBlocked && soleMemberOrganizations.length > 0 && (
        <p className="rounded-lg bg-muted px-4 py-3 text-[13px]">
          You’re the only member of {names(soleMemberOrganizations)}.{" "}
          {soleMemberOrganizations.length === 1 ? "It" : "They"} will be
          deleted with all boards and data, and any Pro subscription cancelled.
        </p>
      )}

      {!isBlocked && (
        <>
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="account-confirmation"
              className="text-[13px] font-medium"
            >
              Type <span className="font-semibold">{CONFIRMATION_PHRASE}</span>{" "}
              to confirm
            </Label>
            <Input
              id="account-confirmation"
              name="confirmation"
              autoComplete="off"
              disabled={isLoading}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              aria-invalid={!!error || undefined}
              aria-describedby={error ? "account-confirmation-error" : undefined}
            />
            {error && (
              <p
                id="account-confirmation-error"
                className="text-xs text-destructive-text"
              >
                {error}
              </p>
            )}
          </div>
          <Button
            type="submit"
            variant="destructive"
            className="self-start"
            disabled={!matches || isLoading}
          >
            {isLoading ? "Deleting…" : "Delete my account"}
          </Button>
        </>
      )}
    </form>
  );
};

// Custom page in Clerk's account dialog
const DataPrivacyPage = () => (
  <div className="flex flex-col gap-8 text-foreground">
    <h1 className="text-[17px] font-semibold">Data & privacy</h1>
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-medium">Download your data</h2>
        <p className="text-[13px] text-muted-foreground">
          Your profile, organization memberships and the activity you’ve
          created. Organization admins can export boards and cards from
          organization settings.
        </p>
      </div>
      <ExportButtons url="/api/me/export" />
    </section>
    <section className="flex flex-col gap-3 border-t pt-6">
      <h2 className="text-sm font-medium text-destructive-text">
        Delete account
      </h2>
      <DeleteAccount />
    </section>
  </div>
);

export default DataPrivacyPage;
