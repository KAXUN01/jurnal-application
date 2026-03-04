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
