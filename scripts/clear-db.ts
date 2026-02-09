import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

// Load environment variables from .env and .env.local
config({ path: ".env" });
config({ path: ".env.local", override: true });

if (!process.env.DATABASE_URL) {
    console.error("❌  Error: DATABASE_URL not found in .env or .env.local");
    process.exit(1);
}

let url = process.env.DATABASE_URL?.trim();

if (url) {
    // Ensure critical SSL params are present for Neon
    if (!url.includes("sslmode=")) {
        url += (url.includes("?") ? "&" : "?") + "sslmode=require";
    }

    // Mask password for safe logging: postgresql://user:***@host...
    const masked = url.replace(/:([^:@]+)@/, ":****@");
    console.log(`🔍 Using Database URL: ${masked}`);

    // Warn if using pooler without pgbouncer param if typical (optional)
    if (url.includes("pooler") && !url.includes("pgbouncer=true")) {
        console.log("⚠️  Note: Connecting to Neon pooler. Prisma usually works, but ensure timeouts are handled.");
    }
}

const prisma = new PrismaClient({
    datasources: {
        db: {
            url,
        },
    },
});

async function main() {
    console.log("⚠️  Clearing all database entries...");
    console.log(`🔌 Connecting to database...`);

    try {
        await prisma.$connect();
        console.log("✅  Connected successfully.");

        const { count } = await prisma.benchmarkRun.deleteMany({});
        console.log(`✅  Deleted ${count} benchmark runs.`);
    } catch (error) {
        console.error("❌  Failed to clear database:");
        if (error instanceof Error) {
            console.error(`   Error: ${error.message}`);
            if (error.message.includes("Can't reach database server")) {
                console.error("\n💡 TIP: Check your internet connection or if the database is paused (Neon).");
            }
        } else {
            console.error(error);
        }
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
