"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ShieldCheck,
    ShieldX,
    RotateCcw,
    Crosshair,
    Clock,
    TrendingUp,
    Target,
    Zap,
    CheckCircle2,
    XCircle,
    ArrowRight,
    Activity,
    BarChart3,
    AlertTriangle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────
interface CheckItem {
    id: string;
    label: string;
    checked: boolean | null; // null = unanswered, true = yes, false = no
}

interface Section {
    id: string;
    title: string;
    icon: React.ElementType;
    color: string;
    items: CheckItem[];
}

// ─── SOP Sections Data ──────────────────────────────────────────────
const createSections = (): Section[] => [
    {
        id: "trading-conditions",
        title: "Trading Conditions",
        icon: Clock,
        color: "blue",
        items: [
            { id: "tc-1", label: "Is today a valid trading day (no bank holiday)?", checked: null },
            { id: "tc-2", label: "Is current time within trading session (5:30 PM – 10:30 PM)?", checked: null },
            { id: "tc-3", label: "Is there NO high-impact news near entry?", checked: null },
        ],
    },
    {
        id: "market-context",
        title: "Market Context",
        icon: BarChart3,
        color: "cyan",
        items: [
            { id: "mc-1", label: "1H market structure (mBOS) identified", checked: null },
            { id: "mc-2", label: "Valid trading range identified (LSL / MIT / IDM / mChoCH)", checked: null },
        ],
    },
    {
        id: "trade-type",
        title: "Trade Type Identification",
        icon: TrendingUp,
        color: "purple",
        items: [
            { id: "tt-1", label: "Trade type selected (15min PT / CT / ECT)", checked: null },
            { id: "tt-2", label: "Is trade aligned with 15min BOS?", checked: null },
        ],
    },
    {
        id: "poi-validation",
        title: "POI Validation",
        icon: Target,
        color: "yellow",
        items: [
            { id: "pv-1", label: "Valid 15min POI identified", checked: null },
            { id: "pv-2", label: "POI has imbalance OR refined to valid LTF POI", checked: null },
            { id: "pv-3", label: "POI has broken structure", checked: null },
        ],
    },
    {
        id: "poi-tap",
        title: "POI Tap Confirmation",
        icon: Crosshair,
        color: "green",
        items: [
            { id: "pt-1", label: "POI tapped properly", checked: null },
            { id: "pt-2", label: "Not just internal liquidity tap", checked: null },
        ],
    },
    {
        id: "entry-confirmation",
        title: "Entry Confirmation",
        icon: Zap,
        color: "green",
        items: [
            { id: "ec-1", label: "3min ChoCH confirmed", checked: null },
            { id: "ec-2", label: "Entry model valid", checked: null },
            { id: "ec-3", label: "Clean structure (no messy confirmation)", checked: null },
        ],
    },
    {
        id: "risk-validation",
        title: "Risk Validation",
        icon: AlertTriangle,
        color: "red",
        items: [
            { id: "rv-1", label: "RR ≥ 5R", checked: null },
            { id: "rv-2", label: "Risk per trade = 1%", checked: null },
        ],
    },
];

// ─── Color map for section theming ──────────────────────────────────
const sectionColorMap: Record<string, { border: string; iconBg: string; iconText: string; badge: string; glow: string }> = {
    blue: {
        border: "border-neon-blue/15",
        iconBg: "bg-neon-blue/10",
        iconText: "text-neon-blue",
        badge: "bg-neon-blue/10 text-neon-blue border-neon-blue/20",
        glow: "hover:shadow-glow-blue",
    },
    cyan: {
        border: "border-neon-cyan/15",
        iconBg: "bg-neon-cyan/10",
        iconText: "text-neon-cyan",
        badge: "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20",
        glow: "hover:shadow-glow-blue",
    },
    purple: {
        border: "border-neon-purple/15",
        iconBg: "bg-neon-purple/10",
        iconText: "text-neon-purple",
        badge: "bg-neon-purple/10 text-neon-purple border-neon-purple/20",
        glow: "hover:shadow-glow-purple",
    },
    yellow: {
        border: "border-neon-yellow/15",
        iconBg: "bg-neon-yellow/10",
        iconText: "text-neon-yellow",
        badge: "bg-neon-yellow/10 text-neon-yellow border-neon-yellow/20",
        glow: "hover:shadow-glow-green",
    },
    green: {
        border: "border-neon-green/15",
        iconBg: "bg-neon-green/10",
        iconText: "text-neon-green",
        badge: "bg-neon-green/10 text-neon-green border-neon-green/20",
        glow: "hover:shadow-glow-green",
    },
    red: {
        border: "border-neon-red/15",
        iconBg: "bg-neon-red/10",
        iconText: "text-neon-red",
        badge: "bg-neon-red/10 text-neon-red border-neon-red/20",
        glow: "hover:shadow-glow-red",
    },
};

// ─── Toggle Button Component ────────────────────────────────────────
function ToggleButton({
    value,
    onChange,
}: {
    value: boolean | null;
    onChange: (val: boolean) => void;
}) {
    return (
        <div className="flex items-center gap-1 shrink-0">
            <button
                onClick={() => onChange(true)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 border ${value === true
                    ? "bg-neon-green/15 text-neon-green border-neon-green/30 shadow-[0_0_12px_rgba(0,255,136,0.15)]"
                    : "bg-transparent text-gray-600 border-surface-500/30 hover:text-gray-400 hover:border-surface-500/60"
                    }`}
            >
                <CheckCircle2 className="h-3 w-3" />
                YES
            </button>
            <button
                onClick={() => onChange(false)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 border ${value === false
                    ? "bg-neon-red/15 text-neon-red border-neon-red/30 shadow-[0_0_12px_rgba(255,59,92,0.15)]"
                    : "bg-transparent text-gray-600 border-surface-500/30 hover:text-gray-400 hover:border-surface-500/60"
                    }`}
            >
                <XCircle className="h-3 w-3" />
                NO
            </button>
        </div>
    );
}

// ─── Main Page Component ────────────────────────────────────────────
export default function ChecklistPage() {
    const [sections, setSections] = useState<Section[]>(createSections());
    const [loaded, setLoaded] = useState(false);

    // Load checked states from localStorage (icons can't be serialized)
    useEffect(() => {
        const stored = localStorage.getItem("tradeflow-sop-checklist");
        if (stored) {
            try {
                const savedSections = JSON.parse(stored);
                // Merge saved checked states into fresh sections (preserves icon refs)
                const freshSections = createSections();
                const merged = freshSections.map((section) => {
                    const savedSection = savedSections.find(
                        (s: { id: string }) => s.id === section.id
                    );
                    if (savedSection) {
                        return {
                            ...section,
                            items: section.items.map((item) => {
                                const savedItem = savedSection.items?.find(
                                    (si: { id: string }) => si.id === item.id
                                );
                                return savedItem ? { ...item, checked: savedItem.checked } : item;
                            }),
                        };
                    }
                    return section;
                });
                setSections(merged);
            } catch {
                setSections(createSections());
            }
        }
        setLoaded(true);
    }, []);

    // Save to localStorage
    useEffect(() => {
        if (loaded) {
            localStorage.setItem("tradeflow-sop-checklist", JSON.stringify(sections));
        }
    }, [sections, loaded]);

    // Toggle a specific item
    const toggleItem = useCallback((sectionId: string, itemId: string, value: boolean) => {
        setSections((prev) =>
            prev.map((section) =>
                section.id === sectionId
                    ? {
                        ...section,
                        items: section.items.map((item) =>
                            item.id === itemId ? { ...item, checked: value } : item
                        ),
                    }
                    : section
            )
        );
    }, []);

    // Reset all
    const resetAll = useCallback(() => {
        setSections(createSections());
    }, []);

    // ─── Computed Values ──────────────────────────────────────────────
    const allItems = sections.flatMap((s) => s.items);
    const totalItems = allItems.length;
    const answeredItems = allItems.filter((i) => i.checked !== null).length;
    const yesItems = allItems.filter((i) => i.checked === true).length;
    const noItems = allItems.filter((i) => i.checked === false).length;
    const progress = totalItems > 0 ? (answeredItems / totalItems) * 100 : 0;
    const allAnswered = answeredItems === totalItems;
    const isValidTrade = allAnswered && allItems.every((i) => i.checked === true);
    const hasAnyNo = noItems > 0;

    // Section completion stats
    const getSectionStats = (section: Section) => {
        const total = section.items.length;
        const yes = section.items.filter((i) => i.checked === true).length;
        const no = section.items.filter((i) => i.checked === false).length;
        const answered = yes + no;
        const allYes = answered === total && yes === total;
        const hasNo = no > 0;
        return { total, yes, no, answered, allYes, hasNo };
    };

    // Execute trade — log the trade and save violation status
    const executeTrade = () => {
        const failedItems = allItems.filter((i) => i.checked === false);
        const isViolation = failedItems.length > 0;

        const tradeLog = {
            id: Date.now().toString(),
            date: new Date().toISOString().split("T")[0],
            timestamp: new Date().toISOString(),
            checklistResult: isViolation ? "INVALID" : "VALID",
            isRuleBreak: isViolation,
            failedItems: failedItems.map((i) => i.label),
            sections: sections.map((s) => ({
                title: s.title,
                items: s.items.map((i) => ({ label: i.label, checked: i.checked })),
            })),
        };

        // Save to checklist logs
        const existingLogs = JSON.parse(localStorage.getItem("tradeflow-checklist-logs") || "[]");
        existingLogs.unshift(tradeLog);
        localStorage.setItem("tradeflow-checklist-logs", JSON.stringify(existingLogs));

        // Save pending checklist state for journal form to pick up
        localStorage.setItem(
            "tradeflow-pending-checklist",
            JSON.stringify({
                isRuleBreak: isViolation,
                failedItems: failedItems.map((i) => i.label),
                checklistResult: isViolation ? "INVALID" : "VALID",
                timestamp: new Date().toISOString(),
            })
        );

        resetAll();

        // Navigate to journal form
        window.location.href = "/journal";
    };

    if (!loaded) return null;

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl">
            {/* ─── Page Header ─────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neon-green/10 border border-neon-green/20">
                            <Activity className="h-5 w-5 text-neon-green" />
                        </div>
                        Trade Execution Checklist
                    </h1>
                    <p className="text-sm text-gray-500 mt-2 ml-12">
                        SOP-based validation — Complete all checks before entering a trade
                    </p>
                </div>
                <Button variant="ghost" size="sm" onClick={resetAll}>
                    <RotateCcw className="h-4 w-4" />
                    Reset
                </Button>
            </div>

            {/* ─── Progress & Status Bar ───────────────────────────────── */}
            <Card className="border-surface-500/30 overflow-hidden">
                <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-white">
                                Completion
                            </span>
                            <span className="text-xs text-gray-500 font-mono">
                                {answeredItems}/{totalItems} items checked
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-neon-green">
                                {yesItems} YES
                            </span>
                            <span className="text-xs font-mono text-neon-red">
                                {noItems} NO
                            </span>
                            <span className="text-sm font-mono font-bold text-white">
                                {progress.toFixed(0)}%
                            </span>
                        </div>
                    </div>
                    <div className="w-full h-2.5 bg-surface-700 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{
                                width: `${progress}%`,
                                background: hasAnyNo
                                    ? "linear-gradient(90deg, #ff3b5c, #ff6b81)"
                                    : isValidTrade
                                        ? "linear-gradient(90deg, #00ff88, #00cc6a)"
                                        : "linear-gradient(90deg, #3b82f6, #06b6d4)",
                            }}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* ─── Trade Verdict ───────────────────────────────────────── */}
            {allAnswered && (
                <div
                    className={`rounded-xl border p-5 text-center transition-all duration-500 animate-fade-in ${isValidTrade
                        ? "border-neon-green/30 bg-neon-green/5 shadow-[0_0_40px_rgba(0,255,136,0.1)]"
                        : "border-neon-red/30 bg-neon-red/5 shadow-[0_0_40px_rgba(255,59,92,0.1)]"
                        }`}
                >
                    <div className="flex items-center justify-center gap-3 mb-2">
                        {isValidTrade ? (
                            <ShieldCheck className="h-8 w-8 text-neon-green animate-pulse" />
                        ) : (
                            <ShieldX className="h-8 w-8 text-neon-red animate-pulse" />
                        )}
                        <span
                            className={`text-2xl font-black tracking-wider font-mono ${isValidTrade ? "text-neon-green" : "text-neon-red"
                                }`}
                        >
                            {isValidTrade ? "VALID TRADE" : "INVALID TRADE"}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500">
                        {isValidTrade
                            ? "All SOP conditions met. You are cleared to execute."
                            : `${noItems} condition${noItems !== 1 ? "s" : ""} failed. Do NOT enter this trade.`}
                    </p>
                </div>
            )}

            {/* ─── Sections ────────────────────────────────────────────── */}
            <div className="space-y-4">
                {sections.map((section, sectionIndex) => {
                    const stats = getSectionStats(section);
                    const colors = sectionColorMap[section.color];
                    const SectionIcon = section.icon;

                    return (
                        <Card
                            key={section.id}
                            className={`${colors.border} ${colors.glow} transition-all duration-300`}
                            style={{ animationDelay: `${sectionIndex * 80}ms` }}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-3 text-sm">
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-lg ${colors.iconBg}`}
                                        >
                                            <SectionIcon className={`h-4 w-4 ${colors.iconText}`} />
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 uppercase tracking-widest font-mono block mb-0.5">
                                                Section {sectionIndex + 1}
                                            </span>
                                            <span className="text-white text-sm font-semibold">
                                                {section.title}
                                            </span>
                                        </div>
                                    </CardTitle>

                                    {/* Section badge */}
                                    <div>
                                        {stats.allYes ? (
                                            <Badge variant="success">
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                PASS
                                            </Badge>
                                        ) : stats.hasNo ? (
                                            <Badge variant="danger">
                                                <XCircle className="h-3 w-3 mr-1" />
                                                FAIL
                                            </Badge>
                                        ) : (
                                            <span className="text-xs text-gray-600 font-mono">
                                                {stats.answered}/{stats.total}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-1">
                                <div className="space-y-1">
                                    {section.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`flex items-center justify-between gap-4 px-3 py-2.5 rounded-xl transition-all duration-200 group ${item.checked === true
                                                ? "bg-neon-green/[0.03]"
                                                : item.checked === false
                                                    ? "bg-neon-red/[0.03]"
                                                    : "hover:bg-surface-700/30"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div
                                                    className={`h-1.5 w-1.5 rounded-full shrink-0 transition-colors duration-200 ${item.checked === true
                                                        ? "bg-neon-green"
                                                        : item.checked === false
                                                            ? "bg-neon-red"
                                                            : "bg-gray-600"
                                                        }`}
                                                />
                                                <span
                                                    className={`text-sm transition-colors duration-200 ${item.checked === true
                                                        ? "text-gray-300"
                                                        : item.checked === false
                                                            ? "text-gray-500 line-through"
                                                            : "text-gray-400"
                                                        }`}
                                                >
                                                    {item.label}
                                                </span>
                                            </div>

                                            <ToggleButton
                                                value={item.checked}
                                                onChange={(val) => toggleItem(section.id, item.id, val)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* ─── Execute Buttons ──────────────────────────────────────── */}
            <div className="pt-2 pb-8 space-y-3">
                {/* Valid trade button */}
                <button
                    onClick={() => executeTrade()}
                    disabled={!isValidTrade}
                    className={`w-full flex items-center justify-center gap-3 rounded-xl py-4 px-6 text-sm font-bold uppercase tracking-widest transition-all duration-300 border ${isValidTrade
                        ? "bg-neon-green/10 text-neon-green border-neon-green/30 hover:bg-neon-green/20 hover:shadow-[0_0_40px_rgba(0,255,136,0.2)] cursor-pointer"
                        : "bg-surface-800/50 text-gray-600 border-surface-600/30 cursor-not-allowed"
                        }`}
                >
                    {isValidTrade ? (
                        <>
                            <ShieldCheck className="h-5 w-5" />
                            Execute Trade & Log
                            <ArrowRight className="h-4 w-4" />
                        </>
                    ) : (
                        <>
                            <ShieldX className="h-5 w-5" />
                            {allAnswered
                                ? "Trade Conditions Not Met"
                                : "Complete All Checks to Proceed"}
                        </>
                    )}
                </button>

                {/* Rule break override — only show when checklist is complete but invalid */}
                {allAnswered && !isValidTrade && (
                    <button
                        onClick={() => executeTrade()}
                        className="w-full flex items-center justify-center gap-3 rounded-xl py-3.5 px-6 text-xs font-bold uppercase tracking-widest transition-all duration-300 border border-neon-red/20 bg-neon-red/[0.04] text-neon-red/70 hover:bg-neon-red/10 hover:text-neon-red hover:border-neon-red/40 hover:shadow-[0_0_30px_rgba(255,59,92,0.1)]"
                    >
                        <AlertTriangle className="h-4 w-4" />
                        Log Trade Anyway (Rule Break)
                        <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
}

