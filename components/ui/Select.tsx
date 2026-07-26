import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, options, className, id, ...props },
  ref
) {
  const selectId = id ?? props.name;
  return (
    <div>
      {label && (
        <label className="text-xs font-medium text-muted mb-1.5 block" htmlFor={selectId}>
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "w-full h-10 rounded-xl bg-white/5 border border-white/10 pl-3 pr-9 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all appearance-none cursor-pointer",
            error && "border-error/50 focus:ring-error/30 focus:border-error/50",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0b0f1a] text-foreground">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
      </div>
      {error && <p className="text-xs text-error mt-1.5">{error}</p>}
    </div>
  );
});
