"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PositionCalcModal } from "@/components/calculator-modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Target, Upload, Save, ArrowRight } from "lucide-react";

function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
            {children}
        </label>
    );
}

export default function JournalPage() {
    const [calcModalOpen, setCalcModalOpen] = useState(false);
    const [screenshotUrl, setScreenshotUrl] = useState("");
    const [form, setForm] = useState(() => ({
        pair: "",
        tradeDirection: "",
        tradeType: "",
        date: new Date().toISOString().slice(0, 10),
        time: "",
        entryExecutionTime: "",
        entryPrice: "",
        stopLoss: "",
        takeProfit: "",
        exitPrice: "",
        lotSize: "",
        tradeDuration: "",
        outcome: "",
        profitLoss: "",
        profitLossPercent: "",
        beforeTrade: "",
        duringTrade: "",
        afterTrade: "",
        beforeScreenshot: "",
        afterScreenshot: "",
        screenshots: [] as string[],
        tags: [] as string[],
        tagInput: "",
    }));

    const set = (key: string, value: string | string[] | number | boolean | null) => setForm((prev) => ({ ...prev, [key]: value }));

    const rrRatio = useMemo(() => {
        const entry = parseFloat(form.entryPrice as string);
        const sl = parseFloat(form.stopLoss as string);
        const tp = parseFloat(form.takeProfit as string);
        if (isNaN(entry) || isNaN(sl) || isNaN(tp) || entry === sl) return null;
        const risk = Math.abs(entry - sl);
        const reward = Math.abs(tp - entry);
        if (risk === 0) return null;
        return parseFloat((reward / risk).toFixed(2));
    }, [form.entryPrice, form.stopLoss, form.takeProfit]);

    const screenshotList = Array.isArray(form.screenshots) ? form.screenshots : [];
    const isFormValid = Boolean(form.pair && form.entryPrice && form.stopLoss);

    const handleSubmit = async () => {
        try {
            const res = await fetch("/api/trades", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, rrRatio, screenshots: screenshotList }),
            });
            if (!res.ok) throw new Error("Failed to save");
            // reset minimal fields after save
            setForm((prev) => ({ ...prev, screenshots: [], tags: [], tagInput: "" }));
            alert("Saved");
        } catch (err) {
            console.error(err);
            alert("Save failed");
        }
    };

    return (
        <div className="space-y-4">
            <Card className="border-neon-blue/15">
                <CardHeader>
                    <CardTitle>Trade Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <FieldLabel>Pair</FieldLabel>
                            <Select value={form.pair} onChange={(e) => set("pair", e.target.value)}>
                                <option value="">Select pair...</option>
                                <option value="EURUSD">EURUSD</option>
                                <option value="GBPUSD">GBPUSD</option>
                                <option value="USDJPY">USDJPY</option>
                                <option value="XAUUSD">XAUUSD</option>
                                <option value="BTCUSD">BTCUSD</option>
                            </Select>
                        </div>
                        <div>
                            <FieldLabel>Date</FieldLabel>
                            <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
                        </div>
                        <div>
                            <FieldLabel>Direction</FieldLabel>
                            <Select value={form.tradeDirection} onChange={(e) => set("tradeDirection", e.target.value)}>
                                <option value="">Select...</option>
                                <option value="Long">Long</option>
                                <option value="Short">Short</option>
                            </Select>
                        </div>
                        <div>
                            <FieldLabel>Strategy</FieldLabel>
                            <Select value={form.tradeType} onChange={(e) => set("tradeType", e.target.value)}>
                                <option value="">Select strategy...</option>
                                <option value="MSNR">MSNR</option>
                                <option value="Price Action">Price Action</option>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Position Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <FieldLabel>Entry Price</FieldLabel>
                            <Input value={form.entryPrice} onChange={(e) => set("entryPrice", e.target.value)} placeholder="0.00000" />
                        </div>
                        <div>
                            <FieldLabel>Entry Execution Time</FieldLabel>
                            <Input type="time" value={form.entryExecutionTime} onChange={(e) => set("entryExecutionTime", e.target.value)} />
                        </div>
                        <div>
                            <FieldLabel>Stop Loss</FieldLabel>
                            <Input value={form.stopLoss} onChange={(e) => set("stopLoss", e.target.value)} placeholder="0.00000" />
                        </div>
                        <div>
                            <FieldLabel>Take Profit</FieldLabel>
                            <Input value={form.takeProfit} onChange={(e) => set("takeProfit", e.target.value)} placeholder="0.00000" />
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <FieldLabel>Exit Price</FieldLabel>
                            <Input value={form.exitPrice} onChange={(e) => set("exitPrice", e.target.value)} placeholder="0.00000" />
                        </div>
                        
                        <div>
                            <FieldLabel>Lot Size</FieldLabel>
                            <Input value={form.lotSize} onChange={(e) => set("lotSize", e.target.value)} placeholder="0.00" />
                        </div>
                        <div>
                            <FieldLabel>Trade Duration</FieldLabel>
                            <Input value={form.tradeDuration} onChange={(e) => set("tradeDuration", e.target.value)} placeholder="e.g. 2h 15m" />
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <FieldLabel>Outcome</FieldLabel>
                            <Select value={form.outcome} onChange={(e) => set("outcome", e.target.value)}>
                                <option value="">Select...</option>
                                <option value="Win">Win</option>
                                <option value="Loss">Loss</option>
                                <option value="Breakeven">Breakeven</option>
                            </Select>
                        </div>
                        <div>
                            <FieldLabel>Profit / Loss ($)</FieldLabel>
                            <Input value={form.profitLoss} onChange={(e) => set("profitLoss", e.target.value)} placeholder="e.g. +150 or -80" />
                        </div>
                        <div>
                            <FieldLabel>Profit / Loss (%)</FieldLabel>
                            <Input value={form.profitLossPercent} onChange={(e) => set("profitLossPercent", e.target.value)} placeholder="e.g. 2.5%" />
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Target className="h-5 w-5 text-gray-400" />
                            <div>
                                <div className="text-xs text-gray-400">Risk / Reward</div>
                                <div className="font-mono font-bold">{rrRatio !== null ? `${rrRatio}R` : "—"}</div>
                            </div>
                        </div>
                        <div className={`text-sm font-semibold ${
                            form.outcome === "Win" ? "text-emerald-400" : 
                            form.outcome === "Loss" ? "text-red-400" : 
                            form.outcome === "Breakeven" ? "text-yellow-400" : "text-gray-400"
                        }`}>
                            {form.outcome || "—"} {form.profitLoss ? `(${form.profitLoss})` : ""}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Psychology Journal</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <FieldLabel>Before Trade</FieldLabel>
                            <Textarea value={form.beforeTrade} onChange={(e) => set("beforeTrade", e.target.value)} />
                        </div>
                        <div>
                            <FieldLabel>During Trade</FieldLabel>
                            <Textarea value={form.duringTrade} onChange={(e) => set("duringTrade", e.target.value)} />
                        </div>
                        <div>
                            <FieldLabel>After Trade</FieldLabel>
                            <Textarea value={form.afterTrade} onChange={(e) => set("afterTrade", e.target.value)} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Trade Images</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Before/After Screenshot URL inputs removed per request */}

                    <div className="mt-4">
                        <FieldLabel>Add Screenshot URL</FieldLabel>
                        <div className="flex gap-2">
                            <Input value={screenshotUrl} onChange={(e) => setScreenshotUrl(e.target.value)} placeholder="Paste image URL" />
                            <button
                                type="button"
                                onClick={() => {
                                    if (screenshotUrl.trim()) {
                                        set("screenshots", [...form.screenshots, screenshotUrl.trim()]);
                                        setScreenshotUrl("");
                                    }
                                }}
                                className="px-4 py-2 rounded-xl bg-neon-green/10 text-neon-green"
                            >
                                <Upload className="h-4 w-4 inline-block" /> Add
                            </button>
                        </div>
                    </div>

                    {screenshotList.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {screenshotList.map((s, i) => (
                                <div key={i} className="rounded overflow-hidden border">
                                    <img src={s} alt={`s-${i}`} className="w-full h-24 object-cover" />
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Tags & Submit</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                        <div className="sm:col-span-2">
                            <FieldLabel>Add custom tag</FieldLabel>
                            <Input value={form.tagInput} onChange={(e) => set("tagInput", e.target.value)} placeholder="Enter custom tag" />
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                const tag = String(form.tagInput).trim();
                                if (!tag) return;
                                if (!form.tags.includes(tag)) set("tags", [...form.tags, tag]);
                                set("tagInput", "");
                            }}
                            className="rounded-xl bg-neon-green/10 text-neon-green px-4 py-2"
                        >
                            Add Tag
                        </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                        {form.tags.map((t, i) => (
                            <div key={i} className="px-3 py-2 rounded-full border bg-surface-800/40">{t}</div>
                        ))}
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleSubmit}
                            disabled={!isFormValid}
                            className={`w-full flex items-center justify-center gap-3 rounded-xl py-4 px-6 text-sm font-bold uppercase tracking-widest transition-all duration-300 border ${isFormValid
                                ? "bg-neon-green/10 text-neon-green border-neon-green/30"
                                : "bg-surface-800/50 text-gray-600 border-surface-600/30"
                                }`}
                        >
                            <Save className="h-5 w-5" />
                            {isFormValid ? "Submit Trade Journal" : "Fill Required Fields to Submit"}
                            {isFormValid && <ArrowRight className="h-4 w-4" />}
                        </button>
                    </div>
                </CardContent>
            </Card>

            <PositionCalcModal
                open={calcModalOpen}
                onClose={() => setCalcModalOpen(false)}
                onApply={(lotSize) => set("lotSize", lotSize)}
                prefill={{ pair: form.pair, entryPrice: form.entryPrice, stopLoss: form.stopLoss }}
            />
        </div>
    );
}
