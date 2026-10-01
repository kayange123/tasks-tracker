"use client";

import { useLocalStorage } from "usehooks-ts";
import { useOrganization, useOrganizationList } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import NavItem, { TOrganization } from "./NavItem";
import PlanMeter from "./PlanMeter";
import { useParams } from "next/navigation";

interface SidebarProps {
  storageKey?: string;
}
const Sidebar = ({ storageKey }: SidebarProps) => {
  const [expanded, setExpanded] = useLocalStorage<Record<string, boolean>>(
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

  if (!isLoadedOrg || !isLoadedOrgList || userMemberships.isLoading) {
    return <Sidebar.Skeleton />;
  }

  const organizations = (userMemberships.data ?? []).map(
    ({ organization }) => organization as TOrganization
  );

  // The organization in the URL starts expanded unless it was collapsed
  const openValues = organizations
    .filter(({ id }) => expanded[id] ?? id === organizationId)
    .map(({ id }) => id);

  const onValueChange = (values: string[]) => {
    setExpanded(
      Object.fromEntries(
        organizations.map(({ id }) => [id, values.includes(id)])
      )
    );
  };

  return (
    <div className="flex h-full flex-col px-3 py-4">
      <div className="flex items-center justify-between px-2 pb-2">
        <span className="text-xs font-medium text-muted-foreground">
          Organizations
        </span>
        <Button
          asChild
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground"
        >
          <Link href="/select-org" aria-label="Add organization">
            <Plus />
          </Link>
        </Button>
      </div>
      <Accordion
        type="multiple"
        value={openValues}
        onValueChange={onValueChange}
        className="flex flex-col gap-0.5"
      >
        {organizations.map((organization) => (
          <NavItem
            key={organization.id}
            isActive={organizationId === organization.id}
            organization={organization}
          />
        ))}
      </Accordion>
      <div className="mt-auto pt-4">
        <PlanMeter />
      </div>
    </div>
  );
};

Sidebar.Skeleton = function SidebarSkeleton() {
  return (
    <div className="flex h-full flex-col gap-2 px-3 py-4" aria-busy="true">
      <div className="flex items-center justify-between px-2 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-8" />
      </div>
      <NavItem.Skeleton />
      <NavItem.Skeleton />
    </div>
  );
};

export default Sidebar;
