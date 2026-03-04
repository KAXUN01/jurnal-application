import { PrismaClient } from "@prisma/client";

// provide a sensible default for local development so that the app works
// out-of-the-box even when DATABASE_URL isn't set (common in fresh clones).
// note: dotenv is not imported here because Next.js loads .env.* files automatically
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === "") {
    console.warn(
        "DATABASE_URL is empty or unset; falling back to sqlite file at ./dev.db"
    );
    process.env.DATABASE_URL = "file:./dev.db";
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ["query"],
    });

// create the Trade table if it doesn't exist (prevents 500 errors when the
// database file has been created but migrations haven't been run). this is
// only done in development; in production you should run proper migrations.
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
    prisma
        .$executeRaw`
      CREATE TABLE IF NOT EXISTS "Trade" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "pair" TEXT NOT NULL,
          "tradeType" TEXT NOT NULL,
          "date" TEXT NOT NULL,
          "time" TEXT NOT NULL,
          "bias1H" TEXT NOT NULL,
          "rangeType" TEXT NOT NULL,
          "poiType" TEXT NOT NULL,
          "entryPrice" TEXT NOT NULL,
          "stopLoss" TEXT NOT NULL,
          "takeProfit" TEXT NOT NULL,
          "rrRatio" REAL NOT NULL,
          "lotSize" TEXT NOT NULL,
          "entryType" TEXT NOT NULL,
          "poiTapped" BOOLEAN,
          "chochConfirmed" BOOLEAN,
          "outcome" TEXT NOT NULL,
          "profitLoss" TEXT NOT NULL,
          "emotion" TEXT NOT NULL,
          "followedRules" BOOLEAN,
          "mistakes" TEXT NOT NULL,
          "screenshots" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL
      );
    `
        .catch((e) => {
            console.error("failed to create Trade table:", e);
        });
}

