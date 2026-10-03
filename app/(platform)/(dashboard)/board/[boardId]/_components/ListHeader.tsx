"use client";

import { updateList } from "@/actions/update-list/action";
import FormInput from "@/components/form/FormInput";
import { useAction } from "@/hooks/useActions";
import { ElementRef, useRef, useState } from "react";
import { notify } from "@/lib/notify";
import { useEventListener } from "usehooks-ts";
import ListOptions from "./ListOptions";

interface ListHeaderProps {
  title: string;
  count: number;
  id: string;
  boardId: string;
  onAddCard: () => void;
}

const ListHeader = ({
  id,
  title,
  count,
  boardId,
  onAddCard,
}: ListHeaderProps) => {
  const [listTitle, setListTitle] = useState(title);
  const [isEditing, setIsEditing] = useState(false);
  const formRef = useRef<ElementRef<"form">>(null);
  const inputRef = useRef<ElementRef<"input">>(null);

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  };
  const disableEditing = () => {
    setIsEditing(false);
  };
  const { execute, fieldErrors } = useAction(updateList, {
    onSuccess(data) {
      notify.success("List renamed", {
        description: `Now called “${data?.title}”.`,
      });
      setListTitle(data?.title);
      disableEditing();
    },
  });
  const onkeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      // Cancel the rename; the native submit() would bypass the action
      disableEditing();
    }
  };

  const onSubmit = (form: FormData) => {
    const getTitle = form.get("title") as string;

    if (title === getTitle) {
      return disableEditing();
    }

    execute({ title: getTitle, id, boardId });
  };
  const onBlur = () => {
    formRef.current?.requestSubmit();
  };

  useEventListener("keydown", onkeyDown);
  return (
    <div className="flex items-center gap-1.5 pl-0.5">
      {isEditing ? (
        <form ref={formRef} action={onSubmit} className="min-w-0 flex-1">
          <FormInput
            errors={fieldErrors}
            ref={inputRef}
            id="title"
            label="List title"
            labelHidden
            onBlur={onBlur}
            placeholder="Enter a title…"
            defaultValue={listTitle}
            className="h-8 px-2 text-sm font-semibold"
          />
        </form>
      ) : (
        <>
          <h2 className="min-w-0">
            <button
              type="button"
              onClick={enableEditing}
              title="Rename list"
              className="max-w-full truncate rounded-md px-1.5 py-1 text-left text-sm font-semibold transition-colors hover:bg-accent"
            >
              {listTitle}
            </button>
          </h2>
          <span className="text-xs text-muted-foreground">
            {count}
            <span className="sr-only"> {count === 1 ? "card" : "cards"}</span>
          </span>
        </>
      )}
      <div className="ml-auto">
        <ListOptions onAddCard={onAddCard} id={id} boardId={boardId} />
      </div>
    </div>
  );
};

export default ListHeader;
