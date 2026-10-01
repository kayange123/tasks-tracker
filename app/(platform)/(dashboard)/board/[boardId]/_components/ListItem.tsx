"use client";

import { ListWithCards } from "@/types";
import ListHeader from "./ListHeader";
import { ElementRef, useRef, useState } from "react";
import CardForm from "./CardForm";
import { cn } from "@/lib/utils";
import CardItem from "./CardItem";
import { Draggable, Droppable } from "@hello-pangea/dnd";

interface ListItemProps {
  index: number;
  list: ListWithCards;
}

const ListItem = ({ index, list }: ListItemProps) => {
  const textAreaRef = useRef<ElementRef<"textarea">>(null);
  const [isEditing, setIsEditing] = useState(false);

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      textAreaRef.current?.select();
    });
  };

  const disableEditing = () => {
    setIsEditing(false);
  };
  return (
    <Draggable draggableId={list.id} index={index}>
      {(provided) => (
        <li
          {...provided.draggableProps}
          ref={provided.innerRef}
          className="shrink-0 h-full max-w-xs select-none"
        >
          <div
            {...provided.dragHandleProps}
            className="w-full rounded-md bg-[#f1f2f4] shadow-md pb-2"
          >
            <ListHeader
              // Remount when the saved title changes so local state can't go stale
              key={`${list.id}:${list.title}`}
              onAddCard={enableEditing}
              title={list.title}
              id={list.id}
              boardId={list.boardId}
            />
            <Droppable droppableId={list.id} type="card">
              {(provided) => (
                <ol
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "mx-1 px-1 py-0.5 flex mt-0 flex-col gap-y-2",
                    list.cards.length > 0 && "mt-2"
                  )}
                >
                  {list.cards?.map((card, index) => (
                    <CardItem index={index} key={card.id} data={card} />
                  ))}
                  {provided.placeholder}
                </ol>
              )}
            </Droppable>
            <CardForm
              ref={textAreaRef}
              isEditing={isEditing}
              enableEditing={enableEditing}
              disableEditing={disableEditing}
              listId={list.id}
            />
          </div>
        </li>
      )}
    </Draggable>
  );
};

export default ListItem;
