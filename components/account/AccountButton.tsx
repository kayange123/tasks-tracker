"use client";

import { UserButton } from "@clerk/nextjs";
import { ShieldCheck } from "lucide-react";
import DataPrivacyPage from "./DataPrivacyPage";

// Clerk's account menu with a Data & privacy page in the account dialog.
// A client component: custom pages are read from UserButton's children.
const AccountButton = () => (
  <UserButton
    appearance={{
      elements: {
        avatarBox: "size-8",
      },
    }}
  >
    <UserButton.UserProfilePage
      label="Data & privacy"
      url="data-privacy"
      labelIcon={<ShieldCheck className="size-4" />}
    >
      <DataPrivacyPage />
    </UserButton.UserProfilePage>
  </UserButton>
);

export default AccountButton;
