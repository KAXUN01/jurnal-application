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

const globalForPrisma = global as unknown as {
    prisma: PrismaClient;
    __prisma_migrations_done?: boolean;
};

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        // Query logging removed — it was dumping every SQL statement to stdout
        // which adds significant overhead. Re-enable only when debugging:
        // log: ["query"],
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

// Create tables if they don't exist (prevents 500 errors when the
// database file has been created but migrations haven't been run). This is
// only done in development; in production you should run proper migrations.
//
// PERF: Wrapped in a once-guard so it only runs once per process lifecycle,
// not on every hot-reload module re-import.
if (process.env.NODE_ENV !== "production" && !globalForPrisma.__prisma_migrations_done) {
    globalForPrisma.__prisma_migrations_done = true;

    (async () => {
        try {
            await prisma.$executeRaw`
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
            `;
        } catch (e) {
            console.error("failed to create Trade table:", e);
        }

        try {
            // Create accounts table and ensure Trade has accountId column
            await prisma.$executeRaw`
                CREATE TABLE IF NOT EXISTS "Account" (
                    "id" TEXT NOT NULL PRIMARY KEY,
                    "name" TEXT NOT NULL,
                    "type" TEXT NOT NULL,
                    "balance" REAL NOT NULL,
                    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    "updatedAt" DATETIME NOT NULL
                );
            `;
        } catch (e) {
            console.error("failed to create Account table:", e);
        }

        try {
            // Create Goal table
            await prisma.$executeRaw`
                CREATE TABLE IF NOT EXISTS "Goal" (
                    "id" TEXT NOT NULL PRIMARY KEY,
                    "title" TEXT NOT NULL,
                    "category" TEXT NOT NULL,
                    "targetValue" REAL NOT NULL,
                    "currentValue" REAL NOT NULL DEFAULT 0,
                    "unit" TEXT NOT NULL DEFAULT '',
                    "timeframe" TEXT NOT NULL,
                    "startDate" TEXT NOT NULL,
                    "endDate" TEXT NOT NULL,
                    "priority" TEXT NOT NULL DEFAULT 'medium',
                    "status" TEXT NOT NULL DEFAULT 'active',
                    "notes" TEXT,
                    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    "updatedAt" DATETIME NOT NULL
                );
            `;
        } catch (e) {
            console.error("failed to create Goal table:", e);
        }

        try {
            // Create Habit table
            await prisma.$executeRaw`
                CREATE TABLE IF NOT EXISTS "Habit" (
                    "id" TEXT NOT NULL PRIMARY KEY,
                    "name" TEXT NOT NULL,
                    "category" TEXT NOT NULL,
                    "date" TEXT NOT NULL,
                    "completed" BOOLEAN NOT NULL DEFAULT false,
                    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    "updatedAt" DATETIME NOT NULL
                );
            `;
        } catch (e) {
            console.error("failed to create Habit table:", e);
        }

        try {
            // Create AiAnalysis table
            await prisma.$executeRaw`
                CREATE TABLE IF NOT EXISTS "AiAnalysis" (
                    "id" TEXT NOT NULL PRIMARY KEY,
                    "filters" TEXT NOT NULL,
                    "qualityScore" TEXT NOT NULL,
                    "executiveSummary" TEXT NOT NULL,
                    "compliance" TEXT NOT NULL,
                    "complianceNote" TEXT,
                    "psychology" TEXT NOT NULL,
                    "risk" TEXT NOT NULL,
                    "patterns" TEXT NOT NULL,
                    "improvementPlan" TEXT NOT NULL,
                    "profile" TEXT NOT NULL,
                    "insights" TEXT NOT NULL,
                    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                );
            `;
        } catch (e) {
            console.error("failed to create AiAnalysis table:", e);
        }

        // Add missing columns to Trade if they are not present
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
            await ensureColumn('entryExecutionTime', 'TEXT');
            await ensureColumn('followedRules', 'BOOLEAN');
        } catch (e) {
            // If alter fails, log but don't crash dev server
            console.error('failed to ensure Trade columns:', e);
        }
    })();
}
