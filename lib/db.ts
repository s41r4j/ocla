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

function createPrismaClient(url: string): PrismaClient {
  return new PrismaClient({
    datasourceUrl: url,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  } as ConstructorParameters<typeof PrismaClient>[0]);
}

export function getPrisma(): PrismaClient | null {
  const url = resolveDatabaseUrl();
  if (!url) return null;

  if (!globalThis.__oclaPrisma) {
    globalThis.__oclaPrisma = createPrismaClient(url);
  }

  return globalThis.__oclaPrisma;
}
