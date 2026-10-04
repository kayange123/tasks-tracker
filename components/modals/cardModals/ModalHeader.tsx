"use client";

import { updateCard } from "@/actions/update-card/action";
import FormInput from "@/components/form/FormInput";
import { Skeleton } from "@/components/ui/skeleton";
import { useAction } from "@/hooks/useActions";
import { CardWithList } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { PanelsTopLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { useRef } from "react";
import { notify } from "@/lib/notify";
import { submitForm } from "@/lib/submitForm";

interface ModalHeaderProps {
  data: CardWithList;
}

const ModalHeader = ({ data }: ModalHeaderProps) => {
  const query = useQueryClient();
  const params = useParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const { execute, fieldErrors } = useAction(updateCard, {
    onSuccess(card) {
      query.invalidateQueries({
        queryKey: ["card", data?.id],
      });
      query.invalidateQueries({
        queryKey: ["card-log", data?.id],
      });

      notify.success("Card renamed", {
        description: `Now called “${card?.title}”.`,
      });
    },
    onError(error) {
      notify.error("Couldn’t rename the card", { description: error });
    },
  });
  const onBlur = () => {
    inputRef.current?.form?.requestSubmit();
  };

  // Escape restores the saved title; the blur that follows saves nothing
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.currentTarget.value = data.title;
      event.currentTarget.blur();
    }
  };

  const onSubmit = (form: FormData) => {
    const formTitle = form.get("title") as string;
    const boardId = params.boardId as string;

    if (formTitle === data.title) return;

    execute({
      title: formTitle,
      id: data.id,
      boardId,
    });
  };
  return (
    // Right padding keeps the title clear of the dialog's close button
    <div className="flex items-start gap-3.5 pr-8">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-[9px] bg-primary-soft text-primary-text">
        <PanelsTopLeft aria-hidden className="size-4.5" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <form onSubmit={submitForm(onSubmit)}>
          <FormInput
            // Remount when the saved title changes so the field never
            // keeps a value from before the latest refetch
            key={data.title}
            ref={inputRef}
            id="title"
            label="Card title"
            labelHidden
            defaultValue={data.title}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            errors={fieldErrors}
            className="-ml-1.5 h-auto border-transparent bg-transparent px-1.5 py-0.5 text-xl font-semibold md:text-xl tracking-tight shadow-none hover:border-input focus-visible:border-ring dark:bg-transparent"
          />
        </form>
        <p className="text-[13px] text-muted-foreground">
          in list{" "}
          <span className="font-medium text-foreground">{data.list.title}</span>
        </p>
      </div>
    </div>
  );
};

ModalHeader.Skeleton = function ModalHeaderSkeleton() {
  return (
    <div className="flex items-start gap-3.5" aria-busy="true">
      <Skeleton className="size-9 shrink-0 rounded-[9px]" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-4 w-28" />
      </div>
    </div>
  );
};

export default ModalHeader;
