import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const accounts = await prisma.account.findMany({ orderBy: { name: "asc" } });
        return NextResponse.json(accounts || []);
    } catch (error) {
        console.error("Failed to fetch accounts:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const balance = typeof body.balance === "string" ? parseFloat(body.balance) : body.balance || 0;
        const created = await prisma.account.create({
            data: {
                id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
                name: body.name,
                type: body.type || "demo",
                balance,
            },
        });
        return NextResponse.json(created || null);
    } catch (error) {
        console.error("Failed to create account:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
