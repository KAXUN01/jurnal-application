"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Newspaper,
    Clock,
    Filter,
    Zap,
    AlertTriangle,
    Minus,
    Globe,
    ArrowRight,
    Calendar,
    Radio,
    Loader2,
    RefreshCw,
    WifiOff,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────
interface NewsEvent {
    event: string;
    currency: string;
    impact: "High" | "Medium" | "Low";
    date: string;      // raw UTC datetime string from API, e.g. "2026-02-23 08:30:00"
    localTime: string;  // converted to local HH:mm
    localDate: string;  // converted to local YYYY-MM-DD
    actual: string;
    forecast: string;
    previous: string;
    country: string;
}

const CURRENCIES = ["EUR", "GBP", "USD", "JPY", "CAD"];

// ─── Currency color map ────────────────────────────────────────────
const currencyColor: Record<string, { text: string; bg: string; border: string }> = {
    USD: { text: "text-neon-green", bg: "bg-neon-green/10", border: "border-neon-green/20" },
    EUR: { text: "text-neon-blue", bg: "bg-neon-blue/10", border: "border-neon-blue/20" },
    GBP: { text: "text-neon-purple", bg: "bg-neon-purple/10", border: "border-neon-purple/20" },
    JPY: { text: "text-neon-red", bg: "bg-neon-red/10", border: "border-neon-red/20" },
    CAD: { text: "text-neon-yellow", bg: "bg-neon-yellow/10", border: "border-neon-yellow/20" },
};

const impactConfig = {
    High: {
        color: "text-neon-red",
        bg: "bg-neon-red/10",
        border: "border-neon-red/20",
        glow: "shadow-[0_0_20px_rgba(255,59,92,0.08)]",
        cardBorder: "border-neon-red/15",
        icon: Zap,
        label: "HIGH IMPACT",
    },
    Medium: {
        color: "text-neon-yellow",
        bg: "bg-neon-yellow/10",
        border: "border-neon-yellow/20",
        glow: "shadow-[0_0_15px_rgba(251,191,36,0.06)]",
        cardBorder: "border-neon-yellow/15",
        icon: AlertTriangle,
        label: "MEDIUM",
    },
    Low: {
        color: "text-gray-500",
        bg: "bg-surface-700/30",
        border: "border-surface-500/20",
        glow: "",
        cardBorder: "border-surface-500/15",
        icon: Minus,
        label: "LOW",
    },
};

// ─── Data Value Component ────────────────────────────────────────────
function DataCell({
    label,
    value,
    highlight,
}: {
    label: string;
    value: string;
    highlight?: "green" | "red" | null;
}) {
    return (
        <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-gray-600 font-mono mb-1">
                {label}
            </p>
            <p
                className={`text-sm font-bold font-mono ${value === "—"
                    ? "text-gray-600"
                    : highlight === "green"
                        ? "text-neon-green"
                        : highlight === "red"
                            ? "text-neon-red"
                            : "text-gray-300"
                    }`}
            >
                {value}
            </p>
        </div>
    );
}

// ─── Format value ────────────────────────────────────────────────────
function fmtValue(v: number | string | null | undefined): string {
    if (v === null || v === undefined || v === "") return "—";
    return String(v);
}

// ─── Convert UTC datetime to local ──────────────────────────────────
function toLocal(utcDateStr: string): { localTime: string; localDate: string } {
    try {
        // API returns "2026-02-23 08:30:00" in UTC
        const d = new Date(utcDateStr.replace(" ", "T") + "Z");
        if (isNaN(d.getTime())) return { localTime: "—", localDate: "—" };
        const localTime = d.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
        const localDate = d.toLocaleDateString("en-CA"); // YYYY-MM-DD
        return { localTime, localDate };
    } catch {
        return { localTime: "—", localDate: "—" };
    }
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function NewsPage() {
    const [events, setEvents] = useState<NewsEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterCurrency, setFilterCurrency] = useState<string>("");
    const [highImpactOnly, setHighImpactOnly] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
    const [dataSource, setDataSource] = useState<"live" | "sample" | null>(null);

    // ─── Fetch data ─────────────────────────────────────────────────
    const fetchEvents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/economic-calendar");
            if (!res.ok) {
                throw new Error(`Server returned ${res.status}`);
            }
            const data = await res.json();
            if (data.error) {
                throw new Error(data.error);
            }

            // Map API response → NewsEvent with local times
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mapped: NewsEvent[] = (data.events || []).map((e: any) => {
                const { localTime, localDate } = toLocal(e.date);
                return {
                    event: e.event,
                    currency: e.currency,
                    impact: e.impact === "High" ? "High" : e.impact === "Medium" ? "Medium" : "Low",
                    date: e.date,
                    localTime,
                    localDate,
                    actual: fmtValue(e.actual),
                    forecast: fmtValue(e.forecast),
                    previous: fmtValue(e.previous),
                    country: e.country,
                };
            });

            // Sort by date/time — nearest upcoming first
            const now = new Date();
            mapped.sort((a, b) => {
                const da = new Date(a.date.replace(" ", "T") + "Z");
                const db = new Date(b.date.replace(" ", "T") + "Z");
                // Future events first, then past events
                const aFuture = da >= now;
                const bFuture = db >= now;
                if (aFuture && !bFuture) return -1;
                if (!aFuture && bFuture) return 1;
                // Both future: nearest first; both past: most recent first
                return aFuture
                    ? da.getTime() - db.getTime()
                    : db.getTime() - da.getTime();
            });

            setEvents(mapped);
            setDataSource(data.source || "sample");
            setLastRefresh(new Date());
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch data");
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch on mount
    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // ─── Filtered events ────────────────────────────────────────────
    const filtered = useMemo(() => {
        let list = events;
        if (filterCurrency) {
            list = list.filter((e) => e.currency === filterCurrency);
        }
        if (highImpactOnly) {
            list = list.filter((e) => e.impact === "High");
        }
        return list;
    }, [events, filterCurrency, highImpactOnly]);

    // Group by local date
    const grouped = useMemo(() => {
        const groups: Record<string, NewsEvent[]> = {};
        filtered.forEach((e) => {
            const key = e.localDate || "Unknown";
            if (!groups[key]) groups[key] = [];
            groups[key].push(e);
        });
        return groups;
    }, [filtered]);

    const sortedDates = Object.keys(grouped).sort();

    // Counts
    const highCount = filtered.filter((e) => e.impact === "High").length;
    const mediumCount = filtered.filter((e) => e.impact === "Medium").length;
    const lowCount = filtered.filter((e) => e.impact === "Low").length;

    // Format date header
    const formatDateHeader = (dateStr: string) => {
        if (dateStr === "Unknown" || dateStr === "—") return "Unknown Date";
        const d = new Date(dateStr + "T00:00:00");
        const today = new Date();
        const isToday = d.toDateString() === today.toDateString();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const isTomorrow = d.toDateString() === tomorrow.toDateString();
        const formatted = d.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
        });
        if (isToday) return `Today — ${formatted}`;
        if (isTomorrow) return `Tomorrow — ${formatted}`;
        return formatted;
    };

    // Determine actual beat or miss
    const getActualHighlight = (actual: string, forecast: string): "green" | "red" | null => {
        if (actual === "—" || forecast === "—") return null;
        const a = parseFloat(actual.replace(/[%K]/g, ""));
        const f = parseFloat(forecast.replace(/[%K]/g, ""));
        if (isNaN(a) || isNaN(f)) return null;
        if (a > f) return "green";
        if (a < f) return "red";
        return null;
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl pb-8">
            {/* ─── Header ──────────────────────────────────────────────── */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neon-red/10 border border-neon-red/20">
                            <Newspaper className="h-5 w-5 text-neon-red" />
                        </div>
                        Market News
                    </h1>
                    <p className="text-sm text-gray-500 mt-2 ml-12">
                        High-impact economic events — Stay ahead of the market
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Last refresh */}
                    {lastRefresh && (
                        <span className="text-[10px] text-gray-600 font-mono">
                            Updated {lastRefresh.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                    )}
                    {/* Refresh button */}
                    <button
                        onClick={fetchEvents}
                        disabled={loading}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-500/30 text-gray-500 transition-all hover:text-white hover:border-surface-500/60 hover:bg-surface-700/30 disabled:opacity-40"
                        title="Refresh"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                    </button>
                    {/* Source indicator */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${dataSource === "live"
                            ? "bg-neon-green/5 border-neon-green/15"
                            : "bg-neon-red/5 border-neon-red/15"
                        }`}>
                        <Radio className={`h-3.5 w-3.5 animate-pulse ${dataSource === "live" ? "text-neon-green" : "text-neon-red"
                            }`} />
                        <span className={`text-xs font-semibold uppercase tracking-wider ${dataSource === "live" ? "text-neon-green" : "text-neon-red"
                            }`}>
                            {dataSource === "live" ? "Live Feed" : "Economic Calendar"}
                        </span>
                    </div>
                </div>
            </div>

            {/* ─── Loading State ───────────────────────────────────────── */}
            {loading && (
                <Card className="border-surface-500/20">
                    <CardContent className="p-16 flex flex-col items-center justify-center gap-4">
                        <div className="relative">
                            <div className="h-12 w-12 rounded-full border-2 border-surface-600/50" />
                            <Loader2 className="h-12 w-12 text-neon-green animate-spin absolute inset-0" style={{ clipPath: "inset(0 50% 50% 0)" }} />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-400">
                                Fetching economic calendar…
                            </p>
                            <p className="text-[10px] text-gray-600 font-mono mt-1">
                                Loading today&apos;s market events
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ─── Error State ─────────────────────────────────────────── */}
            {!loading && error && (
                <Card className="border-neon-red/20">
                    <CardContent className="p-12 flex flex-col items-center justify-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neon-red/10 border border-neon-red/20">
                            <WifiOff className="h-7 w-7 text-neon-red" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold text-white">
                                Unable to Load Events
                            </p>
                            <p className="text-xs text-gray-500 mt-1 max-w-xs">
                                {error}
                            </p>
                        </div>
                        <button
                            onClick={fetchEvents}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-neon-red/10 text-neon-red border border-neon-red/20 hover:bg-neon-red/20 transition-all"
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Try Again
                        </button>
                    </CardContent>
                </Card>
            )}

            {/* ─── Content (only when loaded & no error) ──────────────── */}
            {!loading && !error && (
                <>
                    {/* Impact Summary Bar */}
                    <Card className="border-surface-500/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-5">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2.5 w-2.5 rounded-full bg-neon-red animate-pulse" />
                                        <span className="text-xs font-mono text-gray-400">
                                            HIGH <span className="text-white font-bold">{highCount}</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2.5 w-2.5 rounded-full bg-neon-yellow" />
                                        <span className="text-xs font-mono text-gray-400">
                                            MEDIUM <span className="text-white font-bold">{mediumCount}</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2.5 w-2.5 rounded-full bg-gray-600" />
                                        <span className="text-xs font-mono text-gray-400">
                                            LOW <span className="text-white font-bold">{lowCount}</span>
                                        </span>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-600 font-mono">
                                    {filtered.length} events today
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Filters */}
                    <Card className="border-surface-500/20">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Filter className="h-3.5 w-3.5" />
                                    <span className="uppercase tracking-wider font-mono">Filters</span>
                                </div>

                                {/* Currency filter */}
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => setFilterCurrency("")}
                                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${filterCurrency === ""
                                            ? "bg-surface-600/50 text-white border-surface-500/50"
                                            : "text-gray-500 border-transparent hover:text-gray-300"
                                            }`}
                                    >
                                        All
                                    </button>
                                    {CURRENCIES.map((c) => {
                                        const colors = currencyColor[c] || currencyColor.USD;
                                        return (
                                            <button
                                                key={c}
                                                onClick={() =>
                                                    setFilterCurrency(filterCurrency === c ? "" : c)
                                                }
                                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all duration-200 border ${filterCurrency === c
                                                    ? `${colors.bg} ${colors.text} ${colors.border}`
                                                    : "text-gray-500 border-transparent hover:text-gray-300"
                                                    }`}
                                            >
                                                {c}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="h-5 w-px bg-surface-600/50" />

                                {/* High impact toggle */}
                                <button
                                    onClick={() => setHighImpactOnly(!highImpactOnly)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${highImpactOnly
                                        ? "bg-neon-red/10 text-neon-red border-neon-red/20 shadow-[0_0_12px_rgba(255,59,92,0.1)]"
                                        : "text-gray-500 border-surface-500/30 hover:text-gray-300 hover:border-surface-500/60"
                                        }`}
                                >
                                    <Zap className="h-3 w-3" />
                                    High Impact Only
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ─── Empty State ─────────────────────────────────── */}
                    {sortedDates.length === 0 && (
                        <Card className="border-surface-500/20">
                            <CardContent className="p-12 text-center">
                                <Globe className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                                <p className="text-sm font-medium text-gray-400">
                                    {events.length === 0
                                        ? "No economic events scheduled for today"
                                        : "No events match your filters"
                                    }
                                </p>
                                <p className="text-[10px] text-gray-600 mt-1">
                                    {events.length === 0
                                        ? "Check back during active trading hours"
                                        : "Try broadening your filter criteria"
                                    }
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* ─── News Events ────────────────────────────────── */}
                    {sortedDates.map((date) => (
                        <div key={date} className="space-y-3">
                            {/* Date header */}
                            <div className="flex items-center gap-3 py-1">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                                    {formatDateHeader(date)}
                                </h2>
                                <div className="flex-1 h-px bg-surface-600/30" />
                                <span className="text-[10px] text-gray-600 font-mono">
                                    {grouped[date].length} events
                                </span>
                            </div>

                            {/* Event cards */}
                            <div className="space-y-2">
                                {grouped[date].map((event, idx) => {
                                    const impact = impactConfig[event.impact];
                                    const ImpactIcon = impact.icon;
                                    const ccol = currencyColor[event.currency] || {
                                        text: "text-gray-400",
                                        bg: "bg-surface-700/30",
                                        border: "border-surface-500/20",
                                    };
                                    const actualHL = getActualHighlight(event.actual, event.forecast);

                                    return (
                                        <Card
                                            key={`${event.event}-${event.date}-${idx}`}
                                            className={`${impact.cardBorder} ${impact.glow} transition-all duration-300 hover:scale-[1.005]`}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between gap-4 flex-wrap">
                                                    {/* Left: time + event info */}
                                                    <div className="flex items-center gap-4 min-w-0 flex-1">
                                                        {/* Time */}
                                                        <div className="flex items-center gap-1.5 shrink-0 w-16">
                                                            <Clock className="h-3 w-3 text-gray-600" />
                                                            <span className="text-xs font-mono text-gray-400">
                                                                {event.localTime}
                                                            </span>
                                                        </div>

                                                        {/* Impact badge */}
                                                        <div className="shrink-0">
                                                            <Badge
                                                                variant={
                                                                    event.impact === "High"
                                                                        ? "danger"
                                                                        : event.impact === "Medium"
                                                                            ? "warning"
                                                                            : "neutral"
                                                                }
                                                            >
                                                                <ImpactIcon className="h-3 w-3 mr-1" />
                                                                {impact.label}
                                                            </Badge>
                                                        </div>

                                                        {/* Currency badge */}
                                                        <span
                                                            className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold font-mono border ${ccol.bg} ${ccol.text} ${ccol.border}`}
                                                        >
                                                            {event.currency}
                                                        </span>

                                                        {/* Event name */}
                                                        <span className="text-sm text-white font-medium truncate">
                                                            {event.event}
                                                        </span>
                                                    </div>

                                                    {/* Right: data values */}
                                                    <div className="flex items-center gap-6 shrink-0">
                                                        <DataCell
                                                            label="Actual"
                                                            value={event.actual}
                                                            highlight={actualHL}
                                                        />
                                                        <ArrowRight className="h-3 w-3 text-gray-700" />
                                                        <DataCell
                                                            label="Forecast"
                                                            value={event.forecast}
                                                        />
                                                        <div className="h-6 w-px bg-surface-600/30" />
                                                        <DataCell
                                                            label="Previous"
                                                            value={event.previous}
                                                        />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Footer */}
                    <div className="text-center pt-4 space-y-1">
                        {dataSource === "sample" && (
                            <p className="text-[10px] text-neon-yellow font-mono uppercase tracking-widest">
                                Showing sample data — Upgrade your FMP API plan for live events
                            </p>
                        )}
                        <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">
                            {dataSource === "live"
                                ? "Live data from Financial Modeling Prep — Times shown in your local timezone"
                                : "Times shown in your local timezone"
                            }
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
