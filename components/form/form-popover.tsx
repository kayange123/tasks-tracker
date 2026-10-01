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
import FormPicker from "./form-picker";
import { useRef, ElementRef } from "react";
import { useRouter } from "next/navigation";
import { useProModal } from "@/hooks/useProModal";

interface FormPopoverProps {
  children: React.ReactNode;
  side?: "left" | "right" | "top" | "bottom";
  sideOffset?: number;
  align?: "start" | "center" | "end";
}

const FormPopover = ({
  children,
  side = "bottom",
  sideOffset = 0,
  align,
}: FormPopoverProps) => {
  const router = useRouter();
  const proModal = useProModal();
  const closeRef = useRef<ElementRef<"button">>(null);
  const { execute, fieldErrors } = useAction(createBoard, {
    onSuccess: (data) => {
      notify.success("Board created", {
        description: `“${data?.title}” is ready.`,
      });
      closeRef.current?.click();
      router.push(`/board/${data?.id}`);
    },
    onError: (error) => {
      notify.error(error);
      if (error.includes("upgrade")) {
        proModal.onOpen();
      }
    },
  });
  const onSubmit = (form: FormData) => {
    const title = form.get("title") as string;
    const image = form.get("image") as string;

    execute({ title, image });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-80 pt-3"
        align={align}
        side={side}
        sideOffset={sideOffset}
      >
        <p className="font-medium pb-4 text-sm text-center text-neutral-600">
          Create Board
        </p>
        <PopoverClose ref={closeRef} asChild>
          <Button
            className="h-auto w-auto p-2 absolute top-2 right-2 outline-hidden"
            variant={"ghost"}
          >
            <X className="h-4 w-4" />
          </Button>
        </PopoverClose>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-4">
            <FormPicker id="image" errors={fieldErrors} />
            <FormInput
              errors={fieldErrors}
              id="title"
              type="text"
              label="Board Title"
            />
          </div>
          <FormSubmit variant="primary" className="w-full h-7">
            Save
          </FormSubmit>
        </form>
      </PopoverContent>
    </Popover>
  );
};

export default FormPopover;
