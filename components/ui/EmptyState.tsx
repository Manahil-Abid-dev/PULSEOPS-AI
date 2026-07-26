import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}

export function EmptyState({ icon: Icon = Inbox, title, description, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-10 px-4", className)}>
      <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3">
        <Icon className="h-5 w-5 text-muted" />
      </div>
      <p className="text-sm font-medium text-foreground/80">{title}</p>
      {description && <p className="text-xs text-muted mt-1 max-w-xs">{description}</p>}
    </div>
  );
}
