import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type ButtonSize = "sm" | "md" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-primary to-blue-600 text-white shadow-md shadow-primary/25 hover:shadow-primary/40 hover:brightness-110",
  secondary:
    "bg-gradient-to-r from-secondary to-purple-600 text-white shadow-md shadow-secondary/25 hover:shadow-secondary/40 hover:brightness-110",
  ghost: "bg-transparent text-foreground/80 hover:bg-white/5",
  outline: "bg-transparent border border-white/10 text-foreground/80 hover:bg-white/5 hover:border-white/20",
  danger:
    "bg-gradient-to-r from-error to-red-600 text-white shadow-md shadow-error/25 hover:shadow-error/40 hover:brightness-110",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs rounded-lg",
  md: "h-10 px-4 text-sm rounded-xl",
  icon: "h-10 w-10 rounded-xl",
};

export function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
