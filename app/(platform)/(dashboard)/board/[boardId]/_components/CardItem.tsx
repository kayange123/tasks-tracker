"use client";

import { useCardModal } from "@/hooks/useCardModal";
import { Draggable } from "@hello-pangea/dnd";
import { Card } from "@prisma/client";

interface CardItemProps {
  index: number;
  data: Card;
}

const CardItem = ({ index, data }: CardItemProps) => {
  const cardModal = useCardModal();
  return (
    <Draggable draggableId={data.id} index={index}>
      {(provided) => (
        <div
          {...provided.dragHandleProps}
          {...provided.draggableProps}
          ref={provided.innerRef}
          role="button"
          onClick={() => cardModal.onOpen(data.id)}
          className="truncate border-2 border-transparent hover:border-black px-2 md:px-3 text-xs md:text-sm bg-white rounded-md py-2 shadow-xs"
        >
          {data.title}
        </div>
      )}
    </Draggable>
  );
};

export default CardItem;
