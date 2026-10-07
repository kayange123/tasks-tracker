import {
  buildUserExport,
  exportResponse,
  parseExportFormat,
  userExportTables,
} from "@/lib/dataExport";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// The signed-in person's own data, whatever organization is active
export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const format = parseExportFormat(new URL(req.url).searchParams.get("format"));
  if (!format) {
    return new NextResponse("Format must be json or csv", { status: 400 });
  }

  try {
    const data = await buildUserExport(userId);
    return exportResponse(
      "taskier-my-data",
      format,
      data,
      userExportTables(data),
    );
  } catch (error) {
    return new NextResponse("Failed to export data", { status: 500 });
  }
}
