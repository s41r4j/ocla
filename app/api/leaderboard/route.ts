import { NextResponse } from "next/server";

import { getPrisma } from "@/lib/db";

export async function GET() {
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ rows: [], dbEnabled: false });
  }

  let grouped: {
    model: string;
    _count: { _all: number };
    _avg: { overallAvgScore: number | null; overallRefusalRate: number | null };
  }[];
  try {
    grouped = await prisma.benchmarkRun.groupBy({
      by: ["model"],
      _count: { _all: true },
      _avg: { overallAvgScore: true, overallRefusalRate: true }
    });
  } catch {
    return NextResponse.json({ rows: [], dbEnabled: true }, { status: 503 });
  }

  const rows = grouped
    .map((g) => ({
      model: g.model,
      runs: g._count._all,
      avgScore: Math.round(g._avg.overallAvgScore ?? 0),
      refusalRate: g._avg.overallRefusalRate ?? 0
    }))
    .sort((a, b) => b.avgScore - a.avgScore);

  return NextResponse.json({ rows, dbEnabled: true });
}
