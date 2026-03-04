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
        
        // Validate mandatory fields
        if (!body.name || !body.type || !body.accountSize || !body.brokerName) {
            return NextResponse.json(
                { error: "Missing required fields: name, type, accountSize, brokerName" },
                { status: 400 }
            );
        }

        const created = await prisma.account.create({
            data: {
                id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
                name: body.name,
                type: body.type || "demo",
                balance,
                accountSize: body.accountSize,
                brokerName: body.brokerName,
                currency: body.currency || "USD",
                leverage: body.leverage || "1:100",
                startDate: body.startDate || null,
                notes: body.notes || null,
            },
        });
        return NextResponse.json(created || null);
    } catch (error) {
        console.error("Failed to create account:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
