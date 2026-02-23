import { cn } from "@/lib/utils";
import { forwardRef, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "danger" | "ghost" | "outline" | "secondary";
    size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        const base =
            "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-900 disabled:opacity-50 disabled:pointer-events-none";

        const variants = {
            primary:
                "bg-neon-green/10 text-neon-green border border-neon-green/20 hover:bg-neon-green/20 hover:shadow-glow-green focus:ring-neon-green/50",
            danger:
                "bg-neon-red/10 text-neon-red border border-neon-red/20 hover:bg-neon-red/20 hover:shadow-glow-red focus:ring-neon-red/50",
            ghost:
                "text-gray-400 hover:text-white hover:bg-surface-600/50 focus:ring-gray-500/50",
            outline:
                "border border-surface-500 text-gray-300 hover:bg-surface-600/50 hover:text-white focus:ring-gray-500/50",
            secondary:
                "bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/20 hover:shadow-glow-blue focus:ring-neon-blue/50",
        };

        const sizes = {
            sm: "text-xs px-3 py-1.5 gap-1.5",
            md: "text-sm px-4 py-2 gap-2",
            lg: "text-base px-6 py-2.5 gap-2",
        };

        return (
            <button
                ref={ref}
                className={cn(base, variants[variant], sizes[size], className)}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";
export { Button };
export type { ButtonProps };
