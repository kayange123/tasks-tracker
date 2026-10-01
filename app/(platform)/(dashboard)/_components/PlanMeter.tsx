"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useProModal } from "@/hooks/useProModal";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

interface Usage {
  orgId: string;
  boards: number;
  limit: number;
  isPro: boolean;
}

const fetchUsage = async (organizationId: string): Promise<Usage> => {
  const response = await fetch(`/api/organizations/${organizationId}/usage`);
  if (!response.ok) {
    throw new Error(`Usage request failed: ${response.status}`);
  }
  return response.json();
};

// Free-plan board usage for the organization in the URL
const PlanMeter = () => {
  const { organizationId } = useParams<{ organizationId?: string }>();
  const proModal = useProModal();

  const { data } = useQuery({
    queryKey: ["usage", organizationId],
    queryFn: () => fetchUsage(organizationId!),
    enabled: !!organizationId,
    // Fresh numbers on every visit; while the org switch is still in
    // progress the API answers 409, so keep retrying briefly
    gcTime: 0,
    retry: 5,
    retryDelay: 500,
  });

  if (!organizationId) return null;

  // Only render numbers that belong to the organization being viewed
  if (!data || data.orgId !== organizationId) {
    return <Skeleton className="h-[104px] w-full rounded-xl" />;
  }

  if (data.isPro) {
    return (
      <div className="rounded-xl border p-3.5 text-[13px]">
        <p className="font-medium">Pro plan</p>
        <p className="text-muted-foreground">Unlimited boards</p>
      </div>
    );
  }

  const used = Math.min(data.boards, data.limit);
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border p-3.5">
      <div className="flex justify-between text-[13px]">
        <span className="font-medium">Free plan</span>
        <span className="text-muted-foreground">
          {used} of {data.limit} boards
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Free boards used"
        aria-valuemin={0}
        aria-valuemax={data.limit}
        aria-valuenow={used}
        className="h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${(used / data.limit) * 100}%` }}
        />
      </div>
      <button
        type="button"
        onClick={proModal.onOpen}
        className="text-left text-[13px] font-medium text-primary-text hover:underline"
      >
        Upgrade to Pro for unlimited boards
      </button>
    </div>
  );
};

export default PlanMeter;
