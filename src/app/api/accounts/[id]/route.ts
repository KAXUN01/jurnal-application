import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const account = await prisma.account.findUnique({ where: { id: params.id } });
        if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });
        return NextResponse.json(account);
    } catch (error) {
        console.error("Failed to fetch account:", error);
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
        const balance = typeof body.balance === "string" ? parseFloat(body.balance) : body.balance || 0;
        
        const updated = await prisma.account.update({
            where: { id: params.id },
            data: {
                name: body.name,
                type: body.type,
                balance,
                accountSize: body.accountSize,
                brokerName: body.brokerName,
                currency: body.currency,
                leverage: body.leverage,
                startDate: body.startDate,
                notes: body.notes,
            },
        });
        return NextResponse.json(updated || null);
    } catch (error) {
        console.error("Failed to update account:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.account.delete({ where: { id: params.id } });
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Failed to delete account:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
