"use client";

import { Activity } from "lucide-react";

export function Topbar() {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-surface-600/50 bg-surface-900/80 backdrop-blur-xl px-6">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-neon-green animate-pulse" />
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Market Session Active
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400 font-mono">{dateStr}</span>
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-neon-green/20 to-neon-blue/20 border border-surface-500/50 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">TF</span>
                </div>
            </div>
        </header>
    );
}
