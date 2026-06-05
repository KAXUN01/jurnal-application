import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const habit = await prisma.habit.findUnique({
            where: { id: params.id },
        });

        if (!habit) {
            return NextResponse.json(
                { error: "Habit not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(habit);
    } catch (error) {
        console.error("Failed to fetch habit:", error);
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

        const habit = await prisma.habit.update({
            where: { id: params.id },
            data: {
                name: body.name,
                category: body.category,
                date: body.date,
                completed: body.completed,
            },
        });

        return NextResponse.json(habit);
    } catch (error) {
        console.error("Failed to update habit:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const habit = await prisma.habit.delete({
            where: { id: params.id },
        });

        return NextResponse.json(habit);
    } catch (error) {
        console.error("Failed to delete habit:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
