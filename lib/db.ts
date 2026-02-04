import "server-only";

import { PrismaClient } from "@prisma/client";

declare global {
  var __oclaPrisma: PrismaClient | undefined;
}

function isDatabaseConfigured(): boolean {
  const url =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.POSTGRES_URL;

  console.log("[DB] Checking database configuration...");
  console.log("[DB] DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "NOT SET");

  return Boolean(url);
}

let prismaInitError: Error | null = null;

function createPrismaClient(): PrismaClient | null {
  try {
    console.log("[DB] Creating Prisma client...");
    const client = new PrismaClient({
      log: ["error", "warn"]
    });
    console.log("[DB] Prisma client created successfully");
    return client;
  } catch (error) {
    prismaInitError = error instanceof Error ? error : new Error(String(error));
    console.error("[DB] Failed to create Prisma client:", prismaInitError.message);
    return null;
  }
}

export function getPrisma(): PrismaClient | null {
  console.log("[DB] getPrisma() called");

  if (!isDatabaseConfigured()) {
    console.log("[DB] No database URL configured - returning null");
    return null;
  }

  if (prismaInitError) {
    console.error("[DB] Prisma init previously failed:", prismaInitError.message);
    return null;
  }

  if (!globalThis.__oclaPrisma) {
    console.log("[DB] Creating new Prisma instance...");
    globalThis.__oclaPrisma = createPrismaClient() ?? undefined;
  } else {
    console.log("[DB] Reusing existing Prisma instance");
  }

  return globalThis.__oclaPrisma ?? null;
}

export function getDbStatus(): { configured: boolean; error?: string } {
  if (!isDatabaseConfigured()) {
    return { configured: false, error: "DATABASE_URL not set" };
  }
  if (prismaInitError) {
    return { configured: true, error: prismaInitError.message };
  }
  return { configured: true };
}
