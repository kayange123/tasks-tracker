import { Skeleton } from "@/components/ui/skeleton";

// Shared loading state for console pages: header and a few cards
const AdminSkeleton = () => (
  <div className="flex flex-col gap-8" aria-busy="true">
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-7 w-64 max-w-full" />
      <Skeleton className="h-4 w-80 max-w-full" />
    </div>
    <Skeleton className="h-40 rounded-xl" />
    <Skeleton className="h-28 rounded-xl" />
    <Skeleton className="h-24 rounded-xl" />
  </div>
);

export default AdminSkeleton;
