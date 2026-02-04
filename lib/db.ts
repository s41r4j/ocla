import "server-only";

import { PrismaClient } from "@prisma/client";

declare global {
  var __oclaPrisma: PrismaClient | undefined;
}

function resolveDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.POSTGRES_URL
  );
}

let prismaInitError: Error | null = null;

function createPrismaClient(url: string): PrismaClient | null {
  try {
    const client = new PrismaClient({
      datasourceUrl: url,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
    } as ConstructorParameters<typeof PrismaClient>[0]);
    return client;
  } catch (error) {
    prismaInitError = error instanceof Error ? error : new Error(String(error));
    console.error("Failed to create Prisma client:", prismaInitError.message);
    return null;
  }
}

export function getPrisma(): PrismaClient | null {
  const url = resolveDatabaseUrl();
  if (!url) {
    console.log("Database URL not configured");
    return null;
  }

  if (prismaInitError) {
    console.error("Prisma init previously failed:", prismaInitError.message);
    return null;
  }

  if (!globalThis.__oclaPrisma) {
    globalThis.__oclaPrisma = createPrismaClient(url) ?? undefined;
  }

  return globalThis.__oclaPrisma ?? null;
}

export function getDbStatus(): { configured: boolean; error?: string } {
  const url = resolveDatabaseUrl();
  if (!url) {
    return { configured: false, error: "DATABASE_URL not set" };
  }
  if (prismaInitError) {
    return { configured: true, error: prismaInitError.message };
  }
  return { configured: true };
}
