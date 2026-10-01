"use client";

import { deleteBoard } from "@/actions/delete-board/action";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAction } from "@/hooks/useActions";
import { MoreHorizontal, Trash2, X } from "lucide-react";
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
      notify.success("Board deleted", {
        description: `“${board.title}” was removed.`,
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
        <Button className="w-auto h-auto p-2">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="px-0 pb-3 pt-3" side="bottom" align="start">
        <p className="text-sm font-bold text-center text-neutral-600 pb-4">
          Board Actions
        </p>
        <PopoverClose asChild>
          <Button
            className="absolute top-2 right-2 h-auto w-auto p-2 text-neutral-600"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </PopoverClose>
        <Button
          onClick={onDelete}
          disabled={isLoading}
          variant="ghost"
          className="rounded-none p-2 justify-start font-bold px-5 w-full h-auto flex space-x-2 items-center"
        >
          <Trash2 className="h-4 w-4 mr-2 text-red-600" />
          <span className="text-sm text-red-700">
            {isLoading ? "Deleting..." : "Delete Board"}
          </span>
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default BoardOptions;
