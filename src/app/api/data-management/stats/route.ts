import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const [trades, accounts, goals, habits, aiAnalyses, users] =
            await Promise.all([
                prisma.trade.count(),
                prisma.account.count(),
                prisma.goal.count(),
                prisma.habit.count(),
                prisma.aiAnalysis.count(),
                prisma.user.count(),
            ]);

        // Estimate database size based on record counts
        const estimatedSizeBytes =
            trades * 2048 +
            accounts * 512 +
            goals * 512 +
            habits * 256 +
            aiAnalyses * 4096 +
            users * 256;

        return NextResponse.json({
            trades,
            accounts,
            goals,
            habits,
            aiAnalyses,
            users,
            totalRecords: trades + accounts + goals + habits + aiAnalyses + users,
            estimatedSizeBytes,
            estimatedSizeFormatted: formatBytes(estimatedSizeBytes),
        });
    } catch (error) {
        console.error("Failed to fetch data stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch data statistics" },
            { status: 500 }
        );
    }
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
