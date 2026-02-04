#!/usr/bin/env npx ts-node
/**
 * Script to view NeonDB data stored in the database
 * Usage: npx ts-node scripts/view-db.ts
 */

import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

async function main() {
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
        console.error("❌ DATABASE_URL not set in .env.local");
        process.exit(1);
    }

    console.log("🔌 Connecting to NeonDB...\n");

    const prisma = new PrismaClient();

    try {
        // Get all benchmark runs
        const runs = await prisma.benchmarkRun.findMany({
            orderBy: { createdAt: "desc" },
            take: 50 // Limit to last 50
        });

        console.log(`📊 Found ${runs.length} benchmark runs:\n`);
        console.log("─".repeat(100));

        if (runs.length === 0) {
            console.log("No data yet. Run a benchmark and share the results to populate the database.");
        } else {
            // Print header
            console.log(
                "Model".padEnd(30) +
                "Provider".padEnd(15) +
                "Score".padEnd(10) +
                "Refusal%".padEnd(10) +
                "Prompts".padEnd(10) +
                "Date"
            );
            console.log("─".repeat(100));

            for (const run of runs) {
                console.log(
                    run.model.slice(0, 28).padEnd(30) +
                    run.providerId.padEnd(15) +
                    run.overallAvgScore.toFixed(2).padEnd(10) +
                    (run.overallRefusalRate * 100).toFixed(1).padEnd(9) + "%" +
                    String(run.overallPromptCount).padEnd(10) +
                    run.createdAt.toISOString().split("T")[0]
                );
            }
        }

        console.log("\n─".repeat(100));

        // Aggregate stats
        const stats = await prisma.benchmarkRun.aggregate({
            _count: true,
            _avg: {
                overallAvgScore: true,
                overallRefusalRate: true
            }
        });

        console.log("\n📈 Aggregate Stats:");
        console.log(`   Total runs: ${stats._count}`);
        console.log(`   Avg score: ${stats._avg.overallAvgScore?.toFixed(2) ?? "N/A"}`);
        console.log(`   Avg refusal rate: ${((stats._avg.overallRefusalRate ?? 0) * 100).toFixed(1)}%`);

        // Unique models
        const uniqueModels = await prisma.benchmarkRun.groupBy({
            by: ["model"],
            _count: true,
            orderBy: { _count: { model: "desc" } },
            take: 10
        });

        console.log("\n🏆 Top Models by Run Count:");
        for (const m of uniqueModels) {
            console.log(`   ${m.model}: ${m._count} runs`);
        }

    } catch (error) {
        console.error("❌ Database error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
