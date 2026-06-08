import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow up to 60 seconds for AI processing

const NVIDIA_NIM_API_KEY = process.env.NVIDIA_NIM_API_KEY;
// Use Qwen 14B model by default which is fast and good with structured JSON
const MODEL = process.env.LLM_MODEL || "qwen/qwen2.5-14b-instruct";

export async function POST(request: Request) {
    try {
        if (!NVIDIA_NIM_API_KEY) {
            return NextResponse.json({ error: "NVIDIA NIM API Key not configured." }, { status: 500 });
        }

        const body = await request.json();
        const { dateRange, symbol, strategy, winLoss, session, analysisTarget } = body;

        // Fetch trades based on filters (Simplified for now, in a real app we'd apply all the filters)
        // We'll just fetch 10 recent trades to give context to the AI (reduced from 20 to prevent timeouts)
        let trades = await prisma.trade.findMany({
            orderBy: { date: "desc" },
            take: 10,
        });

        // Apply simple filters
        if (symbol && symbol !== "all") trades = trades.filter(t => t.pair === symbol);
        if (strategy && strategy !== "all") trades = trades.filter(t => t.tradeType?.toLowerCase() === strategy.toLowerCase());
        if (winLoss && winLoss !== "all") trades = trades.filter(t => t.outcome?.toLowerCase() === winLoss.toLowerCase());

        // Prepare context for AI
        const tradesContext = trades.map(t => ({
            date: t.date,
            time: t.time,
            entryTime: t.entryExecutionTime,
            pair: t.pair,
            direction: t.tradeDirection,
            outcome: t.outcome,
            pnl: t.profitLoss,
            pnlPercent: t.profitLossPercent,
            rr: t.rrRatio,
            type: t.tradeType,
            entryPrice: t.entryPrice,
            exitPrice: t.exitPrice,
            stopLoss: t.stopLoss,
            takeProfit: t.takeProfit,
            duration: t.tradeDuration,
            lotSize: t.lotSize,
            rules: (t as Record<string, unknown>).followedRules ? "Followed" : (t as Record<string, unknown>).followedRules === false ? "Broken" : "Unknown",
            notes: `${t.beforeTrade || ''} ${t.duringTrade || ''} ${t.afterTrade || ''} ${t.reasonForTrade || ''} ${t.goodBehavior || ''} ${t.badBehavior || ''}`.trim(),
            mistakes: (t as Record<string, unknown>).mistakes
        }));

        // ─── Fetch the previous (latest) analysis for comparison context ───
        const previousAnalysis = await prisma.aiAnalysis.findFirst({
            orderBy: { createdAt: "desc" },
        });

        let previousContext = "";
        if (previousAnalysis) {
            previousContext = `

IMPORTANT: The user has a previous analysis from ${previousAnalysis.createdAt.toISOString()}.
Previous quality scores: ${previousAnalysis.qualityScore}
Previous executive summary: ${previousAnalysis.executiveSummary}
Previous patterns: ${previousAnalysis.patterns}
Previous improvement plan: ${previousAnalysis.improvementPlan}
Previous psychology: ${previousAnalysis.psychology}
Previous risk profile: ${previousAnalysis.risk}

When generating the new analysis, keep in mind these previous results so you can provide context-aware insights. The comparison will be generated separately.
`;
        }

        const systemPrompt = `
You are an elite AI Trading Coach. Analyze the following trade history and provide a structured JSON response.
Do NOT wrap the response in markdown blocks like \`\`\`json. Just return raw valid JSON.

Here is the user's trade data context (up to 50 recent trades matching their filter: ${analysisTarget}):
${JSON.stringify(tradesContext)}
${previousContext}
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

        // ─── Save the analysis to DB ───────────────────────────────────
        const savedAnalysis = await prisma.aiAnalysis.create({
            data: {
                filters: JSON.stringify({ dateRange, symbol, strategy, winLoss, session, analysisTarget }),
                qualityScore: JSON.stringify(parsedJson.qualityScore),
                executiveSummary: JSON.stringify(parsedJson.executiveSummary),
                compliance: JSON.stringify(parsedJson.compliance),
                complianceNote: parsedJson.complianceNote || null,
                psychology: JSON.stringify(parsedJson.psychology),
                risk: JSON.stringify(parsedJson.risk),
                patterns: JSON.stringify(parsedJson.patterns),
                improvementPlan: JSON.stringify(parsedJson.improvementPlan),
                profile: JSON.stringify(parsedJson.profile),
                insights: JSON.stringify(parsedJson.insights),
            }
        });

        // ─── Prune to keep only the latest 5 analyses ──────────────────
        const allAnalyses = await prisma.aiAnalysis.findMany({
            orderBy: { createdAt: "desc" },
            select: { id: true },
        });
        if (allAnalyses.length > 5) {
            const idsToKeep = allAnalyses.slice(0, 5).map(a => a.id);
            await prisma.aiAnalysis.deleteMany({
                where: { id: { notIn: idsToKeep } }
            });
        }

        // ─── Generate comparison with previous analysis ─────────────────
        let comparison = null;
        if (previousAnalysis) {
            const prevScores = JSON.parse(previousAnalysis.qualityScore);
            const newScores = parsedJson.qualityScore;

            // Build score deltas
            const scoreDeltas = [
                { category: "Overall", previous: prevScores.total, current: newScores.total, delta: newScores.total - prevScores.total },
                { category: "Entry Quality", previous: prevScores.entry, current: newScores.entry, delta: newScores.entry - prevScores.entry },
                { category: "Risk Management", previous: prevScores.risk, current: newScores.risk, delta: newScores.risk - prevScores.risk },
                { category: "Psychology", previous: prevScores.psychology, current: newScores.psychology, delta: newScores.psychology - prevScores.psychology },
                { category: "Trade Management", previous: prevScores.management, current: newScores.management, delta: newScores.management - prevScores.management },
                { category: "Compliance", previous: prevScores.compliance, current: newScores.compliance, delta: newScores.compliance - prevScores.compliance },
            ];

            const overallDelta = newScores.total - prevScores.total;

            // Generate deterministic comparison to prevent Netlify 10s timeout
            comparison = {
                scoreDeltas,
                overallDelta,
                summary: `Your overall score changed by ${overallDelta > 0 ? '+' : ''}${overallDelta} points since your last analysis.`,
                improvements: scoreDeltas.filter(d => d.delta > 0).map(d => `${d.category} improved by +${d.delta} points`),
                regressions: scoreDeltas.filter(d => d.delta < 0).map(d => `${d.category} dropped by ${Math.abs(d.delta)} points`),
                nextSteps: ["Continue focusing on areas that showed regression"],
                previousDate: previousAnalysis.createdAt.toISOString(),
            };
        }

        return NextResponse.json({
            ...parsedJson,
            analysisId: savedAnalysis.id,
            comparison,
        });

    } catch (error: unknown) {
        console.error("AI Analysis Error:", error);
        return NextResponse.json({ error: `Failed to generate analysis: ${error instanceof Error ? error.message : "Unknown error"}` }, { status: 500 });
    }
}
