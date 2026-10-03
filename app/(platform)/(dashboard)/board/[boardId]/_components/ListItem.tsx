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
      {(provided, snapshot) => (
        <li
          {...provided.draggableProps}
          ref={provided.innerRef}
          className="flex max-h-full w-72 shrink-0 flex-col select-none"
        >
          <section
            {...provided.dragHandleProps}
            aria-label={list.title}
            className={cn(
              "flex max-h-full flex-col gap-2 rounded-[14px] border border-border/70 bg-surface-2 p-2.5 transition-shadow",
              snapshot.isDragging && "shadow-lg ring-1 ring-primary/40"
            )}
          >
            <ListHeader
              // Remount when the saved title changes so local state can't go stale
              key={`${list.id}:${list.title}`}
              onAddCard={enableEditing}
              title={list.title}
              count={list.cards.length}
              id={list.id}
              boardId={list.boardId}
            />
            <Droppable droppableId={list.id} type="card">
              {(provided, snapshot) => (
                <ol
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "flex min-h-1 flex-col gap-2 overflow-y-auto rounded-[10px] transition-colors",
                    snapshot.isDraggingOver && "bg-primary-soft"
                  )}
                >
                  {list.cards.map((card, index) => (
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
          </section>
        </li>
      )}
    </Draggable>
  );
};

export default ListItem;
