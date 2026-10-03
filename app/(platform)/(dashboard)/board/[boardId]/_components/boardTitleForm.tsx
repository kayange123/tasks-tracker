"use client";

import { updateBoard } from "@/actions/update-board/action";
import FormInput from "@/components/form/FormInput";
import { useAction } from "@/hooks/useActions";
import { useRouter } from "next/navigation";
import { ElementRef, useRef, useState } from "react";
import { useEventListener } from "usehooks-ts";
import { notify } from "@/lib/notify";

interface BoardTitleFormProps {
  id: string;
  title: string;
}

const BoardTitleForm = ({ title, id }: BoardTitleFormProps) => {
  const router = useRouter();
  const formRef = useRef<ElementRef<"form">>(null);
  const inputRef = useRef<ElementRef<"input">>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formTitle, setFormTitle] = useState(title);

  const { execute } = useAction(updateBoard, {
    onSuccess(data) {
      notify.success("Board renamed", {
        description: `Now called “${data?.title}”.`,
      });
      router.refresh();
      setFormTitle(data?.title);
      disableEditing();
    },
    onError(error) {
      notify.error("Couldn’t rename the board", { description: error });
    },
  });
  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef?.current?.focus();
      inputRef?.current?.select();
    });
  };

  const onSubmit = (formData: FormData) => {
    const getTitle = formData.get("title") as string;

    if (getTitle === formTitle) {
      return disableEditing();
    }

    execute({
      title: getTitle,
      id,
    });
  };
  const disableEditing = () => {
    setIsEditing(false);
  };

  const onBlur = () => {
    formRef?.current?.requestSubmit();
  };

  useEventListener("keydown", (event: KeyboardEvent) => {
    if (isEditing && event.key === "Escape") {
      disableEditing();
    }
  });
  return isEditing ? (
    <form action={onSubmit} ref={formRef} className="min-w-0">
      <FormInput
        ref={inputRef}
        id="title"
        label="Board title"
        labelHidden
        onBlur={onBlur}
        defaultValue={formTitle}
        className="h-9 w-64 max-w-[50vw] text-lg font-semibold"
      />
    </form>
  ) : (
    <h1 className="min-w-0">
      <button
        type="button"
        onClick={enableEditing}
        title="Rename board"
        className="max-w-full truncate rounded-md px-1.5 py-1 text-left text-lg font-semibold tracking-tight transition-colors hover:bg-accent"
      >
        {formTitle}
      </button>
    </h1>
  );
};

export default BoardTitleForm;
