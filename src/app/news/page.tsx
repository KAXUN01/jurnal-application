"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────
interface NewsEvent {
    id: string;
    time: string;
    currency: string;
    event: string;
    impact: "High" | "Medium" | "Low";
    actual: string;
    forecast: string;
    previous: string;
    date: string;
}

// ─── Sample News Data ───────────────────────────────────────────────
const sampleNews: NewsEvent[] = [
    {
        id: "1", date: "2026-02-23", time: "08:30",
        currency: "USD", event: "Non-Farm Payrolls",
        impact: "High", actual: "275K", forecast: "250K", previous: "229K",
    },
    {
        id: "2", date: "2026-02-23", time: "08:30",
        currency: "USD", event: "Unemployment Rate",
        impact: "High", actual: "3.7%", forecast: "3.8%", previous: "3.7%",
    },
    {
        id: "3", date: "2026-02-23", time: "10:00",
        currency: "USD", event: "ISM Manufacturing PMI",
        impact: "High", actual: "49.1", forecast: "47.5", previous: "47.4",
    },
    {
        id: "4", date: "2026-02-23", time: "13:00",
        currency: "GBP", event: "BOE Interest Rate Decision",
        impact: "High", actual: "5.25%", forecast: "5.25%", previous: "5.25%",
    },
    {
        id: "5", date: "2026-02-23", time: "07:00",
        currency: "EUR", event: "ECB Monetary Policy Statement",
        impact: "High", actual: "—", forecast: "—", previous: "—",
    },
    {
        id: "6", date: "2026-02-23", time: "08:15",
        currency: "EUR", event: "French Flash Manufacturing PMI",
        impact: "Medium", actual: "42.5", forecast: "43.1", previous: "42.8",
    },
    {
        id: "7", date: "2026-02-23", time: "09:30",
        currency: "GBP", event: "Flash Manufacturing PMI",
        impact: "Medium", actual: "47.3", forecast: "46.5", previous: "46.2",
    },
    {
        id: "8", date: "2026-02-24", time: "00:30",
        currency: "JPY", event: "BOJ Monetary Policy Meeting Minutes",
        impact: "Medium", actual: "—", forecast: "—", previous: "—",
    },
    {
        id: "9", date: "2026-02-24", time: "08:30",
        currency: "CAD", event: "Core Retail Sales m/m",
        impact: "High", actual: "0.6%", forecast: "0.4%", previous: "-0.3%",
    },
    {
        id: "10", date: "2026-02-24", time: "08:30",
        currency: "CAD", event: "Retail Sales m/m",
        impact: "Medium", actual: "0.9%", forecast: "0.8%", previous: "-0.2%",
    },
    {
        id: "11", date: "2026-02-24", time: "05:00",
        currency: "EUR", event: "German Ifo Business Climate",
        impact: "High", actual: "86.0", forecast: "85.5", previous: "85.2",
    },
    {
        id: "12", date: "2026-02-24", time: "10:00",
        currency: "USD", event: "CB Consumer Confidence",
        impact: "High", actual: "110.7", forecast: "114.0", previous: "114.8",
    },
    {
        id: "13", date: "2026-02-24", time: "15:00",
        currency: "USD", event: "FOMC Meeting Minutes",
        impact: "High", actual: "—", forecast: "—", previous: "—",
    },
    {
        id: "14", date: "2026-02-25", time: "04:00",
        currency: "GBP", event: "CPI y/y",
        impact: "High", actual: "4.0%", forecast: "4.1%", previous: "4.0%",
    },
    {
        id: "15", date: "2026-02-25", time: "08:30",
        currency: "USD", event: "Core Durable Goods Orders m/m",
        impact: "Medium", actual: "0.1%", forecast: "0.2%", previous: "-0.3%",
    },
    {
        id: "16", date: "2026-02-25", time: "08:30",
        currency: "USD", event: "Advance GDP q/q",
        impact: "High", actual: "3.3%", forecast: "2.0%", previous: "4.9%",
    },
    {
        id: "17", date: "2026-02-25", time: "05:00",
        currency: "JPY", event: "Core CPI y/y",
        impact: "High", actual: "2.3%", forecast: "2.3%", previous: "2.5%",
    },
    {
        id: "18", date: "2026-02-25", time: "09:45",
        currency: "EUR", event: "ECB Press Conference",
        impact: "High", actual: "—", forecast: "—", previous: "—",
    },
    {
        id: "19", date: "2026-02-26", time: "08:30",
        currency: "USD", event: "Core PCE Price Index m/m",
        impact: "High", actual: "0.2%", forecast: "0.2%", previous: "0.1%",
    },
    {
        id: "20", date: "2026-02-26", time: "07:00",
        currency: "GBP", event: "Revised GDP q/q",
        impact: "Medium", actual: "-0.3%", forecast: "-0.1%", previous: "-0.1%",
    },
    {
        id: "21", date: "2026-02-26", time: "13:30",
        currency: "CAD", event: "GDP m/m",
        impact: "High", actual: "0.2%", forecast: "0.1%", previous: "-0.1%",
    },
    {
        id: "22", date: "2026-02-23", time: "06:00",
        currency: "EUR", event: "German CPI m/m",
        impact: "Low", actual: "0.2%", forecast: "0.3%", previous: "0.1%",
    },
    {
        id: "23", date: "2026-02-24", time: "11:00",
        currency: "USD", event: "Richmond Manufacturing Index",
        impact: "Low", actual: "-15", forecast: "-10", previous: "-11",
    },
    {
        id: "24", date: "2026-02-25", time: "10:00",
        currency: "USD", event: "Pending Home Sales m/m",
        impact: "Low", actual: "8.3%", forecast: "1.5%", previous: "-0.3%",
    },
];

const CURRENCIES = ["EUR", "GBP", "USD", "JPY", "CAD"];

// ─── Currency flag map ─────────────────────────────────────────────
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

// ─── Main Page ───────────────────────────────────────────────────────
export default function NewsPage() {
    const [filterCurrency, setFilterCurrency] = useState<string>("");
    const [highImpactOnly, setHighImpactOnly] = useState(false);

    // Filter & group
    const filtered = useMemo(() => {
        let events = sampleNews;
        if (filterCurrency) {
            events = events.filter((e) => e.currency === filterCurrency);
        }
        if (highImpactOnly) {
            events = events.filter((e) => e.impact === "High");
        }
        return events;
    }, [filterCurrency, highImpactOnly]);

    // Group by date
    const grouped = useMemo(() => {
        const groups: Record<string, NewsEvent[]> = {};
        filtered.forEach((e) => {
            if (!groups[e.date]) groups[e.date] = [];
            groups[e.date].push(e);
        });
        // Sort events within each group by time
        Object.values(groups).forEach((g) =>
            g.sort((a, b) => a.time.localeCompare(b.time))
        );
        return groups;
    }, [filtered]);

    const sortedDates = Object.keys(grouped).sort();

    // Counts
    const highCount = filtered.filter((e) => e.impact === "High").length;
    const mediumCount = filtered.filter((e) => e.impact === "Medium").length;
    const lowCount = filtered.filter((e) => e.impact === "Low").length;

    // Format date header
    const formatDateHeader = (dateStr: string) => {
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

    // Determine if actual beat or missed forecast
    const getActualHighlight = (
        actual: string,
        forecast: string
    ): "green" | "red" | null => {
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

                {/* Live indicator */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-red/5 border border-neon-red/15">
                    <Radio className="h-3.5 w-3.5 text-neon-red animate-pulse" />
                    <span className="text-xs font-semibold text-neon-red uppercase tracking-wider">
                        Economic Calendar
                    </span>
                </div>
            </div>

            {/* ─── Impact Summary Bar ──────────────────────────────────── */}
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
                            {filtered.length} events total
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* ─── Filters ────────────────────────────────────────────── */}
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

            {/* ─── News Events ────────────────────────────────────────── */}
            {sortedDates.length === 0 ? (
                <Card className="border-surface-500/20">
                    <CardContent className="p-12 text-center">
                        <Globe className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">
                            No events match your filters
                        </p>
                    </CardContent>
                </Card>
            ) : (
                sortedDates.map((date) => (
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
                            {grouped[date].map((event) => {
                                const impact = impactConfig[event.impact];
                                const ImpactIcon = impact.icon;
                                const ccol =
                                    currencyColor[event.currency] || currencyColor.USD;
                                const actualHL = getActualHighlight(
                                    event.actual,
                                    event.forecast
                                );

                                return (
                                    <Card
                                        key={event.id}
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
                                                            {event.time}
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
                ))
            )}

            {/* ─── Footer Note ────────────────────────────────────────── */}
            <div className="text-center pt-4">
                <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">
                    Data updated for demonstration purposes — Connect a live feed for real-time events
                </p>
            </div>
        </div>
    );
}
