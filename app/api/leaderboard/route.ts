import { NextResponse } from "next/server";

import { getPrisma, getDbStatus } from "@/lib/db";

// Prevent static prerendering - this route requires DB access
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  console.log("[API/leaderboard] GET request received");

  try {
    const status = getDbStatus();
    console.log("[API/leaderboard] DB status:", JSON.stringify(status));

    const prisma = getPrisma();

    if (!prisma) {
      console.log("[API/leaderboard] Prisma client is null");
      return NextResponse.json({
        rows: [],
        dbEnabled: false,
        error: status.error ?? "Prisma client not available",
        debug: {
          dbConfigured: status.configured,
          envVars: {
            DATABASE_URL: !!process.env.DATABASE_URL,
            POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
            POSTGRES_URL: !!process.env.POSTGRES_URL
          }
        }
      });
    }

    console.log("[API/leaderboard] Attempting database query...");
    const grouped = await prisma.benchmarkRun.groupBy({
      by: ["model"],
      _count: { _all: true },
      _avg: { overallAvgScore: true, overallRefusalRate: true }
    });
    console.log("[API/leaderboard] Query successful, found", grouped.length, "models");

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
    const stack = error instanceof Error ? error.stack : undefined;
    console.error("[API/leaderboard] Error:", message);
    console.error("[API/leaderboard] Stack:", stack);

    return NextResponse.json(
      {
        rows: [],
        dbEnabled: false,
        error: message,
        debug: {
          envVars: {
            DATABASE_URL: !!process.env.DATABASE_URL,
            POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
            POSTGRES_URL: !!process.env.POSTGRES_URL
          }
        }
      },
      { status: 500 }
    );
  }
}
