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
                tradeType: body.tradeType,
                date: body.date,
                time: body.time,
                bias1H: body.bias1H,
                rangeType: body.rangeType,
                poiType: body.poiType,
                entryPrice: body.entryPrice,
                stopLoss: body.stopLoss,
                takeProfit: body.takeProfit,
                rrRatio: rrRatio || 0,
                lotSize: body.lotSize,
                entryType: body.entryType,
                poiTapped: body.poiTapped,
                chochConfirmed: body.chochConfirmed,
                outcome: body.outcome,
                profitLoss: body.profitLoss,
                emotion: body.emotion,
                followedRules: body.followedRules,
                mistakes: body.mistakes,
                screenshots: JSON.stringify(body.screenshots || []),
            },
        });
        return NextResponse.json(trade);
    } catch (error) {
        console.error("Failed to create trade:", error);
        return NextResponse.json({ error: "Failed to create trade" }, { status: 500 });
    }
}
