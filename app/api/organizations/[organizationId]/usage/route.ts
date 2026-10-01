import { MAX_FREE_BOARDS } from "@/constants/boards";
import { getAvailableCount } from "@/lib/orgLimit";
import { checkSubscription } from "@/lib/subscription";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  // Usage is read for the session's active org; refuse while it differs
  // from the requested one so the meter never shows another org's numbers
  if (orgId !== organizationId) {
    return new NextResponse("Organization is not active", { status: 409 });
  }

  try {
    const [boards, isPro] = await Promise.all([
      getAvailableCount(),
      checkSubscription(),
    ]);
    return NextResponse.json({
      orgId,
      boards,
      limit: MAX_FREE_BOARDS,
      isPro,
    });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
