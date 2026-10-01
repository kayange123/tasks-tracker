"use client";

import { useLocalStorage } from "usehooks-ts";
import { useOrganization, useOrganizationList } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import NavItem, { TOrganization } from "./NavItem";
import { useParams } from "next/navigation";

interface SidebarProps {
  storageKey?: string;
}
const Sidebar = ({ storageKey }: SidebarProps) => {
  const [expanded, setExpanded] = useLocalStorage<Record<string, any>>(
    storageKey ?? "t-sidebar-state",
    {},
    // Read storage after mount so server and client render the same markup
    { initializeWithValue: false }
  );
  // Highlight the organization being viewed, not the session's active one
  const { organizationId } = useParams<{ organizationId?: string }>();
  const { isLoaded: isLoadedOrg } = useOrganization();
  const { userMemberships, isLoaded: isLoadedOrgList } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });
  const defaultAccordionValues: string[] = Object.keys(expanded).reduce(
    (acc: string[], key: string) => {
      if (expanded[key]) {
        acc.push(key);
      }
      return acc;
    },
    []
  );

  const onExpand = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !expanded[key] }));
  };

  if (!isLoadedOrg || !isLoadedOrgList || userMemberships.isLoading)
    return (
      <>
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-10 w-[50%]" />
          <Skeleton className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <NavItem.Skeleton />
          <NavItem.Skeleton />
          <NavItem.Skeleton />
        </div>
      </>
    );

  return (
    <>
      <div className="text-sm font-medium flex items-center mb-1">
        <span className="pl-">Workspaces</span>
        <Button
          size="icon"
          asChild
          type="button"
          variant="ghost"
          className="ml-auto"
        >
          <Link href="/select-org">
            <Plus className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <Accordion
        type="multiple"
        defaultValue={defaultAccordionValues}
        className="space-y-2"
      >
        {userMemberships?.data?.map(({ organization }) => (
          <NavItem
            key={organization.id}
            isActive={organizationId === organization.id}
            isExpanded={expanded[organization?.id]}
            organization={organization as TOrganization}
            onExpand={onExpand}
          />
        ))}
      </Accordion>
    </>
  );
};

export default Sidebar;
