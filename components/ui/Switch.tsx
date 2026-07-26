"use client";

import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
}

export function Switch({ checked, onChange, label, description, disabled, id }: SwitchProps) {
  const switchEl = (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none",
        checked ? "bg-gradient-to-r from-primary to-secondary" : "bg-white/10"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200",
          checked && "translate-x-5"
        )}
      />
    </button>
  );

  if (!label) return switchEl;

  return (
    <label htmlFor={id} className="flex items-center justify-between gap-4 cursor-pointer select-none">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground/90">{label}</p>
        {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
      </div>
      {switchEl}
    </label>
  );
}
