import { auth } from "@clerk/nextjs/server";
import OrganizationControl from "./_components/OrganizationControl";
import OrganizationSkeleton from "./_components/OrganizationSkeleton";

const OrganizationIdLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ organizationId: string }>;
}) => {
  const { organizationId } = await params;
  const { orgId } = await auth();

  // Server components read the session's active organization; until it
  // matches the URL, render a placeholder instead of another org's data
  const isSynced = orgId === organizationId;

  return (
    <div>
      <OrganizationControl isSynced={isSynced} />
      {isSynced ? children : <OrganizationSkeleton />}
    </div>
  );
};

export default OrganizationIdLayout;
