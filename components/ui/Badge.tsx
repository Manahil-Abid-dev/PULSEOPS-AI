import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "primary" | "secondary" | "success" | "warning" | "error" | "neutral";

const variantStyles: Record<BadgeVariant, string> = {
  primary: "bg-primary/15 text-primary border-primary/25",
  secondary: "bg-secondary/15 text-secondary border-secondary/25",
  success: "bg-success/15 text-success border-success/25",
  warning: "bg-warning/15 text-warning border-warning/25",
  error: "bg-error/15 text-error border-error/25",
  neutral: "bg-white/5 text-muted border-white/10",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "neutral", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
