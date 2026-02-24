"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Calculator,
    DollarSign,
    Percent,
    Crosshair,
    ShieldX,
    TrendingUp,
    Ruler,
    BarChart3,
    AlertTriangle,
    ChevronsUpDown,
} from "lucide-react";

// ─── Forex Pair Definitions ─────────────────────────────────────────
interface ForexPair {
    symbol: string;
    label: string;
    pipStep: number;       // price movement per 1 pip
    pipValuePerLot: number; // $ value per pip per standard lot
    isJpy: boolean;
}

const FOREX_PAIRS: ForexPair[] = [
    { symbol: "EURUSD", label: "EUR/USD", pipStep: 0.0001, pipValuePerLot: 10, isJpy: false },
    { symbol: "GBPUSD", label: "GBP/USD", pipStep: 0.0001, pipValuePerLot: 10, isJpy: false },
    { symbol: "AUDUSD", label: "AUD/USD", pipStep: 0.0001, pipValuePerLot: 10, isJpy: false },
    { symbol: "NZDUSD", label: "NZD/USD", pipStep: 0.0001, pipValuePerLot: 10, isJpy: false },
    { symbol: "USDCAD", label: "USD/CAD", pipStep: 0.0001, pipValuePerLot: 10, isJpy: false },
    { symbol: "USDCHF", label: "USD/CHF", pipStep: 0.0001, pipValuePerLot: 10, isJpy: false },
    { symbol: "EURGBP", label: "EUR/GBP", pipStep: 0.0001, pipValuePerLot: 10, isJpy: false },
    { symbol: "EURAUD", label: "EUR/AUD", pipStep: 0.0001, pipValuePerLot: 10, isJpy: false },
    { symbol: "USDJPY", label: "USD/JPY", pipStep: 0.01, pipValuePerLot: 6.67, isJpy: true },
    { symbol: "EURJPY", label: "EUR/JPY", pipStep: 0.01, pipValuePerLot: 6.67, isJpy: true },
    { symbol: "GBPJPY", label: "GBP/JPY", pipStep: 0.01, pipValuePerLot: 6.67, isJpy: true },
    { symbol: "AUDJPY", label: "AUD/JPY", pipStep: 0.01, pipValuePerLot: 6.67, isJpy: true },
    { symbol: "XAUUSD", label: "XAU/USD", pipStep: 0.01, pipValuePerLot: 1, isJpy: false },
];

// ─── Input Field Component ──────────────────────────────────────────
function InputField({
    label,
    icon: Icon,
    value,
    onChange,
    placeholder,
    suffix,
}: {
    label: string;
    icon: React.ElementType;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    suffix?: string;
}) {
    return (
        <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 font-mono">
                <Icon className="h-3.5 w-3.5" />
                {label}
            </label>
            <div className="relative">
                <input
                    type="number"
                    step="any"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full rounded-xl border border-surface-500/30 bg-surface-800/50 px-4 py-3 text-sm font-mono text-white placeholder:text-gray-600 outline-none transition-all duration-200 focus:border-neon-green/40 focus:shadow-[0_0_20px_rgba(0,255,136,0.06)] hover:border-surface-500/50"
                />
                {suffix && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-mono">
                        {suffix}
                    </span>
                )}
            </div>
        </div>
    );
}

// ─── Result Card Component ──────────────────────────────────────────
function ResultCard({
    label,
    value,
    icon: Icon,
    color,
    sublabel,
}: {
    label: string;
    value: string;
    icon: React.ElementType;
    color: "green" | "blue" | "purple";
    sublabel?: string;
}) {
    const colorMap = {
        green: {
            text: "text-neon-green",
            bg: "bg-neon-green/10",
            border: "border-neon-green/20",
            glow: "shadow-[0_0_25px_rgba(0,255,136,0.06)]",
        },
        blue: {
            text: "text-neon-blue",
            bg: "bg-neon-blue/10",
            border: "border-neon-blue/20",
            glow: "shadow-[0_0_25px_rgba(59,130,246,0.06)]",
        },
        purple: {
            text: "text-neon-purple",
            bg: "bg-neon-purple/10",
            border: "border-neon-purple/20",
            glow: "shadow-[0_0_25px_rgba(168,85,247,0.06)]",
        },
    };
    const c = colorMap[color];

    return (
        <Card className={`${c.border} ${c.glow} transition-all duration-300`}>
            <CardContent className="p-5 flex flex-col items-center text-center gap-2">
                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.bg} border ${c.border}`}
                >
                    <Icon className={`h-5 w-5 ${c.text}`} />
                </div>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-mono">
                    {label}
                </p>
                <p className={`text-2xl font-black font-mono ${c.text}`}>
                    {value}
                </p>
                {sublabel && (
                    <p className="text-[10px] text-gray-600 font-mono">{sublabel}</p>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function CalculatorPage() {
    const [balance, setBalance] = useState("");
    const [riskPct, setRiskPct] = useState("");
    const [entry, setEntry] = useState("");
    const [stopLoss, setStopLoss] = useState("");
    const [selectedPair, setSelectedPair] = useState("EURUSD");

    const pair = FOREX_PAIRS.find((p) => p.symbol === selectedPair) || FOREX_PAIRS[0];

    // ─── Calculations ───────────────────────────────────────────────
    const result = useMemo(() => {
        const bal = parseFloat(balance);
        const risk = parseFloat(riskPct);
        const ent = parseFloat(entry);
        const sl = parseFloat(stopLoss);

        if (isNaN(bal) || isNaN(risk) || isNaN(ent) || isNaN(sl)) {
            return null;
        }

        if (bal <= 0 || risk <= 0 || risk > 100 || ent <= 0 || sl <= 0) {
            return { error: "All values must be positive. Risk must be ≤ 100%." };
        }

        if (ent === sl) {
            return { error: "Entry and Stop Loss cannot be the same price." };
        }

        // ─── Core Formulas ──────────────────────────────────────────
        const riskAmount = bal * (risk / 100);
        const priceDiff = Math.abs(ent - sl);

        // Convert price difference to pips using pair-specific pip step
        const pipCount = priceDiff / pair.pipStep;

        // Prevent divide by zero
        if (pipCount === 0) {
            return { error: "Pip distance is zero — adjust your entry or stop loss." };
        }

        // Lot size = Risk Amount / (Pip Count × Pip Value Per Lot)
        const lotSize = riskAmount / (pipCount * pair.pipValuePerLot);

        // Warning flag for extremely small pip distance (less than 1 pip)
        const smallPipWarning = pipCount < 1;

        return {
            riskAmount,
            priceDiff,
            pipCount: Math.round(pipCount * 10) / 10, // round pips to 1 decimal
            lotSize: Math.round(lotSize * 100) / 100,  // round lots to 2 decimal
            direction: ent > sl ? "LONG" : "SHORT",
            smallPipWarning,
            pipStep: pair.pipStep,
            pipValuePerLot: pair.pipValuePerLot,
            pairLabel: pair.label,
        };
    }, [balance, riskPct, entry, stopLoss, pair]);

    const hasInputs = balance || riskPct || entry || stopLoss;
    const isValid = result && !("error" in result) && !("warning" in result);
    const hasError = result && "error" in result;

    return (
        <div className="animate-fade-in max-w-2xl mx-auto pb-8 space-y-6">
            {/* ─── Header ──────────────────────────────────────────────── */}
            <div className="text-center space-y-2">
                <div className="flex justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neon-green/10 border border-neon-green/20 shadow-[0_0_30px_rgba(0,255,136,0.08)]">
                        <Calculator className="h-6 w-6 text-neon-green" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-white mt-3">
                    Position Size Calculator
                </h1>
                <p className="text-sm text-gray-500">
                    Calculate your optimal lot size based on risk management rules
                </p>
            </div>

            {/* ─── Input Card ─────────────────────────────────────────── */}
            <Card className="border-surface-500/20 shadow-[0_0_40px_rgba(0,0,0,0.2)]">
                <CardContent className="p-6 space-y-5">
                    {/* Section label */}
                    <div className="flex items-center gap-2 pb-1 border-b border-surface-600/30">
                        <Crosshair className="h-3.5 w-3.5 text-gray-500" />
                        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-mono font-semibold">
                            Trade Parameters
                        </span>
                    </div>

                    {/* Pair Selector */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 font-mono">
                            <ChevronsUpDown className="h-3.5 w-3.5" />
                            Forex Pair
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                            {FOREX_PAIRS.map((p) => (
                                <button
                                    key={p.symbol}
                                    onClick={() => setSelectedPair(p.symbol)}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold font-mono transition-all duration-200 border ${selectedPair === p.symbol
                                            ? p.isJpy
                                                ? "bg-neon-red/10 text-neon-red border-neon-red/25 shadow-[0_0_12px_rgba(255,59,92,0.08)]"
                                                : p.symbol === "XAUUSD"
                                                    ? "bg-neon-yellow/10 text-neon-yellow border-neon-yellow/25 shadow-[0_0_12px_rgba(251,191,36,0.08)]"
                                                    : "bg-neon-green/10 text-neon-green border-neon-green/25 shadow-[0_0_12px_rgba(0,255,136,0.08)]"
                                            : "text-gray-500 border-surface-500/20 hover:text-gray-300 hover:border-surface-500/40"
                                        }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                        {/* Pip info strip */}
                        <div className="flex items-center gap-4 pt-1">
                            <span className="text-[10px] font-mono text-gray-600">
                                Pip step: <span className="text-gray-400 font-semibold">{pair.pipStep}</span>
                            </span>
                            <span className="text-[10px] font-mono text-gray-600">
                                Pip value/lot: <span className="text-gray-400 font-semibold">${pair.pipValuePerLot}</span>
                            </span>
                            {pair.isJpy && (
                                <span className="text-[10px] font-mono text-neon-red/70">JPY pair</span>
                            )}
                            {pair.symbol === "XAUUSD" && (
                                <span className="text-[10px] font-mono text-neon-yellow/70">Gold</span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <InputField
                            label="Account Balance"
                            icon={DollarSign}
                            value={balance}
                            onChange={setBalance}
                            placeholder="10000"
                            suffix="USD"
                        />
                        <InputField
                            label="Risk Percentage"
                            icon={Percent}
                            value={riskPct}
                            onChange={setRiskPct}
                            placeholder="1.0"
                            suffix="%"
                        />
                        <InputField
                            label="Entry Price"
                            icon={TrendingUp}
                            value={entry}
                            onChange={setEntry}
                            placeholder={pair.isJpy ? "150.500" : pair.symbol === "XAUUSD" ? "2350.00" : "1.0850"}
                        />
                        <InputField
                            label="Stop Loss"
                            icon={ShieldX}
                            value={stopLoss}
                            onChange={setStopLoss}
                            placeholder={pair.isJpy ? "150.000" : pair.symbol === "XAUUSD" ? "2340.00" : "1.0800"}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* ─── Error State ─────────────────────────────────────────── */}
            {hasError && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-neon-red/[0.05] border border-neon-red/20">
                    <AlertTriangle className="h-4 w-4 text-neon-red shrink-0" />
                    <p className="text-xs text-neon-red font-medium">
                        {(result as { error: string }).error}
                    </p>
                </div>
            )}

            {/* ─── Results ─────────────────────────────────────────────── */}
            {isValid && (
                <div className="space-y-4">
                    {/* Direction badge */}
                    <div className="flex justify-center">
                        <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold font-mono uppercase tracking-wider border ${result.direction === "LONG"
                                ? "bg-neon-green/10 text-neon-green border-neon-green/20"
                                : "bg-neon-red/10 text-neon-red border-neon-red/20"
                                }`}
                        >
                            <TrendingUp
                                className={`h-3 w-3 ${result.direction === "SHORT" ? "rotate-180" : ""
                                    }`}
                            />
                            {result.direction} Position
                        </span>
                    </div>

                    {/* Small pip warning */}
                    {result.smallPipWarning && (
                        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-neon-yellow/[0.05] border border-neon-yellow/20">
                            <AlertTriangle className="h-4 w-4 text-neon-yellow shrink-0" />
                            <p className="text-xs text-neon-yellow font-medium">
                                Pip distance is extremely small — Lot size may be unrealistically large. Double-check your entry and stop loss.
                            </p>
                        </div>
                    )}

                    {/* Result cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <ResultCard
                            label="Risk Amount"
                            value={`$${result.riskAmount.toFixed(2)}`}
                            icon={DollarSign}
                            color="green"
                            sublabel={`${riskPct}% of $${parseFloat(balance).toLocaleString()}`}
                        />
                        <ResultCard
                            label="Pip Distance"
                            value={`${result.pipCount}`}
                            icon={Ruler}
                            color="blue"
                            sublabel={`pips (${result.pairLabel})`}
                        />
                        <ResultCard
                            label="Lot Size"
                            value={result.lotSize.toFixed(2)}
                            icon={BarChart3}
                            color="purple"
                            sublabel="standard lots"
                        />
                    </div>

                    {/* Lot breakdown + pip info */}
                    <Card className="border-surface-500/15">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-around text-center">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-600 font-mono mb-1">
                                        Mini Lots
                                    </p>
                                    <p className="text-sm font-bold font-mono text-gray-300">
                                        {(result.lotSize * 10).toFixed(2)}
                                    </p>
                                </div>
                                <div className="h-6 w-px bg-surface-600/30" />
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-600 font-mono mb-1">
                                        Micro Lots
                                    </p>
                                    <p className="text-sm font-bold font-mono text-gray-300">
                                        {(result.lotSize * 100).toFixed(2)}
                                    </p>
                                </div>
                                <div className="h-6 w-px bg-surface-600/30" />
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-600 font-mono mb-1">
                                        Units
                                    </p>
                                    <p className="text-sm font-bold font-mono text-gray-300">
                                        {(result.lotSize * 100000).toFixed(0)}
                                    </p>
                                </div>
                                <div className="h-6 w-px bg-surface-600/30" />
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-600 font-mono mb-1">
                                        Pip Value
                                    </p>
                                    <p className="text-sm font-bold font-mono text-gray-300">
                                        ${result.pipValuePerLot}
                                    </p>
                                </div>
                                <div className="h-6 w-px bg-surface-600/30" />
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-600 font-mono mb-1">
                                        Pip Step
                                    </p>
                                    <p className="text-sm font-bold font-mono text-gray-300">
                                        {result.pipStep}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* ─── Empty State ─────────────────────────────────────────── */}
            {!hasInputs && (
                <Card className="border-surface-500/15">
                    <CardContent className="p-10 text-center">
                        <Calculator className="h-8 w-8 text-gray-700 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">
                            Enter your trade parameters above to calculate position size
                        </p>
                        <p className="text-[10px] text-gray-600 mt-1 font-mono">
                            Risk management is the key to longevity
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* ─── Footer ─────────────────────────────────────────────── */}
            <div className="text-center">
                <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">
                    Pip values are approximations — Verify with your broker before trading
                </p>
            </div>
        </div>
    );
}
