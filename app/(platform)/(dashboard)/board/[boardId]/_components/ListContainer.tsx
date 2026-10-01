"use client";

import { ListWithCards } from "@/types";
import ListForm from "./ListForm";
import { useEffect, useState } from "react";
import ListItem from "./ListItem";

import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useAction } from "@/hooks/useActions";
import { updateListOrder } from "@/actions/update-list-order/action";
import toast from "react-hot-toast";
import { updateCardOrder } from "@/actions/update-card-order/action";

interface ListContainerProps {
  boardId: string;
  list: ListWithCards[];
}
const ListContainer = ({ boardId, list }: ListContainerProps) => {
  const [orderedList, setOrderedList] = useState(list);
  const { execute: executeUpdateListOrder } = useAction(updateListOrder, {
    onSuccess: () => {
      toast.success("lists reordered");
    },
    onError(error) {
      // Drop the optimistic order and show the saved one again
      setOrderedList(list);
      toast.error(error);
    },
  });
  const { execute: executeUpdateCardOrder } = useAction(updateCardOrder, {
    onSuccess: () => {
      toast.success("cards reordered");
    },
    onError(error) {
      setOrderedList(list);
      toast.error(error);
    },
  });

  useEffect(() => {
    setOrderedList(list);
  }, [list]);

  //Reorder the items
  function reorder<T>(list: T[], startIndex: number, endIndex: number) {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  }

  const onDragEnd = (result: any) => {
    const { destination, source, type } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      source.index === destination.index
    )
      return;

    //When dragging a list
    if (type === "list") {
      const items = reorder(orderedList, source.index, destination.index).map(
        (item, index) => ({ ...item, order: index })
      );

      setOrderedList(items);
      executeUpdateListOrder({ items, boardId });
    }

    if (type === "card") {
      // Copy lists and cards so the server-provided props are never mutated
      const newOrderedData = orderedList.map((list) => ({
        ...list,
        cards: [...(list.cards ?? [])],
      }));

      const sourceList = newOrderedData.find(
        (list) => list.id === source.droppableId
      );
      const destinationList = newOrderedData.find(
        (list) => list.id === destination.droppableId
      );

      if (!sourceList || !destinationList) return;

      if (source.droppableId === destination.droppableId) {
        const reorderedCards = reorder(
          sourceList.cards,
          source.index,
          destination.index
        ).map((card, index) => ({ ...card, order: index }));

        sourceList.cards = reorderedCards;
        setOrderedList(newOrderedData);

        executeUpdateCardOrder({ boardId, items: reorderedCards });
      } else {
        const [movedCard] = sourceList.cards.splice(source.index, 1);

        //Assign new listId
        destinationList.cards.splice(destination.index, 0, {
          ...movedCard,
          listId: destination.droppableId,
        });

        sourceList.cards = sourceList.cards.map((card, index) => ({
          ...card,
          order: index,
        }));
        destinationList.cards = destinationList.cards.map((card, index) => ({
          ...card,
          order: index,
        }));

        setOrderedList(newOrderedData);
        executeUpdateCardOrder({
          boardId,
          items: destinationList.cards,
        });
      }
    }
  };

  return (
    <div className="pt-24 w-full">
      <ListForm />
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="lists" type="list" direction="horizontal">
          {(provided) => (
            <ol
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4"
            >
              {/* Render the optimistic order, not the last server snapshot */}
              {orderedList.map((list, index) => (
                <ListItem key={list.id} index={index} list={list} />
              ))}
              {provided.placeholder}
            </ol>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default ListContainer;
