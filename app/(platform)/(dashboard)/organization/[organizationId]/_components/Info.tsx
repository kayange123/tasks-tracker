"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useOrganization } from "@clerk/nextjs";
import Image from "next/image";
import { useParams } from "next/navigation";

interface InfoProps {
  isPro: boolean;
  boardCount?: number;
}

const Info = ({ isPro, boardCount }: InfoProps) => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const { organization, isLoaded } = useOrganization();

  // Until the client switches, the active org is still the previous one
  if (!isLoaded || !organization || organization.id !== organizationId) {
    return <Info.Skeleton />;
  }

  const details = [isPro ? "Pro plan" : "Free plan"];
  if (boardCount !== undefined) {
    details.push(`${boardCount} ${boardCount === 1 ? "board" : "boards"}`);
  }

  return (
    <div className="flex items-center gap-3.5">
      <Image
        src={organization.imageUrl}
        alt=""
        width={48}
        height={48}
        className="size-12 shrink-0 rounded-xl object-cover"
      />
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="truncate text-[22px] leading-tight font-semibold tracking-tight">
          {organization.name}
        </h1>
        <p className="text-[13px] text-muted-foreground">
          {details.join(" · ")}
        </p>
      </div>
    </div>
  );
};

Info.Skeleton = function InfoSkeleton() {
  return (
    <div className="flex items-center gap-3.5" aria-busy="true">
      <Skeleton className="size-12 shrink-0 rounded-xl" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-28" />
      </div>
    </div>
  );
};

export default Info;
