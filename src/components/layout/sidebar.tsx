"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    CheckSquare,
    BookOpen,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useState } from "react";

const navItems = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Checklist",
        href: "/checklist",
        icon: CheckSquare,
    },
    {
        label: "Journal",
        href: "/journal",
        icon: BookOpen,
    },
    {
        label: "Trades",
        href: "/trades",
        icon: TrendingUp,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 h-screen border-r border-surface-600/50 bg-surface-900/95 backdrop-blur-xl transition-all duration-300 flex flex-col",
                collapsed ? "w-[68px]" : "w-[240px]"
            )}
        >
            {/* Logo area */}
            <div className="flex h-16 items-center border-b border-surface-600/50 px-4">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neon-green/10 border border-neon-green/20">
                        <TrendingUp className="h-5 w-5 text-neon-green" />
                    </div>
                    {!collapsed && (
                        <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap animate-fade-in">
                            Trade<span className="text-gradient-green">Flow</span>
                        </span>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-3 mt-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-neon-green/10 text-neon-green border border-neon-green/20 shadow-glow-green"
                                    : "text-gray-400 hover:text-white hover:bg-surface-700/50 border border-transparent"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "h-5 w-5 shrink-0 transition-colors duration-200",
                                    isActive
                                        ? "text-neon-green"
                                        : "text-gray-500 group-hover:text-white"
                                )}
                            />
                            {!collapsed && (
                                <span className="whitespace-nowrap">{item.label}</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Collapse toggle */}
            <div className="border-t border-surface-600/50 p-3">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-500 transition-all duration-200 hover:text-white hover:bg-surface-700/50"
                >
                    {collapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <>
                            <ChevronLeft className="h-4 w-4" />
                            <span>Collapse</span>
                        </>
                    )}
                </button>
            </div>
        </aside>
    );
}
