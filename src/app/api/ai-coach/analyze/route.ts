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
        const { dateRange, symbol, strategy, winLoss, session, analysisTarget } = body;

        // Fetch trades based on filters (Simplified for now, in a real app we'd apply all the filters)
        // Here we'll just fetch recent trades to give context to the AI
        let trades = await prisma.trade.findMany({
            orderBy: { date: "desc" },
            take: 50,
        });

        // Apply simple filters
        if (symbol && symbol !== "all") trades = trades.filter(t => t.pair === symbol);
        if (strategy && strategy !== "all") trades = trades.filter(t => t.tradeType?.toLowerCase() === strategy.toLowerCase());
        if (winLoss && winLoss !== "all") trades = trades.filter(t => t.outcome?.toLowerCase() === winLoss.toLowerCase());

        // Prepare context for AI
        const tradesContext = trades.map(t => ({
            date: t.date,
            pair: t.pair,
            outcome: t.outcome,
            pnl: t.profitLoss,
            rr: t.rrRatio,
            type: t.tradeType,
            rules: t.followedRules ? "Followed" : t.followedRules === false ? "Broken" : "Unknown",
            notes: `${t.beforeTrade} ${t.duringTrade} ${t.afterTrade}`.trim(),
            mistakes: t.mistakes
        }));

        const systemPrompt = `
You are an elite AI Trading Coach. Analyze the following trade history and provide a structured JSON response.
Do NOT wrap the response in markdown blocks like \`\`\`json. Just return raw valid JSON.

Here is the user's trade data context (up to 50 recent trades matching their filter: ${analysisTarget}):
${JSON.stringify(tradesContext)}

Analyze this data and return exactly this JSON structure:
{
  "qualityScore": {
    "total": 85,
    "entry": 80,
    "risk": 90,
    "psychology": 75,
    "management": 88,
    "compliance": 92
  },
  "executiveSummary": {
    "text": "A brief 2 sentence summary of what happened.",
    "execution": "Good / Needs Improvement / Excellent",
    "driver": "Skill / Luck / Market Volatility"
  },
  "compliance": [
    { "rule": "Entry Rules", "status": "followed" | "partially" | "violated" },
    { "rule": "Stop Loss", "status": "followed" | "partially" | "violated" },
    { "rule": "Risk Limits", "status": "followed" | "partially" | "violated" }
  ],
  "complianceNote": "1 sentence note about compliance.",
  "psychology": {
    "tags": ["FOMO", "Hesitation"], // Array of detected emotions
    "analysis": "2 sentence analysis of their journal notes."
  },
  "risk": {
    "avgRisk": "1.2%",
    "rrQuality": "High / Medium / Low",
    "warning": "Any specific risk warning, or null"
  },
  "patterns": {
    "winning": ["Pattern 1", "Pattern 2"],
    "losing": ["Pattern 1", "Pattern 2"]
  },
  "improvementPlan": [
    { "rank": 1, "text": "Actionable advice 1", "impact": "+X% metric" },
    { "rank": 2, "text": "Actionable advice 2", "impact": "+Y% metric" }
  ],
  "profile": {
    "title": "The Sniper",
    "badges": ["Patient", "Low Frequency"],
    "strengths": "1 sentence.",
    "weaknesses": "1 sentence."
  },
  "insights": [
    "Insight 1 based on data",
    "Insight 2 based on data"
  ]
}

Ensure the output is 100% valid JSON and nothing else.
`;

        const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${NVIDIA_NIM_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: "Generate the analysis JSON." }
                ],
                response_format: { type: "json_object" } // Tell the model we want JSON
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`NVIDIA NIM API error: ${err}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // Extract JSON using regex or substring to avoid markdown/text wrappers
        const jsonStart = content.indexOf('{');
        const jsonEnd = content.lastIndexOf('}');
        
        if (jsonStart === -1 || jsonEnd === -1) {
            throw new Error("No JSON object found in the AI response.");
        }
        
        const jsonString = content.substring(jsonStart, jsonEnd + 1);
        const parsedJson = JSON.parse(jsonString);

        return NextResponse.json(parsedJson);

    } catch (error: any) {
        console.error("AI Analysis Error:", error);
        return NextResponse.json({ error: `Failed to generate analysis: ${error.message}` }, { status: 500 });
    }
}
