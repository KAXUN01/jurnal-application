import { cn } from "@/lib/utils";
import { forwardRef, InputHTMLAttributes } from "react";

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
    ({ className, type, ...props }, ref) => (
        <input
            type={type}
            ref={ref}
            className={cn(
                "flex h-10 w-full rounded-xl border border-surface-500/50 bg-surface-700/50 px-4 py-2 text-sm text-white placeholder:text-gray-500 transition-all duration-200 focus:outline-none focus:border-neon-green/40 focus:ring-1 focus:ring-neon-green/20 focus:bg-surface-700 disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium",
                className
            )}
            {...props}
        />
    )
);
Input.displayName = "Input";

export { Input };
