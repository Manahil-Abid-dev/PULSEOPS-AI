"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, AlertTriangle, Mail, RefreshCw, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { useToast } from "@/components/providers/ToastProvider";
import { requireIdToken } from "@/lib/clientAuth";
import { cn } from "@/lib/utils";

type ActionKey = "briefing" | "alerts" | "winback" | "sync";

interface AutomationAction {
  key: ActionKey;
  label: string;
  description: string;
  icon: typeof Rocket;
  accent: string; // tailwind color token, e.g. "primary" | "warning" | "secondary" | "success"
  successMessage: string;
}

const ACTIONS: AutomationAction[] = [
  {
    key: "briefing",
    label: "Executive Briefing",
    description: "Generate the daily health score & headline summary",
    icon: Rocket,
    accent: "primary",
    successMessage: "Executive Briefing generated! Check the Daily Summary & Audit Feed section to view results.",
  },
  {
    key: "alerts",
    label: "Inventory & Stock Scan",
    description: "Scan for low stock and overdue invoices",
    icon: AlertTriangle,
    accent: "warning",
    successMessage: "Stock Scan completed! Check the Inventory & Alerts tab to see updated thresholds.",
  },
  {
    key: "winback",
    label: "Customer Retention",
    description: "Find dormant buyers and trigger win-back outreach",
    icon: Mail,
    accent: "secondary",
    successMessage: "Win-Back Campaign triggered! Check the Customer Logs & Email Feed to verify activity.",
  },
  {
    key: "sync",
    label: "System Data Sync",
    description: "Force-refresh live products, orders & invoice data",
    icon: RefreshCw,
    accent: "success",
    successMessage: "System Data Sync executed! Check the Real-Time Analytics Dashboard to see live metrics.",
  },
];

const accentClasses: Record<string, { icon: string; glow: string; border: string }> = {
  primary: {
    icon: "from-primary/25 to-primary/5 text-primary",
    glow: "hover:shadow-primary/20",
    border: "hover:border-primary/40",
  },
  warning: {
    icon: "from-warning/25 to-warning/5 text-warning",
    glow: "hover:shadow-warning/20",
    border: "hover:border-warning/40",
  },
  secondary: {
    icon: "from-secondary/25 to-secondary/5 text-secondary",
    glow: "hover:shadow-secondary/20",
    border: "hover:border-secondary/40",
  },
  success: {
    icon: "from-success/25 to-success/5 text-success",
    glow: "hover:shadow-success/20",
    border: "hover:border-success/40",
  },
};

export function AutomationControlPanel() {
  const { showToast } = useToast();
  const [runningKey, setRunningKey] = useState<ActionKey | null>(null);
  const [banner, setBanner] = useState<{ action: ActionKey; message: string } | null>(null);

  async function runAction(action: AutomationAction) {
    if (runningKey) return; // one at a time keeps feedback unambiguous
    setRunningKey(action.key);
    setBanner(null);

    try {
      const token = await requireIdToken();
      const res = await fetch("/api/automation/trigger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: action.key }),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        // non-JSON body (e.g. an infra error page) — never surface raw markup
      }

      if (!res.ok) {
        throw new Error(data?.error || "That automation failed to run. Please try again.");
      }

      setBanner({ action: action.key, message: action.successMessage });
      showToast("success", action.label, action.successMessage);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      showToast("error", `${action.label} failed`, message);
    } finally {
      setRunningKey(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Automation Control Panel</CardTitle>
        <span className="text-[11px] uppercase tracking-wider text-muted">Run on demand</span>
      </CardHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {ACTIONS.map((action, index) => {
          const Icon = action.icon;
          const isRunning = runningKey === action.key;
          const isDisabled = runningKey !== null && !isRunning;
          const accent = accentClasses[action.accent];

          return (
            <motion.button
              key={action.key}
              type="button"
              onClick={() => runAction(action)}
              disabled={isDisabled}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={cn(
                "group relative flex flex-col items-start gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-4 text-left",
                "transition-all duration-300 shadow-lg shadow-black/10",
                !isDisabled && accent.border,
                !isDisabled && accent.glow,
                !isDisabled && "hover:bg-white/5 hover:-translate-y-0.5",
                isDisabled && "opacity-40 cursor-not-allowed"
              )}
            >
              <div
                className={cn(
                  "h-9 w-9 rounded-lg bg-gradient-to-br flex items-center justify-center transition-transform duration-300",
                  accent.icon,
                  !isDisabled && "group-hover:scale-110"
                )}
              >
                {isRunning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-foreground/90">{action.label}</p>
                <p className="text-xs text-muted mt-0.5 line-clamp-2">{action.description}</p>
              </div>

              {isRunning && (
                <span className="absolute top-3 right-3 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {banner && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 14 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-3 rounded-xl border border-success/20 bg-success/5 px-4 py-3">
              <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
              <p className="text-xs text-foreground/80 flex-1">{banner.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
