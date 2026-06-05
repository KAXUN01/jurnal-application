"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
    Brain,
    Filter,
    Target,
    ShieldCheck,
    AlertTriangle,
    Zap,
    TrendingUp,
    Send,
    Activity,
    LineChart,
    CheckCircle2,
    XCircle,
    Info,
    Crosshair,
    Lightbulb
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

// ─── Dummy Data for Charts ──────────────────────────────────────────
const MOCK_EQUITY_DATA = [
    { name: "Week 1", value: 10000 },
    { name: "Week 2", value: 10250 },
    { name: "Week 3", value: 10100 },
    { name: "Week 4", value: 10600 },
    { name: "Week 5", value: 10450 },
    { name: "Week 6", value: 11200 },
    { name: "Week 7", value: 11000 },
    { name: "Week 8", value: 11800 },
];

// ─── Types ─────────────────────────────────────────────────────────

type AIAnalysisResponse = {
    qualityScore: { total: number, entry: number, risk: number, psychology: number, management: number, compliance: number };
    executiveSummary: { text: string, execution: string, driver: string };
    compliance: { rule: string, status: "followed" | "partially" | "violated" }[];
    complianceNote?: string;
    psychology: { tags: string[], analysis: string };
    risk: { avgRisk: string, rrQuality: string, warning: string | null };
    patterns: { winning: string[], losing: string[] };
    improvementPlan: { rank: number, text: string, impact: string }[];
    profile: { title: string, badges: string[], strengths: string, weaknesses: string };
    insights: string[];
};

// ─── Reusable Components ───────────────────────────────────────────

function InsightCard({ text }: { text: string }) {
    return (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-800/50 border border-neon-purple/20 shadow-glow-purple/10 hover:border-neon-purple/40 transition-colors animate-fade-in">
            <div className="p-2 rounded-lg bg-neon-purple/10 text-neon-purple shrink-0 mt-0.5">
                <Lightbulb className="h-4 w-4" />
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{text}</p>
        </div>
    );
}

function SectionHeader({ title, icon: Icon, color }: { title: string, icon: any, color: "green" | "purple" | "blue" | "yellow" | "red" | "cyan" }) {
    const colorClasses = {
        green: "text-neon-green bg-neon-green/10 border-neon-green/20",
        purple: "text-neon-purple bg-neon-purple/10 border-neon-purple/20",
        blue: "text-neon-blue bg-neon-blue/10 border-neon-blue/20",
        yellow: "text-neon-yellow bg-neon-yellow/10 border-neon-yellow/20",
        red: "text-neon-red bg-neon-red/10 border-neon-red/20",
        cyan: "text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20",
    };

    return (
        <div className="flex items-center gap-3 mb-6">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${colorClasses[color]}`}>
                <Icon className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-wide font-mono uppercase">{title}</h2>
        </div>
    );
}

// ─── Main Page Component ───────────────────────────────────────────

export default function AICoachPage() {
    // Filter States
    const [dateRange, setDateRange] = useState("all");
    const [symbol, setSymbol] = useState("all");
    const [strategy, setStrategy] = useState("all");
    const [winLoss, setWinLoss] = useState("all");
    const [session, setSession] = useState("all");
    const [analysisTarget, setAnalysisTarget] = useState<string>("Analyze Selected Trade");

    // UI States
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isChatting, setIsChatting] = useState(false);
    const [analysisData, setAnalysisData] = useState<AIAnalysisResponse | null>(null);

    // Chat States
    const [chatInput, setChatInput] = useState("");
    const [chatMessages, setChatMessages] = useState([
        { role: "assistant", content: "Hello! I am ready to analyze your trades. Run an analysis on the left, or ask me a question here." }
    ]);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        try {
            const response = await fetch("/api/ai-coach/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    dateRange, symbol, strategy, winLoss, session, analysisTarget
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Failed to analyze");
            }

            const data = await response.json();
            setAnalysisData(data);

            // Add a chat message to acknowledge
            setChatMessages(prev => [
                ...prev,
                { role: "assistant", content: "I have completed the analysis and updated your dashboard with my findings. Feel free to ask me for more details." }
            ]);

        } catch (error: any) {
            console.error(error);
            alert(`Error running analysis: ${error.message || error}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || isChatting) return;

        const userMsg = chatInput;
        setChatMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setChatInput("");
        setIsChatting(true);

        try {
            const response = await fetch("/api/ai-coach/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMsg,
                    history: chatMessages
                })
            });

            if (!response.ok) throw new Error("Failed to get chat response");

            const data = await response.json();
            setChatMessages(prev => [...prev, { role: "assistant", content: data.response }]);

        } catch (error: any) {
            console.error(error);
            setChatMessages(prev => [...prev, { role: "assistant", content: `Error: ${error.message || "Failed to connect to AI"}` }]);
        } finally {
            setIsChatting(false);
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto pb-12 animate-fade-in">
            {/* ─── Header ────────────────────────────────────────────── */}
            <div className="flex items-center gap-4 mb-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neon-purple/10 border border-neon-purple/30 relative overflow-hidden shadow-glow-purple">
                    <div className="absolute inset-0 bg-neon-purple/20 blur-xl rounded-full" />
                    <Brain className="h-7 w-7 text-neon-purple relative z-10" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-blue tracking-tight">
                        AI Trading Coach
                    </h1>
                    <p className="text-gray-400 mt-1">Your personal trading mentor and performance analyzer</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* ─── Left Panel: Trade Selection (Col span 3) ───────── */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="glass-card rounded-2xl p-6 border border-white/5 sticky top-24">
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">
                            <Filter className="h-4 w-4" />
                            Data Selection
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs text-gray-500 font-mono">Date Range</label>
                                <Select value={dateRange} onChange={e => setDateRange(e.target.value)}>
                                    <option value="all">All Time</option>
                                    <option value="today">Today</option>
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-gray-500 font-mono">Symbol</label>
                                <Select value={symbol} onChange={e => setSymbol(e.target.value)}>
                                    <option value="all">All Pairs</option>
                                    <option value="XAUUSD">XAUUSD</option>
                                    <option value="EURUSD">EURUSD</option>
                                    <option value="GBPUSD">GBPUSD</option>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-gray-500 font-mono">Strategy</label>
                                <Select value={strategy} onChange={e => setStrategy(e.target.value)}>
                                    <option value="all">All Strategies</option>
                                    <option value="msnr">MSNR</option>
                                    <option value="pa">Price Action</option>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-gray-500 font-mono">Win/Loss</label>
                                <Select value={winLoss} onChange={e => setWinLoss(e.target.value)}>
                                    <option value="all">All Outcomes</option>
                                    <option value="win">Wins Only</option>
                                    <option value="loss">Losses Only</option>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-gray-500 font-mono">Session</label>
                                <Select value={session} onChange={e => setSession(e.target.value)}>
                                    <option value="all">All Sessions</option>
                                    <option value="london">London</option>
                                    <option value="ny">New York</option>
                                    <option value="asian">Asian</option>
                                </Select>
                            </div>

                            <div className="pt-4 border-t border-surface-600/50">
                                <label className="text-xs text-gray-500 font-mono block mb-3">Analysis Target</label>
                                <div className="space-y-2">
                                    {[
                                        "Analyze Selected Trade",
                                        "Analyze Current Week",
                                        "Analyze Current Month",
                                        "Analyze Last 3 Months",
                                        "Analyze Entire Account"
                                    ].map((opt) => (
                                        <label 
                                            key={opt} 
                                            onClick={() => setAnalysisTarget(opt)}
                                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${analysisTarget === opt ? "bg-neon-purple/10 border-neon-purple/30" : "bg-surface-800/50 border-surface-600/30 hover:border-surface-500"}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${analysisTarget === opt ? "border-neon-purple" : "border-gray-500"}`}>
                                                {analysisTarget === opt && <div className="w-2 h-2 rounded-full bg-neon-purple" />}
                                            </div>
                                            <span className={`text-sm ${analysisTarget === opt ? "text-neon-purple font-medium" : "text-gray-400"}`}>{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue text-white font-bold uppercase tracking-widest hover:opacity-90 transition-opacity shadow-glow-purple disabled:opacity-50"
                            >
                                {isAnalyzing ? "Analyzing Data..." : "Run AI Analysis"}
                                {!isAnalyzing && <Zap className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ─── Right Panel: Analysis Results (Col span 9) ─────── */}
                <div className="lg:col-span-9 space-y-8">
                    {!analysisData ? (
                        <div className="glass-card rounded-2xl p-12 text-center border border-white/5 flex flex-col items-center justify-center h-[500px]">
                            <div className="w-20 h-20 rounded-full bg-neon-purple/10 flex items-center justify-center mb-6 border border-neon-purple/20 shadow-glow-purple">
                                <Brain className="h-10 w-10 text-neon-purple" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Awaiting Analysis</h2>
                            <p className="text-gray-400 max-w-md">
                                Adjust your filters on the left and click "Run AI Analysis" to generate comprehensive insights from your trading data using our advanced neural network.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Top Stats Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Trade Quality Score */}
                                <div className="glass-card rounded-2xl p-6 border border-white/5 relative overflow-hidden">
                                    <SectionHeader title="Trade Quality Score" icon={Target} color="green" />
                                    <div className="flex flex-col md:flex-row items-center gap-8">
                                        <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                                            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                                                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                                <circle cx="50" cy="50" r="45" fill="none" stroke="url(#gradient)" strokeWidth="8" strokeDasharray="283" strokeDashoffset={283 - (283 * analysisData.qualityScore.total) / 100} className="transition-all duration-1000" />
                                                <defs>
                                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                        <stop offset="0%" stopColor="#00ff88" />
                                                        <stop offset="100%" stopColor="#3b82f6" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-4xl font-black font-mono text-gradient-green">{analysisData.qualityScore.total}</span>
                                                <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">/ 100</span>
                                            </div>
                                            <div className="absolute -bottom-2 text-sm font-bold text-neon-green bg-neon-green/10 px-3 py-1 rounded-full border border-neon-green/20">
                                                {analysisData.qualityScore.total >= 90 ? "Excellent" : analysisData.qualityScore.total >= 70 ? "Good" : analysisData.qualityScore.total >= 50 ? "Average" : "Poor"}
                                            </div>
                                        </div>
                                        <div className="flex-1 w-full space-y-3">
                                            {[
                                                { label: "Entry Quality", score: analysisData.qualityScore.entry },
                                                { label: "Risk Management", score: analysisData.qualityScore.risk },
                                                { label: "Psychology", score: analysisData.qualityScore.psychology },
                                                { label: "Trade Management", score: analysisData.qualityScore.management },
                                                { label: "Strategy Compliance", score: analysisData.qualityScore.compliance },
                                            ].map(item => (
                                                <div key={item.label} className="space-y-1">
                                                    <div className="flex justify-between text-xs font-mono">
                                                        <span className="text-gray-400">{item.label}</span>
                                                        <span className="text-white font-bold">{item.score}</span>
                                                    </div>
                                                    <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
                                                        <div className="h-full bg-gradient-to-r from-neon-blue to-neon-green rounded-full" style={{ width: `${item.score}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Executive Summary */}
                                <div className="glass-card rounded-2xl p-6 border border-white/5">
                                    <SectionHeader title="Executive Summary" icon={Info} color="blue" />
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-600">
                                            <p className="text-sm text-gray-300 leading-relaxed">
                                                "{analysisData.executiveSummary.text}"
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 rounded-xl bg-surface-800/50 border border-surface-600">
                                                <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Execution</span>
                                                <span className="text-sm font-semibold text-neon-yellow">{analysisData.executiveSummary.execution}</span>
                                            </div>
                                            <div className="p-3 rounded-xl bg-surface-800/50 border border-surface-600">
                                                <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Outcome Driver</span>
                                                <span className="text-sm font-semibold text-neon-blue">{analysisData.executiveSummary.driver}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Middle Analysis Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Rule Compliance */}
                                <div className="glass-card rounded-2xl p-6 border border-white/5">
                                    <SectionHeader title="Rule Compliance" icon={ShieldCheck} color="green" />
                                    <div className="space-y-3">
                                        {analysisData.compliance.map((item, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-800/50 border border-surface-600/50">
                                                <span className="text-sm text-gray-300">{item.rule}</span>
                                                {item.status.toLowerCase() === "followed" && <span className="flex items-center gap-1.5 text-xs text-neon-green font-medium"><CheckCircle2 className="h-4 w-4" /> Followed</span>}
                                                {item.status.toLowerCase() === "partially" && <span className="flex items-center gap-1.5 text-xs text-neon-yellow font-medium"><AlertTriangle className="h-4 w-4" /> Partially</span>}
                                                {item.status.toLowerCase() === "violated" && <span className="flex items-center gap-1.5 text-xs text-neon-red font-medium"><XCircle className="h-4 w-4" /> Violated</span>}
                                            </div>
                                        ))}
                                        {analysisData.complianceNote && (
                                            <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                                                <strong className="text-white">AI Note:</strong> {analysisData.complianceNote}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Psychology Analysis */}
                                <div className="glass-card rounded-2xl p-6 border border-white/5">
                                    <SectionHeader title="Psychology" icon={Brain} color="purple" />
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {analysisData.psychology.tags.map(tag => (
                                            <span key={tag} className="px-3 py-1 rounded-full bg-neon-red/10 text-neon-red border border-neon-red/20 text-xs font-medium">
                                                {tag} Detected
                                            </span>
                                        ))}
                                    </div>
                                    <div className="p-4 rounded-xl bg-surface-800/50 border border-neon-purple/20">
                                        <p className="text-sm text-gray-300 leading-relaxed">
                                            "{analysisData.psychology.analysis}"
                                        </p>
                                    </div>
                                </div>

                                {/* Risk Management */}
                                <div className="glass-card rounded-2xl p-6 border border-white/5">
                                    <SectionHeader title="Risk Profile" icon={AlertTriangle} color="yellow" />
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 rounded-xl bg-surface-800/50 border border-surface-600">
                                                <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Avg Risk</span>
                                                <span className="text-lg font-bold text-white">{analysisData.risk.avgRisk}</span>
                                            </div>
                                            <div className="p-3 rounded-xl bg-surface-800/50 border border-surface-600">
                                                <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">RR Quality</span>
                                                <span className={`text-lg font-bold ${analysisData.risk.rrQuality.toLowerCase() === 'high' ? 'text-neon-green' : analysisData.risk.rrQuality.toLowerCase() === 'low' ? 'text-neon-red' : 'text-neon-yellow'}`}>
                                                    {analysisData.risk.rrQuality}
                                                </span>
                                            </div>
                                        </div>
                                        {analysisData.risk.warning && (
                                            <div className="p-3 rounded-xl bg-neon-red/5 border border-neon-red/20">
                                                <span className="text-xs font-semibold text-neon-red flex items-center gap-2 mb-1">
                                                    <AlertTriangle className="h-3 w-3" /> Warning
                                                </span>
                                                <p className="text-xs text-gray-400">{analysisData.risk.warning}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Pattern Detection & Recommendations */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="glass-card rounded-2xl p-6 border border-white/5">
                                    <SectionHeader title="Pattern Detection" icon={Activity} color="cyan" />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-bold text-neon-green uppercase tracking-widest">Winning Patterns</h4>
                                            <ul className="space-y-2">
                                                {analysisData.patterns.winning.map((pat, i) => (
                                                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                                        <span className="text-neon-green mt-1">•</span> {pat}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-bold text-neon-red uppercase tracking-widest">Losing Patterns</h4>
                                            <ul className="space-y-2">
                                                {analysisData.patterns.losing.map((pat, i) => (
                                                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                                        <span className="text-neon-red mt-1">•</span> {pat}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-card rounded-2xl p-6 border border-white/5">
                                    <SectionHeader title="Improvement Plan" icon={TrendingUp} color="green" />
                                    <div className="space-y-4">
                                        {analysisData.improvementPlan.map(item => (
                                            <div key={item.rank} className="flex items-center gap-4 p-3 rounded-xl bg-surface-800/50 border border-surface-600/50 hover:border-neon-green/30 transition-colors">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-700 text-white font-bold font-mono border border-surface-600 shrink-0">
                                                    {item.rank}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-white">{item.text}</p>
                                                    <p className="text-xs text-neon-green font-mono mt-0.5">Expected Impact: {item.impact}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Personality & Insights */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1 glass-card rounded-2xl p-6 border border-white/5">
                                    <SectionHeader title="Trader Profile" icon={Crosshair} color="blue" />
                                    <div className="text-center py-4">
                                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neon-blue/10 border-2 border-neon-blue/30 shadow-glow-blue mb-4">
                                            <Crosshair className="h-10 w-10 text-neon-blue" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">{analysisData.profile.title}</h3>
                                        <div className="flex flex-wrap justify-center gap-2">
                                            {analysisData.profile.badges.map(b => (
                                                <Badge key={b} variant="secondary" className="bg-surface-800">{b}</Badge>
                                            ))}
                                        </div>
                                        <div className="mt-6 text-left space-y-3">
                                            <div>
                                                <span className="text-[10px] uppercase tracking-widest text-gray-500 block mb-1">Strengths</span>
                                                <p className="text-xs text-gray-300">{analysisData.profile.strengths}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] uppercase tracking-widest text-gray-500 block mb-1">Weaknesses</span>
                                                <p className="text-xs text-gray-300">{analysisData.profile.weaknesses}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2 glass-card rounded-2xl p-6 border border-white/5">
                                    <SectionHeader title="AI Insights" icon={Lightbulb} color="purple" />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {analysisData.insights.map((insight, i) => (
                                            <InsightCard key={i} text={insight} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* AI Coach Chat always available */}
                    <div className="glass-card rounded-2xl overflow-hidden border border-white/5 flex flex-col h-[500px]">
                        <div className="p-4 border-b border-white/5 bg-surface-800/80 backdrop-blur-xl flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue flex items-center justify-center shadow-glow-purple">
                                <Brain className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">AI Coach Chat</h3>
                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                    <div className={`w-1.5 h-1.5 rounded-full ${isChatting ? 'bg-neon-yellow' : 'bg-neon-green animate-pulse'}`} />
                                    {isChatting ? 'Thinking...' : 'Online & Ready'}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-surface-900/50">
                            {chatMessages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${msg.role === "user" ? "bg-neon-blue text-white rounded-br-none" : "bg-surface-700/80 border border-white/5 text-gray-200 rounded-bl-none"}`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 bg-surface-800/80 border-t border-white/5">
                            <form onSubmit={handleChatSubmit} className="relative">
                                <Input
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Ask your coach anything..."
                                    className="w-full bg-surface-900 border-surface-600 rounded-xl pr-12 py-6 text-sm"
                                    disabled={isChatting}
                                />
                                <button
                                    type="submit"
                                    disabled={isChatting}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-lg bg-neon-purple/10 text-neon-purple hover:bg-neon-purple/20 transition-colors disabled:opacity-50"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
