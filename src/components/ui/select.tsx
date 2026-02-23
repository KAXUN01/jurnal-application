import { cn } from "@/lib/utils";
import { forwardRef, SelectHTMLAttributes } from "react";

const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
    ({ className, children, ...props }, ref) => (
        <select
            ref={ref}
            className={cn(
                "flex h-10 w-full rounded-xl border border-surface-500/50 bg-surface-700/50 px-4 py-2 text-sm text-white transition-all duration-200 focus:outline-none focus:border-neon-green/40 focus:ring-1 focus:ring-neon-green/20 focus:bg-surface-700 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer",
                className
            )}
            {...props}
        >
            {children}
        </select>
    )
);
Select.displayName = "Select";

export { Select };
