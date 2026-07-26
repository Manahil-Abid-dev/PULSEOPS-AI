"use client";

import { motion } from "framer-motion";
import { ShoppingBag, UserPlus, Package, CreditCard, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { timeAgo, cn } from "@/lib/utils";
import type { ActivityItem, ActivityType } from "@/types/dashboard";

const iconMap: Record<ActivityType, typeof ShoppingBag> = {
  order: ShoppingBag,
  customer: UserPlus,
  product: Package,
  payment: CreditCard,
  alert: AlertTriangle,
};

const colorMap: Record<ActivityType, string> = {
  order: "bg-primary/15 text-primary",
  customer: "bg-success/15 text-success",
  product: "bg-secondary/15 text-secondary",
  payment: "bg-primary/15 text-primary",
  alert: "bg-warning/15 text-warning",
};

interface RecentActivityProps {
  items: ActivityItem[];
}

export function RecentActivity({ items }: RecentActivityProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>

      {items.length === 0 ? (
        <EmptyState title="No recent activity" description="New orders and updates will show up here." />
      ) : (
        <ul className="space-y-1">
          {items.map((item, index) => {
            const Icon = iconMap[item.type];
            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-start gap-3 rounded-xl p-2.5 -mx-2.5 hover:bg-white/5 transition-colors"
              >
                <div className={cn("h-9 w-9 rounded-full flex items-center justify-center shrink-0", colorMap[item.type])}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground/90 truncate">{item.title}</p>
                  <p className="text-xs text-muted line-clamp-1">{item.description}</p>
                </div>
                <span className="text-[11px] text-muted/70 shrink-0 mt-1">{timeAgo(item.timestamp)}</span>
              </motion.li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
