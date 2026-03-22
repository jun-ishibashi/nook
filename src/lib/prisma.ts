import "server-only";

import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const url = process.env.DATABASE_URL?.trim() ?? "";
  if (!url || (!url.startsWith("postgres://") && !url.startsWith("postgresql://"))) {
    throw new Error(
      "DATABASE_URL is missing or not a PostgreSQL URL. Set it in .env (see .env.example).",
    );
  }

  neonConfig.webSocketConstructor = ws;
  return new PrismaClient({
    adapter: new PrismaNeon({ connectionString: url }),
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
