import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: "success" | "danger" | "info" | "warning" | "neutral";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = "neutral", ...props }, ref) => {
        const variants = {
            success:
                "bg-neon-green/10 text-neon-green border-neon-green/20",
            danger:
                "bg-neon-red/10 text-neon-red border-neon-red/20",
            info:
                "bg-neon-blue/10 text-neon-blue border-neon-blue/20",
            warning:
                "bg-neon-yellow/10 text-neon-yellow border-neon-yellow/20",
            neutral:
                "bg-surface-600/50 text-gray-400 border-surface-500/50",
        };

        return (
            <span
                ref={ref}
                className={cn(
                    "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-medium transition-colors",
                    variants[variant],
                    className
                )}
                {...props}
            />
        );
    }
);

Badge.displayName = "Badge";
export { Badge };
export type { BadgeProps };
