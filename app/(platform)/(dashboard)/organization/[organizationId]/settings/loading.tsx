import { Skeleton } from "@/components/ui/skeleton";
import OrganizationHeaderSkeleton from "../_components/OrganizationHeaderSkeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8 pb-12" aria-busy="true">
      <OrganizationHeaderSkeleton />
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        <Skeleton className="h-[520px] rounded-xl" />
      </section>
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </section>
    </div>
  );
}
