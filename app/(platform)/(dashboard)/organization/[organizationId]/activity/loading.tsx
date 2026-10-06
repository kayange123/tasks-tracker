import { Skeleton } from "@/components/ui/skeleton";
import OrganizationHeaderSkeleton from "../_components/OrganizationHeaderSkeleton";
import ActivityList from "./_components/ActivityList";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8 pb-12" aria-busy="true">
      <OrganizationHeaderSkeleton />
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <ActivityList.Skeleton />
      </section>
    </div>
  );
}
