import { Skeleton } from "@/components/ui/skeleton";
import OrganizationHeaderSkeleton from "../_components/OrganizationHeaderSkeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8 pb-12" aria-busy="true">
      <OrganizationHeaderSkeleton />
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </section>
    </div>
  );
}
