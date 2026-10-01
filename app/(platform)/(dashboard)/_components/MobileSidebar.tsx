"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useMobileSidebar } from "@/hooks/useMobileView";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import Sidebar from "./Sidebar";

const MobileSidebar = () => {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const isOpen = useMobileSidebar((state) => state.isOpen);
  const onOpen = useMobileSidebar((state) => state.onOpen);
  const onClose = useMobileSidebar((state) => state.onClose);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  useEffect(() => {
    onClose();
  }, [onClose, pathname]);
  if (!isMounted) return null;

  return (
    <>
      <Button
        onClick={onOpen}
        variant="ghost"
        size="icon"
        aria-label="Open navigation"
        className="md:hidden"
      >
        <Menu className="size-5" />
      </Button>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent
          side="left"
          className="w-[280px] gap-0 p-0 sm:max-w-[280px]"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="h-full pt-8">
            <Sidebar storageKey="t-sidebar-mobile-state" />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileSidebar;
