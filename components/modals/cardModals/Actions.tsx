"use client";

import { copyCard } from "@/actions/copy-card/action";
import { deleteCard } from "@/actions/delete-card/action";
import { restoreCard } from "@/actions/restore-card/action";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAction } from "@/hooks/useActions";
import { useCardModal } from "@/hooks/useCardModal";
import { CardWithList } from "@/types";
import { Copy, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { notify } from "@/lib/notify";

interface ActionsProps {
  data: CardWithList;
}

const Actions = ({ data }: ActionsProps) => {
  const CardModal = useCardModal();
  const params = useParams();
  const { execute: executeCopyCard, isLoading: isLoadCopy } = useAction(
    copyCard,
    {
      onSuccess(data) {
        notify.success("Card copied", {
          description: `“${data?.title}” was added to the list.`,
        });
        CardModal.onClose();
      },
      onError(error) {
        notify.error(error);
      },
    }
  );
  const { execute: executeDeleteCard, isLoading: isLoadDelete } = useAction(
    deleteCard,
    {
      onSuccess(card) {
        const boardId = params.boardId as string;
        CardModal.onClose();
        notify.undo("Card deleted", {
          description: `“${card.title}” was removed.`,
          onUndo: async () => {
            const result = await restoreCard({ id: card.id, boardId });
            if (result.error) {
              notify.error("Couldn’t restore the card", {
                description: result.error,
              });
              return;
            }
            notify.success("Card restored", {
              description: `“${card.title}” is back.`,
            });
          },
        });
      },
      onError(error) {
        notify.error(error);
      },
    }
  );

  const onCopy = () => {
    const boardId = params.boardId as string;

    executeCopyCard({ id: data?.id, boardId });
  };
  const onDelete = () => {
    const boardId = params.boardId as string;

    executeDeleteCard({ id: data?.id, boardId });
  };
  return (
    <aside className="flex flex-col gap-2">
      <h3 className="pb-0.5 text-xs font-medium text-muted-foreground">
        Actions
      </h3>
      <Button
        variant="outline"
        size="sm"
        onClick={onCopy}
        disabled={isLoadCopy}
        className="justify-start"
      >
        <Copy />
        {isLoadCopy ? "Copying…" : "Copy card"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onDelete}
        disabled={isLoadDelete}
        className="justify-start border-destructive-soft text-destructive-text hover:bg-destructive-soft hover:text-destructive-text dark:border-destructive-soft dark:hover:bg-destructive-soft"
      >
        <Trash2 />
        {isLoadDelete ? "Deleting…" : "Delete card"}
      </Button>
    </aside>
  );
};

Actions.Skeleton = function ActionsSkeleton() {
  return (
    <div className="flex flex-col gap-2" aria-busy="true">
      <Skeleton className="h-3.5 w-16" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
    </div>
  );
};

export default Actions;
