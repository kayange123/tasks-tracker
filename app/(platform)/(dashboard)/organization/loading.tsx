import OrganizationSkeleton from "./[organizationId]/_components/OrganizationSkeleton";

// Shown immediately on navigation so the previous page's data never
// stays on screen while the next one loads
export default function Loading() {
  return <OrganizationSkeleton />;
}
