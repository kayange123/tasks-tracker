"use client";

import { updateCard } from "@/actions/update-card/action";
import FormInput from "@/components/form/FormInput";
import { Skeleton } from "@/components/ui/skeleton";
import { useAction } from "@/hooks/useActions";
import { CardWithList } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "lucide-react";
import { useParams } from "next/navigation";
import { ElementRef, useRef } from "react";
import { notify } from "@/lib/notify";

interface ModalHeaderProps {
  data: CardWithList;
}

const ModalHeader = ({ data }: ModalHeaderProps) => {
  const query = useQueryClient();
  const params = useParams();
  const inputRef = useRef<ElementRef<"input">>(null);

  const { execute } = useAction(updateCard, {
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
  });
  const onBlur = () => {
    inputRef.current?.form?.requestSubmit();
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
    <div className="flex items-start gap-x-3 mb-6 w-full">
      <Layout className="h-5 w-5 mt-1 text-neutral-700" />
      <div className="w-full">
        <form action={onSubmit}>
          <FormInput
            // Remount when the saved title changes so the field never
            // keeps a value from before the latest refetch
            key={data.title}
            ref={inputRef}
            onBlur={onBlur}
            id="title"
            defaultValue={data.title}
            className="font-semibold text-xl px-1 text-neutral-700 bg-transparent relative -left-1.5 border-transparent w-[95%] bg-white focus-visible:border-input mb-0.5 truncate"
          />
        </form>
        <p className="text-sm text-muted-foreground">
          In list <span className="underline">{data?.list?.title}</span>
        </p>
      </div>
    </div>
  );
};

ModalHeader.Skeleton = function ModalHeaderSkeleton() {
  return (
    <div className="flex items-start gap-x-3 mb-6">
      <Skeleton className="h-6 w-6 mt-1 bg-neutral-200" />
      <div className="">
        <Skeleton className="w-24 h-6 mb-1 bg-neutral-200" />
        <Skeleton className="w-12 h-4 bg-neutral-200" />
      </div>
    </div>
  );
};

export default ModalHeader;
