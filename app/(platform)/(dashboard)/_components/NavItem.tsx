"use client";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Activity, CreditCard, LayoutGrid, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type TOrganization = {
  id: string;
  name: string;
  imageUrl: string;
  slug: string;
};

interface NavItemProps {
  isActive: boolean;
  organization: TOrganization;
}

const NavItem = ({ isActive, organization }: NavItemProps) => {
  const pathname = usePathname();

  const routes = [
    {
      label: "Boards",
      icon: LayoutGrid,
      href: `/organization/${organization.id}`,
    },
    {
      label: "Activity",
      icon: Activity,
      href: `/organization/${organization.id}/activity`,
    },
    {
      label: "Settings",
      icon: Settings,
      href: `/organization/${organization.id}/settings`,
    },
    {
      label: "Billing",
      icon: CreditCard,
      href: `/organization/${organization.id}/billing`,
    },
  ];

  return (
    <AccordionItem value={organization.id} className="border-none">
      <AccordionTrigger
        className={cn(
          "items-center rounded-lg px-2 py-2 hover:bg-accent hover:no-underline",
          isActive ? "font-semibold" : "font-medium"
        )}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <Image
            src={organization.imageUrl}
            alt=""
            width={24}
            height={24}
            className="size-6 shrink-0 rounded-md object-cover"
          />
          <span className="truncate">{organization.name}</span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-0.5 pt-1 pb-1 pl-3">
        {routes.map(({ href, label, icon: Icon }) => {
          const isCurrent = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              aria-current={isCurrent ? "page" : undefined}
              className={cn(
                "flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors",
                isCurrent
                  ? "bg-primary-soft font-medium text-primary-text"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon aria-hidden className="size-4" />
              {label}
            </Link>
          );
        })}
      </AccordionContent>
    </AccordionItem>
  );
};

export default NavItem;

NavItem.Skeleton = function NavItemSkeleton() {
  return (
    <div className="flex items-center gap-2.5 px-2 py-2">
      <Skeleton className="size-6 shrink-0 rounded-md" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
};
