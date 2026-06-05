"use client";

import { Activity, Sun, Moon, User } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function Topbar() {
    const { theme, toggleTheme } = useTheme();

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const { data: session } = useSession();
    const pathname = usePathname();

    if (pathname === "/login") return null;

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

                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-surface-500/50 bg-surface-800/50 text-gray-400 transition-all duration-300 hover:text-white hover:bg-surface-700/50 hover:border-surface-500/80 hover:shadow-glow-blue"
                    title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                >
                    <Sun
                        className={`h-4 w-4 absolute transition-all duration-300 ${theme === "dark"
                                ? "rotate-0 scale-100 opacity-100"
                                : "-rotate-90 scale-0 opacity-0"
                            }`}
                    />
                    <Moon
                        className={`h-4 w-4 absolute transition-all duration-300 ${theme === "light"
                                ? "rotate-0 scale-100 opacity-100"
                                : "rotate-90 scale-0 opacity-0"
                            }`}
                    />
                </button>

                {session?.user ? (
                    <Link href="/profile" className="h-9 w-9 rounded-xl bg-gradient-to-br from-neon-green/20 to-neon-blue/20 border border-surface-500/50 flex items-center justify-center transition-all hover:border-neon-green/50 hover:shadow-glow-blue cursor-pointer">
                        <span className="text-xs font-bold text-white uppercase">{session.user.name?.[0] || session.user.email?.[0] || "U"}</span>
                    </Link>
                ) : (
                    <Link href="/login" className="h-9 w-9 rounded-xl bg-surface-800/50 border border-surface-500/50 flex items-center justify-center transition-all hover:bg-surface-700/50 hover:text-neon-green">
                        <User className="h-4 w-4 text-gray-400" />
                    </Link>
                )}
            </div>
        </header>
    );
}
