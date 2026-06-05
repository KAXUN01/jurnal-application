import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const trades = await prisma.trade.findMany({
            orderBy: {
                date: "desc",
            },
        });
        return NextResponse.json(trades);
    } catch (error) {
        console.error("Failed to fetch trades:", error);
        return NextResponse.json({ error: "Failed to fetch trades" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Ensure rrRatio is a number
        const rrRatio = typeof body.rrRatio === "string" ? parseFloat(body.rrRatio) : body.rrRatio;

        const trade = await prisma.trade.create({
            data: {
                pair: body.pair,
                accountId: body.accountId || null,
                tradeType: body.tradeType,
                tradeDirection: body.tradeDirection,
                date: body.date,
                    entryExecutionTime: body.entryExecutionTime || null,
                time: body.time,
                entryPrice: body.entryPrice,
                stopLoss: body.stopLoss,
                takeProfit: body.takeProfit,
                exitPrice: body.exitPrice,
                rrRatio: rrRatio || 0,
                lotSize: body.lotSize,
                tradeDuration: body.tradeDuration,
                outcome: body.outcome,
                profitLoss: body.profitLoss,
                profitLossPercent: body.profitLossPercent,
                beforeTrade: body.beforeTrade,
                duringTrade: body.duringTrade,
                afterTrade: body.afterTrade,
                beforeScreenshot: body.beforeScreenshot || null,
                afterScreenshot: body.afterScreenshot || null,
                screenshots: JSON.stringify(body.screenshots || []),
                tags: JSON.stringify(body.tags || []),
            },
        });
        return NextResponse.json(trade);
    } catch (error) {
        console.error("Failed to create trade:", error);
        // return the original error message in the response when possible so the
        // client alert can give more context during development
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
