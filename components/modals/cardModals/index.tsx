"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
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
      <DialogContent>
        {!cardData ? (
          <ModalHeader.Skeleton />
        ) : (
          <ModalHeader key={cardData.id} data={cardData} />
        )}
        <div className="grid grid-cols-1 md:grid-cols-4 md:gap-4">
          <div className="col-span-3">
            <div className="w-full space-y-6">
              {!cardData ? (
                <Description.Skeleton />
              ) : (
                <Description key={cardData.id} data={cardData} />
              )}
              {!cardLogs ? <Activity.Skeleton /> : <Activity logs={cardLogs} />}
            </div>
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
