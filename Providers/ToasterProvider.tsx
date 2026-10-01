"use client";

import { Toaster } from "sonner";

const ToasterProvider = () => {
  return (
    <Toaster
      position="bottom-right"
      visibleToasts={4}
      gap={10}
      offset={16}
      mobileOffset={12}
    />
  );
};

export default ToasterProvider;
