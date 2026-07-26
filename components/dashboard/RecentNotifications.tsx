"use client";

import { BellRing } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { timeAgo, cn } from "@/lib/utils";
import type { NotificationItem, NotificationLevel } from "@/types/dashboard";

const levelVariant: Record<NotificationLevel, "primary" | "success" | "warning" | "error"> = {
  info: "primary",
  success: "success",
  warning: "warning",
  error: "error",
};

interface RecentNotificationsProps {
  items: NotificationItem[];
}

export function RecentNotifications({ items }: RecentNotificationsProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellRing className="h-4 w-4 text-primary" />
          Recent Notifications
        </CardTitle>
      </CardHeader>

      {items.length === 0 ? (
        <EmptyState title="No notifications yet" description="You'll see updates here as they happen." />
      ) : (
        <ul className="space-y-1">
          {items.slice(0, 5).map((n) => (
            <li
              key={n.id}
              className={cn(
                "flex items-start justify-between gap-3 rounded-xl p-2.5 -mx-2.5 hover:bg-white/5 transition-colors",
                !n.read && "bg-white/[0.02]"
              )}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground/90 truncate">{n.title}</p>
                  <Badge variant={levelVariant[n.level]}>{n.level}</Badge>
                </div>
                <p className="text-xs text-muted line-clamp-1 mt-0.5">{n.description}</p>
              </div>
              <span className="text-[11px] text-muted/70 shrink-0 mt-1">{timeAgo(n.timestamp)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
