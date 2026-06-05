import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const NVIDIA_NIM_API_KEY = process.env.NVIDIA_NIM_API_KEY;
const MODEL = "meta/llama-3.3-70b-instruct";

export async function POST(request: Request) {
    try {
        if (!NVIDIA_NIM_API_KEY) {
            return NextResponse.json({ error: "NVIDIA NIM API Key not configured." }, { status: 500 });
        }

        const body = await request.json();
        const { message, history } = body;

        // Fetch recent trades to give the AI context about the user's trading history
        const trades = await prisma.trade.findMany({
            orderBy: { date: "desc" },
            take: 20,
        });

        const tradesContext = trades.map(t => ({
            date: t.date,
            pair: t.pair,
            outcome: t.outcome,
            pnl: t.profitLoss,
            rr: t.rrRatio,
            type: t.tradeType,
        }));

        const systemPrompt = `
You are an elite AI Trading Coach assisting a user.
You have access to their most recent 20 trades:
${JSON.stringify(tradesContext)}

Provide concise, highly actionable, and professional advice. Keep your responses under 4 sentences unless asked for a detailed breakdown.
Base your advice specifically on the data provided if relevant.
`;

        // Format history for OpenRouter
        const messages = [
            { role: "system", content: systemPrompt },
            ...history.map((msg: any) => ({
                role: msg.role === "user" ? "user" : "assistant",
                content: msg.content
            })),
            { role: "user", content: message }
        ];

        const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${NVIDIA_NIM_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: MODEL,
                messages: messages
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`NVIDIA NIM API error: ${err}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        return NextResponse.json({ response: content });

    } catch (error: any) {
        console.error("AI Chat Error:", error);
        return NextResponse.json({ error: `Failed to generate chat response: ${error.message}` }, { status: 500 });
    }
}
