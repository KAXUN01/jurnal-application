"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

interface TradeEntry {
    outcome: string;
    profitLoss: string;
    date: string;
    // other fields omitted for brevity as they are not needed here
}

interface DailySummaryCalendarProps {
    trades: TradeEntry[];
}

export function DailySummaryCalendar({ trades }: DailySummaryCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    // Aggregate trades by day
    const aggregatedData = useMemo(() => {
        const data: Record<string, { count: number; pnl: number }> = {};
        
        trades.forEach((trade) => {
            if (trade.date === "—" || !trade.date) return;
            
            const dateStr = trade.date; // YYYY-MM-DD
            if (!data[dateStr]) {
                data[dateStr] = { count: 0, pnl: 0 };
            }
            
            data[dateStr].count += 1;
            
            const amount = parseFloat(trade.profitLoss) || 0;
            if (trade.outcome === "Loss") {
                data[dateStr].pnl -= amount;
            } else if (trade.outcome === "Win") {
                data[dateStr].pnl += amount;
            }
            // BE adds 0 to pnl
        });
        
        return data;
    }, [trades]);

    // Calendar logic
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
    
    // Calendar grid
    const weeks = [];
    let currentWeek = [];
    
    // Padding days before the 1st
    for (let i = 0; i < startingDayOfWeek; i++) {
        currentWeek.push(null);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        currentWeek.push(day);
        
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    }
    
    // Padding days after the end of the month
    if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
            currentWeek.push(null);
        }
        weeks.push(currentWeek);
    }

    const monthName = currentDate.toLocaleString("default", { month: "long" });

    return (
        <Card className="border-surface-500/20 bg-surface-900 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.2)]">
            {/* Header */}
            <CardHeader className="pb-4 border-b border-surface-500/10">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white tracking-wide">
                            Daily Summary
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePrevMonth}
                                className="p-1.5 rounded-lg border border-surface-500/20 bg-surface-800/40 text-gray-400 hover:text-white hover:bg-surface-700/50 transition-all font-mono"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            
                            <span className="text-[13px] font-bold text-white min-w-[100px] text-center font-mono">
                                {monthName} {year}
                            </span>
                            
                            <button
                                onClick={handleNextMonth}
                                className="p-1.5 rounded-lg border border-surface-500/20 bg-surface-800/40 text-gray-400 hover:text-white hover:bg-surface-700/50 transition-all font-mono"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                        
                        <button
                            onClick={handleToday}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-500/20 bg-surface-800/40 text-[11px] font-semibold text-gray-400 hover:text-white hover:bg-surface-700/50 transition-all font-mono hidden sm:flex"
                        >
                            <CalendarIcon className="h-3 w-3" />
                            Today
                        </button>
                    </div>
                </CardTitle>
            </CardHeader>
            
            <CardContent className="p-4 sm:p-5">
                {/* Day labels */}
                <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
                        <div key={dayName} className="text-center">
                            <span className="text-[10px] sm:text-xs font-medium text-gray-500 font-mono tracking-wider">
                                {dayName}
                            </span>
                        </div>
                    ))}
                </div>
                
                {/* Calendar grid */}
                <div className="flex flex-col gap-2 sm:gap-3">
                    {weeks.map((week, weekIdx) => (
                        <div key={weekIdx} className="grid grid-cols-7 gap-2 sm:gap-3">
                            {week.map((day, dayIdx) => {
                                if (day === null) {
                                    return (
                                        <div 
                                            key={`empty-${dayIdx}`} 
                                            className="aspect-square sm:aspect-auto sm:h-24 rounded-xl bg-surface-800/10 border border-surface-500/5"
                                        />
                                    );
                                }

                                // Format date string for lookup: YYYY-MM-DD
                                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                                const dayData = aggregatedData[dateStr];
                                
                                const hasData = !!dayData;
                                const isProfit = hasData && dayData.pnl > 0;
                                const isLoss = hasData && dayData.pnl < 0;
                                
                                // Dynamic classes based on PnL
                                const bgClass = isProfit 
                                    ? "bg-neon-green/10 border-neon-green/30" 
                                    : isLoss 
                                        ? "bg-neon-red/10 border-neon-red/30" 
                                        : hasData
                                            ? "bg-surface-700/30 border-surface-500/40"
                                            : "bg-surface-800/30 border-surface-500/10 hover:border-surface-500/30 transition-colors";
                                            
                                const textClass = isProfit
                                    ? "text-neon-green"
                                    : isLoss
                                        ? "text-neon-red"
                                        : "text-gray-300";

                                return (
                                    <div 
                                        key={`day-${day}`} 
                                        className={`relative aspect-square sm:aspect-auto sm:h-24 p-2 sm:p-3 rounded-xl border flex flex-col justify-between ${bgClass}`}
                                    >
                                        <span className={`text-[11px] sm:text-sm font-semibold font-mono ${hasData ? "text-white" : "text-gray-500"}`}>
                                            {day}
                                        </span>
                                        
                                        {hasData && (
                                            <div className="text-right flex flex-col gap-0.5 sm:gap-1 mt-auto">
                                                <div className="flex items-center justify-end gap-1">
                                                    <span className={`text-[10px] sm:text-xs font-bold font-mono text-white`}>
                                                        {dayData.count}
                                                    </span>
                                                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400 shrink-0">
                                                        <path d="M4 6.5L1 3.5L4 0.5V2.5H15V4.5H4V6.5Z" fill="currentColor"/>
                                                        <path d="M12 9.5L15 12.5L12 15.5V13.5H1V11.5H12V9.5Z" fill="currentColor"/>
                                                    </svg>
                                                </div>
                                                <span className={`text-[10px] sm:text-[13px] font-black font-mono tracking-tight truncate ${textClass}`}>
                                                    {dayData.pnl > 0 ? "+" : ""}{dayData.pnl < 0 ? "-" : "$"}{Math.abs(dayData.pnl).toFixed(2)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
