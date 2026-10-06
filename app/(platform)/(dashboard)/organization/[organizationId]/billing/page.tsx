import Info from "../_components/Info";
import SubscriptionButton from "./_components/SubscriptionButton";
import { MAX_FREE_BOARDS } from "@/constants/boards";
import { getAvailableCount } from "@/lib/orgLimit";
import { getSubscription } from "@/lib/subscription";
import { format } from "date-fns";
import { Check } from "lucide-react";

const BillingPage = async () => {
  const [{ isPro, periodEnd }, boardsUsed] = await Promise.all([
    getSubscription(),
    getAvailableCount(),
  ]);
  const used = Math.min(boardsUsed, MAX_FREE_BOARDS);

  return (
    <div className="flex flex-col gap-8 pb-12">
      <Info isPro={isPro} />
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[15px] font-semibold">Billing</h2>
          <p className="text-[13px] text-muted-foreground">
            Your organization&apos;s plan. Payments are handled by Stripe.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current plan</span>
              <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary-text">
                {isPro ? "Pro" : "Free"}
              </span>
            </div>
            {isPro ? (
              <div className="flex flex-col gap-1 text-sm">
                <p className="font-medium">Unlimited boards</p>
                {periodEnd && (
                  <p className="text-muted-foreground">
                    Current period ends {format(periodEnd, "MMMM d, yyyy")}.
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Boards</span>
                  <span className="text-muted-foreground">
                    {used} of {MAX_FREE_BOARDS} used
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-label="Free boards used"
                  aria-valuemin={0}
                  aria-valuemax={MAX_FREE_BOARDS}
                  aria-valuenow={used}
                  className="h-1.5 overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(used / MAX_FREE_BOARDS) * 100}%` }}
                  />
                </div>
              </div>
            )}
            <div className="mt-auto">
              <SubscriptionButton isPro={isPro} />
            </div>
          </div>
          {!isPro && (
            <div className="flex flex-col gap-4 rounded-xl border border-primary bg-card p-5">
              <span className="text-sm font-semibold text-primary-text">
                Pro
              </span>
              <p className="flex items-baseline gap-1.5">
                <span className="text-3xl font-semibold tracking-tight">
                  $20
                </span>
                <span className="text-sm text-muted-foreground">per month</span>
              </p>
              <ul className="flex flex-col gap-2 text-sm">
                <li className="flex items-center gap-2.5">
                  <Check aria-hidden className="size-4 text-primary-text" />
                  Unlimited boards for the whole organization
                </li>
                <li className="flex items-center gap-2.5">
                  <Check aria-hidden className="size-4 text-primary-text" />
                  Manage or cancel any time in the billing portal
                </li>
              </ul>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default BillingPage;
