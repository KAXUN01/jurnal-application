import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        const habits = await prisma.habit.findMany({
            where: {
                ...(startDate && endDate ? {
                    date: {
                        gte: startDate,
                        lte: endDate,
                    }
                } : {})
            },
            orderBy: {
                date: "desc",
            },
        });
        return NextResponse.json(habits);
    } catch (error) {
        console.error("Failed to fetch habits:", error);
        return NextResponse.json({ error: "Failed to fetch habits" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // If a habit with the same name and date exists, we'll update it (upsert-like behavior)
        // Check if exists first
        const existing = await prisma.habit.findFirst({
            where: {
                name: body.name,
                date: body.date,
            }
        });

        if (existing) {
            const updated = await prisma.habit.update({
                where: { id: existing.id },
                data: { completed: body.completed }
            });
            return NextResponse.json(updated);
        }

        const habit = await prisma.habit.create({
            data: {
                name: body.name,
                category: body.category,
                date: body.date,
                completed: body.completed || false,
            },
        });
        return NextResponse.json(habit);
    } catch (error) {
        console.error("Failed to create habit:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
