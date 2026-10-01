"use client";

import { copyCard } from "@/actions/copy-card/action";
import { deleteCard } from "@/actions/delete-card/action";
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
      onSuccess(data) {
        notify.success("Card deleted", {
          description: `“${data?.title}” was removed.`,
        });
        CardModal.onClose();
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
    <div className="space-y-2 mt-2">
      <p className="text-xs font-semibold">Actions</p>
      <Button
        onClick={onCopy}
        size="inline"
        disabled={isLoadCopy}
        variant="gray"
        className="w-full justify-start"
      >
        <Copy className="h-4 w-4 mr-2" />
        {isLoadCopy ? "Copying..." : "Copy"}
      </Button>
      <Button
        onClick={onDelete}
        disabled={isLoadDelete}
        size="inline"
        variant="gray"
        className="w-full justify-start"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        {isLoadDelete ? "Deleting..." : "Delete"}
      </Button>
    </div>
  );
};

Actions.Skeleton = function ActionsSkeleton() {
  return (
    <div className="space-y-2 mt-2">
      <Skeleton className="w-20 h-4 bg-neutral-200" />
      <Skeleton className="w-full h-8 bg-neutral-200" />
      <Skeleton className="w-full h-8 bg-neutral-200" />
    </div>
  );
};

export default Actions;
