import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CACHE_HEADERS = {
    "Cache-Control": "private, max-age=0, stale-while-revalidate=30",
};

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
        return NextResponse.json(habits, { headers: CACHE_HEADERS });
    } catch (error) {
        console.error("Failed to fetch habits:", error);
        return NextResponse.json({ error: "Failed to fetch habits" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Use a single findFirst + conditional update/create approach.
        // Prisma's native upsert requires a unique constraint which our schema
        // doesn't have on (name, date), so we keep the manual pattern but
        // short-circuit early to avoid unnecessary work.
        const existing = await prisma.habit.findFirst({
            where: {
                name: body.name,
                date: body.date,
            },
            select: { id: true, completed: true },
        });

        if (existing) {
            // Skip the update entirely if the value hasn't changed
            if (existing.completed === body.completed) {
                return NextResponse.json(existing);
            }
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
