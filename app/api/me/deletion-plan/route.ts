import { getAccountDeletionPlan } from "@/lib/accountDeletion";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// What deleting the signed-in person's account would do to their organizations
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    return NextResponse.json(await getAccountDeletionPlan(userId), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return new NextResponse("Failed to check organizations", { status: 500 });
  }
}
