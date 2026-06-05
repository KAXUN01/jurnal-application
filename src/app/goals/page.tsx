"use client";

import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
    Target,
    Trophy,
    TrendingUp,
    ShieldCheck,
    Brain,
    Zap,
    Activity,
    CheckCircle2,
    CalendarDays,
    Award,
    AlertTriangle,
    BarChart3,
    Plus,
    X,
    Lightbulb,
    Flag,
    ArrowUpRight,
    ArrowDownRight,
    Flame
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────
type Goal = {
    id: string;
    title: string;
    category: "profit" | "consistency" | "risk" | "psychology" | "strategy" | string;
    targetValue: number;
    currentValue: number;
    unit: string;
    timeframe: string;
    startDate: string;
    endDate: string;
    priority: string;
    status: string;
    notes: string | null;
    createdAt: string;
};

type Habit = {
    id: string;
    name: string;
    category: string;
    date: string;
    completed: boolean;
};

type TradeEntry = {
    id: string;
    pair: string;
    tradeType: string;
    outcome: string;
    profitLoss: string;
    rrRatio: number;
    followedRules: boolean | null;
    date: string;
    mistakes: string;
};

const HABIT_LIST = [
    "Journal trades",
    "Review market",
    "Follow risk plan",
    "Daily reflection",
    "Weekly review",
    "No revenge trading"
];

// ─── Helper Components ───────────────────────────────────────────────
function CircularProgress({ value, max, color, size = 120, strokeWidth = 8 }: { value: number, max: number, color: string, size?: number, strokeWidth?: number }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const percent = Math.min(value / (max || 1), 1);
    const offset = circumference - percent * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg className="circular-progress absolute inset-0 w-full h-full">
                <circle
                    className="circular-progress-bg"
                    fill="none"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                />
                <circle
                    className="circular-progress-bar transition-all duration-1000 ease-out"
                    fill="none"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    stroke={color}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                <span className="text-xl font-bold" style={{ color }}>{Math.round(percent * 100)}%</span>
            </div>
        </div>
    );
}

function KPICard({ title, value, icon: Icon, color, delay }: { title: string, value: string | number, icon: any, color: "green" | "blue" | "purple" | "yellow" | "cyan" | "red", delay: string }) {
    const colorStyles = {
        green: "text-neon-green bg-neon-green/10 border-neon-green/20 kpi-glow-green text-gradient-green",
        blue: "text-neon-blue bg-neon-blue/10 border-neon-blue/20 kpi-glow-blue text-gradient-blue",
        purple: "text-neon-purple bg-neon-purple/10 border-neon-purple/20 kpi-glow-purple text-gradient-purple",
        yellow: "text-neon-yellow bg-neon-yellow/10 border-neon-yellow/20 kpi-glow-yellow text-gradient-yellow",
        cyan: "text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20 kpi-glow-cyan text-gradient-cyan",
        red: "text-neon-red bg-neon-red/10 border-neon-red/20 kpi-glow-red text-gradient-red",
    };
    const s = colorStyles[color];

    return (
        <div className={`glass-card rounded-2xl p-4 relative overflow-hidden animate-slide-up-fade ${delay}`}>
            <div className="flex justify-between items-start mb-2">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider font-mono">{title}</p>
                <div className={`p-1.5 rounded-lg ${s.split(' ')[1]} border ${s.split(' ')[2]}`}>
                    <Icon className={`h-3.5 w-3.5 ${s.split(' ')[0]}`} />
                </div>
            </div>
            <h3 className={`text-2xl font-black font-mono tracking-tight ${s.split(' ')[4]}`}>{value}</h3>
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function GoalsPage() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [trades, setTrades] = useState<TradeEntry[]>([]);
    const [loaded, setLoaded] = useState(false);
    
    // Modal state
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [builderStep, setBuilderStep] = useState(1);
    const [newGoal, setNewGoal] = useState<Partial<Goal>>({
        category: "profit", timeframe: "monthly", priority: "medium", unit: "$", status: "active", currentValue: 0
    });

    useEffect(() => {
        Promise.all([
            fetch('/api/goals').then(r => r.json()),
            fetch('/api/habits').then(r => r.json()),
            fetch('/api/trades').then(r => r.json())
        ]).then(([g, h, t]) => {
            if(Array.isArray(g)) setGoals(g);
            if(Array.isArray(h)) setHabits(h);
            if(Array.isArray(t)) setTrades(t);
            setLoaded(true);
        }).catch(err => {
            console.error("Error loading goals data:", err);
            setLoaded(true);
        });
    }, []);

    // ─── Analytics Computations ───────────────────────────────────────
    const metrics = useMemo(() => {
        // Trades analysis
        const totalTrades = trades.length;
        const wins = trades.filter(t => t.outcome === "Win").length;
        const totalPnl = trades.reduce((sum, t) => sum + (t.outcome === 'Loss' ? -(parseFloat(t.profitLoss)||0) : (parseFloat(t.profitLoss)||0)), 0);
        const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
        
        // Rule adherence
        const rulesAnswered = trades.filter(t => t.followedRules !== null).length;
        const rulesFollowed = trades.filter(t => t.followedRules === true).length;
        const ruleAdherence = rulesAnswered > 0 ? (rulesFollowed / rulesAnswered) * 100 : 0;

        // Goals stats
        const activeGoals = goals.filter(g => g.status === 'active');
        const completedGoals = goals.filter(g => g.status === 'completed');
        const completionRate = goals.length > 0 ? (completedGoals.length / goals.length) * 100 : 0;

        // Habit streaks
        let currentStreak = 0;
        let maxStreak = 0;
        // Simplified streak logic: count consecutive days where AT LEAST ONE habit is logged
        const habitDates = [...new Set(habits.filter(h => h.completed).map(h => h.date))].sort();
        let tempStreak = 0;
        for (let i = 0; i < habitDates.length; i++) {
            if (i === 0) { tempStreak = 1; }
            else {
                const prev = new Date(habitDates[i-1]);
                const curr = new Date(habitDates[i]);
                const diffTime = Math.abs(curr.getTime() - prev.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                if (diffDays === 1) tempStreak++;
                else tempStreak = 1;
            }
            if (tempStreak > maxStreak) maxStreak = tempStreak;
        }
        // check if current streak is active (logged yesterday or today)
        const todayStr = new Date().toISOString().split('T')[0];
        const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (habitDates.includes(todayStr) || habitDates.includes(yesterdayStr)) {
            currentStreak = tempStreak;
        } else {
            currentStreak = 0;
        }

        // Trader Score (0-100)
        // 25% Goal Completion, 25% Risk (rule adherence), 20% Psych (fewer mistakes), 15% Consistency (habit streak), 15% Profitability (win rate)
        const sGoal = (completionRate / 100) * 25;
        const sRisk = (ruleAdherence / 100) * 25;
        const sPsych = 20; // Default to 20, reduce if mistakes exist
        const sConsist = Math.min(maxStreak / 30, 1) * 15;
        const sProfit = Math.min(winRate / 60, 1) * 15; // 60% WR = max score
        const traderScore = Math.round(sGoal + sRisk + sPsych + sConsist + sProfit);

        return {
            totalTrades, totalPnl, winRate, ruleAdherence,
            activeGoals: activeGoals.length,
            completedGoals: completedGoals.length,
            completionRate, currentStreak, maxStreak, traderScore,
            scores: { goal: sGoal, risk: sRisk, psych: sPsych, consist: sConsist, profit: sProfit }
        };
    }, [goals, habits, trades]);

    // ─── Habit Tracker Helper ─────────────────────────────────────────
    const toggleHabit = async (habitName: string, dateStr: string) => {
        const existing = habits.find(h => h.name === habitName && h.date === dateStr);
        const newStatus = existing ? !existing.completed : true;

        // optimistic update
        if (existing) {
            setHabits(prev => prev.map(h => h.id === existing.id ? { ...h, completed: newStatus } : h));
        } else {
            setHabits(prev => [...prev, { id: 'temp', name: habitName, category: 'daily', date: dateStr, completed: newStatus }]);
        }

        try {
            const res = await fetch('/api/habits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: habitName, category: 'daily', date: dateStr, completed: newStatus })
            });
            const saved = await res.json();
            // refresh habits to get real ID
            setHabits(prev => {
                const filtered = prev.filter(h => !(h.name === habitName && h.date === dateStr));
                return [...filtered, saved];
            });
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreateGoal = async () => {
        try {
            const res = await fetch('/api/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newGoal,
                    targetValue: parseFloat(String(newGoal.targetValue)),
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: newGoal.endDate || new Date(Date.now() + 30*86400000).toISOString().split('T')[0]
                })
            });
            if (res.ok) {
                const created = await res.json();
                setGoals([created, ...goals]);
                setIsBuilderOpen(false);
                setBuilderStep(1);
                setNewGoal({ category: "profit", timeframe: "monthly", priority: "medium", unit: "$", status: "active", currentValue: 0 });
            } else {
                const err = await res.json();
                console.error("Failed to create goal:", err);
                alert("Failed to create goal: " + (err.error || "Unknown error"));
            }
        } catch (e) {
            console.error(e);
            alert("Network error: Failed to create goal.");
        }
    };

    const updateGoalProgress = async (goal: Goal, newProgress: number) => {
        try {
            let status = goal.status;
            if (newProgress >= goal.targetValue) status = 'completed';
            
            const res = await fetch(`/api/goals/${goal.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...goal, currentValue: newProgress, status })
            });
            if (res.ok) {
                const updated = await res.json();
                setGoals(prev => prev.map(g => g.id === goal.id ? updated : g));
            }
        } catch(e) { console.error(e); }
    };

    if (!loaded) return null;

    // Last 7 days for habit tracker
    const last7Days = Array.from({length: 7}).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
    });

    return (
        <div className="space-y-6 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full animate-fade-in">
            {/* ─── Header ────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neon-purple/10 border border-neon-purple/20 backdrop-blur-md relative shadow-glow-purple">
                            <Target className="h-6 w-6 text-neon-purple relative z-10" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-blue tracking-tight">
                                Performance Goals
                            </h1>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-400 font-mono">
                                <span className="flex items-center gap-1"><Flame className="h-4 w-4 text-neon-yellow" /> {metrics.currentStreak} Day Streak</span>
                                <span>·</span>
                                <span>{metrics.activeGoals} Active Goals</span>
                            </div>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setIsBuilderOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neon-purple text-surface-900 font-bold hover:opacity-90 transition-opacity shadow-glow-purple"
                >
                    <Plus className="h-4 w-4" /> SMART Goal Builder
                </button>
            </div>

            {/* ─── Trader Score Hero ─────────────────────────────────── */}
            <div className="glass-card rounded-3xl p-6 border border-white/5 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 animate-slide-up-fade">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/5 via-transparent to-neon-blue/5 pointer-events-none" />
                
                <div className="relative z-10 flex-shrink-0">
                    <CircularProgress value={metrics.traderScore} max={100} color={metrics.traderScore >= 80 ? "#00ff88" : metrics.traderScore >= 50 ? "#fbbf24" : "#ff3b5c"} size={160} strokeWidth={12} />
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-surface-900 px-3 py-1 rounded-full border border-white/10 text-xs font-bold text-gray-300 font-mono shadow-xl">
                        TRADER SCORE
                    </div>
                </div>

                <div className="relative z-10 flex-1 w-full space-y-4">
                    <h3 className="text-xl font-bold text-white mb-4">Performance Breakdown</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { label: "Goal Completion", score: Math.round(metrics.scores.goal * 4), color: "bg-neon-purple" },
                            { label: "Risk Management", score: Math.round(metrics.scores.risk * 4), color: "bg-neon-red" },
                            { label: "Consistency", score: Math.round(metrics.scores.consist * (100/15)), color: "bg-neon-blue" },
                            { label: "Profitability", score: Math.round(metrics.scores.profit * (100/15)), color: "bg-neon-green" },
                        ].map(item => (
                            <div key={item.label} className="space-y-1">
                                <div className="flex justify-between text-xs font-mono">
                                    <span className="text-gray-400">{item.label}</span>
                                    <span className="text-white font-bold">{item.score}/100</span>
                                </div>
                                <div className="h-2 bg-surface-800 rounded-full overflow-hidden border border-white/5">
                                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${Math.min(item.score, 100)}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2 font-mono">
                        <strong className="text-neon-cyan">AI Insight:</strong> {metrics.traderScore >= 80 ? "Elite execution. Keep sizing consistent." : metrics.traderScore >= 50 ? "Profitable habits forming. Focus on risk adherence." : "System discipline needs immediate attention."}
                    </p>
                </div>
            </div>

            {/* ─── KPI Strip ─────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                <KPICard title="Active Goals" value={metrics.activeGoals} icon={Target} color="blue" delay="stagger-1" />
                <KPICard title="Completed" value={metrics.completedGoals} icon={Trophy} color="green" delay="stagger-2" />
                <KPICard title="Win Rate" value={`${metrics.winRate.toFixed(1)}%`} icon={Target} color="cyan" delay="stagger-3" />
                <KPICard title="Current Streak" value={metrics.currentStreak} icon={Flame} color="yellow" delay="stagger-4" />
                <KPICard title="Max Streak" value={metrics.maxStreak} icon={TrendingUp} color="purple" delay="stagger-5" />
                <KPICard title="Rule Adherence" value={`${Math.round(metrics.ruleAdherence)}%`} icon={ShieldCheck} color="red" delay="stagger-6" />
            </div>

            {/* ─── Habit Tracker ─────────────────────────────────────── */}
            <div className="glass-card rounded-2xl p-6 border border-white/5 animate-slide-up-fade stagger-7">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-white tracking-wide font-mono uppercase flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-neon-green" />
                        Daily Habits
                    </h2>
                    <Badge variant="outline" className="border-neon-green/30 text-neon-green">
                        {metrics.currentStreak} Day Streak
                    </Badge>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr>
                                <th className="py-2 text-xs text-gray-500 font-mono font-normal">Habit</th>
                                {last7Days.map(date => (
                                    <th key={date} className="py-2 px-1 text-center text-[10px] text-gray-500 font-mono font-normal w-12">
                                        {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}<br/>
                                        <span className="text-white">{new Date(date).getDate()}</span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {HABIT_LIST.map(habit => (
                                <tr key={habit} className="border-t border-surface-600/30">
                                    <td className="py-3 text-gray-300 font-medium">{habit}</td>
                                    {last7Days.map(date => {
                                        const isCompleted = habits.some(h => h.name === habit && h.date === date && h.completed);
                                        return (
                                            <td key={date} className="py-3 px-1 text-center">
                                                <button 
                                                    onClick={() => toggleHabit(habit, date)}
                                                    className={`w-6 h-6 rounded-md mx-auto habit-cell flex items-center justify-center ${isCompleted ? 'habit-cell-active' : 'habit-cell-inactive hover:border-white/20'}`}
                                                >
                                                    {isCompleted && <CheckCircle2 className="h-4 w-4 text-surface-900" />}
                                                </button>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ─── Goal Cards Grid ───────────────────────────────────── */}
            <div>
                <div className="flex items-center justify-between mb-4 mt-8">
                    <h2 className="text-lg font-bold text-white tracking-wide font-mono uppercase flex items-center gap-2">
                        <Flag className="h-5 w-5 text-neon-blue" />
                        Active Objectives
                    </h2>
                </div>
                
                {goals.length === 0 ? (
                    <div className="glass-card rounded-2xl p-12 text-center border border-white/5 flex flex-col items-center">
                        <Target className="h-10 w-10 text-gray-600 mb-4" />
                        <h3 className="text-lg font-bold text-gray-300 mb-2">No Goals Set</h3>
                        <p className="text-gray-500 text-sm mb-6">Goals turn journaling into a performance system.</p>
                        <button onClick={() => setIsBuilderOpen(true)} className="px-4 py-2 rounded-xl bg-surface-700 hover:bg-surface-600 text-white transition-colors">
                            Create First Goal
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {goals.map((goal, i) => {
                            const percent = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
                            const catColors: Record<string, string> = {
                                profit: "neon-green", consistency: "neon-blue", risk: "neon-purple", psychology: "neon-red", strategy: "neon-yellow"
                            };
                            const c = catColors[goal.category] || "white";

                            return (
                                <div key={goal.id} className={`glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden hover:border-${c}/30 transition-all animate-slide-up-fade stagger-${(i%5)+1}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <Badge variant="outline" className={`border-${c}/30 text-${c} bg-${c}/5 uppercase tracking-widest text-[10px] font-mono`}>
                                            {goal.category}
                                        </Badge>
                                        <div className="text-[10px] text-gray-500 font-mono">
                                            Due {new Date(goal.endDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-1">{goal.title}</h3>
                                    
                                    <div className="mt-6 space-y-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-2xl font-black font-mono tracking-tight text-white">
                                                {goal.currentValue}{goal.unit}
                                                <span className="text-sm text-gray-500 font-normal"> / {goal.targetValue}{goal.unit}</span>
                                            </span>
                                            <span className={`text-sm font-bold text-${c} font-mono`}>{Math.round(percent)}%</span>
                                        </div>
                                        <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
                                            <div className={`h-full bg-${c} rounded-full transition-all duration-1000`} style={{ width: `${percent}%` }} />
                                        </div>
                                    </div>

                                    {/* Timeline milestones */}
                                    <div className="flex justify-between mt-4 px-1">
                                        {[25, 50, 75, 100].map(m => (
                                            <div key={m} className="flex flex-col items-center gap-1">
                                                <div className={`w-2 h-2 rounded-full ${percent >= m ? `bg-${c} shadow-[0_0_8px_currentColor]` : 'bg-surface-600'}`} />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex gap-2 mt-6 pt-4 border-t border-white/5">
                                        <button 
                                            onClick={() => {
                                                const newVal = prompt(`Update progress for ${goal.title} (current: ${goal.currentValue}${goal.unit}):`, String(goal.currentValue));
                                                if(newVal && !isNaN(Number(newVal))) {
                                                    updateGoalProgress(goal, Number(newVal));
                                                }
                                            }}
                                            className="flex-1 py-1.5 rounded-lg bg-surface-700 hover:bg-surface-600 text-xs font-semibold text-white transition-colors"
                                        >
                                            Update
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ─── Achievements ────────────────────────────────────────── */}
            <div className="mt-12 animate-slide-up-fade stagger-5">
                <div className="flex items-center gap-2 mb-6">
                    <Award className="h-5 w-5 text-neon-yellow" />
                    <h2 className="text-lg font-bold text-white tracking-wide font-mono uppercase">Achievement Showcase</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[
                        { title: "First Win", icon: Trophy, unlocked: metrics.winRate > 0 },
                        { title: "Discipline", icon: ShieldCheck, unlocked: metrics.ruleAdherence > 80 },
                        { title: "Consistency", icon: Flame, unlocked: metrics.maxStreak >= 7 },
                        { title: "Profit Target", icon: Target, unlocked: metrics.totalPnl > 1000 },
                        { title: "Zen Mind", icon: Brain, unlocked: metrics.scores.psych >= 20 },
                        { title: "Data Driven", icon: BarChart3, unlocked: metrics.totalTrades >= 50 },
                    ].map((badge, i) => (
                        <div key={i} className={`flex flex-col items-center text-center p-4 rounded-2xl glass-card border ${badge.unlocked ? 'border-neon-yellow/30 bg-neon-yellow/5 badge-unlocked' : 'border-white/5 badge-locked'}`}>
                            <div className={`p-3 rounded-full mb-3 ${badge.unlocked ? 'bg-neon-yellow/20 text-neon-yellow' : 'bg-surface-700 text-gray-500'}`}>
                                <badge.icon className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-bold text-white font-mono uppercase">{badge.title}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── SMART Goal Builder Modal ────────────────────────────── */}
            {isBuilderOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/80 backdrop-blur-sm animate-fade-in">
                    <div className="glass-card rounded-3xl p-6 w-full max-w-lg border border-white/10 shadow-2xl relative">
                        <button onClick={() => setIsBuilderOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                            <X className="h-5 w-5" />
                        </button>
                        
                        <h2 className="text-xl font-bold text-white mb-6 font-mono flex items-center gap-2">
                            <Lightbulb className="text-neon-purple h-5 w-5" />
                            SMART Goal Builder
                        </h2>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs text-gray-400 font-mono uppercase">Goal Title</label>
                                <Input 
                                    placeholder="e.g. Pass 100k Funded Challenge" 
                                    className="bg-surface-900 border-surface-600"
                                    value={newGoal.title || ""}
                                    onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 font-mono uppercase">Category</label>
                                    <Select 
                                        className="bg-surface-900 border-surface-600 w-full"
                                        value={newGoal.category}
                                        onChange={e => setNewGoal({...newGoal, category: e.target.value})}
                                    >
                                        <option value="profit">Profit</option>
                                        <option value="consistency">Consistency</option>
                                        <option value="risk">Risk Management</option>
                                        <option value="psychology">Psychology</option>
                                        <option value="strategy">Strategy</option>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 font-mono uppercase">Priority</label>
                                    <Select 
                                        className="bg-surface-900 border-surface-600 w-full"
                                        value={newGoal.priority}
                                        onChange={e => setNewGoal({...newGoal, priority: e.target.value})}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 font-mono uppercase">Target Value</label>
                                    <Input 
                                        type="number"
                                        placeholder="100" 
                                        className="bg-surface-900 border-surface-600"
                                        value={newGoal.targetValue || ""}
                                        onChange={e => setNewGoal({...newGoal, targetValue: Number(e.target.value)})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 font-mono uppercase">Unit</label>
                                    <Input 
                                        placeholder="$, %, trades" 
                                        className="bg-surface-900 border-surface-600"
                                        value={newGoal.unit || ""}
                                        onChange={e => setNewGoal({...newGoal, unit: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-gray-400 font-mono uppercase">Deadline</label>
                                <Input 
                                    type="date"
                                    className="bg-surface-900 border-surface-600"
                                    value={newGoal.endDate || ""}
                                    onChange={e => setNewGoal({...newGoal, endDate: e.target.value})}
                                />
                            </div>

                            {/* AI Validation preview */}
                            <div className="mt-4 p-3 rounded-xl bg-surface-800/50 border border-white/5">
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    <strong className="text-neon-cyan">AI Check:</strong> 
                                    {newGoal.title && newGoal.targetValue ? 
                                        " Good goal. It has a specific target and deadline. Ensure you have daily habits that align with this outcome." : 
                                        " Please provide a specific title and target value to make this a SMART goal."}
                                </p>
                            </div>

                            <button 
                                onClick={handleCreateGoal}
                                disabled={!newGoal.title || !newGoal.targetValue}
                                className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                Launch Goal
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
