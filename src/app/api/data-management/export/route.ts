import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getAllData() {
    const [trades, accounts, goals, habits, aiAnalyses, users] =
        await Promise.all([
            prisma.trade.findMany({ orderBy: { createdAt: "desc" } }),
            prisma.account.findMany({ orderBy: { createdAt: "desc" } }),
            prisma.goal.findMany({ orderBy: { createdAt: "desc" } }),
            prisma.habit.findMany({ orderBy: { createdAt: "desc" } }),
            prisma.aiAnalysis.findMany({ orderBy: { createdAt: "desc" } }),
            prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
        ]);

    return { trades, accounts, goals, habits, aiAnalyses, users };
}

export async function GET() {
    try {
        const data = await getAllData();

        const backup = {
            version: "1.0",
            appName: "TradeFlow",
            exportedAt: new Date().toISOString(),
            data: {
                users: data.users,
                trades: data.trades,
                accounts: data.accounts,
                goals: data.goals,
                habits: data.habits,
                aiAnalyses: data.aiAnalyses,
            },
            metadata: {
                totalUsers: data.users.length,
                totalTrades: data.trades.length,
                totalAccounts: data.accounts.length,
                totalGoals: data.goals.length,
                totalHabits: data.habits.length,
                totalAiAnalyses: data.aiAnalyses.length,
                totalRecords:
                    data.users.length +
                    data.trades.length +
                    data.accounts.length +
                    data.goals.length +
                    data.habits.length +
                    data.aiAnalyses.length,
            },
        };

        const jsonString = JSON.stringify(backup, null, 2);
        const today = new Date().toISOString().split("T")[0];
        const filename = `tradejournal-backup-${today}.json`;

        return new NextResponse(jsonString, {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error("Failed to export data:", error);
        return NextResponse.json(
            { error: "Failed to export data" },
            { status: 500 }
        );
    }
}
