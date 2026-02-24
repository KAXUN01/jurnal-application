"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Calculator,
    DollarSign,
    Percent,
    ShieldX,
    TrendingUp,
    AlertTriangle,
    ChevronsUpDown,
    Shield,
    X,
    Check,
} from "lucide-react";

// ─── Forex Pair Definitions ─────────────────────────────────────────
interface ForexPair {
    symbol: string;
    label: string;
    journalKey: string; // matches journal's pair field (EU, GU, etc.)
    pipStep: number;
    pipValuePerLot: number;
    isJpy: boolean;
}

const FOREX_PAIRS: ForexPair[] = [
    { symbol: "EURUSD", label: "EUR/USD", journalKey: "EU", pipStep: 0.0001, pipValuePerLot: 10, isJpy: false },
    { symbol: "GBPUSD", label: "GBP/USD", journalKey: "GU", pipStep: 0.0001, pipValuePerLot: 10, isJpy: false },
    { symbol: "AUDUSD", label: "AUD/USD", journalKey: "AU", pipStep: 0.0001, pipValuePerLot: 10, isJpy: false },
    { symbol: "NZDUSD", label: "NZD/USD", journalKey: "NU", pipStep: 0.0001, pipValuePerLot: 10, isJpy: false },
    { symbol: "USDCAD", label: "USD/CAD", journalKey: "UCAD", pipStep: 0.0001, pipValuePerLot: 10, isJpy: false },
    { symbol: "USDCHF", label: "USD/CHF", journalKey: "UF", pipStep: 0.0001, pipValuePerLot: 10, isJpy: false },
    { symbol: "EURGBP", label: "EUR/GBP", journalKey: "EG", pipStep: 0.0001, pipValuePerLot: 10, isJpy: false },
    { symbol: "EURAUD", label: "EUR/AUD", journalKey: "EA", pipStep: 0.0001, pipValuePerLot: 10, isJpy: false },
    { symbol: "USDJPY", label: "USD/JPY", journalKey: "UJ", pipStep: 0.01, pipValuePerLot: 6.67, isJpy: true },
    { symbol: "EURJPY", label: "EUR/JPY", journalKey: "EJ", pipStep: 0.01, pipValuePerLot: 6.67, isJpy: true },
    { symbol: "GBPJPY", label: "GBP/JPY", journalKey: "GJ", pipStep: 0.01, pipValuePerLot: 6.67, isJpy: true },
    { symbol: "AUDJPY", label: "AUD/JPY", journalKey: "AJ", pipStep: 0.01, pipValuePerLot: 6.67, isJpy: true },
    { symbol: "XAUUSD", label: "XAU/USD", journalKey: "XAUUSD", pipStep: 0.01, pipValuePerLot: 1, isJpy: false },
];

// ─── Props ───────────────────────────────────────────────────────────
interface PositionCalcModalProps {
    open: boolean;
    onClose: () => void;
    onApply: (lotSize: string) => void;
    prefill?: {
        pair?: string;      // journal key like "EU", "GU", "UJ"
        entryPrice?: string;
        stopLoss?: string;
    };
}

// ─── Modal Input ─────────────────────────────────────────────────────
function ModalInput({
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
        <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-gray-500 font-mono">
                <Icon className="h-3 w-3" />
                {label}
            </label>
            <div className="relative">
                <input
                    type="number"
                    step="any"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full rounded-lg border border-surface-500/30 bg-surface-800/50 px-3 py-2 text-sm font-mono text-white placeholder:text-gray-600 outline-none transition-all duration-200 focus:border-neon-green/40 focus:shadow-[0_0_15px_rgba(0,255,136,0.06)]"
                />
                {suffix && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 font-mono">
                        {suffix}
                    </span>
                )}
            </div>
        </div>
    );
}

// ─── Main Modal ──────────────────────────────────────────────────────
export function PositionCalcModal({ open, onClose, onApply, prefill }: PositionCalcModalProps) {
    const [balance, setBalance] = useState("");
    const [riskPct, setRiskPct] = useState("1");
    const [entry, setEntry] = useState("");
    const [stopLoss, setStopLoss] = useState("");
    const [selectedPair, setSelectedPair] = useState("EURUSD");

    // Load saved balance from localStorage
    useEffect(() => {
        if (open) {
            const saved = localStorage.getItem("tradeflow-account-balance");
            if (saved) setBalance(saved);
        }
    }, [open]);

    // Pre-fill from journal form
    useEffect(() => {
        if (open && prefill) {
            if (prefill.entryPrice) setEntry(prefill.entryPrice);
            if (prefill.stopLoss) setStopLoss(prefill.stopLoss);
            if (prefill.pair) {
                const match = FOREX_PAIRS.find((p) => p.journalKey === prefill.pair);
                if (match) setSelectedPair(match.symbol);
            }
        }
    }, [open, prefill]);

    const pair = FOREX_PAIRS.find((p) => p.symbol === selectedPair) || FOREX_PAIRS[0];

    // ─── Calculations ───────────────────────────────────────────────
    const result = useMemo(() => {
        const bal = parseFloat(balance);
        const risk = parseFloat(riskPct);
        const ent = parseFloat(entry);
        const sl = parseFloat(stopLoss);

        if (isNaN(bal) || isNaN(risk) || isNaN(ent) || isNaN(sl)) return null;
        if (bal <= 0 || risk <= 0 || risk > 100 || ent <= 0 || sl <= 0) {
            return { error: "All values must be positive." };
        }
        if (ent === sl) return { error: "Entry = Stop Loss." };

        const riskAmount = bal * (risk / 100);
        const priceDiff = Math.abs(ent - sl);
        const pipCount = priceDiff / pair.pipStep;
        if (pipCount === 0) return { error: "Pip distance is zero." };

        const lotSize = riskAmount / (pipCount * pair.pipValuePerLot);
        const smallPipWarning = pipCount < 1;

        return {
            riskAmount,
            pipCount: Math.round(pipCount * 10) / 10,
            lotSize: Math.round(lotSize * 100) / 100,
            direction: ent > sl ? "LONG" : "SHORT",
            smallPipWarning,
        };
    }, [balance, riskPct, entry, stopLoss, pair]);

    const isValid = result && !("error" in result);
    const hasError = result && "error" in result;
    const riskLevel = parseFloat(riskPct);
    const isHighRisk = !isNaN(riskLevel) && riskLevel > 2;

    const handleApply = () => {
        if (isValid) {
            // Save balance for next time
            localStorage.setItem("tradeflow-account-balance", balance);
            onApply(result.lotSize.toFixed(2));
            onClose();
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto rounded-2xl border border-surface-500/20 bg-surface-900 shadow-[0_0_60px_rgba(0,0,0,0.5)] animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-surface-500/20">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neon-green/10 border border-neon-green/20">
                            <Calculator className="h-4.5 w-4.5 text-neon-green" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-white">Position Size Calculator</h2>
                            <p className="text-[10px] text-gray-500 font-mono">Calculate before you enter</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-surface-700 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 space-y-4">
                    {/* Pair selector (compact) */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-gray-500 font-mono">
                            <ChevronsUpDown className="h-3 w-3" />
                            Pair
                        </label>
                        <div className="flex flex-wrap gap-1">
                            {FOREX_PAIRS.map((p) => (
                                <button
                                    key={p.symbol}
                                    onClick={() => setSelectedPair(p.symbol)}
                                    className={`px-2 py-1 rounded-md text-[10px] font-bold font-mono transition-all duration-200 border ${selectedPair === p.symbol
                                        ? p.isJpy
                                            ? "bg-neon-red/10 text-neon-red border-neon-red/25"
                                            : p.symbol === "XAUUSD"
                                                ? "bg-neon-yellow/10 text-neon-yellow border-neon-yellow/25"
                                                : "bg-neon-green/10 text-neon-green border-neon-green/25"
                                        : "text-gray-500 border-surface-500/20 hover:text-gray-300"
                                        }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-3 text-[9px] font-mono text-gray-600">
                            <span>Pip: <span className="text-gray-400">{pair.pipStep}</span></span>
                            <span>Value: <span className="text-gray-400">${pair.pipValuePerLot}/lot</span></span>
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-2 gap-3">
                        <ModalInput
                            label="Account Balance"
                            icon={DollarSign}
                            value={balance}
                            onChange={setBalance}
                            placeholder="10000"
                            suffix="USD"
                        />
                        <div className="space-y-1.5">
                            <ModalInput
                                label="Risk %"
                                icon={Percent}
                                value={riskPct}
                                onChange={setRiskPct}
                                placeholder="1.0"
                                suffix="%"
                            />
                            <div className="flex gap-1">
                                {[0.5, 1, 2].map((pct) => (
                                    <button
                                        key={pct}
                                        onClick={() => setRiskPct(String(pct))}
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition-all border ${riskPct === String(pct)
                                            ? "bg-neon-green/10 text-neon-green border-neon-green/25"
                                            : "text-gray-500 border-surface-500/20 hover:text-gray-300 active:scale-95"
                                            }`}
                                    >
                                        {pct}%
                                    </button>
                                ))}
                            </div>
                        </div>
                        <ModalInput
                            label="Entry Price"
                            icon={TrendingUp}
                            value={entry}
                            onChange={setEntry}
                            placeholder={pair.isJpy ? "150.500" : pair.symbol === "XAUUSD" ? "2350.00" : "1.0850"}
                        />
                        <ModalInput
                            label="Stop Loss"
                            icon={ShieldX}
                            value={stopLoss}
                            onChange={setStopLoss}
                            placeholder={pair.isJpy ? "150.000" : pair.symbol === "XAUUSD" ? "2340.00" : "1.0800"}
                        />
                    </div>

                    {/* Error */}
                    {hasError && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neon-red/[0.05] border border-neon-red/20">
                            <AlertTriangle className="h-3.5 w-3.5 text-neon-red shrink-0" />
                            <p className="text-[11px] text-neon-red font-medium">
                                {(result as { error: string }).error}
                            </p>
                        </div>
                    )}

                    {/* Results */}
                    {isValid && (
                        <div className="space-y-3 animate-fade-in">
                            {/* Hero lot size */}
                            <Card className={`transition-all duration-300 ${isHighRisk
                                ? "border-neon-red/25 shadow-[0_0_20px_rgba(255,59,92,0.06)]"
                                : "border-neon-green/25 shadow-[0_0_20px_rgba(0,255,136,0.06)]"
                                }`}>
                                <CardContent className="p-4 text-center space-y-2">
                                    <p className="text-[9px] uppercase tracking-widest text-gray-500 font-mono">
                                        Position Size
                                    </p>
                                    <p className={`text-4xl font-black font-mono tracking-tight transition-colors duration-300 ${isHighRisk ? "text-neon-red" : "text-neon-green"
                                        }`}>
                                        {result.lotSize.toFixed(2)}
                                    </p>
                                    <p className="text-[10px] text-gray-500 font-mono">standard lots</p>

                                    {/* Risk statement */}
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-300 ${isHighRisk
                                        ? "bg-neon-red/[0.05] border-neon-red/20"
                                        : "bg-neon-green/[0.05] border-neon-green/20"
                                        }`}>
                                        <Shield className={`h-3.5 w-3.5 ${isHighRisk ? "text-neon-red" : "text-neon-green"}`} />
                                        <p className={`text-xs font-semibold font-mono ${isHighRisk ? "text-neon-red" : "text-neon-green"}`}>
                                            Risking <span className="font-black">${result.riskAmount.toFixed(2)}</span>
                                        </p>
                                    </div>

                                    {isHighRisk && (
                                        <p className="text-[10px] text-neon-red font-medium animate-fade-in">
                                            ⚠ Risk exceeds 2%
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Quick stats row */}
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="p-2 rounded-lg border border-surface-500/15 bg-surface-800/30">
                                    <p className="text-[9px] uppercase tracking-widest text-gray-600 font-mono">Pips</p>
                                    <p className="text-sm font-bold font-mono text-neon-blue">{result.pipCount}</p>
                                </div>
                                <div className="p-2 rounded-lg border border-surface-500/15 bg-surface-800/30">
                                    <p className="text-[9px] uppercase tracking-widest text-gray-600 font-mono">Mini</p>
                                    <p className="text-sm font-bold font-mono text-gray-300">{(result.lotSize * 10).toFixed(2)}</p>
                                </div>
                                <div className="p-2 rounded-lg border border-surface-500/15 bg-surface-800/30">
                                    <p className="text-[9px] uppercase tracking-widest text-gray-600 font-mono">Micro</p>
                                    <p className="text-sm font-bold font-mono text-gray-300">{(result.lotSize * 100).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t border-surface-500/20">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white border border-surface-500/20 hover:border-surface-500/40 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApply}
                        disabled={!isValid}
                        className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all duration-300 border ${isValid
                            ? "bg-neon-green/10 text-neon-green border-neon-green/25 hover:bg-neon-green/20 shadow-[0_0_15px_rgba(0,255,136,0.08)]"
                            : "text-gray-600 border-surface-500/20 cursor-not-allowed"
                            }`}
                    >
                        <Check className="h-3.5 w-3.5" />
                        Apply Lot Size
                    </button>
                </div>
            </div>
        </div>
    );
}
