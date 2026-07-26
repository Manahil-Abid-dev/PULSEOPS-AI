"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Lightbulb, ListChecks, Radar } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import type { AIInsight } from "@/types/dashboard";

interface ExecutiveSummaryCardProps {
  insight: AIInsight;
}

function Section({ title, body }: { title: string; body?: string }) {
  if (!body) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">{title}</p>
      <p className="text-sm text-foreground/85 leading-relaxed">{body}</p>
    </div>
  );
}

function BulletList({
  icon: Icon,
  title,
  items,
  tone,
}: {
  icon: typeof Lightbulb;
  title: string;
  items?: string[];
  tone: "success" | "warning" | "primary";
}) {
  if (!items || items.length === 0) return null;
  const toneClass = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-primary";
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2 flex items-center gap-1.5">
        <Icon className={`h-3.5 w-3.5 ${toneClass}`} />
        {title}
      </p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li
            key={i}
            className="text-sm text-foreground/85 leading-relaxed pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-muted"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Renders the full AI Executive Summary. All fields are optional on the
 * AIInsight type, so this gracefully renders nothing extra when given the
 * legacy mock insight (which only has headline/body/confidence).
 */
export function ExecutiveSummaryCard({ insight }: ExecutiveSummaryCardProps) {
  const hasFullSummary =
    insight.revenueSummary || insight.inventorySummary || insight.customerSummary || insight.ordersSummary || insight.invoiceSummary;

  if (!hasFullSummary) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card>
        <CardHeader>
          <CardTitle>AI Executive Summary</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <Section title="Revenue" body={insight.revenueSummary} />
          <Section title="Inventory" body={insight.inventorySummary} />
          <Section title="Customers" body={insight.customerSummary} />
          <Section title="Orders" body={insight.ordersSummary} />
          <Section title="Invoices" body={insight.invoiceSummary} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-white/5">
          <BulletList icon={CheckCircle2} title="Opportunities" items={insight.opportunities} tone="success" />
          <BulletList icon={AlertTriangle} title="Risks" items={insight.risks} tone="warning" />
          <BulletList icon={ListChecks} title="Action Items" items={insight.actionItems} tone="primary" />
          <BulletList icon={Radar} title="Proactive Alerts" items={insight.proactiveRecommendations} tone="warning" />
        </div>
      </Card>
    </motion.div>
  );
}
