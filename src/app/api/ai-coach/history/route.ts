import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const analyses = await prisma.aiAnalysis.findMany({
            orderBy: { createdAt: "desc" },
            take: 5,
        });

        // Parse JSON fields back into objects
        const parsed = analyses.map(a => ({
            id: a.id,
            filters: JSON.parse(a.filters),
            qualityScore: JSON.parse(a.qualityScore),
            executiveSummary: JSON.parse(a.executiveSummary),
            compliance: JSON.parse(a.compliance),
            complianceNote: a.complianceNote,
            psychology: JSON.parse(a.psychology),
            risk: JSON.parse(a.risk),
            patterns: JSON.parse(a.patterns),
            improvementPlan: JSON.parse(a.improvementPlan),
            profile: JSON.parse(a.profile),
            insights: JSON.parse(a.insights),
            createdAt: a.createdAt.toISOString(),
        }));

        return NextResponse.json(parsed);
    } catch (error: any) {
        console.error("AI History Error:", error);
        return NextResponse.json({ error: `Failed to fetch analysis history: ${error.message}` }, { status: 500 });
    }
}
