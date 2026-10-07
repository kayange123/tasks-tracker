import {
  buildUserExport,
  exportResponse,
  parseExportFormat,
  userExportTables,
} from "@/lib/dataExport";
import { getOperatorId, logAdminAction } from "@/lib/operator";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const operatorId = await getOperatorId();
  if (!operatorId) {
    return new NextResponse("Not found", { status: 404 });
  }

  const { userId } = await params;
  const format = parseExportFormat(new URL(req.url).searchParams.get("format"));
  if (!format) {
    return new NextResponse("Format must be json or csv", { status: 400 });
  }

  try {
    const data = await buildUserExport(userId);
    await logAdminAction(
      operatorId,
      "EXPORT_USER",
      { type: "USER", id: userId },
      format.toUpperCase(),
    );
    return exportResponse(
      `taskier-user-${userId}`,
      format,
      data,
      userExportTables(data),
    );
  } catch (error) {
    return new NextResponse("Failed to export data", { status: 500 });
  }
}
