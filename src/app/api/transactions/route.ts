import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const type = searchParams.get('type');

    const query: any = {};
    if (accountId) query.accountId = accountId;
    if (type) query.type = type;

    const transactions = await prisma.transaction.findMany({
      where: query,
      include: {
        account: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
    
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.accountId || !data.amount || !data.type || !data.date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    const transaction = await prisma.transaction.create({
      data: {
        date: data.date,
        accountId: data.accountId,
        type: data.type,
        amount: parseFloat(data.amount),
        currency: data.currency || "USD",
        method: data.method || "Other",
        status: data.status || "Completed",
        notes: data.notes || null,
        screenshots: data.screenshots ? JSON.stringify(data.screenshots) : null,
        grossProfit: data.grossProfit ? parseFloat(data.grossProfit) : null,
        propShare: data.propShare ? parseFloat(data.propShare) : null,
        traderShare: data.traderShare ? parseFloat(data.traderShare) : null,
        netReceived: data.netReceived ? parseFloat(data.netReceived) : null,
      },
      include: {
        account: true,
      }
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
