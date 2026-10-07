import {
  buildOrgExport,
  exportResponse,
  orgExportTables,
  parseExportFormat,
} from "@/lib/dataExport";
import { isOrgAdmin } from "@/lib/orgAdmin";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const { userId, orgId, orgRole } = await auth();

  if (!userId || !orgId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if (orgId !== organizationId) {
    return new NextResponse("Organization is not active", { status: 409 });
  }
  if (!isOrgAdmin(orgRole)) {
    return new NextResponse("Only organization admins can export data", {
      status: 403,
    });
  }

  const format = parseExportFormat(new URL(req.url).searchParams.get("format"));
  if (!format) {
    return new NextResponse("Format must be json or csv", { status: 400 });
  }

  try {
    const data = await buildOrgExport(orgId);
    return exportResponse(
      `taskier-${data.organization.slug ?? orgId}`,
      format,
      data,
      orgExportTables(data)
    );
  } catch (error) {
    return new NextResponse("Failed to export data", { status: 500 });
  }
}
