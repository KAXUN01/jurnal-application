import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();

    const updateData: any = { ...data };
    if (data.amount !== undefined) updateData.amount = parseFloat(data.amount);
    if (data.grossProfit !== undefined) updateData.grossProfit = parseFloat(data.grossProfit);
    if (data.propShare !== undefined) updateData.propShare = parseFloat(data.propShare);
    if (data.traderShare !== undefined) updateData.traderShare = parseFloat(data.traderShare);
    if (data.netReceived !== undefined) updateData.netReceived = parseFloat(data.netReceived);
    if (data.screenshots) updateData.screenshots = JSON.stringify(data.screenshots);

    const updated = await prisma.transaction.update({
      where: { id },
      data: updateData,
      include: { account: true }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    await prisma.transaction.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}
