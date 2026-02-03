import "server-only";

import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __oclaPrisma: PrismaClient | undefined;
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });
}

function resolveDatabaseUrl() {
  return (
    process.env.DATABASE_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.POSTGRES_URL
  );
}

export function getPrisma() {
  const url = resolveDatabaseUrl();
  if (!url) return null;
  if (!process.env.DATABASE_URL) process.env.DATABASE_URL = url;
  if (!globalThis.__oclaPrisma) globalThis.__oclaPrisma = createPrismaClient();
  return globalThis.__oclaPrisma;
}
