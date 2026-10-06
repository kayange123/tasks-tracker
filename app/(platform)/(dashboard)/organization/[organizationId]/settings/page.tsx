import { OrganizationProfile } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Info from "../_components/Info";
import OrganizationData from "./_components/OrganizationData";
import { checkSubscription } from "@/lib/subscription";
import { isOrgAdmin } from "@/lib/orgAdmin";

const SettingsPage = async () => {
  const [{ orgId, orgRole }, isPro] = await Promise.all([
    auth(),
    checkSubscription(),
  ]);

  return (
    <div className="flex flex-col gap-8 pb-12">
      <Info isPro={isPro} />
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[15px] font-semibold">Settings</h2>
          <p className="text-[13px] text-muted-foreground">
            Organization details, members and invitations.
          </p>
        </div>
        {/* Hash routing: this route has no catch-all segment for Clerk's
            tab paths. Colors come from the app theme */}
        <OrganizationProfile
          routing="hash"
          appearance={{
            elements: {
              rootBox: "w-full",
              // Clerk's own styles win without !important
              cardBox:
                "w-full! max-w-none! rounded-xl! border! border-border! shadow-none!",
            },
          }}
        />
      </section>
      {orgId && (
        <OrganizationData
          orgId={orgId}
          isAdmin={isOrgAdmin(orgRole)}
          isPro={isPro}
        />
      )}
    </div>
  );
};

export default SettingsPage;
