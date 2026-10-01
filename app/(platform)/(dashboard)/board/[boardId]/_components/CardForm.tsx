"use client";

import { createCard } from "@/actions/create-card/action";
import FormSubmit from "@/components/form/FormSubmit";
import FormTextArea from "@/components/form/form-textArea";
import { Button } from "@/components/ui/button";
import { useAction } from "@/hooks/useActions";
import { Plus, X } from "lucide-react";
import { useParams } from "next/navigation";
import React, {
  ElementRef,
  KeyboardEventHandler,
  forwardRef,
  useRef,
} from "react";
import toast from "react-hot-toast";
import { useEventListener, useOnClickOutside } from "usehooks-ts";

interface CardFormProps {
  listId: string;
  enableEditing: () => void;
  disableEditing: () => void;
  isEditing: boolean;
}

const CardForm = forwardRef<HTMLTextAreaElement, CardFormProps>(
  ({ listId, enableEditing, disableEditing, isEditing }, ref) => {
    const params = useParams();
    const formRef = useRef<ElementRef<"form">>(null);

    const { execute, fieldErrors } = useAction(createCard, {
      onSuccess(data) {
        toast.success(`card "${data?.title}" created`);
        formRef.current?.reset();
        disableEditing();
      },
      onError(error) {
        toast.error(error);
      },
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        disableEditing();
      }
    };

    // usehooks-ts types predate React 19 nullable refs
    useOnClickOutside(
      formRef as React.RefObject<HTMLFormElement>,
      disableEditing,
    );
    useEventListener("keydown", onKeyDown);

    const onTextAreaKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (
      e,
    ) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };

    const onSubmit = (form: FormData) => {
      const title = form.get("title") as string;
      const boardId = params?.boardId as string;

      execute({ title, boardId, listId });
    };
    return isEditing ? (
      <form
        ref={formRef}
        action={onSubmit}
        className="m-1 py-0.5 px-1 space-y-4"
      >
        <FormTextArea
          id="title"
          onKeyDown={onTextAreaKeyDown}
          placeholder="Enter title for the card"
          ref={ref}
          errors={fieldErrors}
        />
        <div className="flex items-center justify-between gap-x-1">
          <FormSubmit>Add Card</FormSubmit>
          <Button
            onClick={disableEditing}
            size="sm"
            variant="ghost"
            className="p-2"
          >
            <X className="h-5 w-5 text-neutral-700" />
          </Button>
        </div>
      </form>
    ) : (
      <div className="pt-2 px-2">
        <Button
          onClick={enableEditing}
          variant="ghost"
          className="h-auto px-2 py-1.5 w-full justify-center text-black  text-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Card
        </Button>
      </div>
    );
  },
);
CardForm.displayName = "CardForm";

export default CardForm;
