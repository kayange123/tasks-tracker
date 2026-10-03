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
import { notify } from "@/lib/notify";
import { submitForm } from "@/lib/submitForm";

const ListForm = () => {
  const [isEditing, setIsEditing] = useState(false);
  const formRef = useRef<ElementRef<"form">>(null);
  const inputRef = useRef<ElementRef<"input">>(null);
  const params = useParams();
  const router = useRouter();

  const { execute, fieldErrors, isLoading } = useAction(createList, {
    onError(error) {
      notify.error(error);
    },
    onSuccess(data) {
      notify.success("List created", {
        description: `“${data?.title}” was added to the board.`,
      });
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
    disableEditing
  );
  return isEditing ? (
    <form
      onSubmit={submitForm(onSubmit)}
      ref={formRef}
      className="flex flex-col gap-2 rounded-[14px] border border-border/70 bg-surface-2 p-2.5"
    >
      <FormInput
        disabled={isLoading}
        errors={fieldErrors}
        ref={inputRef}
        id="title"
        label="New list"
        placeholder="e.g. In review"
        className="bg-card"
      />
      <input type="hidden" value={params?.boardId} name="boardId" />
      <div className="flex items-center gap-1.5">
        <FormSubmit disabled={isLoading} className="h-8 px-3.5">
          Add list
        </FormSubmit>
        <Button
          type="button"
          onClick={disableEditing}
          variant="ghost"
          size="icon-sm"
          aria-label="Cancel"
          className="text-muted-foreground"
        >
          <X />
        </Button>
      </div>
    </form>
  ) : (
    <button
      type="button"
      onClick={enableEditing}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-[14px] border border-dashed border-input text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:bg-primary-soft hover:text-primary-text"
    >
      <Plus aria-hidden className="size-4" />
      Add a list
    </button>
  );
};

export default ListForm;
