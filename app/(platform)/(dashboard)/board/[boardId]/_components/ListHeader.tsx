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
  id: string;
  boardId: string;
  onAddCard: () => void;
}

const ListHeader = ({ id, title, boardId, onAddCard }: ListHeaderProps) => {
  const [listTitle, setListTitle] = useState(title);
  const [isEditing, setIsEditing] = useState(false);
  const formRef = useRef<ElementRef<"form">>(null);
  const inputRef = useRef<ElementRef<"input">>(null);

  const enableEditng = () => {
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
      formRef.current?.submit();
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
    <div className="flex px-3 gap-x-2 pt-2 justify-between items-start text-sm font-semibold">
      {isEditing ? (
        <form ref={formRef} action={onSubmit} className="flex-1 px-[2px]">
          <FormInput
            errors={fieldErrors}
            className="text-sm px-[7px] h-7 py-1 font-medium border-transparent hover:border-input focus:border-input transition truncate"
            ref={inputRef}
            id="title"
            onBlur={onBlur}
            placeholder="Enter a title..."
            defaultValue={listTitle}
          />
        </form>
      ) : (
        <p
          onClick={enableEditng}
          className="w-full text-sm px-2.5 py-1 h-7 font-medium border-transparent"
        >
          {listTitle}
        </p>
      )}
      <ListOptions onAddCard={onAddCard} id={id} boardId={boardId} />
    </div>
  );
};

export default ListHeader;
