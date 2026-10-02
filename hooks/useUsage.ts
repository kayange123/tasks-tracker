import { useQuery } from "@tanstack/react-query";

export interface Usage {
  orgId: string;
  boards: number;
  limit: number;
  isPro: boolean;
}

const fetchUsage = async (organizationId: string): Promise<Usage> => {
  const response = await fetch(`/api/organizations/${organizationId}/usage`);
  if (!response.ok) {
    throw new Error(`Usage request failed: ${response.status}`);
  }
  return response.json();
};

// Free-plan board usage for an organization. Returns data only when it
// belongs to that organization, so callers never show another org's
// numbers while a switch is in progress.
export const useUsage = (organizationId?: string) => {
  const { data } = useQuery({
    queryKey: ["usage", organizationId],
    queryFn: () => fetchUsage(organizationId!),
    enabled: !!organizationId,
    // Fresh numbers on every visit; the API answers 409 until the org
    // switch completes, so keep retrying briefly
    gcTime: 0,
    retry: 5,
    retryDelay: 500,
  });

  return data && data.orgId === organizationId ? data : undefined;
};
