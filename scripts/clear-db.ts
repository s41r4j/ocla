import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

config({ path: ".env.local" });

const prisma = new PrismaClient();

async function main() {
    console.log("⚠️  Clearing all database entries...");
    try {
        const { count } = await prisma.benchmarkRun.deleteMany({});
        console.log(`✅  Deleted ${count} benchmark runs.`);
    } catch (error) {
        console.error("❌  Failed to clear database:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
