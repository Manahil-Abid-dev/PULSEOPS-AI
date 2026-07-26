"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  type TooltipProps,
} from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCompactNumber, formatCurrency } from "@/lib/utils";
import type { RevenuePoint, StatusBreakdownPoint, TopProductPoint } from "@/types/report";

const PALETTE = ["#3b82f6", "#a855f7", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4"];

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="glass-card rounded-xl px-3 py-2 shadow-xl text-xs">
      {label ? <p className="text-foreground/80 font-medium mb-1">{label}</p> : null}
      {payload.map((entry, i) => (
        <p key={i} className="flex items-center gap-1.5" style={{ color: entry.color }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: entry.color }} />
          {entry.name}: {typeof entry.value === "number" ? formatCurrency(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
}

interface RevenueLineChartProps {
  data: RevenuePoint[];
  title: string;
}

export function RevenueLineChart({ data, title }: RevenueLineChartProps) {
  const total = data.reduce((sum, p) => sum + p.revenue, 0);
  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="text-xs text-muted mt-1">{formatCurrency(total)} recognized</p>
        </div>
      </CardHeader>
      <div className="h-64 -ml-2">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-muted">Not enough data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => formatCompactNumber(v)}
                width={44}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(148,163,184,0.2)" }} />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#3b82f6" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

interface TopProductsBarChartProps {
  data: TopProductPoint[];
}

export function TopProductsBarChart({ data }: TopProductsBarChartProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
      </CardHeader>
      <div className="h-64 -ml-2">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-muted">No sales recorded yet</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} width={32} />
              <Tooltip
                cursor={{ fill: "rgba(148,163,184,0.06)" }}
                content={({ active, payload, label }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  return (
                    <div className="glass-card rounded-xl px-3 py-2 shadow-xl text-xs">
                      <p className="text-foreground/80 font-medium mb-1">{label}</p>
                      <p className="text-primary">{payload[0].value} units sold</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="quantitySold" name="Units sold" radius={[6, 6, 0, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

interface OrderStatusPieChartProps {
  data: StatusBreakdownPoint[];
}

export function OrderStatusPieChart({ data }: OrderStatusPieChartProps) {
  const total = data.reduce((sum, p) => sum + p.count, 0);
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Orders by Status</CardTitle>
      </CardHeader>
      <div className="h-64">
        {total === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-muted">No orders yet</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="status"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                strokeWidth={0}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  const entry = payload[0];
                  return (
                    <div className="glass-card rounded-xl px-3 py-2 shadow-xl text-xs">
                      <p className="text-foreground/80">
                        {entry.name}: {entry.value} orders
                      </p>
                    </div>
                  );
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={32}
                formatter={(value: string) => <span className="text-xs text-muted">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
