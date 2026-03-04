"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { X, Save, AlertTriangle, CheckCircle2 } from "lucide-react";

interface TradeEntry {
    id: string;
    pair: string;
    tradeType: string;
    date: string;
    time: string;
    bias1H: string;
    rangeType: string;
    poiType: string;
    entryPrice: string;
    stopLoss: string;
    takeProfit: string;
    rrRatio: number;
    lotSize: string;
    entryType: string;
    poiTapped: boolean | null;
    chochConfirmed: boolean | null;
    outcome: string;
    profitLoss: string;
    emotion: string;
    followedRules: boolean | null;
    mistakes: string;
    screenshots: string;
}

interface EditTradeModalProps {
    trade: TradeEntry | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (trade: TradeEntry) => Promise<void>;
}

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
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                    value === true
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
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                    value === false
                        ? "bg-neon-red/15 text-neon-red border-neon-red/30 shadow-[0_0_12px_rgba(255,59,92,0.15)]"
                        : "bg-transparent text-gray-600 border-surface-500/30 hover:text-gray-400 hover:border-surface-500/60"
                }`}
            >
                X
                NO
            </button>
        </div>
    );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
            {children}
        </label>
    );
}

export default function EditTradeModal({
    trade,
    isOpen,
    onClose,
    onSave,
}: EditTradeModalProps) {
    const [form, setForm] = useState<TradeEntry | null>(trade);
    const [isSaving, setIsSaving] = useState(false);

    // Update form when trade prop changes
    if (trade && form?.id !== trade.id) {
        setForm(trade);
    }

    const rrRatio = useMemo(() => {
        if (!form) return null;
        const entry = parseFloat(form.entryPrice);
        const sl = parseFloat(form.stopLoss);
        const tp = parseFloat(form.takeProfit);
        if (isNaN(entry) || isNaN(sl) || isNaN(tp) || entry === sl) return null;
        const risk = Math.abs(entry - sl);
        const reward = Math.abs(tp - entry);
        if (risk === 0) return null;
        return parseFloat((reward / risk).toFixed(2));
    }, [form?.entryPrice, form?.stopLoss, form?.takeProfit]);

    const handleSave = async () => {
        if (!form) return;
        setIsSaving(true);
        try {
            // Parse screenshots if it's a string
            let screenshots = [];
            if (typeof form.screenshots === "string") {
                try {
                    screenshots = JSON.parse(form.screenshots);
                } catch {
                    screenshots = [];
                }
            }

            await onSave({
                ...form,
                rrRatio: rrRatio ?? form.rrRatio,
                screenshots: JSON.stringify(screenshots),
            });
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen || !form) return null;

    const set = (key: string, value: string | boolean | null | number) =>
        setForm((p) => (p ? { ...p, [key]: value } : null));

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <Card className="border-neon-blue/20">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-3">
                                <span>Edit Trade</span>
                                <span className="text-xs text-gray-600 font-mono">
                                    {form.pair} • {form.date}
                                </span>
                            </CardTitle>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-surface-700 rounded-lg transition-colors"
                            >
                                <X className="h-4 w-4 text-gray-400" />
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Section 1: Entry Info */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                                Entry Information
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <FieldLabel>Pair</FieldLabel>
                                    <Select
                                        value={form.pair}
                                        onChange={(e) =>
                                            set("pair", e.target.value)
                                        }
                                    >
                                        <option value="">Select pair...</option>
                                        <option value="EU">
                                            EU (EUR/USD)
                                        </option>
                                        <option value="GU">
                                            GU (GBP/USD)
                                        </option>
                                        <option value="UJ">
                                            UJ (USD/JPY)
                                        </option>
                                        <option value="UF">
                                            UF (USD/CHF)
                                        </option>
                                        <option value="UCAD">
                                            UCAD (USD/CAD)
                                        </option>
                                        <option value="AU">
                                            AU (AUD/USD)
                                        </option>
                                    </Select>
                                </div>
                                <div>
                                    <FieldLabel>Trade Type</FieldLabel>
                                    <Select
                                        value={form.tradeType}
                                        onChange={(e) =>
                                            set("tradeType", e.target.value)
                                        }
                                    >
                                        <option value="">
                                            Select type...
                                        </option>
                                        <option value="15min PT">
                                            15min PT (Pro Trend)
                                        </option>
                                        <option value="CT">CT (Counter Trend)</option>
                                        <option value="ECT">
                                            ECT (Extreme CT)
                                        </option>
                                    </Select>
                                </div>
                                <div>
                                    <FieldLabel>Date</FieldLabel>
                                    <Input
                                        type="date"
                                        value={form.date}
                                        onChange={(e) =>
                                            set("date", e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Price Levels */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                                Price Levels
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <div>
                                    <FieldLabel>Entry Price</FieldLabel>
                                    <Input
                                        type="text"
                                        value={form.entryPrice}
                                        onChange={(e) =>
                                            set("entryPrice", e.target.value)
                                        }
                                        placeholder="1.0850"
                                    />
                                </div>
                                <div>
                                    <FieldLabel>Stop Loss</FieldLabel>
                                    <Input
                                        type="text"
                                        value={form.stopLoss}
                                        onChange={(e) =>
                                            set("stopLoss", e.target.value)
                                        }
                                        placeholder="1.0840"
                                    />
                                </div>
                                <div>
                                    <FieldLabel>Take Profit</FieldLabel>
                                    <Input
                                        type="text"
                                        value={form.takeProfit}
                                        onChange={(e) =>
                                            set("takeProfit", e.target.value)
                                        }
                                        placeholder="1.0870"
                                    />
                                </div>
                                <div>
                                    <FieldLabel>RR Ratio</FieldLabel>
                                    <Input
                                        type="text"
                                        value={
                                            rrRatio !== null ? `${rrRatio}R` : ""
                                        }
                                        readOnly
                                        className="bg-surface-800 opacity-60"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Trade Outcome */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                                Trade Outcome
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <FieldLabel>Outcome</FieldLabel>
                                    <Select
                                        value={form.outcome}
                                        onChange={(e) =>
                                            set("outcome", e.target.value)
                                        }
                                    >
                                        <option value="">Select outcome...</option>
                                        <option value="Win">Win</option>
                                        <option value="Loss">Loss</option>
                                        <option value="BE">Break Even</option>
                                    </Select>
                                </div>
                                <div>
                                    <FieldLabel>P&L</FieldLabel>
                                    <Input
                                        type="text"
                                        value={form.profitLoss}
                                        onChange={(e) =>
                                            set("profitLoss", e.target.value)
                                        }
                                        placeholder="100"
                                    />
                                </div>
                                <div>
                                    <FieldLabel>Emotion</FieldLabel>
                                    <Select
                                        value={form.emotion}
                                        onChange={(e) =>
                                            set("emotion", e.target.value)
                                        }
                                    >
                                        <option value="">Select emotion...</option>
                                        <option value="confident">
                                            Confident
                                        </option>
                                        <option value="nervous">Nervous</option>
                                        <option value="tired">Tired</option>
                                        <option value="frustrated">
                                            Frustrated
                                        </option>
                                        <option value="excited">Excited</option>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Rules & Mistakes */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                                Compliance
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <FieldLabel>Followed Rules?</FieldLabel>
                                    <ToggleButton
                                        value={form.followedRules}
                                        onChange={(val) =>
                                            set("followedRules", val)
                                        }
                                    />
                                </div>
                                <div>
                                    <FieldLabel>Mistakes / Notes</FieldLabel>
                                    <Textarea
                                        value={form.mistakes}
                                        onChange={(e) =>
                                            set("mistakes", e.target.value)
                                        }
                                        placeholder="What mistakes did you make?"
                                        className="min-h-[80px]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 pt-4 border-t border-surface-500/20">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg text-xs font-semibold border border-surface-500/30 text-gray-400 hover:text-gray-300 hover:border-surface-500/50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="ml-auto px-4 py-2 rounded-lg text-xs font-semibold bg-neon-green/10 text-neon-green border border-neon-green/30 hover:bg-neon-green/20 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                <Save className="h-3.5 w-3.5" />
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
