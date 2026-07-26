"use client";

import { motion } from "framer-motion";
import { DollarSign, ShoppingCart, Users, Package, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn, formatPercent } from "@/lib/utils";
import type { StatCardData } from "@/types/dashboard";

const iconMap = {
  revenue: DollarSign,
  sales: ShoppingCart,
  customers: Users,
  products: Package,
};

const iconColorMap = {
  revenue: "from-primary/20 to-primary/5 text-primary",
  sales: "from-secondary/20 to-secondary/5 text-secondary",
  customers: "from-success/20 to-success/5 text-success",
  products: "from-warning/20 to-warning/5 text-warning",
};

interface StatCardProps {
  data: StatCardData;
  index?: number;
}

export function StatCard({ data, index = 0 }: StatCardProps) {
  const Icon = iconMap[data.icon];
  const isUp = data.trend === "up";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Card hoverable className="h-full">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted">{data.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1.5 tracking-tight">{data.value}</p>
          </div>
          <div className={cn("h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center", iconColorMap[data.icon])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="flex items-center gap-1 mt-3">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-semibold",
              isUp ? "text-success" : "text-error"
            )}
          >
            {isUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {formatPercent(data.changePercent)}
          </span>
          <span className="text-xs text-muted">vs last month</span>
        </div>
        <div className="flex items-center gap-1 mt-2">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              data.live ? "bg-success animate-pulse" : "bg-muted/50"
            )}
          />
          <span className="text-[10px] uppercase tracking-wide text-muted/80">
            {data.live ? "Live from Firebase" : "Demo data"}
          </span>
        </div>
      </Card>
    </motion.div>
  );
}
