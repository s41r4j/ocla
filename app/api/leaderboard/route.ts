import { NextResponse } from "next/server";

import { getPrisma, getDbStatus } from "@/lib/db";

// Prevent static prerendering - this route requires DB access
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const prisma = getPrisma();

    if (!prisma) {
      const status = getDbStatus();
      return NextResponse.json({
        rows: [],
        dbEnabled: false,
        error: status.error ?? "Prisma client not available"
      });
    }

    const grouped = await prisma.benchmarkRun.groupBy({
      by: ["model"],
      _count: { _all: true },
      _avg: { overallAvgScore: true, overallRefusalRate: true }
    });

    const rows = grouped
      .map((g) => ({
        model: g.model,
        runs: g._count._all,
        avgScore: Math.round(g._avg.overallAvgScore ?? 0),
        refusalRate: g._avg.overallRefusalRate ?? 0
      }))
      .sort((a, b) => b.avgScore - a.avgScore);

    return NextResponse.json({ rows, dbEnabled: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Leaderboard API error:", message);
    return NextResponse.json(
      { rows: [], dbEnabled: false, error: message },
      { status: 500 }
    );
  }
}
