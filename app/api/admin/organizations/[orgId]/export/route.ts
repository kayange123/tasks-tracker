import {
  buildOrgExport,
  exportResponse,
  orgExportTables,
  parseExportFormat,
} from "@/lib/dataExport";
import { getOperatorId, logAdminAction } from "@/lib/operator";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> },
) {
  const operatorId = await getOperatorId();
  if (!operatorId) {
    return new NextResponse("Not found", { status: 404 });
  }

  const { orgId } = await params;
  const format = parseExportFormat(new URL(req.url).searchParams.get("format"));
  if (!format) {
    return new NextResponse("Format must be json or csv", { status: 400 });
  }

  try {
    const data = await buildOrgExport(orgId);
    await logAdminAction(
      operatorId,
      "EXPORT_ORGANIZATION",
      { type: "ORGANIZATION", id: orgId },
      format.toUpperCase(),
    );
    return exportResponse(
      `taskier-${data.organization.slug ?? orgId}`,
      format,
      data,
      orgExportTables(data),
    );
  } catch (error) {
    return new NextResponse("Failed to export data", { status: 500 });
  }
}
