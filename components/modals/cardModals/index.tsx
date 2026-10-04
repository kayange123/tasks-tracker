"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCardModal } from "@/hooks/useCardModal";
import { fetcher } from "@/lib/fetcher";
import { CardWithList } from "@/types";
import { useQuery } from "@tanstack/react-query";
import ModalHeader from "./ModalHeader";
import Description from "./Description";
import Actions from "./Actions";
import { AuditLog } from "@prisma/client";
import Activity from "./Activity";

const CardModal = () => {
  const id = useCardModal((state) => state.id);
  const isOpen = useCardModal((state) => state.isOpen);
  const onClose = useCardModal((state) => state.onClose);

  // gcTime 0 drops a card's cache when the modal closes, so reopening
  // always loads fresh data behind a skeleton instead of the last copy
  const { data: card } = useQuery<CardWithList>({
    queryKey: ["card", id],
    queryFn: () => fetcher(`/api/cards/${id}`),
    enabled: !!id,
    gcTime: 0,
  });
  const { data: logs } = useQuery<AuditLog[]>({
    queryKey: ["card-log", id],
    queryFn: () => fetcher(`/api/cards/${id}/logs`),
    enabled: !!id,
    gcTime: 0,
  });

  // Only ever render data that belongs to the card being opened
  const cardData = card?.id === id ? card : undefined;
  const cardLogs = cardData ? logs : undefined;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-h-[calc(100dvh-2rem)] gap-6 overflow-y-auto rounded-2xl bg-card p-6 sm:max-w-3xl sm:p-7"
        // Focus the dialog itself on open (still announced), so the close
        // button doesn't start out focused and Tab goes to the title first
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          (event.currentTarget as HTMLElement | null)?.focus();
        }}
        // Escape in a field cancels that edit instead of closing the card
        onEscapeKeyDown={(event) => {
          const target = event.target as HTMLElement | null;
          if (target?.closest("input, textarea")) {
            event.preventDefault();
          }
        }}
      >
        <DialogTitle className="sr-only">
          {cardData?.title ?? "Loading card"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {cardData ? `Card in list ${cardData.list.title}` : "Card details"}
        </DialogDescription>
        {!cardData ? (
          <ModalHeader.Skeleton />
        ) : (
          <ModalHeader key={cardData.id} data={cardData} />
        )}
        <div className="grid gap-7 md:grid-cols-[minmax(0,1fr)_176px]">
          <div className="flex min-w-0 flex-col gap-6">
            {!cardData ? (
              <Description.Skeleton />
            ) : (
              <Description key={cardData.id} data={cardData} />
            )}
            {!cardLogs ? <Activity.Skeleton /> : <Activity logs={cardLogs} />}
          </div>
          {!cardData ? (
            <Actions.Skeleton />
          ) : (
            <Actions key={cardData.id} data={cardData} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CardModal;
