import { Skeleton } from "@/components/ui/skeleton";
import BoardList from "./BoardList";

// Placeholder for organization pages while they load or while the
// organization in the URL is being activated
const OrganizationSkeleton = () => {
  return (
    <div className="flex flex-col gap-8 pb-12" aria-busy="true">
      <div className="flex items-center gap-3.5">
        <Skeleton className="size-12 shrink-0 rounded-xl" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <BoardList.Skeleton />
    </div>
  );
};

export default OrganizationSkeleton;
