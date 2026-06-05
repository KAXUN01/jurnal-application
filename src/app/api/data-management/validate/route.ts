import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import JSZip from "jszip";

export const dynamic = "force-dynamic";

interface BackupData {
    version?: string;
    appName?: string;
    exportedAt?: string;
    data?: {
        users?: unknown[];
        trades?: unknown[];
        accounts?: unknown[];
        goals?: unknown[];
        habits?: unknown[];
        aiAnalyses?: unknown[];
        transactions?: unknown[];
    };
    metadata?: Record<string, unknown>;
}

interface ValidationIssue {
    type: "error" | "warning" | "duplicate" | "missing_field" | "corrupted";
    module: string;
    count?: number;
    message: string;
}

function validateBackupStructure(data: BackupData): {
    valid: boolean;
    issues: ValidationIssue[];
    counts: Record<string, number>;
} {
    const issues: ValidationIssue[] = [];
    const counts: Record<string, number> = {
        users: 0,
        trades: 0,
        accounts: 0,
        goals: 0,
        habits: 0,
        aiAnalyses: 0,
        transactions: 0,
    };

    // Check version
    if (!data.version) {
        issues.push({
            type: "warning",
            module: "system",
            message: "No version field found — compatibility may vary",
        });
    }

    // Check data object exists
    if (!data.data) {
        issues.push({
            type: "error",
            module: "system",
            message: "Missing 'data' object — this file may not be a valid TradeFlow backup",
        });
        return { valid: false, issues, counts };
    }

    // Count records and validate structure for each module
    const modules = ["users", "trades", "accounts", "goals", "habits", "aiAnalyses", "transactions"] as const;
    for (const mod of modules) {
        const arr = data.data[mod];
        if (Array.isArray(arr)) {
            counts[mod] = arr.length;

            // Basic validation per module
            for (let i = 0; i < arr.length; i++) {
                const record = arr[i] as Record<string, unknown>;
                if (!record || typeof record !== "object") {
                    issues.push({
                        type: "corrupted",
                        module: mod,
                        message: `Record at index ${i} is not a valid object`,
                    });
                }
                if (!record?.id) {
                    issues.push({
                        type: "missing_field",
                        module: mod,
                        message: `Record at index ${i} is missing 'id' field`,
                    });
                }
            }
        }
    }

    // Validate required trade fields
    if (Array.isArray(data.data.trades)) {
        const requiredTradeFields = ["pair", "tradeType", "date", "outcome"];
        for (let i = 0; i < data.data.trades.length; i++) {
            const trade = data.data.trades[i] as Record<string, unknown>;
            for (const field of requiredTradeFields) {
                if (!trade?.[field]) {
                    issues.push({
                        type: "missing_field",
                        module: "trades",
                        message: `Trade at index ${i} is missing required field '${field}'`,
                    });
                    break; // One issue per record is enough
                }
            }
        }
    }

    const hasErrors = issues.some((i) => i.type === "error" || i.type === "corrupted");
    return { valid: !hasErrors, issues, counts };
}

export async function POST(request: Request) {
    try {
        const contentType = request.headers.get("content-type") || "";
        let backupData: BackupData;

        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();
            const file = formData.get("file") as File | null;

            if (!file) {
                return NextResponse.json(
                    { error: "No file provided" },
                    { status: 400 }
                );
            }

            const fileName = file.name.toLowerCase();

            if (fileName.endsWith(".json")) {
                const text = await file.text();
                try {
                    backupData = JSON.parse(text);
                } catch {
                    return NextResponse.json(
                        {
                            valid: false,
                            issues: [
                                {
                                    type: "error",
                                    module: "system",
                                    message: "Invalid JSON file — could not parse",
                                },
                            ],
                            counts: {},
                        },
                        { status: 200 }
                    );
                }
            } else if (fileName.endsWith(".zip")) {
                const arrayBuffer = await file.arrayBuffer();
                try {
                    const zip = await JSZip.loadAsync(arrayBuffer);
                    const dbFile = zip.file("database.json");
                    if (!dbFile) {
                        return NextResponse.json(
                            {
                                valid: false,
                                issues: [
                                    {
                                        type: "error",
                                        module: "system",
                                        message:
                                            "ZIP archive does not contain 'database.json'",
                                    },
                                ],
                                counts: {},
                            },
                            { status: 200 }
                        );
                    }
                    const text = await dbFile.async("text");
                    backupData = JSON.parse(text);
                } catch {
                    return NextResponse.json(
                        {
                            valid: false,
                            issues: [
                                {
                                    type: "error",
                                    module: "system",
                                    message: "Invalid ZIP file — could not extract",
                                },
                            ],
                            counts: {},
                        },
                        { status: 200 }
                    );
                }
            } else {
                return NextResponse.json(
                    {
                        valid: false,
                        issues: [
                            {
                                type: "error",
                                module: "system",
                                message:
                                    "Unsupported file format. Please upload a .json or .zip file",
                            },
                        ],
                        counts: {},
                    },
                    { status: 200 }
                );
            }
        } else {
            // Direct JSON body
            try {
                backupData = await request.json();
            } catch {
                return NextResponse.json(
                    {
                        valid: false,
                        issues: [
                            {
                                type: "error",
                                module: "system",
                                message: "Invalid request body",
                            },
                        ],
                        counts: {},
                    },
                    { status: 200 }
                );
            }
        }

        // Validate the structure
        const validation = validateBackupStructure(backupData);

        // Check for duplicates against existing data
        if (validation.valid && backupData.data) {
            const duplicateChecks = [];

            if (
                Array.isArray(backupData.data.trades) &&
                backupData.data.trades.length > 0
            ) {
                const tradeIds = backupData.data.trades
                    .map((t) => (t as Record<string, unknown>).id as string)
                    .filter(Boolean);
                if (tradeIds.length > 0) {
                    const existing = await prisma.trade.findMany({
                        where: { id: { in: tradeIds } },
                        select: { id: true },
                    });
                    if (existing.length > 0) {
                        duplicateChecks.push({
                            type: "duplicate" as const,
                            module: "trades",
                            count: existing.length,
                            message: `${existing.length} trade(s) already exist in database`,
                        });
                    }
                }
            }

            if (
                Array.isArray(backupData.data.goals) &&
                backupData.data.goals.length > 0
            ) {
                const goalIds = backupData.data.goals
                    .map((g) => (g as Record<string, unknown>).id as string)
                    .filter(Boolean);
                if (goalIds.length > 0) {
                    const existing = await prisma.goal.findMany({
                        where: { id: { in: goalIds } },
                        select: { id: true },
                    });
                    if (existing.length > 0) {
                        duplicateChecks.push({
                            type: "duplicate" as const,
                            module: "goals",
                            count: existing.length,
                            message: `${existing.length} goal(s) already exist in database`,
                        });
                    }
                }
            }

            validation.issues.push(...duplicateChecks);
        }

        return NextResponse.json({
            valid: validation.valid,
            tradesFound: validation.counts.trades,
            accountsFound: validation.counts.accounts,
            goalsFound: validation.counts.goals,
            habitsFound: validation.counts.habits,
            aiAnalysesFound: validation.counts.aiAnalyses,
            transactionsFound: validation.counts.transactions,
            usersFound: validation.counts.users,
            totalRecords: Object.values(validation.counts).reduce(
                (a, b) => a + b,
                0
            ),
            issues: validation.issues,
            exportedAt: backupData.exportedAt || null,
            version: backupData.version || null,
        });
    } catch (error) {
        console.error("Validation failed:", error);
        return NextResponse.json(
            { error: "Validation failed" },
            { status: 500 }
        );
    }
}
