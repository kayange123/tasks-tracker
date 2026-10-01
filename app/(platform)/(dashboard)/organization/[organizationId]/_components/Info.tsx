"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useOrganization } from "@clerk/nextjs";
import { CreditCard } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";

interface InfoProps {
  isPro: boolean;
}

const Info = ({ isPro }: InfoProps) => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const { organization, isLoaded } = useOrganization();

  // Until the client switches, the active org is still the previous one
  if (!isLoaded || organization?.id !== organizationId) {
    return <Info.Skeleton />;
  }
  return (
    <div className="flex items-center gap-x-4">
      <div className="relative w-[60px] h-[60px]">
        <Image
          src={organization?.imageUrl!}
          fill
          className="rounded-md object-cover"
          alt={`${organization?.name} - cover image`}
        />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-xl">{organization?.name}</p>
        <div className="flex items-center font-semibold space-x-2 text-muted-foreground">
          <CreditCard className="h-4 w-4 md:h-5 md:w-5" />
          <p>{isPro ? "Pro" : "Free"}</p>
        </div>
      </div>
    </div>
  );
};

Info.Skeleton = function SkeletonInfo() {
  return (
    <div className="flex items-center gap-x-4">
      <div className="relative w-[60px] h-[60px]">
        <Skeleton className="w-full h-full absolute" />
      </div>
      <div className="space-y-1">
        <Skeleton className="h-10 w-[200px]" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4 md:h-5 md:w-5" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
      </div>
    </div>
  );
};

export default Info;
