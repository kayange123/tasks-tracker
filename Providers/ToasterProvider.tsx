"use client";

import { Toaster as LegacyToaster } from "react-hot-toast";
import { Toaster } from "sonner";

const ToasterProvider = () => {
  return (
    <>
      <LegacyToaster position="bottom-right" />
      <Toaster
        position="bottom-right"
        visibleToasts={4}
        gap={10}
        offset={16}
        mobileOffset={12}
      />
    </>
  );
};

export default ToasterProvider;
