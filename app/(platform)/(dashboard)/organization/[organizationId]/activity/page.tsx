import { Suspense } from "react";
import Info from "../_components/Info";
import ActivityList from "./_components/ActivityList";
import { checkSubscription } from "@/lib/subscription";

const ActivityPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) => {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const isPro = await checkSubscription();

  return (
    <div className="flex flex-col gap-8 pb-12">
      <Info isPro={isPro} />
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[15px] font-semibold">Activity</h2>
          <p className="text-[13px] text-muted-foreground">
            Every change to boards, lists and cards in this organization.
          </p>
        </div>
        {/* Keyed by page so another page's entries never stay on screen */}
        <Suspense key={page} fallback={<ActivityList.Skeleton />}>
          <ActivityList page={page} />
        </Suspense>
      </section>
    </div>
  );
};

export default ActivityPage;
