"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    TrendingUp,
    Target,
    ShieldCheck,
    BarChart3,
    Award,
    AlertTriangle,
    Brain,
    Crosshair,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────
interface TradeEntry {
    id: string;
    pair: string;
    tradeType: string;
    date: string;
    outcome: string;
    profitLoss: string;
    rrRatio: number;
    followedRules: boolean | null;
    emotion: string;
    mistakes: string;
    poiTapped: boolean | null;
    chochConfirmed: boolean | null;
    // Legacy
    symbol?: string;
    status?: string;
    pnl?: number;
    notes?: string;
}

// ─── Custom Tooltip ──────────────────────────────────────────────────
function ChartTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: Array<{ value: number; name: string; color: string }>;
    label?: string;
}) {
    if (!active || !payload) return null;
    return (
        <div className="bg-surface-800 border border-surface-500/30 rounded-lg px-3 py-2 shadow-xl">
            <p className="text-[10px] text-gray-500 font-mono mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} className="text-xs font-mono font-bold" style={{ color: p.color }}>
                    {p.name}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
                </p>
            ))}
        </div>
    );
}

// ─── Stat Card ───────────────────────────────────────────────────────
function MetricCard({
    icon: Icon,
    label,
    value,
    sub,
    color,
    glow,
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    sub?: string;
    color: string;
    glow?: boolean;
}) {
    const colorClasses: Record<string, { text: string; bg: string; border: string; shadow: string }> = {
        green: {
            text: "text-neon-green",
            bg: "bg-neon-green/10",
            border: "border-neon-green/20",
            shadow: "shadow-[0_0_30px_rgba(0,255,136,0.08)]",
        },
        red: {
            text: "text-neon-red",
            bg: "bg-neon-red/10",
            border: "border-neon-red/20",
            shadow: "shadow-[0_0_30px_rgba(255,59,92,0.08)]",
        },
        blue: {
            text: "text-neon-blue",
            bg: "bg-neon-blue/10",
            border: "border-neon-blue/20",
            shadow: "shadow-[0_0_30px_rgba(59,130,246,0.08)]",
        },
        yellow: {
            text: "text-neon-yellow",
            bg: "bg-neon-yellow/10",
            border: "border-neon-yellow/20",
            shadow: "shadow-[0_0_30px_rgba(251,191,36,0.08)]",
        },
        purple: {
            text: "text-neon-purple",
            bg: "bg-neon-purple/10",
            border: "border-neon-purple/20",
            shadow: "shadow-[0_0_30px_rgba(168,85,247,0.08)]",
        },
    };
    const c = colorClasses[color] || colorClasses.blue;

    return (
        <Card className={`${c.border} ${glow ? c.shadow : ""} transition-all duration-300`}>
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest font-mono">
                            {label}
                        </p>
                        <p className={`text-2xl font-bold font-mono ${c.text}`}>{value}</p>
                        {sub && <p className="text-[10px] text-gray-500">{sub}</p>}
                    </div>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.bg} border ${c.border}`}>
                        <Icon className={`h-5 w-5 ${c.text}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Main Dashboard ─────────────────────────────────────────────────
export default function DashboardPage() {
    const [trades, setTrades] = useState<TradeEntry[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        // Load from both stores
        const journalEntries: TradeEntry[] = JSON.parse(
            localStorage.getItem("tradeflow-journal-entries") || "[]"
        );
        const legacyTrades: TradeEntry[] = JSON.parse(
            localStorage.getItem("tradeflow-trades") || "[]"
        );

        const journalIds = new Set(journalEntries.map((e) => e.id));
        const combined = [
            ...journalEntries,
            ...legacyTrades.filter((t) => !journalIds.has(t.id)),
        ];

        // Normalize
        const normalized = combined.map((t) => ({
            ...t,
            pair: t.pair || t.symbol || "—",
            tradeType: t.tradeType || "—",
            outcome: t.outcome || t.status || "—",
            rrRatio: t.rrRatio || 0,
            profitLoss: t.profitLoss || (t.pnl !== undefined ? String(t.pnl) : "0"),
            followedRules: t.followedRules ?? null,
            emotion: t.emotion || "—",
            mistakes: t.mistakes || t.notes || "",
            poiTapped: t.poiTapped ?? null,
            chochConfirmed: t.chochConfirmed ?? null,
            date: t.date || "—",
        }));

        normalized.sort((a, b) => (a.date > b.date ? 1 : -1));
        setTrades(normalized);
        setLoaded(true);
    }, []);

    // ─── Computed Metrics ─────────────────────────────────────────────
    const metrics = useMemo(() => {
        const total = trades.length;
        const wins = trades.filter((t) => t.outcome === "Win").length;
        const losses = trades.filter((t) => t.outcome === "Loss").length;
        const be = trades.filter((t) => t.outcome === "BE").length;
        const winRate = total > 0 ? (wins / total) * 100 : 0;
        const avgRR =
            total > 0
                ? trades.reduce((s, t) => s + (t.rrRatio || 0), 0) / total
                : 0;
        const totalPnl = trades.reduce(
            (s, t) => s + (parseFloat(t.profitLoss) || 0),
            0
        );
        const rulesFollowed = trades.filter((t) => t.followedRules === true).length;
        const rulesBroken = trades.filter((t) => t.followedRules === false).length;
        const rulesAnswered = trades.filter((t) => t.followedRules !== null).length;
        const ruleAdherence =
            rulesAnswered > 0 ? (rulesFollowed / rulesAnswered) * 100 : 0;
        const ruleBreakPct =
            rulesAnswered > 0 ? (rulesBroken / rulesAnswered) * 100 : 0;

        // Win rates split by rule adherence
        const followedTrades = trades.filter((t) => t.followedRules === true);
        const brokenTrades = trades.filter((t) => t.followedRules === false);
        const followedWins = followedTrades.filter((t) => t.outcome === "Win").length;
        const brokenWins = brokenTrades.filter((t) => t.outcome === "Win").length;
        const followedWinRate = followedTrades.length > 0 ? (followedWins / followedTrades.length) * 100 : 0;
        const brokenWinRate = brokenTrades.length > 0 ? (brokenWins / brokenTrades.length) * 100 : 0;

        // Full confirmation: poiTapped === true && chochConfirmed === true
        const fullConf = trades.filter(
            (t) => t.poiTapped === true && t.chochConfirmed === true
        ).length;
        const partialConf = trades.filter(
            (t) =>
                (t.poiTapped !== null || t.chochConfirmed !== null) &&
                !(t.poiTapped === true && t.chochConfirmed === true)
        ).length;

        return {
            total,
            wins,
            losses,
            be,
            winRate,
            avgRR,
            totalPnl,
            ruleAdherence,
            ruleBreakPct,
            rulesFollowed,
            rulesBroken,
            followedWinRate,
            brokenWinRate,
            fullConf,
            partialConf,
        };
    }, [trades]);

    // ─── Equity Curve Data ────────────────────────────────────────────
    const equityData = useMemo(() => {
        let cumulative = 0;
        return trades.map((t) => {
            cumulative += parseFloat(t.profitLoss) || 0;
            return {
                date: t.date !== "—"
                    ? new Date(t.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                    })
                    : "—",
                equity: parseFloat(cumulative.toFixed(2)),
            };
        });
    }, [trades]);

    // ─── Win / Loss / BE Data ─────────────────────────────────────────
    const winLossData = useMemo(
        () => [
            { name: "Win", value: metrics.wins, color: "#00ff88" },
            { name: "Loss", value: metrics.losses, color: "#ff3b5c" },
            { name: "BE", value: metrics.be, color: "#fbbf24" },
        ],
        [metrics]
    );

    // ─── Confirmation Analysis ────────────────────────────────────────
    const confirmationData = useMemo(() => {
        const fullWins = trades.filter(
            (t) =>
                t.poiTapped === true &&
                t.chochConfirmed === true &&
                t.outcome === "Win"
        ).length;
        const fullTotal = metrics.fullConf;
        const partialWins = trades.filter(
            (t) =>
                !(t.poiTapped === true && t.chochConfirmed === true) &&
                (t.poiTapped !== null || t.chochConfirmed !== null) &&
                t.outcome === "Win"
        ).length;
        const partialTotal = metrics.partialConf;

        return [
            {
                name: "Full Confirmation",
                winRate: fullTotal > 0 ? parseFloat(((fullWins / fullTotal) * 100).toFixed(1)) : 0,
                trades: fullTotal,
            },
            {
                name: "Partial Confirmation",
                winRate: partialTotal > 0 ? parseFloat(((partialWins / partialTotal) * 100).toFixed(1)) : 0,
                trades: partialTotal,
            },
        ];
    }, [trades, metrics]);

    // ─── Trade Type Performance ───────────────────────────────────────
    const tradeTypePerf = useMemo(() => {
        const types: Record<string, { wins: number; total: number; pnl: number }> = {};
        trades.forEach((t) => {
            if (t.tradeType === "—") return;
            if (!types[t.tradeType]) types[t.tradeType] = { wins: 0, total: 0, pnl: 0 };
            types[t.tradeType].total++;
            types[t.tradeType].pnl += parseFloat(t.profitLoss) || 0;
            if (t.outcome === "Win") types[t.tradeType].wins++;
        });
        return Object.entries(types)
            .map(([name, data]) => ({
                name,
                winRate: data.total > 0 ? parseFloat(((data.wins / data.total) * 100).toFixed(1)) : 0,
                pnl: parseFloat(data.pnl.toFixed(1)),
                trades: data.total,
            }))
            .sort((a, b) => b.pnl - a.pnl);
    }, [trades]);

    // ─── Pair Performance ─────────────────────────────────────────────
    const pairPerf = useMemo(() => {
        const pairs: Record<string, { wins: number; total: number; pnl: number }> = {};
        trades.forEach((t) => {
            if (t.pair === "—") return;
            if (!pairs[t.pair]) pairs[t.pair] = { wins: 0, total: 0, pnl: 0 };
            pairs[t.pair].total++;
            pairs[t.pair].pnl += parseFloat(t.profitLoss) || 0;
            if (t.outcome === "Win") pairs[t.pair].wins++;
        });
        return Object.entries(pairs)
            .map(([name, data]) => ({
                name,
                winRate: data.total > 0 ? parseFloat(((data.wins / data.total) * 100).toFixed(1)) : 0,
                pnl: parseFloat(data.pnl.toFixed(1)),
                trades: data.total,
            }))
            .sort((a, b) => b.pnl - a.pnl);
    }, [trades]);

    // ─── Most Common Mistake ──────────────────────────────────────────
    const topMistake = useMemo(() => {
        const words: Record<string, number> = {};
        trades.forEach((t) => {
            if (!t.mistakes) return;
            // Split into phrases by common separators
            const phrases = t.mistakes
                .toLowerCase()
                .split(/[,.;\n]+/)
                .map((s) => s.trim())
                .filter((s) => s.length > 5);
            phrases.forEach((p) => {
                words[p] = (words[p] || 0) + 1;
            });
        });
        const sorted = Object.entries(words).sort((a, b) => b[1] - a[1]);
        return sorted.length > 0 ? { text: sorted[0][0], count: sorted[0][1] } : null;
    }, [trades]);

    // ─── Emotion Distribution ─────────────────────────────────────────
    const emotionData = useMemo(() => {
        const emo: Record<string, number> = {};
        trades.forEach((t) => {
            if (t.emotion && t.emotion !== "—") {
                emo[t.emotion] = (emo[t.emotion] || 0) + 1;
            }
        });
        const colorMap: Record<string, string> = {
            Calm: "#00ff88",
            FOMO: "#ff3b5c",
            Hesitation: "#fbbf24",
            Revenge: "#ff3b5c",
        };
        return Object.entries(emo).map(([name, value]) => ({
            name,
            value,
            color: colorMap[name] || "#3b82f6",
        }));
    }, [trades]);

    if (!loaded) return null;

    // Empty state
    if (trades.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center">
                        <div className="h-16 w-16 rounded-2xl bg-surface-700/50 border border-surface-500/20 flex items-center justify-center">
                            <BarChart3 className="h-8 w-8 text-gray-600" />
                        </div>
                    </div>
                    <h2 className="text-lg font-semibold text-white">No Trading Data Yet</h2>
                    <p className="text-sm text-gray-500 max-w-sm">
                        Start logging trades from the Journal page to see your performance analytics here.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* ─── Header ──────────────────────────────────────────────── */}
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neon-blue/10 border border-neon-blue/20">
                        <BarChart3 className="h-5 w-5 text-neon-blue" />
                    </div>
                    Dashboard
                </h1>
                <p className="text-sm text-gray-500 mt-2 ml-12">
                    Trading performance analytics and insights
                </p>
            </div>

            {/* ─── Key Metrics ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    icon={BarChart3}
                    label="Total Trades"
                    value={metrics.total}
                    sub={`${metrics.wins}W / ${metrics.losses}L / ${metrics.be}BE`}
                    color="blue"
                    glow
                />
                <MetricCard
                    icon={TrendingUp}
                    label="Win Rate"
                    value={`${metrics.winRate.toFixed(1)}%`}
                    sub={metrics.winRate >= 50 ? "Above average" : "Below 50%"}
                    color={metrics.winRate >= 50 ? "green" : "red"}
                    glow
                />
                <MetricCard
                    icon={Target}
                    label="Avg RR"
                    value={`${metrics.avgRR.toFixed(1)}R`}
                    sub={metrics.avgRR >= 5 ? "Meets SOP target" : "Below 5R target"}
                    color={metrics.avgRR >= 5 ? "green" : "yellow"}
                    glow
                />
                <MetricCard
                    icon={ShieldCheck}
                    label="Rule Adherence"
                    value={`${metrics.ruleAdherence.toFixed(0)}%`}
                    sub={metrics.ruleAdherence >= 90 ? "Excellent discipline" : "Needs improvement"}
                    color={metrics.ruleAdherence >= 90 ? "green" : metrics.ruleAdherence >= 70 ? "yellow" : "red"}
                    glow
                />
            </div>

            {/* ─── Total P&L Banner ────────────────────────────────────── */}
            <Card
                className={`overflow-hidden ${metrics.totalPnl >= 0
                    ? "border-neon-green/20 shadow-[0_0_40px_rgba(0,255,136,0.06)]"
                    : "border-neon-red/20 shadow-[0_0_40px_rgba(255,59,92,0.06)]"
                    }`}
            >
                <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div
                            className={`h-12 w-12 rounded-xl flex items-center justify-center ${metrics.totalPnl >= 0
                                ? "bg-neon-green/10 border border-neon-green/20"
                                : "bg-neon-red/10 border border-neon-red/20"
                                }`}
                        >
                            {metrics.totalPnl >= 0 ? (
                                <ArrowUpRight className="h-6 w-6 text-neon-green" />
                            ) : (
                                <ArrowDownRight className="h-6 w-6 text-neon-red" />
                            )}
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-mono">
                                Total P&L
                            </p>
                            <p
                                className={`text-3xl font-black font-mono ${metrics.totalPnl >= 0 ? "text-neon-green" : "text-neon-red"
                                    }`}
                            >
                                {metrics.totalPnl >= 0 ? "+" : ""}
                                {metrics.totalPnl.toFixed(2)}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-mono">
                            Avg per trade
                        </p>
                        <p className="text-lg font-bold font-mono text-gray-300">
                            {metrics.total > 0
                                ? `${(metrics.totalPnl / metrics.total).toFixed(2)}`
                                : "0"}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* ─── Rule Violation Detector ────────────────────────────────── */}
            {(metrics.rulesFollowed > 0 || metrics.rulesBroken > 0) && (
                <Card className="border-neon-red/15 overflow-hidden shadow-[0_0_40px_rgba(255,59,92,0.04)]">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-3 text-sm">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon-red/10 border border-neon-red/20">
                                <ShieldCheck className="h-4 w-4 text-neon-red" />
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 uppercase tracking-widest font-mono block mb-0.5">
                                    System Analysis
                                </span>
                                <span className="text-white text-sm font-semibold">
                                    Rule Violation Detector
                                </span>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {/* Rule Break % */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex flex-col items-center px-4 py-4 rounded-xl bg-surface-800/50 border border-surface-500/15">
                                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-mono">Rule Break %</span>
                                <span className={`text-2xl font-black font-mono mt-1 ${metrics.ruleBreakPct > 20 ? "text-neon-red" : metrics.ruleBreakPct > 0 ? "text-neon-yellow" : "text-neon-green"}`}>
                                    {metrics.ruleBreakPct.toFixed(0)}%
                                </span>
                                <span className="text-[10px] text-gray-600 mt-0.5">{metrics.rulesBroken} of {metrics.rulesFollowed + metrics.rulesBroken} trades</span>
                            </div>
                            <div className="flex flex-col items-center px-4 py-4 rounded-xl bg-neon-green/[0.03] border border-neon-green/15">
                                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-mono">Rules Followed WR</span>
                                <span className="text-2xl font-black font-mono mt-1 text-neon-green">
                                    {metrics.followedWinRate.toFixed(0)}%
                                </span>
                                <span className="text-[10px] text-gray-600 mt-0.5">{metrics.rulesFollowed} trades</span>
                            </div>
                            <div className="flex flex-col items-center px-4 py-4 rounded-xl bg-neon-red/[0.03] border border-neon-red/15">
                                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-mono">Rules Broken WR</span>
                                <span className="text-2xl font-black font-mono mt-1 text-neon-red">
                                    {metrics.brokenWinRate.toFixed(0)}%
                                </span>
                                <span className="text-[10px] text-gray-600 mt-0.5">{metrics.rulesBroken} trades</span>
                            </div>
                        </div>

                        {/* Visual Comparison Bars */}
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-400 flex items-center gap-1.5">
                                        <ShieldCheck className="h-3 w-3 text-neon-green" />
                                        Rules Followed
                                    </span>
                                    <span className="font-mono font-bold text-neon-green">{metrics.followedWinRate.toFixed(0)}%</span>
                                </div>
                                <div className="w-full h-3 bg-surface-700/50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000 ease-out"
                                        style={{
                                            width: `${metrics.followedWinRate}%`,
                                            background: "linear-gradient(90deg, #00ff88, #00cc6a)",
                                            boxShadow: "0 0 12px rgba(0,255,136,0.3)",
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-400 flex items-center gap-1.5">
                                        <AlertTriangle className="h-3 w-3 text-neon-red" />
                                        Rules Broken
                                    </span>
                                    <span className="font-mono font-bold text-neon-red">{metrics.brokenWinRate.toFixed(0)}%</span>
                                </div>
                                <div className="w-full h-3 bg-surface-700/50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000 ease-out"
                                        style={{
                                            width: `${metrics.brokenWinRate}%`,
                                            background: "linear-gradient(90deg, #ff3b5c, #ff6b81)",
                                            boxShadow: "0 0 12px rgba(255,59,92,0.3)",
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Insight Message */}
                        <div className={`rounded-xl border p-4 text-center transition-all duration-500 ${metrics.followedWinRate > metrics.brokenWinRate
                                ? "border-neon-green/20 bg-neon-green/[0.03] shadow-[0_0_25px_rgba(0,255,136,0.05)]"
                                : metrics.followedWinRate === metrics.brokenWinRate
                                    ? "border-surface-500/20 bg-surface-800/30"
                                    : "border-neon-yellow/20 bg-neon-yellow/[0.03]"
                            }`}>
                            <p className="text-sm font-medium text-white">
                                {metrics.followedWinRate > metrics.brokenWinRate ? (
                                    <>Your win rate is <span className="text-neon-green font-bold font-mono">{(metrics.followedWinRate - metrics.brokenWinRate).toFixed(0)}%</span> higher when following your system</>
                                ) : metrics.rulesBroken === 0 ? (
                                    <>Perfect discipline — <span className="text-neon-green font-bold">zero rule breaks</span> logged</>
                                ) : (
                                    <>Not enough data yet to determine the impact of rule adherence</>
                                )}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-1 font-mono uppercase tracking-wider">
                                {metrics.followedWinRate > metrics.brokenWinRate
                                    ? "Trust your process. The numbers prove it works."
                                    : metrics.rulesBroken === 0
                                        ? "Keep it up. Consistency is key."
                                        : "Keep logging trades to build a clearer picture."}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ─── Charts Row 1 ────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Equity Curve */}
                <Card className="lg:col-span-2 border-surface-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs text-gray-500 font-mono uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp className="h-3.5 w-3.5 text-neon-green" />
                            Equity Curve
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={equityData}>
                                    <defs>
                                        <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop
                                                offset="5%"
                                                stopColor={metrics.totalPnl >= 0 ? "#00ff88" : "#ff3b5c"}
                                                stopOpacity={0.2}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor={metrics.totalPnl >= 0 ? "#00ff88" : "#ff3b5c"}
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 10, fill: "#555" }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10, fill: "#555" }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="equity"
                                        stroke={metrics.totalPnl >= 0 ? "#00ff88" : "#ff3b5c"}
                                        strokeWidth={2}
                                        fill="url(#equityGrad)"
                                        name="Equity"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Win / Loss Pie */}
                <Card className="border-surface-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs text-gray-500 font-mono uppercase tracking-widest flex items-center gap-2">
                            <Target className="h-3.5 w-3.5 text-neon-blue" />
                            Win vs Loss
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={winLossData.filter((d) => d.value > 0)}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={80}
                                        paddingAngle={4}
                                        dataKey="value"
                                        strokeWidth={0}
                                    >
                                        {winLossData.filter((d) => d.value > 0).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<ChartTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex items-center justify-center gap-4 mt-1">
                            {winLossData.map((d) => (
                                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                                    <div
                                        className="h-2 w-2 rounded-full"
                                        style={{ backgroundColor: d.color }}
                                    />
                                    <span className="text-gray-400">
                                        {d.name}{" "}
                                        <span className="font-mono font-bold text-white">{d.value}</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ─── Charts Row 2 ────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Confirmation Analysis */}
                <Card className="border-surface-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs text-gray-500 font-mono uppercase tracking-widest flex items-center gap-2">
                            <Crosshair className="h-3.5 w-3.5 text-neon-green" />
                            Confirmation Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={confirmationData} barGap={16}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 9, fill: "#555" }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10, fill: "#555" }}
                                        axisLine={false}
                                        tickLine={false}
                                        domain={[0, 100]}
                                        unit="%"
                                    />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Bar dataKey="winRate" name="Win Rate" fill="#00ff88" radius={[6, 6, 0, 0]} maxBarSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex items-center justify-center gap-6 mt-2">
                            {confirmationData.map((d) => (
                                <div key={d.name} className="text-center">
                                    <p className="text-[10px] text-gray-500 font-mono">{d.name}</p>
                                    <p className="text-sm font-bold font-mono text-white">
                                        {d.trades} trades
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Emotion Distribution */}
                <Card className="border-surface-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs text-gray-500 font-mono uppercase tracking-widest flex items-center gap-2">
                            <Brain className="h-3.5 w-3.5 text-neon-red" />
                            Emotional State Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={emotionData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={75}
                                        paddingAngle={4}
                                        dataKey="value"
                                        strokeWidth={0}
                                    >
                                        {emotionData.map((entry, index) => (
                                            <Cell key={`emo-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<ChartTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex items-center justify-center gap-4 mt-1 flex-wrap">
                            {emotionData.map((d) => (
                                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                                    <div
                                        className="h-2 w-2 rounded-full"
                                        style={{ backgroundColor: d.color }}
                                    />
                                    <span className="text-gray-400">
                                        {d.name}{" "}
                                        <span className="font-mono font-bold text-white">{d.value}</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ─── Insights Row ────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Trade Type Performance */}
                <Card className="border-surface-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs text-gray-500 font-mono uppercase tracking-widest flex items-center gap-2">
                            <Award className="h-3.5 w-3.5 text-neon-purple" />
                            Trade Type Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {tradeTypePerf.length === 0 ? (
                            <p className="text-xs text-gray-600 text-center py-4">No data yet</p>
                        ) : (
                            tradeTypePerf.map((tp) => (
                                <div
                                    key={tp.name}
                                    className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-surface-800/40 border border-surface-500/10"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-white">{tp.name}</p>
                                        <p className="text-[10px] text-gray-500 font-mono">
                                            {tp.trades} trades · {tp.winRate}% win rate
                                        </p>
                                    </div>
                                    <span
                                        className={`text-sm font-bold font-mono ${tp.pnl >= 0 ? "text-neon-green" : "text-neon-red"
                                            }`}
                                    >
                                        {tp.pnl >= 0 ? "+" : ""}
                                        {tp.pnl}
                                    </span>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Pairs Performance */}
                <Card className="border-surface-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs text-gray-500 font-mono uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp className="h-3.5 w-3.5 text-neon-blue" />
                            Pairs Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {pairPerf.length === 0 ? (
                            <p className="text-xs text-gray-600 text-center py-4">No data yet</p>
                        ) : (
                            pairPerf.map((pp) => (
                                <div
                                    key={pp.name}
                                    className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-surface-800/40 border border-surface-500/10"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-white font-mono">
                                            {pp.name}
                                        </span>
                                        <Badge
                                            variant={pp.winRate >= 50 ? "success" : "danger"}
                                        >
                                            {pp.winRate}%
                                        </Badge>
                                    </div>
                                    <div className="text-right">
                                        <span
                                            className={`text-sm font-bold font-mono ${pp.pnl >= 0 ? "text-neon-green" : "text-neon-red"
                                                }`}
                                        >
                                            {pp.pnl >= 0 ? "+" : ""}
                                            {pp.pnl}
                                        </span>
                                        <p className="text-[10px] text-gray-600 font-mono">
                                            {pp.trades} trades
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Key Insights */}
                <Card className="border-surface-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs text-gray-500 font-mono uppercase tracking-widest flex items-center gap-2">
                            <AlertTriangle className="h-3.5 w-3.5 text-neon-yellow" />
                            Key Insights
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {/* Most Common Mistake */}
                        <InsightRow
                            icon={<AlertTriangle className="h-4 w-4 text-neon-red" />}
                            label="Common Mistake"
                            value={topMistake ? `"${topMistake.text}"` : "None logged"}
                            sub={topMistake ? `×${topMistake.count}` : ""}
                            color="red"
                        />

                        {/* Best Performing Type */}
                        {tradeTypePerf.length > 0 && (
                            <InsightRow
                                icon={<Award className="h-4 w-4 text-neon-green" />}
                                label="Most Profitable"
                                value={tradeTypePerf[0].name}
                                sub={`+${tradeTypePerf[0].pnl} P&L`}
                                color="green"
                            />
                        )}

                        {/* Rule Adherence */}
                        <InsightRow
                            icon={<ShieldCheck className="h-4 w-4 text-neon-blue" />}
                            label="Discipline"
                            value={
                                metrics.ruleAdherence >= 90
                                    ? "Excellent"
                                    : metrics.ruleAdherence >= 70
                                        ? "Good"
                                        : "Needs Work"
                            }
                            sub={`${metrics.ruleAdherence.toFixed(0)}% adherence`}
                            color={metrics.ruleAdherence >= 90 ? "green" : metrics.ruleAdherence >= 70 ? "blue" : "red"}
                        />

                        {/* Confirmation Impact */}
                        {confirmationData[0].trades > 0 && (
                            <InsightRow
                                icon={<Crosshair className="h-4 w-4 text-neon-purple" />}
                                label="Full Confirm WR"
                                value={`${confirmationData[0].winRate}%`}
                                sub={`vs ${confirmationData[1].winRate}% partial`}
                                color="purple"
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// ─── Insight Row ────────────────────────────────────────────────────
function InsightRow({
    icon,
    label,
    value,
    sub,
    color,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    sub: string;
    color: string;
}) {
    const colorMap: Record<string, string> = {
        green: "border-neon-green/10",
        red: "border-neon-red/10",
        blue: "border-neon-blue/10",
        yellow: "border-neon-yellow/10",
        purple: "border-neon-purple/10",
    };
    return (
        <div
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-800/40 border ${colorMap[color] || "border-surface-500/10"
                }`}
        >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-700/50 shrink-0">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-gray-600 font-mono">
                    {label}
                </p>
                <p className="text-xs font-semibold text-white truncate">{value}</p>
                {sub && <p className="text-[10px] text-gray-500">{sub}</p>}
            </div>
        </div>
    );
}
