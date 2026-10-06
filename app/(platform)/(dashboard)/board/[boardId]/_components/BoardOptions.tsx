"use client";

import { deleteBoard } from "@/actions/delete-board/action";
import { restoreBoard } from "@/actions/restore-board/action";
import { useProModal } from "@/hooks/useProModal";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAction } from "@/hooks/useActions";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { notify } from "@/lib/notify";
import { useRouter } from "next/navigation";

interface BoardOptionsProps {
  id: string;
}

const BoardOptions = ({ id }: BoardOptionsProps) => {
  const router = useRouter();
  const { execute, isLoading } = useAction(deleteBoard, {
    onSuccess(board) {
      router.push(`/organization/${board.orgId}`);
      notify.undo("Board deleted", {
        description: `“${board.title}” and all of its lists were removed.`,
        onUndo: async () => {
          const result = await restoreBoard({ id: board.id });
          if (result.error) {
            notify.error("Couldn’t restore the board", {
              description: result.error,
            });
            // Restoring needs a free slot, like creating a board
            if (result.error.includes("upgrade")) {
              useProModal.getState().onOpen();
            }
            return;
          }
          notify.success("Board restored", {
            description: `“${board.title}” is back.`,
          });
          router.push(`/board/${board.id}`);
        },
      });
    },
    onError(error) {
      notify.error("Couldn’t delete the board", { description: error });
    },
  });

  const onDelete = () => {
    execute({ id });
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Board actions"
          className="text-muted-foreground"
        >
          <MoreHorizontal />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        className="flex w-56 flex-col gap-0.5 rounded-xl p-1.5"
      >
        <p className="px-2.5 pt-1.5 pb-1 text-xs font-medium text-muted-foreground">
          Board actions
        </p>
        <button
          type="button"
          onClick={onDelete}
          disabled={isLoading}
          className="flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-left text-sm text-destructive-text transition-colors hover:bg-destructive-soft disabled:opacity-50"
        >
          <Trash2 aria-hidden className="size-4" />
          {isLoading ? "Deleting…" : "Delete board"}
        </button>
      </PopoverContent>
    </Popover>
  );
};

export default BoardOptions;
