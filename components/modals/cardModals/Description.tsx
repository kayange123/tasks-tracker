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
import toast from "react-hot-toast";
import { useEventListener, useOnClickOutside } from "usehooks-ts";

interface DescriptionProps {
  data: CardWithList;
}
const Description = ({ data }: DescriptionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const params = useParams();
  const textAreaRef = useRef<ElementRef<"textarea">>(null);
  const formRef = useRef<ElementRef<"form">>(null);

  const enableEditing = () => {
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
  const { execute, fieldErrors } = useAction(updateCard, {
    onSuccess(data) {
      queryClient.invalidateQueries({
        queryKey: ["card", data?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["card-log", data?.id],
      });
      disableEditing();
      toast.success(`card updated`);
    },
    onError(error) {
      toast.error(error);
    },
  });

  useEventListener("keydown", onKeyDown);
  // usehooks-ts types predate React 19 nullable refs
  useOnClickOutside(
    formRef as React.RefObject<HTMLFormElement>,
    disableEditing,
  );

  const onSubmit = (form: FormData) => {
    const description = form.get("description") as string;
    const boardId = params.boardId as string;

    execute({
      title: data.title,
      description,
      boardId,
      id: data?.id,
    });
  };
  return (
    <div className="flex items-start gap-x-3 w-full ">
      <AlignLeft className="h-5 w-5 text-neutral-700 mt-0.5" />
      <div className="w-full">
        <p className="font-semibold text-neutral-700 mb-2">Description</p>
        {isEditing ? (
          <form className="space-y-2" action={onSubmit} ref={formRef}>
            <FormTextArea
              ref={textAreaRef}
              id="description"
              className="w-full mt-2"
              errors={fieldErrors}
              placeholder="Add a more detailed description"
              defaultValue={data?.description || undefined}
            />
            <div className="flex items-center gap-x-2">
              <FormSubmit>Save</FormSubmit>
              <Button
                onClick={disableEditing}
                type="button"
                size="sm"
                variant="ghost"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div
            onClick={enableEditing}
            role="button"
            className="min-h-[78px] bg-neutral-200 text-sm font-medium py-3 rounded-md px-3.5"
          >
            {data?.description || "Add a more detailed description"}
          </div>
        )}
      </div>
    </div>
  );
};

Description.Skeleton = function DescriptionSkeleton() {
  return (
    <div className="flex items-start gap-x-3 w-full">
      <Skeleton className="h-6 w-6 bg-neutral-200" />
      <div className="w-full">
        <Skeleton className="h-6 mb-2 bg-neutral-200 w-24" />
        <Skeleton className="h-[78px] bg-neutral-200 w-full" />
      </div>
    </div>
  );
};

export default Description;
