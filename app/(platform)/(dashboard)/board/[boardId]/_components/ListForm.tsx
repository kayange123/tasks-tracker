"use client";

import FormInput from "@/components/form/FormInput";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useState, ElementRef, useRef } from "react";
import { useEventListener, useOnClickOutside } from "usehooks-ts";
import { useParams, useRouter } from "next/navigation";
import FormSubmit from "@/components/form/FormSubmit";
import { useAction } from "@/hooks/useActions";
import { createList } from "@/actions/create-list/action";
import toast from "react-hot-toast";

const ListForm = () => {
  const [isEditing, setIsEditing] = useState(false);
  const formRef = useRef<ElementRef<"form">>(null);
  const inputRef = useRef<ElementRef<"input">>(null);
  const params = useParams();
  const router = useRouter();

  const { execute, fieldErrors } = useAction(createList, {
    onError(error) {
      toast.error(error);
    },
    onSuccess(data) {
      toast.success(`list "${data?.title}" created`);
      disableEditing();
      router.refresh();
    },
  });
  const onSubmit = (form: FormData) => {
    const title = form.get("title") as string;
    const boardId = form.get("boardId") as string;

    execute({ title, boardId });
  };
  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    });
  };

  const disableEditing = () => {
    setIsEditing(false);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      disableEditing();
    }
  };
  useEventListener("keydown", onKeyDown);
  // usehooks-ts types predate React 19 nullable refs
  useOnClickOutside(
    formRef as React.RefObject<HTMLFormElement>,
    disableEditing,
  );
  return (
    <div className="w-full md:max-w-xs">
      {isEditing ? (
        <form
          action={onSubmit}
          ref={formRef}
          className=" p-3 bg-white space-y-4 shadow-sm"
        >
          <FormInput
            errors={fieldErrors}
            ref={inputRef}
            id="title"
            placeholder="Enter list title"
            className="text-sm px-2 py-1 h-7 font-medium border-transparent hover:border-input transition ease-in focus:border-input"
          />
          <input type="text" hidden value={params?.boardId} name="boardId" />
          <div className="flex items-center justify-between gap-x-1">
            <FormSubmit className="h-8">Add list</FormSubmit>
            <Button
              type="submit"
              onClick={disableEditing}
              size="sm"
              variant="ghost"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </form>
      ) : (
        <Button
          onClick={enableEditing}
          className="w-full rounded-md bg-white/80 hover:bg-white/50 text-black/80 font-extrabold transition p-3 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add a list
        </Button>
      )}
    </div>
  );
};

export default ListForm;
