import { Board } from "@prisma/client";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { unsplashWidth } from "@/lib/utils";
import BoardTitleForm from "./boardTitleForm";
import BoardOptions from "./BoardOptions";

interface BoardNavbarProps {
  board: Board;
}

const BoardNavbar = ({ board }: BoardNavbarProps) => {
  return (
    <div className="flex h-16 shrink-0 items-center gap-2.5 border-b bg-card px-4 md:gap-3 md:px-7">
      <Link
        href={`/organization/${board.orgId}`}
        className="hidden rounded-sm text-[13px] text-muted-foreground transition-colors hover:text-foreground sm:block"
      >
        Boards
      </Link>
      <ChevronRight
        aria-hidden
        className="hidden size-3.5 shrink-0 text-muted-foreground sm:block"
      />
      <span className="relative size-7 shrink-0 overflow-hidden rounded-md bg-muted">
        <Image
          src={unsplashWidth(board.imageThumbUrl, 112)}
          alt=""
          fill
          sizes="28px"
          className="object-cover"
        />
      </span>
      {/* Remount when the saved title changes so local state can't go stale */}
      <BoardTitleForm
        key={`${board.id}:${board.title}`}
        id={board.id}
        title={board.title}
      />
      <div className="ml-auto flex items-center gap-3">
        <a
          href={board.imageLinkHTML}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden rounded-sm text-xs text-muted-foreground hover:underline lg:block"
        >
          Photo by {board.imageUserName} on Unsplash
        </a>
        <BoardOptions id={board.id} />
      </div>
    </div>
  );
};

export default BoardNavbar;
