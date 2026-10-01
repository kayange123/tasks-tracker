import { ModalProvider } from "@/Providers/ModalProvider";
import QueryProvider from "@/Providers/QueryProvider";
import ToasterProvider from "@/Providers/ToasterProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";

const PlatformLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider
      afterSignOutUrl="/"
      // Reads the app's CSS tokens, so Clerk follows light and dark mode.
      // Clerk paints --input as the field background; ours is a border color
      appearance={{
        theme: shadcn,
        variables: { colorInput: "var(--card)" },
        // --primary is too dark for link text on dark surfaces
        elements: { footerActionLink: "text-primary-text!" },
      }}
    >
      <QueryProvider>
        <ToasterProvider />
        <ModalProvider />
        {children}
      </QueryProvider>
    </ClerkProvider>
  );
};

export default PlatformLayout;
