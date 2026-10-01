"use client";

import { copyList } from "@/actions/copy-list/action";
import { deleteList } from "@/actions/delete-list/action";
import FormSubmit from "@/components/form/FormSubmit";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useAction } from "@/hooks/useActions";
import { MoreHorizontal, X } from "lucide-react";
import { ElementRef, useRef } from "react";
import { notify } from "@/lib/notify";

interface ListOptionsProps {
  onAddCard: () => void;
  id: string;
  boardId: string;
}
const ListOptions = ({ onAddCard, id, boardId }: ListOptionsProps) => {
  const closeRef = useRef<ElementRef<"button">>(null);
  const { execute } = useAction(deleteList, {
    onSuccess(data) {
      notify.success("List deleted", {
        description: `“${data?.title}” and its cards were removed.`,
      });
      closeRef.current?.click();
    },
    onError(error) {
      notify.error(error);
    },
  });

  //The action to copy list
  const { execute: executeCopy } = useAction(copyList, {
    onSuccess(data) {
      notify.success("List copied", {
        description: `“${data?.title}” was added to the board.`,
      });
      closeRef.current?.click();
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
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="h-auto w-auto p-2" variant="ghost">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="px-0 py-3" side="bottom" align="start">
        <p className="text-sm text-center pb-4 font-medium text-neutral-600">
          List Actions
        </p>
        <PopoverClose ref={closeRef} asChild>
          <Button
            variant="ghost"
            className="w-auto h-auto p-2 absolute top-2 right-2 text-neutral-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </PopoverClose>
        <Button
          variant="ghost"
          onClick={onAddCard}
          className="w-full h-auto rounded-none p-2 px-5 justify-start font-normal text-sm"
        >
          Add Card..
        </Button>
        <form action={onCopyList}>
          <input id="id" name="id" hidden value={id} />
          <FormSubmit
            variant="ghost"
            className="w-full h-auto rounded-none p-2 px-5 justify-start font-normal text-sm"
          >
            Copy list..
          </FormSubmit>
        </form>
        <Separator />
        <form action={onDelete}>
          <input id="id" name="id" hidden value={id} />
          <FormSubmit
            variant="ghost"
            className="w-full h-auto rounded-none p-2 px-5 justify-start font-normal text-sm"
          >
            Delete list..
          </FormSubmit>
        </form>
      </PopoverContent>
    </Popover>
  );
};

export default ListOptions;
