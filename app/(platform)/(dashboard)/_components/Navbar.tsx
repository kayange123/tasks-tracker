import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import React from "react";
import MobileSidebar from "./MobileSidebar";
import FormPopover from "@/components/form/form-popover";
import ThemeToggle from "@/components/ThemeToggle";

const Navbar = () => {
  return (
    <nav className="fixed top-0 z-50 flex h-14 w-full items-center gap-2 border-b bg-card px-3 md:gap-3 md:px-5">
      <MobileSidebar />
      {/* Same width as the sidebar, so the switcher lines up with content */}
      <Logo compact className="md:w-[228px]" />
      <div className="hidden sm:flex">
        <OrganizationSwitcher
          hidePersonal
          afterCreateOrganizationUrl="/organization/:id"
          afterLeaveOrganizationUrl="/select-org"
          afterSelectOrganizationUrl="/organization/:id"
          appearance={{
            elements: {
              rootBox: "flex items-center",
              organizationSwitcherTrigger:
                "h-9! rounded-md! border! border-border! px-2.5! hover:bg-accent!",
            },
          }}
        />
      </div>
      <div className="ml-auto flex items-center gap-1.5 md:gap-2">
        <FormPopover align="end" side="bottom" sideOffset={12}>
          <Button size="sm" aria-label="Create board">
            <Plus />
            <span className="hidden sm:inline">Create board</span>
          </Button>
        </FormPopover>
        <ThemeToggle />
        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-8",
            },
          }}
        />
      </div>
    </nav>
  );
};

export default Navbar;
