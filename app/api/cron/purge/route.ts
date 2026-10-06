import { db } from "@/lib/prisma";
import { PURGE_AFTER_DAYS } from "@/lib/softDelete";
import { NextResponse } from "next/server";

const DAY_IN_MS = 86_400_000;

// Permanently removes rows soft-deleted more than PURGE_AFTER_DAYS ago.
// Vercel Cron calls it daily (vercel.json) with CRON_SECRET as a bearer token.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const cutoff = new Date(Date.now() - PURGE_AFTER_DAYS * DAY_IN_MS);
  const where = { deletedAt: { lt: cutoff } };

  // Children first, so no removal relies on cascading from a parent
  const cards = await db.card.deleteMany({ where });
  const lists = await db.list.deleteMany({ where });
  const boards = await db.board.deleteMany({ where });

  return NextResponse.json({
    cards: cards.count,
    lists: lists.count,
    boards: boards.count,
  });
}
