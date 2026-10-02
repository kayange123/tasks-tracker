import FormPopover from "@/components/form/form-popover";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MAX_FREE_BOARDS } from "@/constants/boards";
import { getAvailableCount } from "@/lib/orgLimit";
import { db } from "@/lib/prisma";
import { active } from "@/lib/softDelete";
import { checkSubscription } from "@/lib/subscription";
import { unsplashWidth } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { LayoutGrid, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

const plural = (count: number, word: string) =>
  `${count} ${count === 1 ? word : `${word}s`}`;

const BoardList = async () => {
  const { orgId } = await auth();
  if (!orgId) redirect("/select-org");

  const [boards, availableCount, isPro] = await Promise.all([
    db.board.findMany({
      where: { orgId, ...active },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        imageThumbUrl: true,
        lists: {
          where: active,
          select: { _count: { select: { cards: { where: active } } } },
        },
      },
    }),
    getAvailableCount(),
    checkSubscription(),
  ]);

  const remaining = Math.max(0, MAX_FREE_BOARDS - availableCount);

  return (
    <section className="flex flex-col gap-3.5">
      <h2 className="text-[15px] font-semibold">Your boards</h2>
      {boards.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary-text">
            <LayoutGrid aria-hidden className="size-5" />
          </span>
          <h3 className="text-base font-semibold">No boards yet</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Create a board to organize your team&apos;s work into lists and
            cards.
          </p>
          <FormPopover side="bottom" align="center" sideOffset={8}>
            <Button className="mt-1">
              <Plus />
              Create your first board
            </Button>
          </FormPopover>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {boards.map((board) => {
            const cards = board.lists.reduce(
              (total, list) => total + list._count.cards,
              0
            );
            return (
              <Link
                key={board.id}
                href={`/board/${board.id}`}
                className="group flex flex-col overflow-hidden rounded-xl border bg-card outline-none transition-shadow hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <div className="relative h-24 overflow-hidden bg-muted">
                  <Image
                    src={unsplashWidth(board.imageThumbUrl, 640)}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 480px) 50vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
                  />
                </div>
                <div className="flex flex-col gap-1 px-3.5 py-3">
                  <span className="truncate text-sm font-semibold">
                    {board.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {plural(board.lists.length, "list")} ·{" "}
                    {plural(cards, "card")}
                  </span>
                </div>
              </Link>
            );
          })}
          <FormPopover side="bottom" align="center" sideOffset={8}>
            <button
              type="button"
              className="flex min-h-[154px] flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-input text-muted-foreground outline-none transition-colors hover:border-primary hover:bg-primary-soft focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <Plus aria-hidden className="size-5" />
              <span className="text-sm font-medium text-foreground">
                Create new board
              </span>
              <span className="text-xs">
                {isPro ? "Unlimited boards" : `${remaining} remaining`}
              </span>
            </button>
          </FormPopover>
        </div>
      )}
    </section>
  );
};

BoardList.Skeleton = function BoardListSkeleton() {
  return (
    <section className="flex flex-col gap-3.5" aria-busy="true">
      <Skeleton className="h-5 w-28" />
      <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl border bg-card"
          >
            <Skeleton className="h-24 rounded-none" />
            <div className="flex flex-col gap-2 px-3.5 py-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BoardList;
