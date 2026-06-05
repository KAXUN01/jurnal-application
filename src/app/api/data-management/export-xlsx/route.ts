import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

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

        const workbook = XLSX.utils.book_new();

        // Users sheet
        if (users.length > 0) {
            const usersSheet = XLSX.utils.json_to_sheet(
                users.map((u) => ({
                    ID: u.id,
                    Name: u.name || "",
                    Email: u.email || "",
                    Role: u.role,
                    "Created At": u.createdAt?.toISOString() || "",
                    "Updated At": u.updatedAt?.toISOString() || "",
                }))
            );
            XLSX.utils.book_append_sheet(workbook, usersSheet, "Users");
        } else {
            XLSX.utils.book_append_sheet(
                workbook,
                XLSX.utils.aoa_to_sheet([["No user data"]]),
                "Users"
            );
        }

        // Trades sheet
        if (trades.length > 0) {
            const tradesSheet = XLSX.utils.json_to_sheet(
                trades.map((t) => ({
                    ID: t.id,
                    Pair: t.pair,
                    "Account ID": t.accountId || "",
                    "Trade Type": t.tradeType,
                    Direction: t.tradeDirection,
                    Date: t.date,
                    Time: t.time,
                    "Entry Price": t.entryPrice,
                    "Stop Loss": t.stopLoss,
                    "Take Profit": t.takeProfit,
                    "Exit Price": t.exitPrice,
                    "RR Ratio": t.rrRatio,
                    "Lot Size": t.lotSize,
                    Duration: t.tradeDuration,
                    Outcome: t.outcome,
                    "P/L": t.profitLoss,
                    "P/L %": t.profitLossPercent,
                    "Before Trade": t.beforeTrade,
                    "During Trade": t.duringTrade,
                    "After Trade": t.afterTrade,
                    Tags: t.tags || "",
                    "Created At": t.createdAt?.toISOString() || "",
                }))
            );
            XLSX.utils.book_append_sheet(workbook, tradesSheet, "Trades");
        } else {
            XLSX.utils.book_append_sheet(
                workbook,
                XLSX.utils.aoa_to_sheet([["No trade data"]]),
                "Trades"
            );
        }

        // Accounts sheet
        if (accounts.length > 0) {
            const accountsSheet = XLSX.utils.json_to_sheet(
                accounts.map((a) => ({
                    ID: a.id,
                    Name: a.name,
                    Type: a.type,
                    Balance: a.balance,
                    "Account Size": a.accountSize,
                    Broker: a.brokerName,
                    Currency: a.currency || "",
                    Leverage: a.leverage || "",
                    Status: a.status,
                    "Start Date": a.startDate || "",
                    Notes: a.notes || "",
                    "Created At": a.createdAt?.toISOString() || "",
                }))
            );
            XLSX.utils.book_append_sheet(workbook, accountsSheet, "Accounts");
        } else {
            XLSX.utils.book_append_sheet(
                workbook,
                XLSX.utils.aoa_to_sheet([["No account data"]]),
                "Accounts"
            );
        }

        // Goals sheet
        if (goals.length > 0) {
            const goalsSheet = XLSX.utils.json_to_sheet(
                goals.map((g) => ({
                    ID: g.id,
                    Title: g.title,
                    Category: g.category,
                    "Target Value": g.targetValue,
                    "Current Value": g.currentValue,
                    Unit: g.unit,
                    Timeframe: g.timeframe,
                    "Start Date": g.startDate,
                    "End Date": g.endDate,
                    Priority: g.priority,
                    Status: g.status,
                    Notes: g.notes || "",
                    "Created At": g.createdAt?.toISOString() || "",
                }))
            );
            XLSX.utils.book_append_sheet(workbook, goalsSheet, "Goals");
        } else {
            XLSX.utils.book_append_sheet(
                workbook,
                XLSX.utils.aoa_to_sheet([["No goal data"]]),
                "Goals"
            );
        }

        // Habits sheet
        if (habits.length > 0) {
            const habitsSheet = XLSX.utils.json_to_sheet(
                habits.map((h) => ({
                    ID: h.id,
                    Name: h.name,
                    Category: h.category,
                    Date: h.date,
                    Completed: h.completed ? "Yes" : "No",
                    "Created At": h.createdAt?.toISOString() || "",
                }))
            );
            XLSX.utils.book_append_sheet(workbook, habitsSheet, "Habits");
        } else {
            XLSX.utils.book_append_sheet(
                workbook,
                XLSX.utils.aoa_to_sheet([["No habit data"]]),
                "Habits"
            );
        }

        // AI Analyses sheet
        if (aiAnalyses.length > 0) {
            const aiSheet = XLSX.utils.json_to_sheet(
                aiAnalyses.map((a) => ({
                    ID: a.id,
                    Filters: a.filters,
                    "Quality Score": a.qualityScore,
                    "Executive Summary": a.executiveSummary,
                    Psychology: a.psychology,
                    Risk: a.risk,
                    Patterns: a.patterns,
                    "Created At": a.createdAt?.toISOString() || "",
                }))
            );
            XLSX.utils.book_append_sheet(workbook, aiSheet, "AI Analyses");
        } else {
            XLSX.utils.book_append_sheet(
                workbook,
                XLSX.utils.aoa_to_sheet([["No AI analysis data"]]),
                "AI Analyses"
            );
        }

        const buffer = XLSX.write(workbook, {
            type: "buffer",
            bookType: "xlsx",
        });

        const today = new Date().toISOString().split("T")[0];
        const filename = `tradejournal-backup-${today}.xlsx`;

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type":
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error("Failed to export XLSX:", error);
        return NextResponse.json(
            { error: "Failed to export Excel file" },
            { status: 500 }
        );
    }
}
