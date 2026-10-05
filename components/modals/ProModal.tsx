"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProModal } from "@/hooks/useProModal";
import { useUsage } from "@/hooks/useUsage";
import { Button } from "../ui/button";
import { useAction } from "@/hooks/useActions";
import { stripeRedirect } from "@/actions/stripe-redirect/action";
import { notify } from "@/lib/notify";
import { useOrganization } from "@clerk/nextjs";
import { Check, Lock } from "lucide-react";

// Only rendered while open, so usage is fetched fresh each time
const ProModalBody = ({ onClose }: { onClose: () => void }) => {
  const { organization } = useOrganization();
  const usage = useUsage(organization?.id);

  const { execute, isLoading } = useAction(stripeRedirect, {
    onSuccess(data) {
      notify.loading("Redirecting to Stripe…", {
        description: "Opening secure checkout.",
      });
      window.location.href = data;
    },
    onError(error) {
      notify.error(error);
    },
  });

  const orgName = organization?.name ?? "your organization";
  const limit = usage?.limit ?? 5;
  const used = usage ? Math.min(usage.boards, usage.limit) : undefined;
  const atLimit = usage !== undefined && used !== undefined && used >= limit;

  return (
    <div className="flex flex-col gap-5.5">
      <span className="w-fit rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary-text">
        Pro
      </span>

      <div className="flex flex-col gap-2">
        <DialogTitle className="text-[22px] leading-tight font-semibold tracking-tight">
          {atLimit ? "You’ve reached the free board limit" : "Upgrade to Pro"}
        </DialogTitle>
        <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
          {atLimit
            ? `${orgName} is using all ${limit} free boards. Upgrade to Pro to keep creating boards for the whole organization.`
            : `Pro removes the ${limit}-board limit for ${orgName}.`}
        </DialogDescription>
      </div>

      {used !== undefined && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-[13px]">
            <span className="font-medium">Free plan</span>
            <span className="text-muted-foreground">
              {used} of {limit} boards
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="Free boards used"
            aria-valuemin={0}
            aria-valuemax={limit}
            aria-valuenow={used}
            className="h-1.5 overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${(used / limit) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-xl border p-4">
        <p className="flex items-baseline gap-1.5">
          <span className="text-[28px] font-semibold tracking-tight">$20</span>
          <span className="text-sm text-muted-foreground">
            per month, billed monthly
          </span>
        </p>
        <ul className="flex flex-col gap-2 text-sm">
          <li className="flex items-center gap-2.5">
            <Check aria-hidden className="size-4 shrink-0 text-primary-text" />
            Unlimited boards for {orgName}
          </li>
          <li className="flex items-center gap-2.5">
            <Check aria-hidden className="size-4 shrink-0 text-primary-text" />
            Manage or cancel any time in the billing portal
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-2.5">
        <Button
          onClick={() => execute({})}
          disabled={isLoading}
          className="h-10.5"
        >
          {isLoading ? "Opening checkout…" : "Continue to checkout"}
        </Button>
        <Button variant="outline" onClick={onClose} className="h-10.5">
          Not now
        </Button>
        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Lock aria-hidden className="size-3.5" />
          You’ll pay securely on Stripe.
        </p>
      </div>
    </div>
  );
};

const ProModal = () => {
  const proModal = useProModal();

  return (
    <Dialog open={proModal.isOpen} onOpenChange={proModal.onClose}>
      <DialogContent className="rounded-2xl bg-card p-7 sm:max-w-120">
        {proModal.isOpen && <ProModalBody onClose={proModal.onClose} />}
      </DialogContent>
    </Dialog>
  );
};

export default ProModal;
