import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  rightElement?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, icon, rightElement, className, id, ...props },
  ref
) {
  const inputId = id ?? props.name;
  return (
    <div>
      {label && (
        <label className="text-xs font-medium text-muted mb-1.5 block" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full h-10 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all",
            icon ? "pl-9" : "pl-3",
            rightElement ? "pr-9" : "pr-3",
            error && "border-error/50 focus:ring-error/30 focus:border-error/50",
            className
          )}
          {...props}
        />
        {rightElement && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2">{rightElement}</span>
        )}
      </div>
      {error && <p className="text-xs text-error mt-1.5">{error}</p>}
    </div>
  );
});
