"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, type TooltipProps } from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCompactNumber } from "@/lib/utils";
import type { SalesChannelPoint } from "@/types/dashboard";

interface SalesOverviewProps {
  data: SalesChannelPoint[];
  isLive?: boolean;
}

const COLORS = ["#3b82f6", "#a855f7", "#10b981", "#f97316"];

function ChartTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0];
  return (
    <div className="glass-card rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="text-foreground/80 font-medium">{entry.payload.channel}</p>
      <p className="text-muted">{formatCompactNumber(Number(entry.value))} sales</p>
    </div>
  );
}

export function SalesOverview({ data, isLive }: SalesOverviewProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Sales by Category</CardTitle>
        <Badge variant={isLive ? "success" : "neutral"}>{isLive ? "Live" : "Demo data"}</Badge>
      </CardHeader>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis
              dataKey="channel"
              type="category"
              width={92}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(148,163,184,0.06)" }} />
            <Bar dataKey="sales" radius={[0, 8, 8, 0]} barSize={18}>
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
