"use client";

import ProModal from "@/components/modals/ProModal";
import CardModal from "@/components/modals/cardModals";
import { useCardModal } from "@/hooks/useCardModal";
import { useProModal } from "@/hooks/useProModal";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Modals live above the routes; close them on navigation so a card from
  // the previous board never stays open on the next page
  useEffect(() => {
    useCardModal.getState().onClose();
    useProModal.getState().onClose();
  }, [pathname]);

  if (!isMounted) return null;
  return (
    <>
      <CardModal />
      <ProModal />
    </>
  );
};
