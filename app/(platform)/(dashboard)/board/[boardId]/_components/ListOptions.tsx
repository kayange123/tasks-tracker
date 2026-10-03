"use client";

import { copyList } from "@/actions/copy-list/action";
import { deleteList } from "@/actions/delete-list/action";
import { restoreList } from "@/actions/restore-list/action";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAction } from "@/hooks/useActions";
import { cn } from "@/lib/utils";
import { Copy, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { notify } from "@/lib/notify";

interface ListOptionsProps {
  onAddCard: () => void;
  id: string;
  boardId: string;
}
const ListOptions = ({ onAddCard, id, boardId }: ListOptionsProps) => {
  const [open, setOpen] = useState(false);
  const { execute, isLoading: isDeleting } = useAction(deleteList, {
    onSuccess(list) {
      setOpen(false);
      notify.undo("List deleted", {
        description: `“${list.title}” and its cards were removed.`,
        onUndo: async () => {
          const result = await restoreList({ id: list.id, boardId });
          if (result.error) {
            notify.error("Couldn’t restore the list", {
              description: result.error,
            });
            return;
          }
          notify.success("List restored", {
            description: `“${list.title}” and its cards are back.`,
          });
        },
      });
    },
    onError(error) {
      notify.error(error);
    },
  });

  //The action to copy list
  const { execute: executeCopy, isLoading: isCopying } = useAction(copyList, {
    onSuccess(data) {
      notify.success("List copied", {
        description: `“${data?.title}” was added to the board.`,
      });
      setOpen(false);
    },
    onError(error) {
      notify.error(error);
    },
  });

  const onCopyList = () => {
    executeCopy({ id, boardId });
  };

  const onDelete = () => {
    execute({ id, boardId });
  };
  const item =
    "flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-left text-sm transition-colors disabled:opacity-50";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="List actions"
          className="text-muted-foreground"
        >
          <MoreHorizontal />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        className="flex w-56 flex-col gap-0.5 rounded-xl p-1.5"
      >
        <p className="px-2.5 pt-1.5 pb-1 text-xs font-medium text-muted-foreground">
          List actions
        </p>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onAddCard();
          }}
          className={cn(item, "hover:bg-accent")}
        >
          <Plus aria-hidden className="size-4" />
          Add card
        </button>
        <button
          type="button"
          onClick={onCopyList}
          disabled={isCopying}
          className={cn(item, "hover:bg-accent")}
        >
          <Copy aria-hidden className="size-4" />
          {isCopying ? "Copying…" : "Copy list"}
        </button>
        <span role="separator" className="mx-1.5 my-1 h-px bg-border" />
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className={cn(
            item,
            "text-destructive-text hover:bg-destructive-soft"
          )}
        >
          <Trash2 aria-hidden className="size-4" />
          {isDeleting ? "Deleting…" : "Delete list"}
        </button>
      </PopoverContent>
    </Popover>
  );
};

export default ListOptions;
