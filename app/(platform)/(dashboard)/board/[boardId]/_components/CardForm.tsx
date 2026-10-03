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
import { notify } from "@/lib/notify";
import { submitForm } from "@/lib/submitForm";
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

    const { execute, fieldErrors, isLoading } = useAction(createCard, {
      onSuccess(data) {
        notify.success("Card created", {
          description: `“${data?.title}” was added to the list.`,
        });
        formRef.current?.reset();
        disableEditing();
      },
      onError(error) {
        notify.error(error);
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
      disableEditing
    );
    useEventListener("keydown", onKeyDown);

    const onTextAreaKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (
      e
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
        onSubmit={submitForm(onSubmit)}
        className="flex flex-col gap-2"
      >
        <FormTextArea
          disabled={isLoading}
          id="title"
          label="Card title"
          labelHidden
          onKeyDown={onTextAreaKeyDown}
          placeholder="Enter a title for this card…"
          ref={ref}
          errors={fieldErrors}
          className="min-h-16 bg-card"
        />
        <div className="flex items-center gap-1.5">
          <FormSubmit disabled={isLoading} className="h-8 px-3.5">
            Add card
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
          <span className="ml-auto text-xs text-muted-foreground">
            Enter to add
          </span>
        </div>
      </form>
    ) : (
      <Button
        onClick={enableEditing}
        variant="ghost"
        className="h-9 w-full justify-start gap-2 px-2.5 text-[13px] font-medium text-muted-foreground"
      >
        <Plus />
        Add a card
      </Button>
    );
  }
);
CardForm.displayName = "CardForm";

export default CardForm;
