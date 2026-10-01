"use client";

import { updateBoard } from "@/actions/update-board/action";
import FormInput from "@/components/form/FormInput";
import { Button } from "@/components/ui/button";
import { useAction } from "@/hooks/useActions";
import { useRouter } from "next/navigation";
import { ElementRef, useRef, useState } from "react";
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
  return isEditing ? (
    <form action={onSubmit} ref={formRef} className="flex items-center gap-x-2">
      <FormInput
        ref={inputRef}
        className="text-lg font-bold px-[7px] py-1 h-7 bg-transparent focus-visible:outline-hidden focus-visible:ring-transparent"
        id="title"
        onBlur={onBlur}
        defaultValue={formTitle}
      />
    </form>
  ) : (
    <Button
      onClick={enableEditing}
      variant="transparent"
      className="font-bold h-auto w-auto text-lg p-1 px-2"
    >
      {formTitle}
    </Button>
  );
};

export default BoardTitleForm;
