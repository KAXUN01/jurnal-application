import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const trade = await prisma.trade.findUnique({
            where: { id: params.id },
        });

        if (!trade) {
            return NextResponse.json(
                { error: "Trade not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(trade);
    } catch (error) {
        console.error("Failed to fetch trade:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();

        // Ensure rrRatio is a number
        const rrRatio =
            typeof body.rrRatio === "string"
                ? parseFloat(body.rrRatio)
                : body.rrRatio;

        const trade = await prisma.trade.update({
            where: { id: params.id },
            data: {
                accountId: body.accountId || null,
                pair: body.pair,
                tradeType: body.tradeType,
                tradeDirection: body.tradeDirection,
                    entryExecutionTime: body.entryExecutionTime || null,
                date: body.date,
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
        console.error("Failed to update trade:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const trade = await prisma.trade.delete({
            where: { id: params.id },
        });

        return NextResponse.json(trade);
    } catch (error) {
        console.error("Failed to delete trade:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
