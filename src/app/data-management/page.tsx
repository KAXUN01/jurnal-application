"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
    Database,
    Download,
    UploadCloud,
    FileJson,
    FileSpreadsheet,
    FileArchive,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Info,
    RefreshCw,
    HardDrive,
    Server,
    Clock,
    FileUp,
} from "lucide-react";

interface Stats {
    trades: number;
    accounts: number;
    goals: number;
    habits: number;
    aiAnalyses: number;
    transactions: number;
    users: number;
    totalRecords: number;
    estimatedSizeFormatted: string;
}

interface ValidationIssue {
    type: "error" | "warning" | "duplicate" | "missing_field" | "corrupted";
    module: string;
    count?: number;
    message: string;
}

interface ValidationResult {
    valid: boolean;
    tradesFound: number;
    accountsFound: number;
    goalsFound: number;
    habitsFound: number;
    aiAnalysesFound: number;
    transactionsFound: number;
    usersFound: number;
    totalRecords: number;
    issues: ValidationIssue[];
    exportedAt: string | null;
    version: string | null;
}

export default function DataManagementPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [exporting, setExporting] = useState<string | null>(null);

    // Import State
    const [importFile, setImportFile] = useState<File | null>(null);
    const [validating, setValidating] = useState(false);
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
    const [importing, setImporting] = useState(false);
    const [importSuccess, setImportSuccess] = useState<{
        message: string;
        details?: {
            totalImported: number;
            totalSkipped: number;
            totalErrors: number;
        };
    } | null>(null);
    const [importError, setImportError] = useState<string | null>(null);

    // Recovery Options
    const [recoveryMode, setRecoveryMode] = useState<"replace" | "merge" | "selective">("merge");
    const [selectedModules, setSelectedModules] = useState<string[]>([
        "users",
        "trades",
        "accounts",
        "goals",
        "habits",
        "aiAnalyses",
        "transactions",
    ]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoadingStats(true);
        try {
            const res = await fetch("/api/data-management/stats");
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch stats", error);
        } finally {
            setLoadingStats(false);
        }
    };

    const handleExport = async (format: "json" | "xlsx" | "zip") => {
        setExporting(format);
        try {
            let url = "/api/data-management/export";
            if (format === "xlsx") url = "/api/data-management/export-xlsx";
            if (format === "zip") url = "/api/data-management/export-zip";

            const res = await fetch(url);
            if (!res.ok) throw new Error("Export failed");

            // Handle file download
            const blob = await res.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;

            // Extract filename from Content-Disposition if present, or use default
            const disposition = res.headers.get("content-disposition");
            let filename = `tradejournal-backup-${new Date().toISOString().split("T")[0]}.${format}`;
            if (disposition && disposition.indexOf("attachment") !== -1) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, "");
                }
            }

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            a.remove();
        } catch (error) {
            console.error(`Failed to export ${format}:`, error);
            alert(`Failed to export as ${format.toUpperCase()}`);
        } finally {
            setExporting(null);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImportFile(file);
        setValidationResult(null);
        setImportSuccess(null);
        setImportError(null);
        await validateFile(file);
    };

    const validateFile = async (file: File) => {
        setValidating(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/data-management/validate", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (res.ok) {
                setValidationResult(data);
            } else {
                setImportError(data.error || "Validation failed");
            }
        } catch (error) {
            console.error("Validation error:", error);
            setImportError("An error occurred during validation");
        } finally {
            setValidating(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        const name = file.name.toLowerCase();
        if (name.endsWith(".json") || name.endsWith(".zip") || name.endsWith(".xlsx")) {
            setImportFile(file);
            setValidationResult(null);
            setImportSuccess(null);
            setImportError(null);
            
            // Note: XLSX validation is not fully implemented in the backend validation route yet
            // but we allow it through to show an error or try. JSON/ZIP are fully supported.
            await validateFile(file);
        } else {
            setImportError("Unsupported file type. Please upload JSON or ZIP.");
        }
    };

    const toggleModule = (module: string) => {
        setSelectedModules((prev) =>
            prev.includes(module)
                ? prev.filter((m) => m !== module)
                : [...prev, module]
        );
    };

    const toggleAllModules = () => {
        if (selectedModules.length === 7) {
            setSelectedModules([]);
        } else {
            setSelectedModules([
                "users",
                "trades",
                "accounts",
                "goals",
                "habits",
                "aiAnalyses",
                "transactions",
            ]);
        }
    };

    const handleImport = async () => {
        if (!importFile || !validationResult?.valid) return;

        if (
            recoveryMode === "replace" &&
            !confirm(
                "WARNING: You are about to REPLACE all existing data with the backup data. This action CANNOT be undone. Are you absolutely sure?"
            )
        ) {
            return;
        }

        setImporting(true);
        setImportError(null);

        try {
            const formData = new FormData();
            formData.append("file", importFile);
            formData.append("mode", recoveryMode);
            formData.append("modules", JSON.stringify(selectedModules));

            const res = await fetch("/api/data-management/import", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setImportSuccess({
                    message: "Data successfully imported!",
                    details: data.summary,
                });
                setImportFile(null);
                setValidationResult(null);
                fetchStats(); // Refresh stats after import
            } else {
                setImportError(data.error || "Import failed");
            }
        } catch (error) {
            console.error("Import error:", error);
            setImportError("An error occurred during import");
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-24 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                        <Database className="h-8 w-8 text-neon-blue" />
                        Data Management
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Securely backup, export, import, and restore your trading data.
                    </p>
                </div>
                {/* Mini Stats Banner */}
                <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-300">Total Records:</span>
                        <span className="font-mono text-neon-cyan">
                            {loadingStats ? "..." : stats?.totalRecords.toLocaleString()}
                        </span>
                    </div>
                    <div className="w-px h-4 bg-surface-600"></div>
                    <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-300">Est. Size:</span>
                        <span className="font-mono text-neon-cyan">
                            {loadingStats ? "..." : stats?.estimatedSizeFormatted}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Export Options */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="glass-card p-6 rounded-2xl border border-surface-600/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-blue/5 rounded-full blur-3xl -z-10 group-hover:bg-neon-blue/10 transition-colors"></div>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-neon-blue/10 border border-neon-blue/20">
                                <Download className="h-5 w-5 text-neon-blue" />
                            </div>
                            <h2 className="text-xl font-semibold text-white">Export Complete Database</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* JSON Export */}
                            <div className="bg-surface-800/50 border border-surface-600/50 rounded-xl p-4 flex flex-col h-full hover:border-neon-green/30 transition-colors relative">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-neon-green/20 text-neon-green border border-neon-green/30 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold">
                                    Recommended
                                </div>
                                <div className="flex items-center gap-3 mb-3 mt-2">
                                    <FileJson className="h-8 w-8 text-neon-green" />
                                    <div>
                                        <h3 className="font-medium text-white">JSON Backup</h3>
                                        <p className="text-xs text-gray-400 font-mono">.json</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-400 mb-6 flex-grow">
                                    Contains complete system data structured for easy automated parsing and restoration.
                                </p>
                                <button
                                    onClick={() => handleExport("json")}
                                    disabled={exporting !== null}
                                    className="w-full py-2 bg-surface-700 hover:bg-neon-green/10 text-white hover:text-neon-green border border-transparent hover:border-neon-green/20 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                                >
                                    {exporting === "json" ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Download className="h-4 w-4" />
                                    )}
                                    Export JSON
                                </button>
                            </div>

                            {/* ZIP Export */}
                            <div className="bg-surface-800/50 border border-surface-600/50 rounded-xl p-4 flex flex-col h-full hover:border-neon-purple/30 transition-colors relative">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-neon-purple/20 text-neon-purple border border-neon-purple/30 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                                    Complete Recovery
                                </div>
                                <div className="flex items-center gap-3 mb-3 mt-2">
                                    <FileArchive className="h-8 w-8 text-neon-purple" />
                                    <div>
                                        <h3 className="font-medium text-white">ZIP Archive</h3>
                                        <p className="text-xs text-gray-400 font-mono">.zip</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-400 mb-6 flex-grow">
                                    Compressed JSON data plus metadata. Best for long-term storage and full system recovery.
                                </p>
                                <button
                                    onClick={() => handleExport("zip")}
                                    disabled={exporting !== null}
                                    className="w-full py-2 bg-surface-700 hover:bg-neon-purple/10 text-white hover:text-neon-purple border border-transparent hover:border-neon-purple/20 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                                >
                                    {exporting === "zip" ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Download className="h-4 w-4" />
                                    )}
                                    Export ZIP
                                </button>
                            </div>

                            {/* XLSX Export */}
                            <div className="bg-surface-800/50 border border-surface-600/50 rounded-xl p-4 flex flex-col h-full hover:border-emerald-500/30 transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <FileSpreadsheet className="h-8 w-8 text-emerald-500" />
                                    <div>
                                        <h3 className="font-medium text-white">Excel Backup</h3>
                                        <p className="text-xs text-gray-400 font-mono">.xlsx</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-400 mb-6 flex-grow">
                                    Multi-sheet spreadsheet format. Best for manual analysis or opening in Excel/Google Sheets.
                                </p>
                                <button
                                    onClick={() => handleExport("xlsx")}
                                    disabled={exporting !== null}
                                    className="w-full py-2 bg-surface-700 hover:bg-emerald-500/10 text-white hover:text-emerald-500 border border-transparent hover:border-emerald-500/20 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                                >
                                    {exporting === "xlsx" ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Download className="h-4 w-4" />
                                    )}
                                    Export Excel
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Import Section */}
                    <section className="glass-card p-6 rounded-2xl border border-surface-600/50 relative overflow-hidden group">
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon-green/5 rounded-full blur-3xl -z-10 group-hover:bg-neon-green/10 transition-colors"></div>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-neon-green/10 border border-neon-green/20">
                                <UploadCloud className="h-5 w-5 text-neon-green" />
                            </div>
                            <h2 className="text-xl font-semibold text-white">Restore Backup</h2>
                        </div>

                        {/* File Drop Zone */}
                        {!importFile ? (
                            <div
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-surface-500 hover:border-neon-green/50 bg-surface-800/30 hover:bg-surface-800/50 rounded-xl p-8 text-center cursor-pointer transition-all duration-200"
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept=".json,.zip,.xlsx"
                                    className="hidden"
                                />
                                <FileUp className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-white mb-2">Click or drag file to this area to upload</h3>
                                <p className="text-sm text-gray-400">Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files</p>
                                <p className="text-xs text-gray-500 mt-4">Supported formats: .json, .zip, .xlsx</p>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-fade-in">
                                {/* Selected File Banner */}
                                <div className="flex items-center justify-between bg-surface-700/50 border border-surface-600 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-surface-800 rounded-lg">
                                            {importFile.name.endsWith('.json') ? <FileJson className="h-6 w-6 text-neon-green" /> :
                                             importFile.name.endsWith('.zip') ? <FileArchive className="h-6 w-6 text-neon-purple" /> :
                                             <FileSpreadsheet className="h-6 w-6 text-emerald-500" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{importFile.name}</p>
                                            <p className="text-xs text-gray-400">{(importFile.size / 1024).toFixed(2)} KB</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setImportFile(null);
                                            setValidationResult(null);
                                            setImportSuccess(null);
                                            setImportError(null);
                                        }}
                                        className="text-gray-400 hover:text-white p-2"
                                    >
                                        <XCircle className="h-5 w-5" />
                                    </button>
                                </div>

                                {validating && (
                                    <div className="flex flex-col items-center justify-center p-8 text-gray-400">
                                        <RefreshCw className="h-8 w-8 animate-spin mb-4 text-neon-blue" />
                                        <p>Validating backup file integrity...</p>
                                    </div>
                                )}

                                {importError && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3">
                                        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium">Import Error</p>
                                            <p className="text-sm mt-1">{importError}</p>
                                        </div>
                                    </div>
                                )}

                                {importSuccess && (
                                    <div className="bg-neon-green/10 border border-neon-green/20 text-neon-green p-4 rounded-xl flex items-start gap-3">
                                        <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                                        <div className="w-full">
                                            <p className="font-medium">{importSuccess.message}</p>
                                            {importSuccess.details && (
                                                <div className="text-sm mt-2 space-y-1 text-emerald-400/80 font-mono">
                                                    <p>Imported: {importSuccess.details.totalImported}</p>
                                                    <p>Skipped: {importSuccess.details.totalSkipped}</p>
                                                    <p>Errors: {importSuccess.details.totalErrors}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {validationResult && !validating && !importSuccess && (
                                    <div className="space-y-4 animate-slide-up-fade">
                                        <h3 className="font-medium text-white flex items-center gap-2">
                                            <Info className="h-4 w-4 text-neon-cyan" />
                                            Import Summary
                                        </h3>
                                        
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            <div className="bg-surface-800/50 p-3 rounded-lg border border-surface-600/50">
                                                <p className="text-xs text-gray-400 uppercase">Trades Found</p>
                                                <p className="text-xl font-mono text-white">{validationResult.tradesFound}</p>
                                            </div>
                                            <div className="bg-surface-800/50 p-3 rounded-lg border border-surface-600/50">
                                                <p className="text-xs text-gray-400 uppercase">Accounts Found</p>
                                                <p className="text-xl font-mono text-white">{validationResult.accountsFound}</p>
                                            </div>
                                            <div className="bg-surface-800/50 p-3 rounded-lg border border-surface-600/50">
                                                <p className="text-xs text-gray-400 uppercase">Goals Found</p>
                                                <p className="text-xl font-mono text-white">{validationResult.goalsFound}</p>
                                            </div>
                                            <div className="bg-surface-800/50 p-3 rounded-lg border border-surface-600/50">
                                                <p className="text-xs text-gray-400 uppercase">Withdrawals Found</p>
                                                <p className="text-xl font-mono text-white">{validationResult.transactionsFound}</p>
                                            </div>
                                        </div>

                                        {validationResult.issues.length > 0 && (
                                            <div className="mt-4 space-y-2">
                                                <p className="text-sm font-medium text-gray-300">Issues Detected:</p>
                                                {validationResult.issues.map((issue, idx) => (
                                                    <div key={idx} className={cn(
                                                        "text-sm p-3 rounded-lg flex items-start gap-2 border",
                                                        issue.type === 'error' || issue.type === 'corrupted' ? "bg-red-500/10 border-red-500/20 text-red-400" :
                                                        issue.type === 'warning' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                                                        "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                                    )}>
                                                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                                        <span>{issue.message}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="pt-4 flex gap-3">
                                            <button
                                                onClick={handleImport}
                                                disabled={!validationResult.valid || importing}
                                                className="flex-1 bg-neon-green text-surface-950 font-bold py-2.5 rounded-xl hover:bg-[#00e67a] hover:shadow-[0_0_15px_rgba(0,255,136,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {importing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
                                                {importing ? "Importing Data..." : "Proceed with Import"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                </div>

                {/* Right Column: Recovery Options & Stats */}
                <div className="space-y-6">
                    {/* Recovery Mode Selection */}
                    <section className="glass-card p-6 rounded-2xl border border-surface-600/50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/5 rounded-full blur-2xl -z-10"></div>
                        <h2 className="text-lg font-semibold text-white mb-4">Recovery Options</h2>
                        
                        <div className="space-y-3 mb-6">
                            <label className={cn(
                                "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                                recoveryMode === 'replace' 
                                    ? "bg-red-500/10 border-red-500/30" 
                                    : "bg-surface-800/50 border-surface-600/50 hover:bg-surface-700/50"
                            )}>
                                <input
                                    type="radio"
                                    name="recoveryMode"
                                    value="replace"
                                    checked={recoveryMode === 'replace'}
                                    onChange={() => setRecoveryMode('replace')}
                                    className="mt-1"
                                />
                                <div>
                                    <p className={cn("font-medium", recoveryMode === 'replace' ? "text-red-400" : "text-white")}>
                                        Replace Existing Data
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">Clears all current database records and replaces them entirely with the backup.</p>
                                </div>
                            </label>

                            <label className={cn(
                                "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                                recoveryMode === 'merge' 
                                    ? "bg-neon-blue/10 border-neon-blue/30" 
                                    : "bg-surface-800/50 border-surface-600/50 hover:bg-surface-700/50"
                            )}>
                                <input
                                    type="radio"
                                    name="recoveryMode"
                                    value="merge"
                                    checked={recoveryMode === 'merge'}
                                    onChange={() => setRecoveryMode('merge')}
                                    className="mt-1"
                                />
                                <div>
                                    <p className={cn("font-medium", recoveryMode === 'merge' ? "text-neon-blue" : "text-white")}>
                                        Merge Data (Default)
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">Adds new records from the backup. Skips records that already exist.</p>
                                </div>
                            </label>

                            <label className={cn(
                                "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                                recoveryMode === 'selective' 
                                    ? "bg-neon-purple/10 border-neon-purple/30" 
                                    : "bg-surface-800/50 border-surface-600/50 hover:bg-surface-700/50"
                            )}>
                                <input
                                    type="radio"
                                    name="recoveryMode"
                                    value="selective"
                                    checked={recoveryMode === 'selective'}
                                    onChange={() => setRecoveryMode('selective')}
                                    className="mt-1"
                                />
                                <div>
                                    <p className={cn("font-medium", recoveryMode === 'selective' ? "text-neon-purple" : "text-white")}>
                                        Selective Restore
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">Choose exactly which modules to restore.</p>
                                </div>
                            </label>
                        </div>

                        {/* Selective Modules */}
                        <div className={cn(
                            "transition-all duration-300 overflow-hidden",
                            recoveryMode === 'selective' ? "opacity-100 max-h-[400px]" : "opacity-50 max-h-[200px] pointer-events-none grayscale"
                        )}>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-gray-300">Modules to Restore</h3>
                                <button 
                                    onClick={toggleAllModules}
                                    className="text-xs text-neon-blue hover:text-white transition-colors"
                                >
                                    {selectedModules.length === 7 ? "Deselect All" : "Select All"}
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { id: "trades", label: "Trades" },
                                    { id: "accounts", label: "Accounts" },
                                    { id: "goals", label: "Goals" },
                                    { id: "habits", label: "Habits" },
                                    { id: "aiAnalyses", label: "AI Analysis" },
                                    { id: "transactions", label: "Withdrawals" },
                                    { id: "users", label: "Users/Settings" }
                                ].map((mod) => (
                                    <label key={mod.id} className="flex items-center gap-2 p-2 bg-surface-800/50 rounded border border-surface-600/30 cursor-pointer hover:bg-surface-700/50">
                                        <input
                                            type="checkbox"
                                            checked={selectedModules.includes(mod.id)}
                                            onChange={() => toggleModule(mod.id)}
                                            className="rounded border-gray-600 text-neon-blue focus:ring-neon-blue bg-surface-900"
                                        />
                                        <span className="text-sm text-gray-300">{mod.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Data Overview Stats Box */}
                    <section className="glass-card p-6 rounded-2xl border border-surface-600/50 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white">Database Overview</h2>
                            <button onClick={fetchStats} className="p-1.5 text-gray-400 hover:text-white bg-surface-700 rounded-md transition-colors">
                                <RefreshCw className={cn("h-4 w-4", loadingStats && "animate-spin")} />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-surface-800/50 rounded-xl border border-surface-600/30">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-300">Total Trades</span>
                                </div>
                                <span className="font-mono text-white">{loadingStats ? "-" : stats?.trades}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-surface-800/50 rounded-xl border border-surface-600/30">
                                <div className="flex items-center gap-2">
                                    <Target className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-300">Active Goals</span>
                                </div>
                                <span className="font-mono text-white">{loadingStats ? "-" : stats?.goals}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-surface-800/50 rounded-xl border border-surface-600/30">
                                <div className="flex items-center gap-2">
                                    <Brain className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-300">AI Analyses</span>
                                </div>
                                <span className="font-mono text-white">{loadingStats ? "-" : stats?.aiAnalyses}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-surface-800/50 rounded-xl border border-surface-600/30">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-300">Last Backup</span>
                                </div>
                                <span className="text-xs text-emerald-400">Never</span> {/* Could track this in localstorage or DB later */}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

// Missing icon imports placeholder to ensure compiling
import { TrendingUp, Target, Brain } from "lucide-react";
