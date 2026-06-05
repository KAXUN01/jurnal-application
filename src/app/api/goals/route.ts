import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const goals = await prisma.goal.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
        return NextResponse.json(goals);
    } catch (error) {
        console.error("Failed to fetch goals:", error);
        return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const goal = await prisma.goal.create({
            data: {
                title: body.title,
                category: body.category,
                targetValue: body.targetValue,
                currentValue: body.currentValue || 0,
                unit: body.unit || "",
                timeframe: body.timeframe,
                startDate: body.startDate,
                endDate: body.endDate,
                priority: body.priority || "medium",
                status: body.status || "active",
                notes: body.notes || null,
            },
        });
        return NextResponse.json(goal);
    } catch (error) {
        console.error("Failed to create goal:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
