"use client";

import { updateCard } from "@/actions/update-card/action";
import FormSubmit from "@/components/form/FormSubmit";
import FormTextArea from "@/components/form/form-textArea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAction } from "@/hooks/useActions";
import { CardWithList } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { AlignLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { ElementRef, useRef, useState } from "react";
import { notify } from "@/lib/notify";
import { submitForm } from "@/lib/submitForm";
import { cn } from "@/lib/utils";
import { useEventListener, useOnClickOutside } from "usehooks-ts";

const MAX_LENGTH = 5000;

interface DescriptionProps {
  data: CardWithList;
}
const Description = ({ data }: DescriptionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [length, setLength] = useState(0);
  const queryClient = useQueryClient();
  const params = useParams();
  const textAreaRef = useRef<ElementRef<"textarea">>(null);
  const formRef = useRef<ElementRef<"form">>(null);

  const enableEditing = () => {
    setLength(data.description?.length ?? 0);
    setIsEditing(true);
    setTimeout(() => {
      textAreaRef.current?.focus();
    });
  };

  const disableEditing = () => {
    setIsEditing(false);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      disableEditing();
    }
  };
  const { execute, fieldErrors, isLoading } = useAction(updateCard, {
    onSuccess(card) {
      queryClient.invalidateQueries({
        queryKey: ["card", card?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["card-log", card?.id],
      });
      disableEditing();
      notify.success(
        card.description ? "Description saved" : "Description removed"
      );
    },
    onError(error) {
      notify.error(error);
    },
  });

  useEventListener("keydown", onKeyDown);
  // usehooks-ts types predate React 19 nullable refs
  useOnClickOutside(
    formRef as React.RefObject<HTMLFormElement>,
    disableEditing
  );

  const onSubmit = (form: FormData) => {
    const description = form.get("description") as string;
    const boardId = params.boardId as string;

    if (description === (data.description ?? "")) {
      return disableEditing();
    }

    execute({
      title: data.title,
      description,
      boardId,
      id: data.id,
    });
  };

  const tooLong = length > MAX_LENGTH;

  return (
    <section className="flex flex-col gap-2.5">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <AlignLeft aria-hidden className="size-4 text-muted-foreground" />
        Description
      </h3>
      {isEditing ? (
        <form
          ref={formRef}
          onSubmit={submitForm(onSubmit)}
          className="flex flex-col gap-2"
        >
          <FormTextArea
            ref={textAreaRef}
            id="description"
            label="Description"
            labelHidden
            errors={fieldErrors}
            placeholder="Add more detail to this card…"
            defaultValue={data.description ?? undefined}
            onChange={(value) => setLength(value.length)}
            disabled={isLoading}
            className="min-h-32 resize-y bg-card leading-relaxed"
          />
          <div className="flex items-center gap-2">
            <FormSubmit disabled={isLoading || tooLong} className="h-8 px-3.5">
              Save
            </FormSubmit>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={disableEditing}
            >
              Cancel
            </Button>
            <span
              className={cn(
                "ml-auto text-xs tabular-nums",
                tooLong ? "text-destructive-text" : "text-muted-foreground"
              )}
            >
              {length.toLocaleString("en-US")} /{" "}
              {MAX_LENGTH.toLocaleString("en-US")}
            </span>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={enableEditing}
          className="min-h-20 w-full rounded-[10px] border bg-surface-2 px-3.5 py-3 text-left text-sm leading-relaxed whitespace-pre-wrap transition-colors hover:border-input"
        >
          {data.description || (
            <span className="text-muted-foreground">
              Add more detail to this card…
            </span>
          )}
        </button>
      )}
    </section>
  );
};

Description.Skeleton = function DescriptionSkeleton() {
  return (
    <div className="flex flex-col gap-2.5" aria-busy="true">
      <Skeleton className="h-5 w-28" />
      <Skeleton className="h-20 w-full rounded-[10px]" />
    </div>
  );
};

export default Description;
