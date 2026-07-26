"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, FileText, UserPlus, BarChart3, Sparkles, TrendingUp, AlertTriangle, Rocket } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import type { QuickAction } from "@/types/dashboard";

const iconMap = {
  plus: Plus,
  invoice: FileText,
  customer: UserPlus,
  report: BarChart3,
  sparkles: Sparkles,
  trending: TrendingUp,
  alert: AlertTriangle,
  growth: Rocket,
};

interface QuickActionsProps {
  actions: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const Icon = iconMap[action.icon];
          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                href={action.href}
                className="group flex flex-col gap-2 rounded-xl border border-white/8 bg-white/[0.02] p-3.5 h-full hover:border-primary/30 hover:bg-white/5 transition-all duration-200"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground/90">{action.label}</p>
                  <p className="text-xs text-muted mt-0.5 line-clamp-2">{action.description}</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
