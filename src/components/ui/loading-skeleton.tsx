"use client";

import { cn } from "@/lib/utils";

/**
 * Reusable shimmer skeleton component for loading states.
 * Use instead of `return null` to give instant perceived performance.
 */
export function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-xl bg-surface-700/40",
                className
            )}
            {...props}
        />
    );
}

/** A card-shaped skeleton block for dashboards and list views. */
export function SkeletonCard({ className }: { className?: string }) {
    return (
        <div className={cn("glass-card rounded-2xl p-6 border border-white/5 space-y-4", className)}>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-3 w-24" />
        </div>
    );
}

/** A full-page loading skeleton with KPI cards and chart placeholders. */
export function DashboardSkeleton() {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-10 w-32 rounded-xl" />
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>

            {/* Chart area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card rounded-2xl p-6 border border-white/5">
                    <Skeleton className="h-4 w-40 mb-4" />
                    <Skeleton className="h-64 w-full rounded-xl" />
                </div>
                <div className="glass-card rounded-2xl p-6 border border-white/5">
                    <Skeleton className="h-4 w-40 mb-4" />
                    <Skeleton className="h-64 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}

/** Loading skeleton for the trades list page. */
export function TradesSkeleton() {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-10 w-28 rounded-xl" />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>

            {/* Filter bar */}
            <Skeleton className="h-12 w-full rounded-xl" />

            {/* Trade rows */}
            <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
            </div>
        </div>
    );
}

/** Loading skeleton for goals / accounts pages. */
export function GenericPageSkeleton() {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-10 w-28 rounded-xl" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} className="h-48" />
                ))}
            </div>
        </div>
    );
}
