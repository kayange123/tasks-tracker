import ActivityItem from "@/components/ActivityItem";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const ACTIVITY_PAGE_SIZE = 30;

interface ActivityListProps {
  page: number;
}

const ActivityList = async ({ page }: ActivityListProps) => {
  const { orgId } = await auth();
  if (!orgId) redirect("/select-org");

  // One extra row tells us whether an older page exists
  const logs = await db.auditLog.findMany({
    where: { orgId },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * ACTIVITY_PAGE_SIZE,
    take: ACTIVITY_PAGE_SIZE + 1,
  });
  const hasOlder = logs.length > ACTIVITY_PAGE_SIZE;
  const items = logs.slice(0, ACTIVITY_PAGE_SIZE);
  const href = (target: number) =>
    target === 1
      ? `/organization/${orgId}/activity`
      : `/organization/${orgId}/activity?page=${target}`;

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
        {page === 1
          ? "No activity yet. Changes to boards, lists and cards will show up here."
          : "There's no activity on this page."}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ol className="divide-y rounded-xl border bg-card [&>li]:px-4 [&>li]:py-3">
        {items.map((log) => (
          <ActivityItem key={log.id} log={log} />
        ))}
      </ol>
      {(page > 1 || hasOlder) && (
        <nav
          aria-label="Activity pages"
          className="flex items-center justify-between gap-3"
        >
          {page > 1 ? (
            <Button asChild variant="outline" size="sm">
              <Link href={href(page - 1)}>
                <ChevronLeft />
                Newer
              </Link>
            </Button>
          ) : (
            <span />
          )}
          <span className="text-[13px] text-muted-foreground">Page {page}</span>
          {hasOlder ? (
            <Button asChild variant="outline" size="sm">
              <Link href={href(page + 1)}>
                Older
                <ChevronRight />
              </Link>
            </Button>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
};

ActivityList.Skeleton = function ActivityListSkeleton() {
  return (
    <div className="divide-y rounded-xl border bg-card" aria-busy="true">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="size-7 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
};

export default ActivityList;
