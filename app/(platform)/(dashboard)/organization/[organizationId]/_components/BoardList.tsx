import Hint from "@/components/Hint";
import FormPopover from "@/components/form/form-popover";
import { Skeleton } from "@/components/ui/skeleton";
import { MAX_FREE_BOARDS } from "@/constants/boards";
import { getAvailableCount } from "@/lib/orgLimit";
import { db } from "@/lib/prisma";
import { active } from "@/lib/softDelete";
import { checkSubscription } from "@/lib/subscription";
import { auth } from "@clerk/nextjs/server";
import { HelpCircle, User } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const BoardList = async () => {
  const { orgId } = await auth();
  if (!orgId) redirect("/select-org");

  let boards;
  try {
    boards = await db.board.findMany({
      where: {
        orgId,
        ...active,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    //console.log(error);
  }

  const availableCount = await getAvailableCount();
  const isPro = await checkSubscription();

  return (
    <div className="space-y-4">
      <div className="flex items-center font-semibold text-lg text-neutral-700">
        <User className="w-6 h-6 mr-2" />
        <p>Your boards</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {boards &&
          boards.map((board) => (
            <Link
              key={board.id}
              href={`/board/${board.id}`}
              className="group relative aspect-video bg-no-repeat bg-center bg-cover bg-sky-700 rounded-sm w-full h-full overflow-hidden p-2"
              style={{ backgroundImage: `url(${board.imageThumbUrl})` }}
            >
              <div className="absolute inset-0 bg-black/30 transition group-hover:bg-black/40" />
              <p className="text-white text-sm truncate text-muted-foreground relative">
                {board.title}
              </p>
            </Link>
          ))}
        <FormPopover side="bottom" sideOffset={10}>
          <div
            className="aspect-video p-4 relative hover:opacity-75 transition items-center justify-center h-full w-full bg-muted rounded-sm flex flex-col gap-y-1"
            role="button"
          >
            <p className="text-sm text-muted-foreground">Create your board</p>
            <span className="text-xs">
              {isPro
                ? "Unlimited boards"
                : `${MAX_FREE_BOARDS - availableCount} remaining`}
            </span>
            {!isPro && (
              <Hint
                description={`Free workspaces can have atmost 5 boards, For unlimited boards upgrade this workspace`}
                sideOffset={40}
              >
                <HelpCircle className="w-4 h-4 absolute bottom-2 right-2" />
              </Hint>
            )}
          </div>
        </FormPopover>
      </div>
    </div>
  );
};

BoardList.Skeleton = function BoardListSkeleton() {
  return (
    <div className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <Skeleton className="aspect-video w-full h-full p-2" />
      <Skeleton className="aspect-video w-full h-full p-2" />
      <Skeleton className="aspect-video w-full h-full p-2" />
      <Skeleton className="aspect-video w-full h-full p-2" />
      <Skeleton className="aspect-video w-full h-full p-2" />
      <Skeleton className="aspect-video w-full h-full p-2" />
      <Skeleton className="aspect-video w-full h-full p-2" />
      <Skeleton className="aspect-video w-full h-full p-2" />
      <Skeleton className="aspect-video w-full h-full p-2" />
    </div>
  );
};

export default BoardList;
