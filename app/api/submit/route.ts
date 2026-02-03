import { NextResponse } from "next/server";
import { z } from "zod";

import { getPrisma } from "@/lib/db";

const categorySummarySchema = z.object({
  category: z.enum(["red", "blue", "purple"]),
  promptCount: z.number().int().min(0).max(500),
  refusalCount: z.number().int().min(0).max(500),
  refusalRate: z.number().min(0).max(1),
  avgScore: z.number().min(0).max(100)
});

const payloadSchema = z.object({
  runId: z.string().min(1).max(128),
  createdAt: z.string().datetime(),
  execution: z.enum(["browser", "script"]),
  trustLevel: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  trustReason: z.string().min(1).max(400),

  providerId: z.string().min(1).max(64),
  baseUrl: z.string().min(1).max(2048),
  model: z.string().min(1).max(128),

  promptPackId: z.string().min(1).max(128),
  promptPackSha256: z.string().regex(/^[a-f0-9]{64}$/i),

  runnerSha256: z.string().regex(/^[a-f0-9]{64}$/i).optional(),
  buildSha: z.string().min(1).max(64).optional(),

  userHash: z.string().min(1).max(128),
  summary: z.object({
    byCategory: z.array(categorySummarySchema).max(10),
    totals: z.object({
      promptCount: z.number().int().min(0).max(500),
      refusalRate: z.number().min(0).max(1),
      avgScore: z.number().min(0).max(100)
    })
  })
});

function pickCategory(summary: z.infer<typeof payloadSchema>["summary"], category: "red" | "blue" | "purple") {
  return summary.byCategory.find((c) => c.category === category) ?? {
    category,
    promptCount: 0,
    refusalCount: 0,
    refusalRate: 0,
    avgScore: 0
  };
}

export async function POST(req: Request) {
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json(
      { error: "Database not configured. Set DATABASE_URL to enable uploads." },
      { status: 503 }
    );
  }

  let payload: z.infer<typeof payloadSchema>;
  try {
    const json = await req.json();
    payload = payloadSchema.parse(json);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid payload." },
      { status: 400 }
    );
  }

  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const recentCount = await prisma.benchmarkRun.count({
    where: { userHash: payload.userHash, createdAt: { gte: dayAgo } }
  });
  if (recentCount >= 5) {
    return NextResponse.json({ error: "Rate limit exceeded (5 uploads per 24h)." }, { status: 429 });
  }

  const red = pickCategory(payload.summary, "red");
  const blue = pickCategory(payload.summary, "blue");
  const purple = pickCategory(payload.summary, "purple");

  await prisma.benchmarkRun.create({
    data: {
      runId: payload.runId,
      userHash: payload.userHash,
      providerId: payload.providerId,
      baseUrl: payload.baseUrl,
      model: payload.model,
      execution: payload.execution,
      trustLevel: payload.trustLevel,
      promptPackId: payload.promptPackId,
      promptPackSha256: payload.promptPackSha256,
      runnerSha256: payload.runnerSha256,
      buildSha: payload.buildSha,
      clientCreatedAt: new Date(payload.createdAt),
      redPromptCount: red.promptCount,
      redRefusalRate: red.refusalRate,
      redAvgScore: red.avgScore,
      bluePromptCount: blue.promptCount,
      blueRefusalRate: blue.refusalRate,
      blueAvgScore: blue.avgScore,
      purplePromptCount: purple.promptCount,
      purpleRefusalRate: purple.refusalRate,
      purpleAvgScore: purple.avgScore,
      overallPromptCount: payload.summary.totals.promptCount,
      overallRefusalRate: payload.summary.totals.refusalRate,
      overallAvgScore: payload.summary.totals.avgScore,
      summary: payload.summary
    }
  });

  return NextResponse.json({ ok: true });
}
