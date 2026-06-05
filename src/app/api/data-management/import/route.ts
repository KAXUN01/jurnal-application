import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import JSZip from "jszip";

export const dynamic = "force-dynamic";

interface ImportOptions {
    mode: "replace" | "merge" | "selective";
    modules: string[];
}

/* eslint-disable @typescript-eslint/no-explicit-any */

async function parseBackupFile(
    request: Request
): Promise<{ data: any; options: ImportOptions } | { error: string }> {
    const contentType = request.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
        return { error: "Expected multipart/form-data" };
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const modeStr = (formData.get("mode") as string) || "merge";
    const modulesStr = (formData.get("modules") as string) || "[]";

    if (!file) {
        return { error: "No file provided" };
    }

    const mode = ["replace", "merge", "selective"].includes(modeStr)
        ? (modeStr as ImportOptions["mode"])
        : "merge";

    let modules: string[] = [];
    try {
        modules = JSON.parse(modulesStr);
    } catch {
        modules = [
            "users",
            "trades",
            "accounts",
            "goals",
            "habits",
            "aiAnalyses",
            "transactions",
        ];
    }

    const fileName = file.name.toLowerCase();
    let backupData: any;

    if (fileName.endsWith(".json")) {
        const text = await file.text();
        backupData = JSON.parse(text);
    } else if (fileName.endsWith(".zip")) {
        const arrayBuffer = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);
        const dbFile = zip.file("database.json");
        if (!dbFile) {
            return { error: "ZIP archive does not contain 'database.json'" };
        }
        const text = await dbFile.async("text");
        backupData = JSON.parse(text);
    } else {
        return { error: "Unsupported file format" };
    }

    if (!backupData?.data) {
        return { error: "Invalid backup file structure" };
    }

    return { data: backupData.data, options: { mode, modules } };
}

function shouldProcess(
    module: string,
    options: ImportOptions
): boolean {
    if (options.mode === "replace" || options.mode === "merge") return true;
    // selective mode
    return options.modules.includes(module);
}

async function importModule(
    moduleName: string,
    records: any[],
    mode: "replace" | "merge" | "selective",
    prismaModel: any
): Promise<{ imported: number; skipped: number; errors: number }> {
    let imported = 0;
    let skipped = 0;
    let errors = 0;

    if (mode === "replace") {
        // Delete all existing records first
        try {
            await prismaModel.deleteMany();
        } catch (e) {
            console.error(`Failed to delete ${moduleName}:`, e);
        }
    }

    for (const record of records) {
        try {
            // Remove fields that Prisma auto-manages
            const data = { ...record };

            // Convert date strings back to Date objects for DateTime fields
            if (data.createdAt) data.createdAt = new Date(data.createdAt);
            if (data.updatedAt) data.updatedAt = new Date(data.updatedAt);

            if (mode === "merge" || mode === "selective") {
                // Check if record exists
                const existing = await prismaModel.findUnique({
                    where: { id: data.id },
                });
                if (existing) {
                    skipped++;
                    continue;
                }
            }

            await prismaModel.create({ data });
            imported++;
        } catch (e) {
            console.error(
                `Failed to import ${moduleName} record:`,
                e
            );
            errors++;
        }
    }

    return { imported, skipped, errors };
}

export async function POST(request: Request) {
    try {
        const result = await parseBackupFile(request);

        if ("error" in result) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        const { data, options } = result;
        const importResults: Record<
            string,
            { imported: number; skipped: number; errors: number }
        > = {};

        // Import each module in dependency order (accounts before trades)
        const moduleMap: [string, string, any][] = [
            ["users", "users", prisma.user],
            ["accounts", "accounts", prisma.account],
            ["trades", "trades", prisma.trade],
            ["goals", "goals", prisma.goal],
            ["habits", "habits", prisma.habit],
            ["aiAnalyses", "aiAnalyses", prisma.aiAnalysis],
            ["transactions", "transactions", prisma.transaction],
        ];

        // If replacing, we need to delete in reverse dependency order
        if (options.mode === "replace") {
            // Delete trades first (depends on accounts), then accounts
            const deleteOrder = [
                "trades",
                "transactions",
                "habits",
                "goals",
                "aiAnalyses",
                "accounts",
                "users",
            ];
            for (const mod of deleteOrder) {
                if (shouldProcess(mod, options)) {
                    const modelEntry = moduleMap.find(([key]) => key === mod);
                    if (modelEntry) {
                        try {
                            await modelEntry[2].deleteMany();
                        } catch (e) {
                            console.error(`Failed to delete ${mod}:`, e);
                        }
                    }
                }
            }
        }

        for (const [key, dataKey, model] of moduleMap) {
            if (!shouldProcess(key, options)) {
                continue;
            }

            const records = Array.isArray(data[dataKey]) ? data[dataKey] : [];
            if (records.length === 0) {
                importResults[key] = { imported: 0, skipped: 0, errors: 0 };
                continue;
            }

            // For replace mode, we already deleted above, so use a simplified import
            const effectiveMode =
                options.mode === "replace" ? "replace" : options.mode;

            // Don't pass to importModule's delete logic since we handled it above
            const moduleResult = await importModule(
                key,
                records,
                effectiveMode === "replace" ? "merge" : effectiveMode,
                model
            );
            importResults[key] = moduleResult;
        }

        const totalImported = Object.values(importResults).reduce(
            (sum, r) => sum + r.imported,
            0
        );
        const totalSkipped = Object.values(importResults).reduce(
            (sum, r) => sum + r.skipped,
            0
        );
        const totalErrors = Object.values(importResults).reduce(
            (sum, r) => sum + r.errors,
            0
        );

        return NextResponse.json({
            success: true,
            mode: options.mode,
            results: importResults,
            summary: {
                totalImported,
                totalSkipped,
                totalErrors,
            },
        });
    } catch (error) {
        console.error("Import failed:", error);
        const message =
            error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { error: `Import failed: ${message}` },
            { status: 500 }
        );
    }
}
