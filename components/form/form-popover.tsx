"use client";

import { X } from "lucide-react";
import { Button } from "../ui/button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import FormInput from "./FormInput";
import FormSubmit from "./FormSubmit";
import { useAction } from "@/hooks/useActions";
import { createBoard } from "@/actions/create-board/action";
import { notify } from "@/lib/notify";
import { submitForm } from "@/lib/submitForm";
import FormPicker from "./form-picker";
import { useRef, useState, ElementRef } from "react";
import { useRouter } from "next/navigation";
import { useProModal } from "@/hooks/useProModal";
import { useOrganization } from "@clerk/nextjs";
import { useUsage } from "@/hooks/useUsage";

interface FormPopoverProps {
  children: React.ReactNode;
  side?: "left" | "right" | "top" | "bottom";
  sideOffset?: number;
  align?: "start" | "center" | "end";
}

const TITLE_MIN = 3;
const TITLE_MAX = 100;

// Rendered only while the popover is open, so every open starts empty
const CreateBoardForm = ({ onCreated }: { onCreated: () => void }) => {
  const router = useRouter();
  const proModal = useProModal();
  const { organization } = useOrganization();
  const usage = useUsage(organization?.id);
  const [title, setTitle] = useState("");
  const [hasImage, setHasImage] = useState(false);

  const { execute, fieldErrors, isLoading } = useAction(createBoard, {
    onSuccess: (data) => {
      notify.success("Board created", {
        description: `“${data?.title}” is ready.`,
      });
      onCreated();
      router.push(`/board/${data?.id}`);
    },
    onError: (error) => {
      notify.error(error);
      if (error.includes("upgrade")) {
        proModal.onOpen();
      }
    },
  });

  const length = title.trim().length;
  const titleError =
    length > 0 && length < TITLE_MIN
      ? `Title must be at least ${TITLE_MIN} characters.`
      : length > TITLE_MAX
        ? `Title must be at most ${TITLE_MAX} characters.`
        : undefined;
  const canSubmit = length >= TITLE_MIN && length <= TITLE_MAX && hasImage;

  const usageHint =
    usage && !usage.isPro && organization
      ? `${Math.max(0, usage.limit - usage.boards)} of ${usage.limit} free boards left in ${organization.name}.`
      : undefined;

  const onSubmit = (form: FormData) => {
    const title = form.get("title") as string;
    const image = form.get("image") as string;

    execute({ title, image });
  };

  return (
    <form onSubmit={submitForm(onSubmit)} className="flex flex-col gap-3.5">
      <FormPicker id="image" errors={fieldErrors} onChange={setHasImage} />
      <FormInput
        disabled={isLoading}
        errors={fieldErrors}
        id="title"
        type="text"
        label="Board title"
        placeholder="e.g. Product roadmap"
        onChange={setTitle}
        invalid={!!titleError}
        hint={titleError ?? usageHint}
      />
      <FormSubmit disabled={!canSubmit || isLoading} className="w-full">
        Create board
      </FormSubmit>
    </form>
  );
};

const FormPopover = ({
  children,
  side = "bottom",
  sideOffset = 0,
  align,
}: FormPopoverProps) => {
  const closeRef = useRef<ElementRef<"button">>(null);

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-85 rounded-xl p-4"
        align={align}
        side={side}
        sideOffset={sideOffset}
      >
        <div className="mb-3.5 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">Create board</h2>
          <PopoverClose ref={closeRef} asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Close"
              className="-mr-1.5 text-muted-foreground"
            >
              <X />
            </Button>
          </PopoverClose>
        </div>
        <CreateBoardForm onCreated={() => closeRef.current?.click()} />
      </PopoverContent>
    </Popover>
  );
};

export default FormPopover;
