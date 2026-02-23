"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

import {
    BookOpen,
    TrendingUp,
    Target,
    Crosshair,
    BarChart3,
    Brain,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    ArrowRight,
    Zap,
    Save,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────
interface TradeJournalEntry {
    id: string;
    // Section 1: Trade Info
    pair: string;
    tradeType: string;
    date: string;
    time: string;
    // Section 2: Market Context
    bias1H: string;
    rangeType: string;
    poiType: string;
    // Section 3: Entry Details
    entryPrice: string;
    stopLoss: string;
    takeProfit: string;
    rrRatio: number;
    // Section 4: Execution
    entryType: string;
    poiTapped: boolean | null;
    chochConfirmed: boolean | null;
    // Section 5: Result
    outcome: string;
    profitLoss: string;
    // Section 6: Psychology
    emotion: string;
    followedRules: boolean | null;
    mistakes: string;
}

// ─── Toggle Button Component ────────────────────────────────────────
function ToggleButton({
    value,
    onChange,
}: {
    value: boolean | null;
    onChange: (val: boolean) => void;
}) {
    return (
        <div className="flex items-center gap-1">
            <button
                type="button"
                onClick={() => onChange(true)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${value === true
                    ? "bg-neon-green/15 text-neon-green border-neon-green/30 shadow-[0_0_12px_rgba(0,255,136,0.15)]"
                    : "bg-transparent text-gray-600 border-surface-500/30 hover:text-gray-400 hover:border-surface-500/60"
                    }`}
            >
                <CheckCircle2 className="h-3 w-3" />
                YES
            </button>
            <button
                type="button"
                onClick={() => onChange(false)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${value === false
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

// ─── Label ──────────────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
            {children}
        </label>
    );
}

// ─── Main Component ─────────────────────────────────────────────────
export default function JournalPage() {
    const router = useRouter();
    const [showSuccess, setShowSuccess] = useState(false);
    const [checklistViolation, setChecklistViolation] = useState<{
        isRuleBreak: boolean;
        failedItems: string[];
        checklistResult: string;
    } | null>(null);

    const [form, setForm] = useState({
        pair: "",
        tradeType: "",
        date: new Date().toISOString().split("T")[0],
        time: "",
        bias1H: "",
        rangeType: "",
        poiType: "",
        entryPrice: "",
        stopLoss: "",
        takeProfit: "",
        entryType: "",
        poiTapped: null as boolean | null,
        chochConfirmed: null as boolean | null,
        outcome: "",
        profitLoss: "",
        emotion: "",
        followedRules: null as boolean | null,
        mistakes: "",
    });

    // Read pending checklist state on mount
    useEffect(() => {
        const pending = localStorage.getItem("tradeflow-pending-checklist");
        if (pending) {
            try {
                const data = JSON.parse(pending);
                if (data.isRuleBreak) {
                    setChecklistViolation(data);
                    setForm((prev) => ({
                        ...prev,
                        followedRules: false,
                        mistakes: data.failedItems.length > 0
                            ? `Rule violations: ${data.failedItems.join("; ")}`
                            : prev.mistakes,
                    }));
                }
                // Clear after reading
                localStorage.removeItem("tradeflow-pending-checklist");
            } catch {
                // ignore parse errors
            }
        }
    }, []);

    const set = (key: string, value: string | boolean | null) =>
        setForm((p) => ({ ...p, [key]: value }));

    // ─── Auto RR Calculation ──────────────────────────────────────────
    const rrRatio = useMemo(() => {
        const entry = parseFloat(form.entryPrice);
        const sl = parseFloat(form.stopLoss);
        const tp = parseFloat(form.takeProfit);
        if (isNaN(entry) || isNaN(sl) || isNaN(tp) || entry === sl) return null;
        const risk = Math.abs(entry - sl);
        const reward = Math.abs(tp - entry);
        if (risk === 0) return null;
        return parseFloat((reward / risk).toFixed(2));
    }, [form.entryPrice, form.stopLoss, form.takeProfit]);

    const rrIsLow = rrRatio !== null && rrRatio < 5;

    // ─── Form validation ─────────────────────────────────────────────
    const isFormValid = useMemo(() => {
        return (
            form.pair !== "" &&
            form.tradeType !== "" &&
            form.date !== "" &&
            form.bias1H !== "" &&
            form.entryPrice !== "" &&
            form.stopLoss !== "" &&
            form.takeProfit !== "" &&
            form.outcome !== "" &&
            form.emotion !== ""
        );
    }, [form]);

    // ─── Submit ───────────────────────────────────────────────────────
    const handleSubmit = () => {
        if (!isFormValid) return;

        const entry: TradeJournalEntry = {
            id: Date.now().toString(),
            pair: form.pair,
            tradeType: form.tradeType,
            date: form.date,
            time: form.time,
            bias1H: form.bias1H,
            rangeType: form.rangeType,
            poiType: form.poiType,
            entryPrice: form.entryPrice,
            stopLoss: form.stopLoss,
            takeProfit: form.takeProfit,
            rrRatio: rrRatio ?? 0,
            entryType: form.entryType,
            poiTapped: form.poiTapped,
            chochConfirmed: form.chochConfirmed,
            outcome: form.outcome,
            profitLoss: form.profitLoss,
            emotion: form.emotion,
            followedRules: form.followedRules,
            mistakes: form.mistakes,
        };

        // Save to journal entries
        const existing = JSON.parse(
            localStorage.getItem("tradeflow-journal-entries") || "[]"
        );
        existing.unshift(entry);
        localStorage.setItem("tradeflow-journal-entries", JSON.stringify(existing));

        // Also save as a trade to show on dashboard/trades page
        const pnlValue = parseFloat(form.profitLoss) || 0;
        const tradeRecord = {
            id: entry.id,
            date: form.date,
            symbol: form.pair,
            side: form.bias1H === "Bullish" ? "Long" : "Short",
            entry: parseFloat(form.entryPrice) || 0,
            exit: parseFloat(form.takeProfit) || 0,
            pnl: form.outcome === "Loss" ? -Math.abs(pnlValue) : Math.abs(pnlValue),
            status: form.outcome === "BE" ? "Win" : form.outcome,
            notes: `${form.tradeType} | ${form.rangeType} | ${form.poiType} | RR: ${rrRatio ?? "N/A"}`,
        };
        const trades = JSON.parse(
            localStorage.getItem("tradeflow-trades") || "[]"
        );
        trades.unshift(tradeRecord);
        localStorage.setItem("tradeflow-trades", JSON.stringify(trades));

        // Show success
        setShowSuccess(true);
        setTimeout(() => {
            router.push("/trades");
        }, 2000);
    };

    // ─── Success Overlay ──────────────────────────────────────────────
    if (showSuccess) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center">
                        <div className="h-20 w-20 rounded-2xl bg-neon-green/10 border border-neon-green/20 flex items-center justify-center shadow-[0_0_60px_rgba(0,255,136,0.15)] animate-pulse">
                            <CheckCircle2 className="h-10 w-10 text-neon-green" />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-white">Trade Logged Successfully</h2>
                    <p className="text-sm text-gray-500">Redirecting to trades page...</p>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                        <ArrowRight className="h-3 w-3 animate-pulse" />
                        <span>/trades</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5 animate-fade-in max-w-4xl pb-8">
            {/* ─── Header ──────────────────────────────────────────────── */}
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neon-blue/10 border border-neon-blue/20">
                        <BookOpen className="h-5 w-5 text-neon-blue" />
                    </div>
                    Trade Journal
                </h1>
                <p className="text-sm text-gray-500 mt-2 ml-12">
                    Log your trade with full SOP documentation
                </p>
            </div>

            {/* ─── Rule Break Warning ───────────────────────────────────── */}
            {checklistViolation && checklistViolation.isRuleBreak && (
                <div className="rounded-xl border border-neon-red/30 bg-neon-red/5 p-4 animate-fade-in shadow-[0_0_30px_rgba(255,59,92,0.08)]">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-neon-red shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-neon-red mb-1">
                                Rule Break Detected
                            </p>
                            <p className="text-xs text-gray-400 mb-2">
                                You logged this trade despite failing {checklistViolation.failedItems.length} SOP condition{checklistViolation.failedItems.length !== 1 ? "s" : ""}. This trade has been auto-flagged as a rule violation.
                            </p>
                            <div className="space-y-1">
                                {checklistViolation.failedItems.map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs text-neon-red/70">
                                        <XCircle className="h-3 w-3 shrink-0" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── SECTION 1: Trade Info ───────────────────────────────── */}
            <Card className="border-neon-blue/15 hover:shadow-glow-blue transition-all duration-300">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-3 text-sm">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon-blue/10">
                            <TrendingUp className="h-4 w-4 text-neon-blue" />
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 uppercase tracking-widest font-mono block mb-0.5">
                                Section 1
                            </span>
                            <span className="text-white text-sm font-semibold">
                                Trade Info
                            </span>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <FieldLabel>Pair</FieldLabel>
                            <Select value={form.pair} onChange={(e) => set("pair", e.target.value)}>
                                <option value="">Select pair...</option>
                                <option value="EU">EU (EUR/USD)</option>
                                <option value="GU">GU (GBP/USD)</option>
                                <option value="UJ">UJ (USD/JPY)</option>
                                <option value="UF">UF (USD/CHF)</option>
                                <option value="UCAD">UCAD (USD/CAD)</option>
                            </Select>
                        </div>
                        <div>
                            <FieldLabel>Trade Type</FieldLabel>
                            <Select value={form.tradeType} onChange={(e) => set("tradeType", e.target.value)}>
                                <option value="">Select type...</option>
                                <option value="15min PT">15min PT (Pro Trend)</option>
                                <option value="CT">CT (Counter Trend)</option>
                                <option value="ECT">ECT (Extreme CT)</option>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <FieldLabel>Date</FieldLabel>
                                <Input
                                    type="date"
                                    value={form.date}
                                    onChange={(e) => set("date", e.target.value)}
                                />
                            </div>
                            <div>
                                <FieldLabel>Time</FieldLabel>
                                <Input
                                    type="time"
                                    value={form.time}
                                    onChange={(e) => set("time", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ─── SECTION 2: Market Context ───────────────────────────── */}
            <Card className="border-neon-cyan/15 hover:shadow-glow-blue transition-all duration-300">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-3 text-sm">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon-cyan/10">
                            <BarChart3 className="h-4 w-4 text-neon-cyan" />
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 uppercase tracking-widest font-mono block mb-0.5">
                                Section 2
                            </span>
                            <span className="text-white text-sm font-semibold">
                                Market Context
                            </span>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <FieldLabel>1H Bias</FieldLabel>
                            <Select value={form.bias1H} onChange={(e) => set("bias1H", e.target.value)}>
                                <option value="">Select bias...</option>
                                <option value="Bullish">🟢 Bullish</option>
                                <option value="Bearish">🔴 Bearish</option>
                            </Select>
                        </div>
                        <div>
                            <FieldLabel>Range Type</FieldLabel>
                            <Select value={form.rangeType} onChange={(e) => set("rangeType", e.target.value)}>
                                <option value="">Select range...</option>
                                <option value="LSL">LSL</option>
                                <option value="MIT">MIT</option>
                                <option value="IDM">IDM</option>
                                <option value="mChoCH">mChoCH</option>
                            </Select>
                        </div>
                        <div>
                            <FieldLabel>POI Type</FieldLabel>
                            <Select value={form.poiType} onChange={(e) => set("poiType", e.target.value)}>
                                <option value="">Select POI...</option>
                                <option value="OB">Order Block (OB)</option>
                                <option value="Wick">Wick</option>
                                <option value="LTF Refinement">LTF Refinement</option>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ─── SECTION 3: Entry Details ────────────────────────────── */}
            <Card className="border-neon-purple/15 hover:shadow-glow-purple transition-all duration-300">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-3 text-sm">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon-purple/10">
                            <Crosshair className="h-4 w-4 text-neon-purple" />
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 uppercase tracking-widest font-mono block mb-0.5">
                                Section 3
                            </span>
                            <span className="text-white text-sm font-semibold">
                                Entry Details
                            </span>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <FieldLabel>Entry Price</FieldLabel>
                            <Input
                                type="number"
                                step="0.00001"
                                value={form.entryPrice}
                                onChange={(e) => set("entryPrice", e.target.value)}
                                placeholder="0.00000"
                            />
                        </div>
                        <div>
                            <FieldLabel>Stop Loss</FieldLabel>
                            <Input
                                type="number"
                                step="0.00001"
                                value={form.stopLoss}
                                onChange={(e) => set("stopLoss", e.target.value)}
                                placeholder="0.00000"
                            />
                        </div>
                        <div>
                            <FieldLabel>Take Profit</FieldLabel>
                            <Input
                                type="number"
                                step="0.00001"
                                value={form.takeProfit}
                                onChange={(e) => set("takeProfit", e.target.value)}
                                placeholder="0.00000"
                            />
                        </div>
                    </div>

                    {/* RR Display */}
                    <div className="mt-4 flex items-center gap-3">
                        <div
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-300 ${rrRatio === null
                                ? "border-surface-500/30 bg-surface-700/30"
                                : rrIsLow
                                    ? "border-neon-red/30 bg-neon-red/5 shadow-[0_0_20px_rgba(255,59,92,0.08)]"
                                    : "border-neon-green/30 bg-neon-green/5 shadow-[0_0_20px_rgba(0,255,136,0.08)]"
                                }`}
                        >
                            <Target
                                className={`h-4 w-4 ${rrRatio === null
                                    ? "text-gray-500"
                                    : rrIsLow
                                        ? "text-neon-red"
                                        : "text-neon-green"
                                    }`}
                            />
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Risk/Reward
                            </span>
                            <span
                                className={`text-lg font-bold font-mono ${rrRatio === null
                                    ? "text-gray-500"
                                    : rrIsLow
                                        ? "text-neon-red"
                                        : "text-neon-green"
                                    }`}
                            >
                                {rrRatio !== null ? `${rrRatio}R` : "—"}
                            </span>
                        </div>

                        {rrIsLow && (
                            <div className="flex items-center gap-2 text-neon-red animate-fade-in">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="text-xs font-medium">
                                    RR below 5R — Does not meet SOP minimum
                                </span>
                            </div>
                        )}

                        {rrRatio !== null && !rrIsLow && (
                            <div className="flex items-center gap-2 text-neon-green animate-fade-in">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="text-xs font-medium">
                                    Meets SOP requirement
                                </span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* ─── SECTION 4: Execution ────────────────────────────────── */}
            <Card className="border-neon-yellow/15 hover:shadow-glow-green transition-all duration-300">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-3 text-sm">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon-yellow/10">
                            <Zap className="h-4 w-4 text-neon-yellow" />
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 uppercase tracking-widest font-mono block mb-0.5">
                                Section 4
                            </span>
                            <span className="text-white text-sm font-semibold">
                                Execution
                            </span>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <FieldLabel>Entry Type</FieldLabel>
                            <Select value={form.entryType} onChange={(e) => set("entryType", e.target.value)}>
                                <option value="">Select type...</option>
                                <option value="Limit">Limit Order</option>
                                <option value="Market">Market Order</option>
                            </Select>
                        </div>
                        <div>
                            <FieldLabel>POI Tapped Correctly?</FieldLabel>
                            <div className="mt-1">
                                <ToggleButton
                                    value={form.poiTapped}
                                    onChange={(val) => set("poiTapped", val)}
                                />
                            </div>
                        </div>
                        <div>
                            <FieldLabel>3min ChoCH Confirmed?</FieldLabel>
                            <div className="mt-1">
                                <ToggleButton
                                    value={form.chochConfirmed}
                                    onChange={(val) => set("chochConfirmed", val)}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ─── SECTION 5: Result ───────────────────────────────────── */}
            <Card className="border-neon-green/15 hover:shadow-glow-green transition-all duration-300">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-3 text-sm">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon-green/10">
                            <Target className="h-4 w-4 text-neon-green" />
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 uppercase tracking-widest font-mono block mb-0.5">
                                Section 5
                            </span>
                            <span className="text-white text-sm font-semibold">
                                Result
                            </span>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel>Outcome</FieldLabel>
                            <div className="flex gap-2">
                                {(["Win", "Loss", "BE"] as const).map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => set("outcome", opt)}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${form.outcome === opt
                                            ? opt === "Win"
                                                ? "bg-neon-green/15 text-neon-green border-neon-green/30 shadow-[0_0_12px_rgba(0,255,136,0.12)]"
                                                : opt === "Loss"
                                                    ? "bg-neon-red/15 text-neon-red border-neon-red/30 shadow-[0_0_12px_rgba(255,59,92,0.12)]"
                                                    : "bg-neon-yellow/15 text-neon-yellow border-neon-yellow/30 shadow-[0_0_12px_rgba(251,191,36,0.12)]"
                                            : "bg-transparent text-gray-500 border-surface-500/30 hover:text-gray-300 hover:border-surface-500/60"
                                            }`}
                                    >
                                        {opt === "Win" ? "🟢 " : opt === "Loss" ? "🔴 " : "🟡 "}
                                        {opt === "BE" ? "Break Even" : opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <FieldLabel>Profit / Loss (in R or $)</FieldLabel>
                            <Input
                                type="number"
                                step="0.01"
                                value={form.profitLoss}
                                onChange={(e) => set("profitLoss", e.target.value)}
                                placeholder="e.g., 5 or 50.00"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ─── SECTION 6: Psychology ───────────────────────────────── */}
            <Card className="border-neon-red/15 hover:shadow-glow-red transition-all duration-300">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-3 text-sm">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon-red/10">
                            <Brain className="h-4 w-4 text-neon-red" />
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 uppercase tracking-widest font-mono block mb-0.5">
                                Section 6
                            </span>
                            <span className="text-white text-sm font-semibold">
                                Psychology
                            </span>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel>Emotional State</FieldLabel>
                            <div className="grid grid-cols-2 gap-2">
                                {(["Calm", "FOMO", "Hesitation", "Revenge"] as const).map(
                                    (em) => (
                                        <button
                                            key={em}
                                            type="button"
                                            onClick={() => set("emotion", em)}
                                            className={`py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${form.emotion === em
                                                ? em === "Calm"
                                                    ? "bg-neon-green/15 text-neon-green border-neon-green/30"
                                                    : "bg-neon-red/15 text-neon-red border-neon-red/30"
                                                : "bg-transparent text-gray-500 border-surface-500/30 hover:text-gray-300 hover:border-surface-500/60"
                                                }`}
                                        >
                                            {em === "Calm"
                                                ? "😌"
                                                : em === "FOMO"
                                                    ? "😰"
                                                    : em === "Hesitation"
                                                        ? "😟"
                                                        : "😤"}{" "}
                                            {em}
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                        <div>
                            <FieldLabel>Followed Rules?</FieldLabel>
                            <div className="mt-1">
                                <ToggleButton
                                    value={form.followedRules}
                                    onChange={(val) => set("followedRules", val)}
                                />
                            </div>
                            {form.followedRules === false && (
                                <p className="text-xs text-neon-red mt-2 flex items-center gap-1 animate-fade-in">
                                    <AlertTriangle className="h-3 w-3" />
                                    Rule break detected — review and improve
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <FieldLabel>Mistakes / Notes</FieldLabel>
                        <Textarea
                            value={form.mistakes}
                            onChange={(e) => set("mistakes", e.target.value)}
                            placeholder="What mistakes did you make? What will you improve next time?"
                            className="min-h-[90px]"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* ─── Submit Button ───────────────────────────────────────── */}
            <div className="pt-2">
                <button
                    onClick={handleSubmit}
                    disabled={!isFormValid}
                    className={`w-full flex items-center justify-center gap-3 rounded-xl py-4 px-6 text-sm font-bold uppercase tracking-widest transition-all duration-300 border ${isFormValid
                        ? "bg-neon-green/10 text-neon-green border-neon-green/30 hover:bg-neon-green/20 hover:shadow-[0_0_40px_rgba(0,255,136,0.15)] cursor-pointer"
                        : "bg-surface-800/50 text-gray-600 border-surface-600/30 cursor-not-allowed"
                        }`}
                >
                    <Save className="h-5 w-5" />
                    {isFormValid ? "Submit Trade Journal" : "Fill Required Fields to Submit"}
                    {isFormValid && <ArrowRight className="h-4 w-4" />}
                </button>
            </div>
        </div>
    );
}
