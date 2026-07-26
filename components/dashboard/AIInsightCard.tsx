"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { AIInsight } from "@/types/dashboard";

interface AIInsightCardProps {
  insight: AIInsight;
}

export function AIInsightCard({ insight }: AIInsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl p-5 sm:p-6 border border-primary/20 bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent shadow-lg shadow-primary/5"
    >
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
      <div className="relative flex items-start gap-4">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 shadow-lg shadow-primary/30">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Today&apos;s AI Insight</p>
            <span className="text-[11px] text-muted">{insight.confidence}% confidence</span>
          </div>
          <p className="text-base font-semibold text-foreground mt-1.5">{insight.headline}</p>
          <p className="text-sm text-muted mt-1.5 leading-relaxed">{insight.body}</p>
        </div>
      </div>
    </motion.div>
  );
}
