"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    BookOpen,
    TrendingUp,
    Brain,
    Menu
} from "lucide-react";
import { useState } from "react";

const mainNavItems = [
    { label: "Home", href: "/dashboard", icon: LayoutDashboard },
    { label: "Journal", href: "/journal", icon: BookOpen },
    { label: "Trades", href: "/trades", icon: TrendingUp },
    { label: "AI Coach", href: "/ai-coach", icon: Brain },
];

export function BottomNav() {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);

    if (pathname === "/login") return null;

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-900/95 backdrop-blur-xl border-t border-surface-600/50 pb-safe">
            <nav className="flex items-center justify-around px-2 h-16">
                {mainNavItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-200",
                                isActive
                                    ? "text-neon-green"
                                    : "text-gray-500 hover:text-white"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "h-5 w-5",
                                    isActive && "drop-shadow-[0_0_8px_rgba(0,255,136,0.8)]"
                                )}
                            />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
                
                {/* Mobile Menu Toggle for other items like Accounts, Checklist, News, Calculator */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-200",
                        menuOpen ? "text-neon-blue" : "text-gray-500 hover:text-white"
                    )}
                >
                    <Menu className={cn("h-5 w-5", menuOpen && "drop-shadow-[0_0_8px_rgba(0,195,255,0.8)]")} />
                    <span className="text-[10px] font-medium">More</span>
                </button>
            </nav>

            {/* Expanded Menu Overlay */}
            {menuOpen && (
                <div className="absolute bottom-16 left-0 right-0 bg-surface-800/95 backdrop-blur-xl border-t border-surface-600/50 p-4 animate-slide-up-fade flex flex-col gap-2 rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
                    <div className="flex items-center justify-between px-2 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">More Options</span>
                        <button onClick={() => setMenuOpen(false)} className="text-gray-500 hover:text-white">✕</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Link href="/accounts" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-surface-700/30 hover:bg-surface-700/60 border border-white/5 transition-colors">
                            <span className="text-sm font-medium text-white">Accounts</span>
                        </Link>
                        <Link href="/checklist" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-surface-700/30 hover:bg-surface-700/60 border border-white/5 transition-colors">
                            <span className="text-sm font-medium text-white">Checklist</span>
                        </Link>
                        <Link href="/news" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-surface-700/30 hover:bg-surface-700/60 border border-white/5 transition-colors">
                            <span className="text-sm font-medium text-white">News</span>
                        </Link>
                        <Link href="/goals" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-surface-700/30 hover:bg-surface-700/60 border border-white/5 transition-colors">
                            <span className="text-sm font-medium text-white">Goals</span>
                        </Link>
                        <Link href="/calculator" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-surface-700/30 hover:bg-surface-700/60 border border-white/5 transition-colors">
                            <span className="text-sm font-medium text-white">Calculator</span>
                        </Link>
                        <Link href="/data-management" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-surface-700/30 hover:bg-surface-700/60 border border-white/5 transition-colors">
                            <span className="text-sm font-medium text-white">Data</span>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
