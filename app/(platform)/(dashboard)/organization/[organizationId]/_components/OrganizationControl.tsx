"use client";

import { useOrganization, useOrganizationList } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

interface OrganizationControlProps {
  // Whether the server rendered with the organization in the URL
  isSynced: boolean;
}

const OrganizationControl = ({ isSynced }: OrganizationControlProps) => {
  const router = useRouter();
  const { organizationId } = useParams<{ organizationId: string }>();
  const { organization, isLoaded: isOrgLoaded } = useOrganization();
  const { setActive, isLoaded: isListLoaded } = useOrganizationList();

  useEffect(() => {
    if (!isOrgLoaded || !isListLoaded || !setActive || !organizationId) return;

    if (organization?.id === organizationId) {
      // Client is already on this org; re-render the server placeholder
      if (!isSynced) router.refresh();
      return;
    }

    let cancelled = false;
    setActive({ organization: organizationId })
      .then(() => {
        if (!cancelled) router.refresh();
      })
      .catch(() => {
        // Not a member of this organization
        if (!cancelled) router.replace("/select-org");
      });

    return () => {
      cancelled = true;
    };
  }, [
    isOrgLoaded,
    isListLoaded,
    setActive,
    organization?.id,
    organizationId,
    isSynced,
    router,
  ]);

  return null;
};

export default OrganizationControl;
