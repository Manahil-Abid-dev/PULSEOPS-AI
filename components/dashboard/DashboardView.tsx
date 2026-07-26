"use client";

import { motion } from "framer-motion";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { StatCard } from "@/components/dashboard/StatCard";
import { BusinessHealthScore } from "@/components/dashboard/BusinessHealthScore";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { SalesOverview } from "@/components/dashboard/SalesOverview";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { LowStockSummary } from "@/components/dashboard/LowStockSummary";
import { RecentNotifications } from "@/components/dashboard/RecentNotifications";
import { AIInsightCard } from "@/components/dashboard/AIInsightCard";
import { ExecutiveSummaryCard } from "@/components/dashboard/ExecutiveSummaryCard";
import { InsightCardsGrid } from "@/components/dashboard/InsightCardsGrid";
import { AutomationControlPanel } from "@/components/dashboard/AutomationControlPanel";
import { Button } from "@/components/ui/Button";
import {
  StatCardSkeleton,
  ChartCardSkeleton,
  ListCardSkeleton,
} from "@/components/ui/Skeleton";

export function DashboardView() {
  const { data, isLoading, error, refetch } = useDashboardData();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-24">
        <div className="h-12 w-12 rounded-full bg-error/10 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-error" />
        </div>
        <p className="text-base font-semibold text-foreground">Something went wrong</p>
        <p className="text-sm text-muted mt-1 max-w-sm">{error}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
          <RefreshCcw className="h-3.5 w-3.5" />
          Try again
        </Button>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <ChartCardSkeleton />
          </div>
          <ChartCardSkeleton heightClass="h-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ListCardSkeleton />
          <ListCardSkeleton />
          <ListCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AIInsightCard insight={data.insight} />

      {data.insightCards && <InsightCardsGrid cards={data.insightCards} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {data.stats.map((stat, index) => (
          <StatCard key={stat.id} data={stat} index={index} />
        ))}
      </div>

      <ExecutiveSummaryCard insight={data.insight} />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <AutomationControlPanel />
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <motion.div
          className="xl:col-span-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <RevenueChart data={data.revenueTrend} isLive={data.isLive} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <BusinessHealthScore health={data.health} />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <SalesOverview data={data.salesByChannel} isLive={data.isLive} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
          <QuickActions actions={data.quickActions} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <LowStockSummary items={data.lowStock} />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <RecentActivity items={data.activity} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
          <RecentNotifications items={data.notifications} />
        </motion.div>
      </div>
    </div>
  );
}
