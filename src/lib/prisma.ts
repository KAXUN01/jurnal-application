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
          "tradeDirection" TEXT NOT NULL,
          "date" TEXT NOT NULL,
          "time" TEXT NOT NULL,
          "entryPrice" TEXT NOT NULL,
          "stopLoss" TEXT NOT NULL,
          "takeProfit" TEXT NOT NULL,
          "exitPrice" TEXT NOT NULL,
          "rrRatio" REAL NOT NULL,
          "lotSize" TEXT NOT NULL,
          "tradeDuration" TEXT NOT NULL,
          "outcome" TEXT NOT NULL,
          "profitLoss" TEXT NOT NULL,
          "profitLossPercent" TEXT NOT NULL,
          "beforeTrade" TEXT NOT NULL,
          "duringTrade" TEXT NOT NULL,
          "afterTrade" TEXT NOT NULL,
          "beforeScreenshot" TEXT,
          "afterScreenshot" TEXT,
          "screenshots" TEXT,
          "tags" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL
      );
    `
        .catch((e) => {
            console.error("failed to create Trade table:", e);
        });

    // Create accounts table and ensure Trade has accountId column
    prisma
        .$executeRaw`
      CREATE TABLE IF NOT EXISTS "Account" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "balance" REAL NOT NULL,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL
      );
    `
        .catch((e) => {
            console.error("failed to create Account table:", e);
        });

    // Add missing columns to Trade if they are not present
    (async () => {
        try {
            const cols = (await prisma.$queryRaw`PRAGMA table_info('Trade')`) as Array<{ name: string }>;
            const columnNames = Array.isArray(cols) ? cols.map((c) => c.name) : [];
            const ensureColumn = async (name: string, definition: string) => {
                if (!columnNames.includes(name)) {
                    await prisma.$executeRawUnsafe(`ALTER TABLE "Trade" ADD COLUMN "${name}" ${definition}`);
                }
            };

            if (!columnNames.includes('accountId')) {
                await prisma.$executeRaw`ALTER TABLE "Trade" ADD COLUMN "accountId" TEXT`;
            }
            await ensureColumn('tradeDirection', "TEXT NOT NULL DEFAULT ''");
            await ensureColumn('exitPrice', "TEXT NOT NULL DEFAULT ''");
            await ensureColumn('tradeDuration', "TEXT NOT NULL DEFAULT ''");
            await ensureColumn('profitLossPercent', "TEXT NOT NULL DEFAULT ''");
            await ensureColumn('beforeTrade', "TEXT NOT NULL DEFAULT ''");
            await ensureColumn('duringTrade', "TEXT NOT NULL DEFAULT ''");
            await ensureColumn('afterTrade', "TEXT NOT NULL DEFAULT ''");
            await ensureColumn('beforeScreenshot', 'TEXT');
            await ensureColumn('afterScreenshot', 'TEXT');
            await ensureColumn('screenshots', 'TEXT');
            await ensureColumn('tags', 'TEXT');
        } catch (e) {
            // If alter fails, log but don't crash dev server
            console.error('failed to ensure Trade columns:', e);
        }
    })();
}

