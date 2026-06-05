import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const goal = await prisma.goal.findUnique({
            where: { id: params.id },
        });

        if (!goal) {
            return NextResponse.json(
                { error: "Goal not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(goal);
    } catch (error) {
        console.error("Failed to fetch goal:", error);
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

        const goal = await prisma.goal.update({
            where: { id: params.id },
            data: {
                title: body.title,
                category: body.category,
                targetValue: body.targetValue,
                currentValue: body.currentValue,
                unit: body.unit,
                timeframe: body.timeframe,
                startDate: body.startDate,
                endDate: body.endDate,
                priority: body.priority,
                status: body.status,
                notes: body.notes,
            },
        });

        return NextResponse.json(goal);
    } catch (error) {
        console.error("Failed to update goal:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const goal = await prisma.goal.delete({
            where: { id: params.id },
        });

        return NextResponse.json(goal);
    } catch (error) {
        console.error("Failed to delete goal:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
