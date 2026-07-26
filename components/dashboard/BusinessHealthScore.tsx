"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import type { BusinessHealth } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface BusinessHealthScoreProps {
  health: BusinessHealth;
}

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function BusinessHealthScore({ health }: BusinessHealthScoreProps) {
  const offset = CIRCUMFERENCE - (health.score / 100) * CIRCUMFERENCE;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Business Health Score
        </CardTitle>
      </CardHeader>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative h-32 w-32 shrink-0">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="10" />
            <motion.circle
              cx="60"
              cy="60"
              r={RADIUS}
              fill="none"
              stroke="url(#health-gradient)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="health-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-foreground">{health.score}</span>
            <span className="text-xs text-muted">{health.label}</span>
          </div>
        </div>

        <div className="flex-1 w-full space-y-3">
          <p className="text-sm text-muted">{health.summary}</p>
          <div className="space-y-2">
            {health.factors.map((factor) => (
              <div key={factor.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-foreground/70">{factor.label}</span>
                  <span className="text-muted">{factor.value}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className={cn(
                      "h-full rounded-full",
                      factor.value >= 80
                        ? "bg-success"
                        : factor.value >= 60
                        ? "bg-primary"
                        : "bg-warning"
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${factor.value}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
