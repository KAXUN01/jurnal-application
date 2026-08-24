"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { X, Save, ArrowRight } from "lucide-react";

interface TradeEntry {
    id: string;
    pair: string;
    tradeType: string;
    tradeDirection?: string;
    date: string;
    time?: string;
    entryExecutionTime?: string;
    entryPrice: string;
    stopLoss: string;
    takeProfit: string;
    exitPrice?: string;
    rrRatio: number;
    lotSize?: string;
    tradeDuration?: string;
    outcome: string;
    profitLoss: string;
    profitLossPercent?: string;
    beforeTrade?: string;
    duringTrade?: string;
    afterTrade?: string;
    reasonForTrade?: string;
    goodBehavior?: string;
    badBehavior?: string;
    beforeScreenshot?: string;
    afterScreenshot?: string;
    screenshots?: string;
    tags?: string;
    accountId?: string;
    followedRules?: boolean | null;
}

interface EditTradeModalProps {
    trade: TradeEntry | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (trade: TradeEntry) => Promise<void>;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
            {children}
        </label>
    );
}

const parseJsonArray = (value: string | undefined) => {
    if (!value) return [] as string[];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [] as string[];
    }
};

export default function EditTradeModal({ trade, isOpen, onClose, onSave }: EditTradeModalProps) {
    const [form, setForm] = useState<TradeEntry | null>(trade);
    const [isSaving, setIsSaving] = useState(false);
    const [screenshotUrl, setScreenshotUrl] = useState("");
    const [tagInput, setTagInput] = useState("");

    if (trade && form?.id !== trade.id) {
        setForm(trade);
    }

    const formScreenshots = form?.screenshots;
    const formTags = form?.tags;

    const screenshots = useMemo(() => parseJsonArray(formScreenshots), [formScreenshots]);
    const tags = useMemo(() => parseJsonArray(formTags), [formTags]);

    const editEntryPrice = form?.entryPrice ?? "";
    const editStopLoss = form?.stopLoss ?? "";
    const editTakeProfit = form?.takeProfit ?? "";

    const rrRatio = useMemo(() => {
        const entry = parseFloat(editEntryPrice);
        const sl = parseFloat(editStopLoss);
        const tp = parseFloat(editTakeProfit);
        if (isNaN(entry) || isNaN(sl) || isNaN(tp) || entry === sl) return null;
        const risk = Math.abs(entry - sl);
        const reward = Math.abs(tp - entry);
        if (risk === 0) return null;
        return parseFloat((reward / risk).toFixed(2));
    }, [editEntryPrice, editStopLoss, editTakeProfit]);

    const handleSave = async () => {
        if (!form) return;
        setIsSaving(true);
        try {
            await onSave({
                ...form,
                rrRatio: rrRatio ?? form.rrRatio,
                screenshots: JSON.stringify(screenshots),
                tags: JSON.stringify(tags),
            });
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    const set = (key: string, value: string | number | boolean | null) =>
        setForm((prev) => (prev ? { ...prev, [key]: value } : null));

    if (!isOpen || !form) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <Card className="border-neon-blue/20">
                    <CardHeader>
                        <div className="flex items-center justify-between gap-3">
                            <CardTitle className="flex flex-col gap-1">
                                <span>Edit Trade</span>
                                <span className="text-xs text-gray-500 font-mono">
                                    {form.pair} • {form.date}
                                </span>
                            </CardTitle>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-surface-700 transition-colors"
                            >
                                <X className="h-4 w-4 text-gray-400" />
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div>
                                <FieldLabel>Pair</FieldLabel>
                                <Select value={form.pair} onChange={(e) => set("pair", e.target.value)}>
                                    <option value="">Select pair...</option>
                                    <option value="EURUSD">EURUSD</option>
                                    <option value="GBPUSD">GBPUSD</option>
                                    <option value="AUDUSD">AUDUSD</option>
                                    <option value="USDJPY">USDJPY</option>
                                    <option value="XAUUSD">XAUUSD</option>
                                    <option value="BTCUSD">BTCUSD</option>
                                    <option value="US500">US500</option>
                                </Select>
                            </div>
                            <div>
                                <FieldLabel>Direction</FieldLabel>
                                <Select value={form.tradeDirection || ""} onChange={(e) => set("tradeDirection", e.target.value)}>
                                    <option value="">Select...</option>
                                    <option value="Long">Long</option>
                                    <option value="Short">Short</option>
                                </Select>
                            </div>
                            <div>
                                <FieldLabel>Trade Type</FieldLabel>
                                <Select value={form.tradeType} onChange={(e) => set("tradeType", e.target.value)}>
                                    <option value="">Select type...</option>
                                    <option value="MSNR">MSNR</option>
                                    <option value="Price Action">Price Action</option>
                                    <option value="Supply Demand">Supply Demand</option>
                                </Select>
                            </div>
                            <div>
                                <FieldLabel>Followed Rules (SOP)</FieldLabel>
                                <Select
                                    value={form.followedRules === true ? "Yes" : form.followedRules === false ? "No" : ""}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        set("followedRules", val === "Yes" ? true : val === "No" ? false : null);
                                    }}
                                >
                                    <option value="">Select...</option>
                                    <option value="Yes">Yes (Followed)</option>
                                    <option value="No">No (Rule Break)</option>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <FieldLabel>Date</FieldLabel>
                                <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
                            </div>
                            <div>
                                <FieldLabel>Entry Execution Time</FieldLabel>
                                <Input type="time" value={form.entryExecutionTime || ""} onChange={(e) => set("entryExecutionTime", e.target.value)} />
                            </div>
                            <div>
                                <FieldLabel>Outcome</FieldLabel>
                                <Select value={form.outcome} onChange={(e) => set("outcome", e.target.value)}>
                                    <option value="">Select outcome...</option>
                                    <option value="Win">Win</option>
                                    <option value="Loss">Loss</option>
                                    <option value="BE">Break Even</option>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div>
                                <FieldLabel>Entry Price</FieldLabel>
                                <Input value={form.entryPrice} onChange={(e) => set("entryPrice", e.target.value)} placeholder="0.00000" />
                            </div>
                            <div>
                                <FieldLabel>Stop Loss</FieldLabel>
                                <Input value={form.stopLoss} onChange={(e) => set("stopLoss", e.target.value)} placeholder="0.00000" />
                            </div>
                            <div>
                                <FieldLabel>Take Profit</FieldLabel>
                                <Input value={form.takeProfit} onChange={(e) => set("takeProfit", e.target.value)} placeholder="0.00000" />
                            </div>
                            <div>
                                <FieldLabel>Exit Price</FieldLabel>
                                <Input value={form.exitPrice || ""} onChange={(e) => set("exitPrice", e.target.value)} placeholder="0.00000" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <FieldLabel>Lot Size</FieldLabel>
                                <Input value={form.lotSize || ""} onChange={(e) => set("lotSize", e.target.value)} placeholder="0.00" />
                            </div>
                            <div>
                                <FieldLabel>Duration</FieldLabel>
                                <Input value={form.tradeDuration || ""} onChange={(e) => set("tradeDuration", e.target.value)} placeholder="e.g. 2h 15m" />
                            </div>
                            <div>
                                <FieldLabel>Profit / Loss %</FieldLabel>
                                <Input value={form.profitLossPercent || ""} onChange={(e) => set("profitLossPercent", e.target.value)} placeholder="0.00%" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <FieldLabel>Profit / Loss</FieldLabel>
                                <Input value={form.profitLoss} onChange={(e) => set("profitLoss", e.target.value)} placeholder="0.00" />
                            </div>
                            <div className="flex h-full items-end">
                                <div className="w-full rounded-xl border border-surface-500/20 bg-surface-900/50 px-4 py-3">
                                    <div className="text-xs text-gray-400 uppercase tracking-wider">RR Ratio</div>
                                    <div className="mt-2 text-lg font-bold text-white">{rrRatio !== null ? `${rrRatio}R` : "—"}</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <FieldLabel>Before Trade</FieldLabel>
                                <Textarea value={form.beforeTrade || ""} onChange={(e) => set("beforeTrade", e.target.value)} placeholder="Why did I enter?" className="min-h-[110px]" />
                            </div>
                            <div>
                                <FieldLabel>During Trade</FieldLabel>
                                <Textarea value={form.duringTrade || ""} onChange={(e) => set("duringTrade", e.target.value)} placeholder="What was I feeling?" className="min-h-[110px]" />
                            </div>
                        </div>

                        <div>
                            <FieldLabel>After Trade</FieldLabel>
                            <Textarea value={form.afterTrade || ""} onChange={(e) => set("afterTrade", e.target.value)} placeholder="Lessons learned" className="min-h-[110px]" />
                        </div>

                        <div className="grid grid-cols-1 gap-4 pt-4 border-t border-surface-500/20">
                            <div>
                                <FieldLabel>Reason For Trade (Why I took it)</FieldLabel>
                                <Textarea value={form.reasonForTrade || ""} onChange={(e) => set("reasonForTrade", e.target.value)} placeholder="What was your conviction or edge for taking this trade?" />
                            </div>
                            <div>
                                <FieldLabel>Good Behavior</FieldLabel>
                                <Textarea value={form.goodBehavior || ""} onChange={(e) => set("goodBehavior", e.target.value)} placeholder="What did you do well? (e.g. Followed rules, let winner run)" />
                            </div>
                            <div>
                                <FieldLabel>Bad Behavior</FieldLabel>
                                <Textarea value={form.badBehavior || ""} onChange={(e) => set("badBehavior", e.target.value)} placeholder="What mistakes did you make? (e.g. FOMO, moved stop loss)" />
                            </div>
                        </div>

                        {/* Before/After Screenshot URL inputs removed per request */}

                        <div>
                            <FieldLabel>Add Screenshot URL</FieldLabel>
                            <div className="flex gap-2">
                                <Input value={screenshotUrl} onChange={(e) => setScreenshotUrl(e.target.value)} placeholder="Paste screenshot URL" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const url = screenshotUrl.trim();
                                        if (!url) return;
                                        const next = [...screenshots, url];
                                        set("screenshots", JSON.stringify(next));
                                        setScreenshotUrl("");
                                    }}
                                    className="rounded-xl bg-neon-green/10 text-neon-green px-4 py-2"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        {screenshots.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {screenshots.map((src, idx) => (
                                    <div key={idx} className="group relative rounded-lg overflow-hidden border border-surface-500/20">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={src} alt={`Screenshot ${idx + 1}`} className="w-full h-24 object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const next = screenshots.filter((_, i) => i !== idx);
                                                set("screenshots", JSON.stringify(next));
                                            }}
                                            className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                            <div className="sm:col-span-2">
                                <FieldLabel>Tags</FieldLabel>
                                <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add custom tag" />
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    const tag = tagInput.trim();
                                    if (!tag) return;
                                    const next = Array.from(new Set([...tags, tag]));
                                    set("tags", JSON.stringify(next));
                                    setTagInput("");
                                }}
                                className="rounded-xl bg-neon-green/10 text-neon-green px-4 py-2"
                            >
                                Add Tag
                            </button>
                        </div>

                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                            const next = tags.filter((_, i) => i !== idx);
                                            set("tags", JSON.stringify(next));
                                        }}
                                        className="rounded-full border border-surface-500/30 px-3 py-2 text-xs text-gray-300"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center gap-3 pt-4 border-t border-surface-500/20">
                            <button
                                onClick={onClose}
                                type="button"
                                className="px-4 py-2 rounded-lg text-xs font-semibold border border-surface-500/30 text-gray-400 hover:text-gray-300 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="ml-auto inline-flex items-center gap-2 rounded-xl bg-neon-green/10 text-neon-green px-4 py-2 text-xs font-semibold border border-neon-green/30 hover:bg-neon-green/20 disabled:opacity-50"
                            >
                                <Save className="h-4 w-4" />
                                {isSaving ? "Saving..." : "Save Changes"}
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
