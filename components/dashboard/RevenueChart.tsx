"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCompactNumber, formatCurrency } from "@/lib/utils";
import type { RevenuePoint } from "@/types/dashboard";

interface RevenueChartProps {
  data: RevenuePoint[];
  isLive?: boolean;
}

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="glass-card rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="text-foreground/80 font-medium mb-1">{label}</p>
      {payload.map((entry: { dataKey?: string | number; color?: string; name?: string; value?: number | string }, i: number) => (
        <p key={i} className="flex items-center gap-1.5" style={{ color: entry.color }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: entry.color }} />
          {entry.name}: {formatCurrency(Number(entry.value))}
        </p>
      ))}
    </div>
  );
}

export function RevenueChart({ data, isLive }: RevenueChartProps) {
  const totalRevenue = data.reduce((sum, point) => sum + point.revenue, 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle>Revenue Overview</CardTitle>
          <p className="text-xs text-muted mt-1">{formatCurrency(totalRevenue)} recent months</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isLive ? "success" : "neutral"}>{isLive ? "Live" : "Demo data"}</Badge>
        </div>
      </CardHeader>

      <div className="h-72 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => formatCompactNumber(v)}
              width={44}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(148,163,184,0.2)" }} />
            <Area
              type="monotone"
              dataKey="target"
              name="Target"
              stroke="#a855f7"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fill="url(#targetGradient)"
            />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
