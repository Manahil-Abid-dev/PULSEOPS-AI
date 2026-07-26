"use client";

import { useRef, useState, type ReactNode } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { cn } from "@/lib/utils";

interface DropdownProps {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  panelClassName?: string;
}

export function Dropdown({ trigger, children, align = "right", panelClassName }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setOpen(false));

  return (
    <div ref={containerRef} className="relative">
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div
          role="menu"
          className={cn(
            "absolute z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] glass-card rounded-2xl shadow-2xl shadow-black/40 py-2 animate-in",
            align === "right" ? "right-0" : "left-0",
            panelClassName
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}
