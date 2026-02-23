import { cn } from "@/lib/utils";
import { forwardRef, TextareaHTMLAttributes } from "react";

const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
    ({ className, ...props }, ref) => (
        <textarea
            ref={ref}
            className={cn(
                "flex min-h-[100px] w-full rounded-xl border border-surface-500/50 bg-surface-700/50 px-4 py-3 text-sm text-white placeholder:text-gray-500 transition-all duration-200 focus:outline-none focus:border-neon-green/40 focus:ring-1 focus:ring-neon-green/20 focus:bg-surface-700 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
                className
            )}
            {...props}
        />
    )
);
Textarea.displayName = "Textarea";

export { Textarea };
