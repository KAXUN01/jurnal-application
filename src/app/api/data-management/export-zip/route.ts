import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import JSZip from "jszip";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const [trades, accounts, goals, habits, aiAnalyses, users] =
            await Promise.all([
                prisma.trade.findMany({ orderBy: { createdAt: "desc" } }),
                prisma.account.findMany({ orderBy: { createdAt: "desc" } }),
                prisma.goal.findMany({ orderBy: { createdAt: "desc" } }),
                prisma.habit.findMany({ orderBy: { createdAt: "desc" } }),
                prisma.aiAnalysis.findMany({ orderBy: { createdAt: "desc" } }),
                prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
            ]);

        const exportedAt = new Date().toISOString();

        const backup = {
            version: "1.0",
            appName: "TradeFlow",
            exportedAt,
            data: {
                users,
                trades,
                accounts,
                goals,
                habits,
                aiAnalyses,
            },
            metadata: {
                totalUsers: users.length,
                totalTrades: trades.length,
                totalAccounts: accounts.length,
                totalGoals: goals.length,
                totalHabits: habits.length,
                totalAiAnalyses: aiAnalyses.length,
                totalRecords:
                    users.length +
                    trades.length +
                    accounts.length +
                    goals.length +
                    habits.length +
                    aiAnalyses.length,
            },
        };

        const metadata = {
            version: "1.0",
            appName: "TradeFlow",
            exportedAt,
            format: "zip",
            contents: [
                "database.json — Complete database export",
                "metadata.json — Export metadata and record counts",
            ],
            counts: backup.metadata,
        };

        const zip = new JSZip();
        zip.file("database.json", JSON.stringify(backup, null, 2));
        zip.file("metadata.json", JSON.stringify(metadata, null, 2));

        const zipBuffer = await zip.generateAsync({
            type: "nodebuffer",
            compression: "DEFLATE",
            compressionOptions: { level: 9 },
        });

        const today = new Date().toISOString().split("T")[0];
        const filename = `tradejournal-backup-${today}.zip`;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return new NextResponse(zipBuffer as any, {
            status: 200,
            headers: {
                "Content-Type": "application/zip",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error("Failed to export ZIP:", error);
        return NextResponse.json(
            { error: "Failed to export ZIP archive" },
            { status: 500 }
        );
    }
}
