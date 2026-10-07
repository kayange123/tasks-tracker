import { anonymizeUser, purgeOrganization } from "@/lib/dataDeletion";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest, NextResponse } from "next/server";

// Clerk calls this when users or organizations are deleted, including from
// Clerk's own components and dashboard. Signed with CLERK_WEBHOOK_SIGNING_SECRET.
export async function POST(req: NextRequest) {
  let event;
  try {
    event = await verifyWebhook(req);
  } catch {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  try {
    if (event.type === "organization.deleted" && event.data.id) {
      await purgeOrganization(event.data.id);
    }
    if (event.type === "user.deleted" && event.data.id) {
      await anonymizeUser(event.data.id);
    }
  } catch (error) {
    // A failed response makes Clerk retry; the handlers are safe to repeat
    console.error(`Failed to handle ${event.type}`, error);
    return new NextResponse("Cleanup failed", { status: 500 });
  }

  return new NextResponse(null, { status: 200 });
}
