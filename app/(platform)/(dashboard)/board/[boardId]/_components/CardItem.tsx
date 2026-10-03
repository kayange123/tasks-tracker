"use client";

import { useCardModal } from "@/hooks/useCardModal";
import { cn } from "@/lib/utils";
import { Draggable } from "@hello-pangea/dnd";
import { Card } from "@prisma/client";
import { AlignLeft } from "lucide-react";

interface CardItemProps {
  index: number;
  data: Card;
}

const CardItem = ({ index, data }: CardItemProps) => {
  const cardModal = useCardModal();
  return (
    <Draggable draggableId={data.id} index={index}>
      {(provided, snapshot) => (
        <li
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          aria-label={`Open card ${data.title}`}
          onClick={() => cardModal.onOpen(data.id)}
          // Space lifts the card for keyboard dragging; Enter opens it
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              cardModal.onOpen(data.id);
            }
          }}
          className="rounded-[10px] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {/* Inner wrapper so the drag tilt doesn't fight the library's transform */}
          <div
            className={cn(
              "flex cursor-pointer flex-col gap-2 rounded-[10px] border bg-card px-3 py-2.5 text-sm shadow-xs transition-colors hover:border-input",
              snapshot.isDragging &&
                "rotate-2 border-primary shadow-lg motion-reduce:rotate-0"
            )}
          >
            <span className="leading-snug break-words">{data.title}</span>
            {data.description && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <AlignLeft aria-hidden className="size-3.5" />
                Description
              </span>
            )}
          </div>
        </li>
      )}
    </Draggable>
  );
};

export default CardItem;
