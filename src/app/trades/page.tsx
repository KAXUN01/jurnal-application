"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import EditTradeModal from "@/components/edit-trade-modal";
import {
    BarChart3,
    ChevronDown,
    ChevronUp,
    Filter,
    TrendingUp,
    Target,
    Brain,
    Crosshair,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    ListChecks,
    Edit2,
    Trash2,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────
interface TradeEntry {
    id: string;
    pair: string;
    tradeType: string;
    date: string;
    time?: string;
    bias1H: string;
    rangeType: string;
    poiType: string;
    entryPrice: string;
    stopLoss: string;
    takeProfit: string;
    rrRatio: number;
    entryType: string;
    poiTapped: boolean | null;
    chochConfirmed: boolean | null;
    outcome: string;
    profitLoss: string;
    emotion: string;
    followedRules: boolean | null;
    mistakes: string;
    // Legacy fields from old trade format
    symbol?: string;
    side?: string;
    entry?: number;
    exit?: number;
    pnl?: number;
    status?: string;
    notes?: string;
}

// ─── Stat Card ───────────────────────────────────────────────────────
function StatBox({
    label,
    value,
    sub,
    color,
}: {
    label: string;
    value: string | number;
    sub?: string;
    color: "green" | "red" | "blue" | "yellow";
}) {
    const colorMap = {
        green: "text-neon-green",
        red: "text-neon-red",
        blue: "text-neon-blue",
        yellow: "text-neon-yellow",
    };
    return (
        <div className="flex flex-col items-center px-4 py-3 rounded-xl bg-surface-800/50 border border-surface-500/20">
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-mono">
                {label}
            </span>
            <span className={`text-lg font-bold font-mono ${colorMap[color]}`}>
                {value}
            </span>
            {sub && <span className="text-[10px] text-gray-600">{sub}</span>}
        </div>
    );
}

// ─── Expanded Detail Row ─────────────────────────────────────────────
function TradeDetail({ trade }: { trade: TradeEntry }) {
    return (
        <div className="px-4 py-4 bg-surface-900/50 border-t border-surface-500/10 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Checklist / Entry Validation */}
                <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <ListChecks className="h-3.5 w-3.5 text-neon-blue" />
                        Entry Validation
                    </h4>
                    <div className="space-y-2">
                        <DetailRow
                            label="1H Bias"
                            value={trade.bias1H || "—"}
                            type="text"
                        />
                        <DetailRow
                            label="Range Type"
                            value={trade.rangeType || "—"}
                            type="text"
                        />
                        <DetailRow
                            label="POI Type"
                            value={trade.poiType || "—"}
                            type="text"
                        />
                        <DetailRow
                            label="Entry Type"
                            value={trade.entryType || "—"}
                            type="text"
                        />
                    </div>
                </div>

                {/* Execution Confirmation */}
                <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Crosshair className="h-3.5 w-3.5 text-neon-green" />
                        Execution Confirmation
                    </h4>
                    <div className="space-y-2">
                        <DetailRow
                            label="POI Tapped"
                            value={trade.poiTapped}
                            type="bool"
                        />
                        <DetailRow
                            label="3min ChoCH"
                            value={trade.chochConfirmed}
                            type="bool"
                        />
                        <DetailRow
                            label="Entry"
                            value={trade.entryPrice || "—"}
                            type="text"
                        />
                        <DetailRow
                            label="SL"
                            value={trade.stopLoss || "—"}
                            type="text"
                        />
                        <DetailRow
                            label="TP"
                            value={trade.takeProfit || "—"}
                            type="text"
                        />
                    </div>
                </div>

                {/* Psychology */}
                <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Brain className="h-3.5 w-3.5 text-neon-red" />
                        Psychology
                    </h4>
                    <div className="space-y-2">
                        <DetailRow
                            label="Emotion"
                            value={trade.emotion || "—"}
                            type="emotion"
                        />
                        <DetailRow
                            label="Followed Rules"
                            value={trade.followedRules}
                            type="bool"
                        />
                    </div>
                    {trade.mistakes && (
                        <div className="mt-2">
                            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-mono block mb-1">
                                Mistakes / Notes
                            </span>
                            <p className="text-xs text-gray-400 bg-surface-800/60 rounded-lg px-3 py-2 border border-surface-500/15 leading-relaxed">
                                {trade.mistakes}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function DetailRow({
    label,
    value,
    type,
}: {
    label: string;
    value: string | boolean | null;
    type: "text" | "bool" | "emotion";
}) {
    return (
        <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">{label}</span>
            {type === "bool" ? (
                value === true ? (
                    <span className="flex items-center gap-1 text-neon-green font-medium">
                        <CheckCircle2 className="h-3 w-3" /> Yes
                    </span>
                ) : value === false ? (
                    <span className="flex items-center gap-1 text-neon-red font-medium">
                        <XCircle className="h-3 w-3" /> No
                    </span>
                ) : (
                    <span className="text-gray-600">—</span>
                )
            ) : type === "emotion" ? (
                <span
                    className={`font-medium ${value === "Calm"
                        ? "text-neon-green"
                        : value === "FOMO" || value === "Revenge"
                            ? "text-neon-red"
                            : value === "Hesitation"
                                ? "text-neon-yellow"
                                : "text-gray-400"
                        }`}
                >
                    {String(value)}
                </span>
            ) : (
                <span className="text-gray-300 font-mono font-medium">
                    {String(value)}
                </span>
            )}
        </div>
    );
}

// ─── Main Component ─────────────────────────────────────────────────
export default function TradesPage() {
    const [trades, setTrades] = useState<TradeEntry[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editingTrade, setEditingTrade] = useState<TradeEntry | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [accounts, setAccounts] = useState<Array<{ id: string; name: string }>>([]);
    const accountMap = useMemo(() => {
        const m: Record<string, string> = {};
        accounts.forEach((a) => (m[a.id] = a.name));
        return m;
    }, [accounts]);

    // Filters - Pair, Type, Result
    const [filterPair, setFilterPair] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterResult, setFilterResult] = useState("");

    // Filters - Date Range
    const [dateFilterMode, setDateFilterMode] = useState<
        "all" | "today" | "week" | "month" | "custom"
    >("all");
    const [customStartDate, setCustomStartDate] = useState("");
    const [customEndDate, setCustomEndDate] = useState("");

    // ─── Date filter helper functions ─────────────────────────────────
    const getDateRangeForMode = (
        mode: string
    ): { start: string; end: string } | null => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (mode === "today") {
            const dateStr = today.toISOString().split("T")[0];
            return { start: dateStr, end: dateStr };
        }

        if (mode === "week") {
            // Get start of current week (Monday)
            const weekStart = new Date(today);
            const day = today.getDay();
            const diff = today.getDate() - day + (day === 0 ? -6 : 1);
            weekStart.setDate(diff);
            weekStart.setHours(0, 0, 0, 0);

            // Get end of current week (Sunday)
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);

            return {
                start: weekStart.toISOString().split("T")[0],
                end: weekEnd.toISOString().split("T")[0],
            };
        }

        if (mode === "month") {
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

            return {
                start: monthStart.toISOString().split("T")[0],
                end: monthEnd.toISOString().split("T")[0],
            };
        }

        if (mode === "custom" && customStartDate && customEndDate) {
            return { start: customStartDate, end: customEndDate };
        }

        return null;
    };

    // Load trades from API
    useEffect(() => {
        async function fetchTrades() {
            try {
                const response = await fetch("/api/trades");
                if (!response.ok) throw new Error("Failed to fetch trades");
                const journalEntries: TradeEntry[] = await response.json();

                // Merge: database entries take priority, legacy database records fill gaps
                const normalized = journalEntries.map((t) => ({
                    ...t,
                    pair: t.pair || "—",
                    tradeType: t.tradeType || "—",
                    outcome: t.outcome || "—",
                    rrRatio: t.rrRatio || 0,
                    profitLoss: t.profitLoss || "0",
                    followedRules: t.followedRules ?? null,
                    emotion: t.emotion || "—",
                    bias1H: t.bias1H || "—",
                    rangeType: t.rangeType || "—",
                    poiType: t.poiType || "—",
                    entryPrice: t.entryPrice || "—",
                    stopLoss: t.stopLoss || "—",
                    takeProfit: t.takeProfit || "—",
                    entryType: t.entryType || "—",
                    poiTapped: t.poiTapped ?? null,
                    chochConfirmed: t.chochConfirmed ?? null,
                    mistakes: t.mistakes || "",
                    date: t.date || "—",
                }));

                // Sort by date desc
                normalized.sort((a, b) => (b.date > a.date ? 1 : -1));
                setTrades(normalized);
                setLoaded(true);
            } catch (error) {
                console.error("Fetch error:", error);
                setLoaded(true);
            }
        }
        fetchTrades();
        // fetch accounts for display
        (async () => {
            try {
                const res = await fetch('/api/accounts');
                if (!res.ok) return;
                const ac = await res.json();
                setAccounts(ac || []);
            } catch (e) {
                // ignore
            }
        })();
    }, []);

    // ─── Handle edit trade ────────────────────────────────────────────
    const handleEditTrade = (trade: TradeEntry) => {
        setEditingTrade(trade);
        setIsEditModalOpen(true);
    };

    // ─── Handle save edited trade ─────────────────────────────────────
    const handleSaveEditedTrade = async (updatedTrade: TradeEntry) => {
        try {
            const response = await fetch(`/api/trades/${updatedTrade.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedTrade),
            });

            if (!response.ok) throw new Error("Failed to save trade");

            // Update local state
            setTrades((prev) =>
                prev.map((t) => (t.id === updatedTrade.id ? updatedTrade : t))
            );
            setIsEditModalOpen(false);
            setEditingTrade(null);
        } catch (error) {
            console.error("Save error:", error);
            alert("Failed to save changes");
        }
    };

    // ─── Handle delete trade ──────────────────────────────────────────
    const handleDeleteTrade = async (id: string) => {
        if (!confirm("Are you sure you want to delete this trade?")) return;

        try {
            const response = await fetch(`/api/trades/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete trade");

            // Update local state
            setTrades((prev) => prev.filter((t) => t.id !== id));
            setExpandedId(null);
        } catch (error) {
            console.error("Delete error:", error);
            alert("Failed to delete trade");
        }
    };

    // ─── Filtered trades ──────────────────────────────────────────────
    const filtered = trades.filter((t) => {
        // Apply pair filter
        if (filterPair && t.pair !== filterPair) return false;
        
        // Apply trade type filter
        if (filterType && t.tradeType !== filterType) return false;
        
        // Apply outcome filter
        if (filterResult && t.outcome !== filterResult) return false;

        // Apply date range filter
        if (dateFilterMode !== "all") {
            const dateRange = getDateRangeForMode(dateFilterMode);
            if (dateRange && t.date !== "—") {
                const tradeDate = t.date;
                if (tradeDate < dateRange.start || tradeDate > dateRange.end) {
                    return false;
                }
            }
        }

        return true;
    });

    // ─── Stats ────────────────────────────────────────────────────────
    const totalTrades = filtered.length;
    const wins = filtered.filter((t) => t.outcome === "Win").length;
    const losses = filtered.filter((t) => t.outcome === "Loss").length;
    const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : "0";
    const totalPnl = filtered.reduce((sum, t) => sum + (parseFloat(t.profitLoss) || 0), 0);
    const avgRR = totalTrades > 0
        ? (filtered.reduce((sum, t) => sum + (t.rrRatio || 0), 0) / totalTrades).toFixed(1)
        : "0";
    const ruleBreaks = filtered.filter((t) => t.followedRules === false).length;

    // Unique values for filters
    const uniquePairs = Array.from(new Set(trades.map((t) => t.pair).filter((p) => p !== "—")));
    const uniqueTypes = Array.from(new Set(trades.map((t) => t.tradeType).filter((t) => t !== "—")));

    if (!loaded) return null;

    return (
        <div className="space-y-5 animate-fade-in">
            {/* ─── Header ──────────────────────────────────────────────── */}
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neon-green/10 border border-neon-green/20">
                        <BarChart3 className="h-5 w-5 text-neon-green" />
                    </div>
                    Trade Log
                </h1>
                <p className="text-sm text-gray-500 mt-2 ml-12">
                    Review your trades, identify patterns, and learn from mistakes
                </p>
            </div>

            {/* ─── Stats Bar ───────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatBox label="Total" value={totalTrades} color="blue" />
                <StatBox label="Win Rate" value={`${winRate}%`} sub={`${wins}W / ${losses}L`} color="green" />
                <StatBox
                    label="Total P&L"
                    value={`${totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(1)}`}
                    color={totalPnl >= 0 ? "green" : "red"}
                />
                <StatBox label="Avg RR" value={`${avgRR}R`} color="blue" />
                <StatBox
                    label="Rule Breaks"
                    value={ruleBreaks}
                    color={ruleBreaks > 0 ? "red" : "green"}
                />
                <StatBox
                    label="Best Streak"
                    value={(() => {
                        let streak = 0, max = 0;
                        filtered.forEach((t) => {
                            if (t.outcome === "Win") { streak++; max = Math.max(max, streak); }
                            else streak = 0;
                        });
                        return max;
                    })()}
                    sub="consecutive wins"
                    color="yellow"
                />
            </div>

            {/* ─── Filters ─────────────────────────────────────────────── */}
            <Card className="border-surface-500/20">
                <CardContent className="p-4 space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Filter className="h-3.5 w-3.5" />
                            <span className="uppercase tracking-widest font-mono">Filters</span>
                        </div>
                        <Select
                            value={filterPair}
                            onChange={(e) => setFilterPair(e.target.value)}
                            className="w-36 text-xs"
                        >
                            <option value="">All Pairs</option>
                            {uniquePairs.map((p) => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </Select>
                        <Select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-40 text-xs"
                        >
                            <option value="">All Types</option>
                            {uniqueTypes.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </Select>
                        <Select
                            value={filterResult}
                            onChange={(e) => setFilterResult(e.target.value)}
                            className="w-36 text-xs"
                        >
                            <option value="">All Results</option>
                            <option value="Win">Win</option>
                            <option value="Loss">Loss</option>
                            <option value="BE">Break Even</option>
                        </Select>
                        {(filterPair || filterType || filterResult) && (
                            <button
                                onClick={() => {
                                    setFilterPair("");
                                    setFilterType("");
                                    setFilterResult("");
                                }}
                                className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1 rounded-lg border border-surface-500/20 hover:border-surface-500/40"
                            >
                                Clear
                            </button>
                        )}
                        <span className="ml-auto text-xs text-gray-600 font-mono">
                            {filtered.length} trade{filtered.length !== 1 ? "s" : ""}
                        </span>
                    </div>

                    {/* ─── Date Range Filter ───────────────────────────────── */}
                    <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-surface-500/10">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="uppercase tracking-widest font-mono">Date</span>
                        </div>
                        <Select
                            value={dateFilterMode}
                            onChange={(e) =>
                                setDateFilterMode(
                                    e.target.value as
                                        | "all"
                                        | "today"
                                        | "week"
                                        | "month"
                                        | "custom"
                                )
                            }
                            className="w-36 text-xs"
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="custom">Custom Range</option>
                        </Select>

                        {dateFilterMode === "custom" && (
                            <>
                                <Input
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    className="w-32 text-xs"
                                    placeholder="Start date"
                                />
                                <span className="text-xs text-gray-600">to</span>
                                <Input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    className="w-32 text-xs"
                                    placeholder="End date"
                                />
                            </>
                        )}

                        {dateFilterMode !== "all" && (
                            <button
                                onClick={() => {
                                    setDateFilterMode("all");
                                    setCustomStartDate("");
                                    setCustomEndDate("");
                                }}
                                className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1 rounded-lg border border-surface-500/20 hover:border-surface-500/40"
                            >
                                Clear Date
                            </button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* ─── Trades Table ────────────────────────────────────────── */}
            {filtered.length === 0 ? (
                <Card className="border-surface-500/20">
                    <CardContent className="py-16 text-center">
                        <TrendingUp className="h-10 w-10 text-gray-700 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">No trades found</p>
                        <p className="text-xs text-gray-600 mt-1">
                            Log trades from the{" "}
                            <Link
                                href="/journal"
                                className="text-neon-green hover:text-neon-green/80 font-semibold transition-colors underline"
                            >
                                Journal page
                            </Link>
                            {" "}to see them here
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-surface-500/20 overflow-hidden">
                    <CardHeader className="pb-0 pt-4 px-4">
                        <CardTitle className="text-xs text-gray-500 font-mono uppercase tracking-widest">
                            Trade History
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 mt-3">
                        {/* Header Row */}
                        <div className="grid grid-cols-[80px_70px_120px_100px_60px_70px_80px_80px_70px_36px] gap-2 px-4 py-2 border-b border-surface-500/15 text-[10px] uppercase tracking-widest text-gray-600 font-mono">
                            <span>Date</span>
                            <span>Pair</span>
                            <span>Account</span>
                            <span>Type</span>
                            <span>RR</span>
                            <span>Result</span>
                            <span className="text-right">P&L</span>
                            <span>Actions</span>
                            <span></span>
                            <span></span>
                        </div>

                        {/* Trade Rows */}
                        {filtered.map((trade) => {
                            const isExpanded = expandedId === trade.id;
                            const rulesBroken = trade.followedRules === false;
                            const highRR = trade.rrRatio >= 5;

                            return (
                                <div key={trade.id}>
                                    <div className={`flex items-center w-full border-b transition-all duration-200 ${rulesBroken
                                            ? "border-l-2 border-l-neon-red/50 border-b-surface-500/10 bg-neon-red/[0.02]"
                                            : highRR
                                                ? "border-l-2 border-l-neon-green/30 border-b-surface-500/10 bg-neon-green/[0.01]"
                                                : "border-l-2 border-l-transparent border-b-surface-500/10"
                                            }`}>
                                        <button
                                            onClick={() =>
                                                setExpandedId(isExpanded ? null : trade.id)
                                            }
                                            className="flex-1 grid grid-cols-[80px_70px_120px_100px_60px_70px_80px_80px_70px_36px] gap-2 px-4 py-3 items-center text-sm hover:bg-surface-700/20"
                                        >
                                            {/* Date */}
                                            <span className="text-xs text-gray-400 font-mono text-left">
                                                {trade.date !== "—"
                                                    ? new Date(trade.date).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                    })
                                                    : "—"}
                                            </span>

                                            {/* Pair */}
                                            <span className="text-xs font-semibold text-white text-left">
                                                {trade.pair}
                                            </span>

                                            {/* Account */}
                                            <span className="text-xs text-gray-300 text-left">
                                                {accountMap[trade.accountId || ""] || "—"}
                                            </span>

                                            {/* Trade Type */}
                                            <span className="text-left">
                                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-surface-700/50 border border-surface-500/20 text-gray-400 font-mono">
                                                    {trade.tradeType}
                                                </span>
                                            </span>

                                            {/* RR */}
                                            <span
                                                className={`text-xs font-bold font-mono text-left ${trade.rrRatio >= 5
                                                    ? "text-neon-green"
                                                    : trade.rrRatio > 0
                                                        ? "text-neon-yellow"
                                                        : "text-gray-500"
                                                    }`}
                                            >
                                                {trade.rrRatio > 0 ? `${trade.rrRatio}R` : "—"}
                                            </span>

                                            {/* Result */}
                                            <span className="text-left">
                                                <Badge
                                                    variant={
                                                        trade.outcome === "Win"
                                                            ? "success"
                                                            : trade.outcome === "Loss"
                                                                ? "danger"
                                                                : "warning"
                                                    }
                                                >
                                                    {trade.outcome}
                                                </Badge>
                                            </span>

                                            {/* Followed Rules */}
                                            <span className="text-left">
                                                {trade.followedRules === true ? (
                                                    <span className="flex items-center gap-1 text-xs text-neon-green">
                                                        <CheckCircle2 className="h-3 w-3" /> Yes
                                                    </span>
                                                ) : trade.followedRules === false ? (
                                                    <span className="flex items-center gap-1 text-xs text-neon-red">
                                                        <XCircle className="h-3 w-3" /> No
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-600">—</span>
                                                )}
                                            </span>

                                            {/* P&L */}
                                            <span
                                                className={`text-xs font-bold font-mono text-right ${parseFloat(trade.profitLoss) > 0
                                                    ? "text-neon-green"
                                                    : parseFloat(trade.profitLoss) < 0
                                                        ? "text-neon-red"
                                                        : "text-gray-500"
                                                    }`}
                                            >
                                                {parseFloat(trade.profitLoss) > 0 ? "+" : ""}
                                                {parseFloat(trade.profitLoss)
                                                    ? parseFloat(trade.profitLoss).toFixed(1)
                                                    : "0"}
                                            </span>

                                            {/* Actions: Edit / Delete */}
                                            <span className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditTrade(trade);
                                                    }}
                                                    className="p-1 rounded-md hover:bg-surface-700/40"
                                                    title="Edit"
                                                >
                                                    <svg className="h-4 w-4 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/><path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteTrade(trade.id);
                                                    }}
                                                    className="p-1 rounded-md hover:bg-surface-700/40"
                                                    title="Delete"
                                                >
                                                    <svg className="h-4 w-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18"/><path d="M8 6v14a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                                </button>
                                            </span>

                                            {/* Expand icon */}
                                            <span className="flex justify-center text-gray-600">
                                                {isExpanded ? (
                                                    <ChevronUp className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                            </span>
                                        </button>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2 px-3 pr-4">
                                            <button
                                                onClick={() => handleEditTrade(trade)}
                                                className="p-2 hover:bg-neon-blue/10 rounded-lg text-gray-400 hover:text-neon-blue transition-colors"
                                                title="Edit trade"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTrade(trade.id)}
                                                className="p-2 hover:bg-neon-red/10 rounded-lg text-gray-400 hover:text-neon-red transition-colors"
                                                title="Delete trade"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Detail */}
                                    {isExpanded && <TradeDetail trade={trade} />}
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            )}

            {/* ─── Patterns / Insights ─────────────────────────────────── */}
            {filtered.length > 0 && (
                <Card className="border-surface-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4 text-neon-yellow" />
                            Quick Insights
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {/* Most Traded Pair */}
                            {(() => {
                                const pairCounts: Record<string, number> = {};
                                filtered.forEach((t) => {
                                    if (t.pair !== "—") pairCounts[t.pair] = (pairCounts[t.pair] || 0) + 1;
                                });
                                const top = Object.entries(pairCounts).sort((a, b) => b[1] - a[1])[0];
                                return top ? (
                                    <InsightCard
                                        icon={<TrendingUp className="h-4 w-4 text-neon-blue" />}
                                        label="Most Traded"
                                        value={top[0]}
                                        sub={`${top[1]} trades`}
                                    />
                                ) : null;
                            })()}

                            {/* Most Common Emotion (excluding Calm) */}
                            {(() => {
                                const emCounts: Record<string, number> = {};
                                filtered.forEach((t) => {
                                    if (t.emotion && t.emotion !== "—" && t.emotion !== "Calm")
                                        emCounts[t.emotion] = (emCounts[t.emotion] || 0) + 1;
                                });
                                const top = Object.entries(emCounts).sort((a, b) => b[1] - a[1])[0];
                                return top ? (
                                    <InsightCard
                                        icon={<Brain className="h-4 w-4 text-neon-red" />}
                                        label="Common Emotion"
                                        value={top[0]}
                                        sub={`${top[1]} occurrences`}
                                    />
                                ) : (
                                    <InsightCard
                                        icon={<Brain className="h-4 w-4 text-neon-green" />}
                                        label="Emotional State"
                                        value="Calm"
                                        sub="No negative patterns"
                                    />
                                );
                            })()}

                            {/* Best Trade Type */}
                            {(() => {
                                const typeWins: Record<string, { wins: number; total: number }> = {};
                                filtered.forEach((t) => {
                                    if (t.tradeType !== "—") {
                                        if (!typeWins[t.tradeType]) typeWins[t.tradeType] = { wins: 0, total: 0 };
                                        typeWins[t.tradeType].total++;
                                        if (t.outcome === "Win") typeWins[t.tradeType].wins++;
                                    }
                                });
                                const best = Object.entries(typeWins)
                                    .filter(([, v]) => v.total >= 1)
                                    .sort((a, b) => b[1].wins / b[1].total - a[1].wins / a[1].total)[0];
                                return best ? (
                                    <InsightCard
                                        icon={<Target className="h-4 w-4 text-neon-green" />}
                                        label="Best Trade Type"
                                        value={best[0]}
                                        sub={`${((best[1].wins / best[1].total) * 100).toFixed(0)}% win rate`}
                                    />
                                ) : null;
                            })()}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ─── Edit Trade Modal ────────────────────────────────────── */}
            <EditTradeModal
                trade={editingTrade}
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingTrade(null);
                }}
                onSave={handleSaveEditedTrade}
            />
        </div>
    );
}

function InsightCard({
    icon,
    label,
    value,
    sub,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    sub: string;
}) {
    return (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-800/40 border border-surface-500/15">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-700/50">
                {icon}
            </div>
            <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-600 font-mono">
                    {label}
                </p>
                <p className="text-sm font-semibold text-white">{value}</p>
                <p className="text-[10px] text-gray-500">{sub}</p>
            </div>
        </div>
    );
}
