"use client";

import { useEffect, useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
    TrendingUp,
    Target,
    ShieldCheck,
    BarChart3,
    Award,
    AlertTriangle,
    Crosshair,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    TrendingDown,
    Activity,
    CalendarDays
} from "lucide-react";
import {
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { DailySummaryCalendar } from "@/components/daily-summary-calendar";

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
}

// ─── Number Animation Hook ───────────────────────────────────────────
function useCountUp(end: number, duration: number = 1000, decimals: number = 0) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number | null = null;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            
            // Easing function (easeOutExpo)
            const easeProgress = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
            
            setCount(end * easeProgress);

            if (percentage < 1) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                setCount(end); // Ensure exact final value
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration]);

    return Number(count.toFixed(decimals));
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
        <div className="glass-card rounded-lg px-3 py-2 shadow-xl border border-white/10 backdrop-blur-xl">
            <p className="text-[10px] text-gray-400 font-mono mb-1 uppercase tracking-widest">{label}</p>
            {payload.map((p, i) => (
                <p key={i} className="text-xs font-mono font-bold" style={{ color: p.color }}>
                    {p.name}: {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
                </p>
            ))}
        </div>
    );
}

// ─── Glass KPI Card ──────────────────────────────────────────────────
function KPICard({
    title,
    value,
    prefix = "",
    suffix = "",
    icon: Icon,
    color,
    delayClass,
    decimals = 0,
    subtext,
    trend
}: {
    title: string;
    value: number;
    prefix?: string;
    suffix?: string;
    icon: React.ElementType;
    color: "green" | "red" | "blue" | "purple" | "cyan" | "yellow";
    delayClass: string;
    decimals?: number;
    subtext?: string;
    trend?: "up" | "down" | "neutral";
}) {
    const animatedValue = useCountUp(value, 1500, decimals);
    
    const colorStyles = {
        green: { iconBg: "bg-neon-green/10", iconColor: "text-neon-green", textGrad: "text-gradient-green", glow: "kpi-glow-green" },
        red: { iconBg: "bg-neon-red/10", iconColor: "text-neon-red", textGrad: "text-gradient-red", glow: "kpi-glow-red" },
        blue: { iconBg: "bg-neon-blue/10", iconColor: "text-neon-blue", textGrad: "text-gradient-blue", glow: "kpi-glow-blue" },
        purple: { iconBg: "bg-neon-purple/10", iconColor: "text-neon-purple", textGrad: "text-gradient-purple", glow: "kpi-glow-purple" },
        cyan: { iconBg: "bg-neon-cyan/10", iconColor: "text-neon-cyan", textGrad: "text-gradient-cyan", glow: "kpi-glow-cyan" },
        yellow: { iconBg: "bg-neon-yellow/10", iconColor: "text-neon-yellow", textGrad: "text-gradient-yellow", glow: "kpi-glow-yellow" },
    };
    
    const style = colorStyles[color];

    return (
        <div className={`glass-card rounded-2xl p-4 sm:p-5 relative overflow-hidden group animate-slide-up-fade ${delayClass} ${style.glow}`}>
            {/* Top gradient highlight */}
            <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-${color}-500/50 to-transparent opacity-50`} />
            
            <div className="flex justify-between items-start mb-4">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider font-mono">
                    {title}
                </p>
                <div className={`p-2 rounded-xl ${style.iconBg} backdrop-blur-md border border-white/5`}>
                    <Icon className={`h-4 w-4 ${style.iconColor}`} />
                </div>
            </div>
            
            <div className="flex items-baseline gap-1">
                {prefix && <span className={`text-xl font-bold font-mono ${style.textGrad}`}>{prefix}</span>}
                <h3 className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${style.textGrad}`}>
                    {decimals > 0 ? animatedValue.toFixed(decimals) : animatedValue}
                </h3>
                {suffix && <span className={`text-xl font-bold font-mono ${style.textGrad}`}>{suffix}</span>}
            </div>
            
            {subtext && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500 font-mono">
                    {trend === "up" && <ArrowUpRight className="h-3 w-3 text-neon-green" />}
                    {trend === "down" && <ArrowDownRight className="h-3 w-3 text-neon-red" />}
                    <span>{subtext}</span>
                </div>
            )}
            
            {/* Decorative background glow */}
            <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full ${style.iconBg} blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500`} />
        </div>
    );
}

// ─── Main Dashboard ─────────────────────────────────────────────────
export default function DashboardPage() {
    const [trades, setTrades] = useState<TradeEntry[]>([]);
    const [loaded, setLoaded] = useState(false);

    // Load trades from API
    useEffect(() => {
        async function fetchTrades() {
            try {
                const response = await fetch("/api/trades");
                if (!response.ok) throw new Error("Failed to fetch trades");
                const journalEntries: TradeEntry[] = await response.json();

                // Normalize database entries
                const normalized = journalEntries.map((t) => ({
                    ...t,
                    pair: t.pair || "—",
                    tradeType: t.tradeType || "—",
                    outcome: t.outcome || "—",
                    rrRatio: t.rrRatio || 0,
                    profitLoss: t.profitLoss || "0",
                    followedRules: t.followedRules ?? null,
                    emotion: t.emotion || "—",
                    mistakes: t.mistakes || "",
                    poiTapped: t.poiTapped ?? null,
                    chochConfirmed: t.chochConfirmed ?? null,
                    date: t.date || "—",
                }));

                normalized.sort((a, b) => (a.date > b.date ? 1 : -1));
                setTrades(normalized);
                setLoaded(true);
            } catch (error) {
                console.error("Fetch error:", error);
                setLoaded(true);
            }
        }
        fetchTrades();
    }, []);

    // ─── Computed Metrics ─────────────────────────────────────────────
    const metrics = useMemo(() => {
        const total = trades.length;
        const wins = trades.filter((t) => t.outcome === "Win").length;
        const losses = trades.filter((t) => t.outcome === "Loss").length;
        const be = trades.filter((t) => t.outcome === "BE").length;
        
        const winRate = total > 0 ? (wins / total) * 100 : 0;
        
        let grossProfit = 0;
        let grossLoss = 0;
        let totalPnl = 0;
        let bestTrade = 0;
        let worstTrade = 0;
        let currentMonthPnl = 0;
        
        let maxWinStreak = 0;
        let maxLossStreak = 0;
        let tempWinStreak = 0;
        let tempLossStreak = 0;
        
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        trades.forEach(t => {
            const amount = parseFloat(t.profitLoss) || 0;
            
            if (t.outcome === "Win") {
                grossProfit += amount;
                totalPnl += amount;
                if (amount > bestTrade) bestTrade = amount;
                
                tempWinStreak++;
                tempLossStreak = 0;
                if (tempWinStreak > maxWinStreak) maxWinStreak = tempWinStreak;
            } else if (t.outcome === "Loss") {
                grossLoss += amount;
                totalPnl -= amount;
                if (amount > worstTrade) worstTrade = amount;
                
                tempLossStreak++;
                tempWinStreak = 0;
                if (tempLossStreak > maxLossStreak) maxLossStreak = tempLossStreak;
            } else if (t.outcome === "BE") {
                tempWinStreak = 0;
                tempLossStreak = 0;
            }
            
            if (t.date && t.date !== "—") {
                const tradeDate = new Date(t.date);
                if (tradeDate.getMonth() === currentMonth && tradeDate.getFullYear() === currentYear) {
                    if (t.outcome === "Win") currentMonthPnl += amount;
                    else if (t.outcome === "Loss") currentMonthPnl -= amount;
                }
            }
        });

        const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 99.99 : 0);
        
        const avgRR = total > 0 ? trades.reduce((s, t) => s + (t.rrRatio || 0), 0) / total : 0;

        const rulesFollowed = trades.filter((t) => t.followedRules === true).length;
        const rulesBroken = trades.filter((t) => t.followedRules === false).length;
        const rulesAnswered = trades.filter((t) => t.followedRules !== null).length;
        const ruleAdherence = rulesAnswered > 0 ? (rulesFollowed / rulesAnswered) * 100 : 0;
        const ruleBreakPct = rulesAnswered > 0 ? (rulesBroken / rulesAnswered) * 100 : 0;

        // Win rates split by rule adherence
        const followedTrades = trades.filter((t) => t.followedRules === true);
        const brokenTrades = trades.filter((t) => t.followedRules === false);
        const followedWins = followedTrades.filter((t) => t.outcome === "Win").length;
        const brokenWins = brokenTrades.filter((t) => t.outcome === "Win").length;
        const followedWinRate = followedTrades.length > 0 ? (followedWins / followedTrades.length) * 100 : 0;
        const brokenWinRate = brokenTrades.length > 0 ? (brokenWins / brokenTrades.length) * 100 : 0;

        const fullConf = trades.filter(
            (t) => t.poiTapped === true && t.chochConfirmed === true
        ).length;
        const partialConf = trades.filter(
            (t) =>
                (t.poiTapped !== null || t.chochConfirmed !== null) &&
                !(t.poiTapped === true && t.chochConfirmed === true)
        ).length;

        const currentWinStreak = tempWinStreak;
        const currentLossStreak = tempLossStreak;

        return {
            total, wins, losses, be, winRate, avgRR, totalPnl,
            profitFactor, bestTrade, worstTrade, currentMonthPnl,
            currentWinStreak, currentLossStreak, maxWinStreak, maxLossStreak,
            ruleAdherence, ruleBreakPct, rulesFollowed, rulesBroken,
            followedWinRate, brokenWinRate, fullConf, partialConf,
        };
    }, [trades]);

    // ─── Equity Curve Data ────────────────────────────────────────────
    const equityData = useMemo(() => {
        let cumulative = 0;
        return trades.map((t) => {
            const amount = parseFloat(t.profitLoss) || 0;
            if (t.outcome === "Loss") cumulative -= amount;
            else if (t.outcome === "Win") cumulative += amount;
            
            return {
                date: t.date !== "—"
                    ? new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : "—",
                equity: parseFloat(cumulative.toFixed(2)),
            };
        });
    }, [trades]);

    // ─── Win / Loss / BE Data ─────────────────────────────────────────
    const winLossData = useMemo(() => [
        { name: "Win", value: metrics.wins, color: "#00ff88" },
        { name: "Loss", value: metrics.losses, color: "#ff3b5c" },
        { name: "BE", value: metrics.be, color: "#fbbf24" },
    ], [metrics]);

    // ─── Trade Type Performance ───────────────────────────────────────
    const tradeTypePerf = useMemo(() => {
        const types: Record<string, { wins: number; total: number; pnl: number }> = {};
        trades.forEach((t) => {
            if (t.tradeType === "—") return;
            if (!types[t.tradeType]) types[t.tradeType] = { wins: 0, total: 0, pnl: 0 };
            types[t.tradeType].total++;
            const amount = parseFloat(t.profitLoss) || 0;
            if (t.outcome === "Loss") types[t.tradeType].pnl -= amount;
            else if (t.outcome === "Win") types[t.tradeType].pnl += amount;
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
            const amount = parseFloat(t.profitLoss) || 0;
            if (t.outcome === "Loss") pairs[t.pair].pnl -= amount;
            else if (t.outcome === "Win") pairs[t.pair].pnl += amount;
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
            const phrases = t.mistakes.toLowerCase().split(/[,.;\n]+/).map((s) => s.trim()).filter((s) => s.length > 5);
            phrases.forEach((p) => words[p] = (words[p] || 0) + 1);
        });
        const sorted = Object.entries(words).sort((a, b) => b[1] - a[1]);
        return sorted.length > 0 ? { text: sorted[0][0], count: sorted[0][1] } : null;
    }, [trades]);

    if (!loaded) return null;

    if (trades.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[80vh] animate-slide-up-fade">
                <div className="glass-card rounded-3xl p-12 text-center max-w-md border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-transparent pointer-events-none" />
                    <div className="flex justify-center mb-6 relative">
                        <div className="absolute inset-0 bg-neon-blue/20 blur-3xl rounded-full" />
                        <div className="h-20 w-20 rounded-2xl bg-surface-800/80 border border-white/10 flex items-center justify-center relative z-10 backdrop-blur-xl">
                            <Activity className="h-10 w-10 text-neon-blue" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">No Trading Data Yet</h2>
                    <p className="text-gray-400">
                        Start logging your trades in the Journal to see your performance analytics materialize here.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full overflow-x-hidden">
            {/* ─── Premium Header ──────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 animate-slide-up-fade stagger-1">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neon-cyan/10 border border-neon-cyan/20 backdrop-blur-md relative">
                            <div className="absolute inset-0 bg-neon-cyan/20 blur-xl rounded-full" />
                            <Activity className="h-6 w-6 text-neon-cyan relative z-10" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 tracking-tight">
                                Performance Dashboard
                            </h1>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-400 font-mono">
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-800 border border-white/5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-neon-green live-pulse" />
                                    <span className="text-[10px] uppercase tracking-wider text-neon-green">Live Analysis</span>
                                </div>
                                <span>·</span>
                                <span>{trades.length} Total Executions</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-3">
                    <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-2 text-sm text-gray-300 font-mono">
                        <CalendarDays className="h-4 w-4 text-neon-blue" />
                        <span>All Time Data</span>
                    </div>
                </div>
            </div>

            {/* ─── KPI Cards Grid ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <KPICard
                    title="Total Trades"
                    value={metrics.total}
                    icon={Activity}
                    color="cyan"
                    delayClass="stagger-1"
                    subtext={`${metrics.wins}W / ${metrics.losses}L / ${metrics.be}BE`}
                />
                <KPICard
                    title="Win Rate"
                    value={metrics.winRate}
                    suffix="%"
                    decimals={1}
                    icon={Target}
                    color={metrics.winRate >= 50 ? "green" : "red"}
                    delayClass="stagger-2"
                    trend={metrics.winRate >= 50 ? "up" : "down"}
                    subtext={metrics.winRate >= 50 ? "Profitable strike rate" : "Below 50% threshold"}
                />
                <KPICard
                    title="Profit Factor"
                    value={metrics.profitFactor}
                    decimals={2}
                    icon={TrendingUp}
                    color={metrics.profitFactor >= 1.5 ? "green" : metrics.profitFactor >= 1 ? "yellow" : "red"}
                    delayClass="stagger-3"
                    trend={metrics.profitFactor >= 1 ? "up" : "down"}
                    subtext={metrics.profitFactor >= 1.5 ? "Excellent system edge" : metrics.profitFactor >= 1 ? "Marginal edge" : "Negative expectancy"}
                />
                <KPICard
                    title="Total Net Profit"
                    value={Math.abs(metrics.totalPnl)}
                    prefix={metrics.totalPnl >= 0 ? "+" : "-"}
                    decimals={2}
                    icon={Wallet}
                    color={metrics.totalPnl >= 0 ? "green" : "red"}
                    delayClass="stagger-4"
                    trend={metrics.totalPnl >= 0 ? "up" : "down"}
                    subtext={`Avg $${(metrics.totalPnl / metrics.total || 0).toFixed(2)} / trade`}
                />
                <KPICard
                    title="Average RR"
                    value={metrics.avgRR}
                    suffix="R"
                    decimals={2}
                    icon={Crosshair}
                    color="blue"
                    delayClass="stagger-5"
                    subtext="Mean risk-to-reward ratio"
                />
                <KPICard
                    title="Best Trade"
                    value={metrics.bestTrade}
                    prefix="+"
                    decimals={2}
                    icon={Award}
                    color="green"
                    delayClass="stagger-6"
                    subtext="Max single execution profit"
                />
                <KPICard
                    title="Worst Trade"
                    value={Math.abs(metrics.worstTrade)}
                    prefix="-"
                    decimals={2}
                    icon={TrendingDown}
                    color="red"
                    delayClass="stagger-7"
                    subtext="Max single execution drawdown"
                />
                <KPICard
                    title="Current Month P&L"
                    value={Math.abs(metrics.currentMonthPnl)}
                    prefix={metrics.currentMonthPnl >= 0 ? "+" : "-"}
                    decimals={2}
                    icon={BarChart3}
                    color="purple"
                    delayClass="stagger-8"
                    trend={metrics.currentMonthPnl >= 0 ? "up" : "down"}
                    subtext="Performance this month"
                />
                <KPICard
                    title="Win Streak"
                    value={metrics.currentWinStreak}
                    icon={TrendingUp}
                    color="green"
                    delayClass="stagger-8"
                    subtext={`Max: ${metrics.maxWinStreak} consecutive`}
                />
                <KPICard
                    title="Loss Streak"
                    value={metrics.currentLossStreak}
                    icon={TrendingDown}
                    color="red"
                    delayClass="stagger-8"
                    subtext={`Max: ${metrics.maxLossStreak} consecutive`}
                />
            </div>

            {/* ─── Charts Row: Equity Curve & Distribution ──────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 animate-slide-up-fade stagger-5">
                {/* ─── Equity Curve ────────────────────────────── */}
                <div className="lg:col-span-2 glass-card-chart rounded-2xl p-4 sm:p-6 border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent" />
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-semibold text-white tracking-wider uppercase font-mono flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-neon-blue" />
                            Equity Curve
                        </h2>
                        <Badge variant={metrics.totalPnl >= 0 ? "success" : "danger"} className="font-mono bg-surface-800/80 backdrop-blur-md">
                            {metrics.totalPnl >= 0 ? "PROFITABLE" : "DRAWDOWN"}
                        </Badge>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={equityData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={metrics.totalPnl >= 0 ? "#00ff88" : "#ff3b5c"} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={metrics.totalPnl >= 0 ? "#00ff88" : "#ff3b5c"} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis 
                                    dataKey="date" 
                                    tick={{ fontSize: 10, fill: "#888", fontFamily: "monospace" }} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    dy={10}
                                />
                                <YAxis 
                                    tick={{ fontSize: 10, fill: "#888", fontFamily: "monospace" }} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tickFormatter={(val) => `$${val}`}
                                />
                                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }} />
                                <Area
                                    type="monotone"
                                    dataKey="equity"
                                    stroke={metrics.totalPnl >= 0 ? "#00ff88" : "#ff3b5c"}
                                    strokeWidth={3}
                                    fill="url(#equityGrad)"
                                    name="Cumulative P&L"
                                    activeDot={{ r: 6, fill: metrics.totalPnl >= 0 ? "#00ff88" : "#ff3b5c", stroke: "#111118", strokeWidth: 3 }}
                                    animationDuration={2000}
                                    animationEasing="ease-out"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ─── Win vs Loss Pie ────────────────────────────── */}
                <div className="glass-card-chart rounded-2xl p-4 sm:p-6 border border-white/5 w-full flex flex-col justify-between">
                    <h2 className="text-sm font-semibold text-white tracking-wider uppercase font-mono flex items-center gap-2 mb-4">
                        <Target className="h-4 w-4 text-neon-blue" />
                        Distribution
                    </h2>
                    <div className="h-48 lg:h-[220px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={winLossData.filter((d) => d.value > 0)}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    strokeWidth={0}
                                    animationDuration={1500}
                                    animationEasing="ease-out"
                                >
                                    {winLossData.filter((d) => d.value > 0).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(0px 0px 8px ${entry.color}80)` }} />
                                    ))}
                                </Pie>
                                <Tooltip content={<ChartTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-4">
                        {winLossData.map((d) => (
                            <div key={d.name} className="flex items-center gap-1.5 text-xs font-mono">
                                <div className="h-2 w-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: d.color, color: d.color }} />
                                <span className="text-gray-400">{d.name} <span className="text-white font-bold">{d.value}</span></span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ─── Rule Violation Detector (Glass Style) ──────────────── */}
            {(metrics.rulesFollowed > 0 || metrics.rulesBroken > 0) && (
                <div className="glass-card rounded-2xl p-4 sm:p-6 relative overflow-hidden animate-slide-up-fade stagger-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/5 to-transparent pointer-events-none" />
                    
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-purple/10 border border-neon-purple/20">
                            <ShieldCheck className="h-5 w-5 text-neon-purple" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-white tracking-wider uppercase font-mono">
                                Rule Violation Analysis
                            </h2>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">System discipline tracking</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        {/* Metrics */}
                        <div className="space-y-4">
                            <div className="glass-card-chart rounded-xl p-4 border border-white/5 flex items-center justify-between">
                                <span className="text-xs text-gray-400 font-mono uppercase">Rule Break Rate</span>
                                <span className={`text-xl font-bold font-mono ${metrics.ruleBreakPct > 20 ? "text-neon-red" : metrics.ruleBreakPct > 0 ? "text-neon-yellow" : "text-neon-green"}`}>
                                    {metrics.ruleBreakPct.toFixed(1)}%
                                </span>
                            </div>
                            <div className="glass-card-chart rounded-xl p-4 border border-white/5 flex items-center justify-between">
                                <span className="text-xs text-gray-400 font-mono uppercase">Followed WR</span>
                                <span className="text-xl font-bold font-mono text-neon-green">{metrics.followedWinRate.toFixed(1)}%</span>
                            </div>
                            <div className="glass-card-chart rounded-xl p-4 border border-white/5 flex items-center justify-between">
                                <span className="text-xs text-gray-400 font-mono uppercase">Broken WR</span>
                                <span className="text-xl font-bold font-mono text-neon-red">{metrics.brokenWinRate.toFixed(1)}%</span>
                            </div>
                        </div>

                        {/* Progress Bars */}
                        <div className="md:col-span-2 space-y-6 flex flex-col justify-center">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-mono">
                                    <span className="text-gray-400">Win Rate when Following Rules</span>
                                    <span className="text-neon-green font-bold">{metrics.followedWinRate.toFixed(1)}%</span>
                                </div>
                                <div className="h-4 bg-surface-800/80 rounded-full overflow-hidden border border-white/5">
                                    <div 
                                        className="h-full bg-gradient-to-r from-neon-green/80 to-neon-green rounded-full shadow-[0_0_15px_rgba(0,255,136,0.5)] progress-animate"
                                        style={{ width: `${metrics.followedWinRate}%` }}
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-mono">
                                    <span className="text-gray-400">Win Rate when Breaking Rules</span>
                                    <span className="text-neon-red font-bold">{metrics.brokenWinRate.toFixed(1)}%</span>
                                </div>
                                <div className="h-4 bg-surface-800/80 rounded-full overflow-hidden border border-white/5">
                                    <div 
                                        className="h-full bg-gradient-to-r from-neon-red/80 to-neon-red rounded-full shadow-[0_0_15px_rgba(255,59,92,0.5)] progress-animate"
                                        style={{ width: `${metrics.brokenWinRate}%`, animationDelay: '200ms' }}
                                    />
                                </div>
                            </div>

                            <div className="mt-4 p-4 rounded-xl bg-surface-800/50 border border-white/5 backdrop-blur-md">
                                <p className="text-sm text-gray-300">
                                    {metrics.followedWinRate > metrics.brokenWinRate ? (
                                        <>Following rules yields a <strong className="text-neon-green font-mono">{(metrics.followedWinRate - metrics.brokenWinRate).toFixed(1)}%</strong> higher win rate.</>
                                    ) : metrics.rulesBroken === 0 ? (
                                        <>Perfect discipline logged. Keep trusting the system.</>
                                    ) : (
                                        <>Insufficient data to determine statistical edge of rule adherence.</>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Distribution pie moved to top row ─── */}

            {/* ─── Daily Summary Calendar ──────────────────────────────── */}
            <div className="animate-slide-up-fade stagger-8">
                <DailySummaryCalendar trades={trades} />
            </div>

            {/* ─── Bottom Insights Row ─────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 animate-slide-up-fade" style={{ animationDelay: '480ms' }}>
                {/* Trade Type Performance */}
                <div className="glass-card-chart rounded-2xl p-4 sm:p-6 border border-white/5">
                    <h2 className="text-sm font-semibold text-white tracking-wider uppercase font-mono flex items-center gap-2 mb-4">
                        <Award className="h-4 w-4 text-neon-yellow" />
                        Setup Performance
                    </h2>
                    <div className="space-y-3">
                        {tradeTypePerf.length === 0 ? (
                            <p className="text-xs text-gray-500 font-mono text-center py-4">No setups logged</p>
                        ) : (
                            tradeTypePerf.map((tp) => (
                                <div key={tp.name} className="flex items-center justify-between p-3 rounded-xl bg-surface-800/50 border border-white/5 hover:border-white/10 transition-colors">
                                    <div>
                                        <p className="text-sm font-semibold text-white">{tp.name}</p>
                                        <p className="text-xs text-gray-500 font-mono">{tp.trades} trades · {tp.winRate}% WR</p>
                                    </div>
                                    <span className={`text-sm font-bold font-mono ${tp.pnl >= 0 ? "text-neon-green" : "text-neon-red"}`}>
                                        {tp.pnl >= 0 ? "+" : ""}{tp.pnl}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Pairs Performance */}
                <div className="glass-card-chart rounded-2xl p-4 sm:p-6 border border-white/5">
                    <h2 className="text-sm font-semibold text-white tracking-wider uppercase font-mono flex items-center gap-2 mb-4">
                        <TrendingUp className="h-4 w-4 text-neon-blue" />
                        Asset Performance
                    </h2>
                    <div className="space-y-3">
                        {pairPerf.length === 0 ? (
                            <p className="text-xs text-gray-500 font-mono text-center py-4">No assets logged</p>
                        ) : (
                            pairPerf.map((pp) => (
                                <div key={pp.name} className="flex items-center justify-between p-3 rounded-xl bg-surface-800/50 border border-white/5 hover:border-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-white font-mono">{pp.name}</span>
                                        <Badge variant={pp.winRate >= 50 ? "success" : "danger"} className="scale-90 origin-left">
                                            {pp.winRate}%
                                        </Badge>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-sm font-bold font-mono ${pp.pnl >= 0 ? "text-neon-green" : "text-neon-red"}`}>
                                            {pp.pnl >= 0 ? "+" : ""}{pp.pnl}
                                        </span>
                                        <p className="text-[10px] text-gray-500 font-mono">{pp.trades} trades</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Key Insights */}
                <div className="glass-card-chart rounded-2xl p-4 sm:p-6 border border-white/5">
                    <h2 className="text-sm font-semibold text-white tracking-wider uppercase font-mono flex items-center gap-2 mb-4">
                        <AlertTriangle className="h-4 w-4 text-neon-purple" />
                        System Diagnostics
                    </h2>
                    <div className="space-y-3">
                        {topMistake && (
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-800/50 border border-neon-red/10">
                                <div className="p-2 rounded-lg bg-neon-red/10 text-neon-red mt-0.5"><AlertTriangle className="h-3 w-3" /></div>
                                <div>
                                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Critical Leak</p>
                                    <p className="text-xs font-semibold text-white">&quot;{topMistake.text}&quot;</p>
                                    <p className="text-[10px] text-neon-red font-mono mt-0.5">Recorded {topMistake.count} times</p>
                                </div>
                            </div>
                        )}
                        
                        {tradeTypePerf.length > 0 && (
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-800/50 border border-neon-green/10">
                                <div className="p-2 rounded-lg bg-neon-green/10 text-neon-green mt-0.5"><Award className="h-3 w-3" /></div>
                                <div>
                                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Primary Edge</p>
                                    <p className="text-xs font-semibold text-white">{tradeTypePerf[0].name}</p>
                                    <p className="text-[10px] text-neon-green font-mono mt-0.5">+{tradeTypePerf[0].pnl} Net Profit</p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-800/50 border border-neon-blue/10">
                            <div className="p-2 rounded-lg bg-neon-blue/10 text-neon-blue mt-0.5"><ShieldCheck className="h-3 w-3" /></div>
                            <div>
                                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">System Adherence</p>
                                <p className="text-xs font-semibold text-white">
                                    {metrics.ruleAdherence >= 90 ? "Excellent" : metrics.ruleAdherence >= 70 ? "Satisfactory" : "Critical Warning"}
                                </p>
                                <p className="text-[10px] text-neon-blue font-mono mt-0.5">{metrics.ruleAdherence.toFixed(1)}% Compliance</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
