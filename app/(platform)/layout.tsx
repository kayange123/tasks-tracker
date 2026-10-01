import { ModalProvider } from "@/Providers/ModalProvider";
import QueryProvider from "@/Providers/QueryProvider";
import ToasterProvider from "@/Providers/ToasterProvider";
import { ClerkProvider } from "@clerk/nextjs";

const PlatformLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <QueryProvider>
        <ToasterProvider />
        <ModalProvider />
        {children}
      </QueryProvider>
    </ClerkProvider>
  );
};

export default PlatformLayout;
