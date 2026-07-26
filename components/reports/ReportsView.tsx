"use client";

import { useMemo, useState } from "react";
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, FileDown, FileText } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useOrders } from "@/hooks/useOrders";
import { useInvoices } from "@/hooks/useInvoices";
import { useProducts } from "@/hooks/useProducts";
import { useCustomers } from "@/hooks/useCustomers";
import { useToast } from "@/components/providers/ToastProvider";
import { formatCurrency } from "@/lib/utils";
import { downloadCsv, printCurrentPage } from "@/lib/exportUtils";
import { logReportExport } from "@/services/reportService";
import {
  computeReportSummary,
  computeRevenueSeries,
  computeOrderStatusBreakdown,
  computeTopProducts,
} from "@/lib/reportAnalytics";
import { RevenueLineChart, TopProductsBarChart, OrderStatusPieChart } from "@/components/reports/ReportCharts";
import { InventoryTable, CustomerSpendTable, type CustomerSpendRow } from "@/components/reports/ReportTables";

type Granularity = "day" | "week" | "month";

const granularityOptions: { value: Granularity; label: string; buckets: number }[] = [
  { value: "day", label: "Daily", buckets: 14 },
  { value: "week", label: "Weekly", buckets: 8 },
  { value: "month", label: "Monthly", buckets: 12 },
];

const summaryCards = [
  { key: "totalRevenue" as const, label: "Total Revenue", icon: DollarSign, format: "currency" as const },
  { key: "totalOrders" as const, label: "Orders", icon: ShoppingCart, format: "number" as const },
  { key: "totalProducts" as const, label: "Products", icon: Package, format: "number" as const },
  { key: "totalCustomers" as const, label: "Customers", icon: Users, format: "number" as const },
  { key: "profit" as const, label: "Profit", icon: TrendingUp, format: "currency" as const },
];

export function ReportsView() {
  const { orders } = useOrders();
  const { invoices } = useInvoices();
  const { products } = useProducts();
  const { customers } = useCustomers();
  const { showToast } = useToast();

  const [granularity, setGranularity] = useState<Granularity>("month");

  const summary = useMemo(
    () => computeReportSummary(orders, invoices, products, customers),
    [orders, invoices, products, customers]
  );

  const activeGranularity = granularityOptions.find((g) => g.value === granularity) ?? granularityOptions[2];
  const revenueSeries = useMemo(
    () => computeRevenueSeries(invoices, granularity, activeGranularity.buckets),
    [invoices, granularity, activeGranularity.buckets]
  );

  const statusBreakdown = useMemo(() => computeOrderStatusBreakdown(orders), [orders]);
  const topProducts = useMemo(() => computeTopProducts(orders, 6), [orders]);
  const lowStockProducts = useMemo(
    () => products.filter((p) => p.status !== "in-stock").sort((a, b) => a.quantity - b.quantity),
    [products]
  );

  const customerSpend: CustomerSpendRow[] = useMemo(() => {
    const map = new Map<string, CustomerSpendRow>();
    for (const order of orders) {
      if (order.status === "Cancelled") continue;
      const customer = customers.find((c) => c.id === order.customerId);
      const existing = map.get(order.customerId);
      if (existing) {
        existing.orderCount += 1;
        existing.totalSpent += order.total;
      } else {
        map.set(order.customerId, {
          id: order.customerId,
          name: customer?.name ?? order.customerName,
          company: customer?.company ?? "",
          orderCount: 1,
          totalSpent: order.total,
        });
      }
    }
    return Array.from(map.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 6);
  }, [orders, customers]);

  async function handleExportCsv() {
    const rows: Record<string, string | number>[] = [
      { section: "Summary", metric: "Total Revenue", value: formatCurrency(summary.totalRevenue) },
      { section: "Summary", metric: "Orders", value: summary.totalOrders },
      { section: "Summary", metric: "Products", value: summary.totalProducts },
      { section: "Summary", metric: "Customers", value: summary.totalCustomers },
      { section: "Summary", metric: "Profit", value: formatCurrency(summary.profit) },
      ...statusBreakdown.map((s) => ({ section: "Orders by Status", metric: s.status, value: s.count })),
      ...topProducts.map((p) => ({
        section: "Top Selling Products",
        metric: p.name,
        value: `${p.quantitySold} units / ${formatCurrency(p.revenue)}`,
      })),
      ...lowStockProducts.map((p) => ({ section: "Low Stock", metric: p.name, value: `${p.quantity} remaining` })),
      ...customerSpend.map((c) => ({
        section: "Top Customers",
        metric: `${c.name} — ${c.company}`,
        value: `${c.orderCount} orders / ${formatCurrency(c.totalSpent)}`,
      })),
    ];
    downloadCsv("pulseops-report", rows);
    try {
      await logReportExport("full", "csv");
    } catch {
      // Export already downloaded locally; the audit log is best-effort.
    }
    showToast("success", "Report exported", "Your CSV download has started.");
  }

  async function handleExportPdf() {
    printCurrentPage();
    try {
      await logReportExport("full", "pdf");
    } catch {
      // Print dialog already opened; the audit log is best-effort.
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap print:hidden">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Reports</h1>
          <p className="text-sm text-muted mt-1">Revenue, sales, inventory, and customer performance at a glance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCsv}>
            <FileDown className="h-3.5 w-3.5" /> Export CSV
          </Button>
          <Button size="sm" onClick={handleExportPdf}>
            <FileText className="h-3.5 w-3.5" /> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          const value = summary[card.key];
          return (
            <Card key={card.key} hoverable>
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted">{card.label}</p>
                  <p className="text-xl font-bold text-foreground mt-1.5 tracking-tight truncate">
                    {card.format === "currency" ? formatCurrency(value) : value}
                  </p>
                </div>
                <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center">
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-2">
          <div className="flex items-center justify-end gap-1.5 print:hidden">
            {granularityOptions.map((g) => (
              <button
                key={g.value}
                onClick={() => setGranularity(g.value)}
                className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                  granularity === g.value ? "bg-primary/15 text-primary" : "text-muted hover:text-foreground"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
          <RevenueLineChart data={revenueSeries} title="Revenue Report" />
        </div>
        <OrderStatusPieChart data={statusBreakdown} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <TopProductsBarChart data={topProducts} />
        <CustomerSpendTable rows={customerSpend} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <InventoryTable products={products} title="Inventory Report" emptyLabel="No products yet" />
        <InventoryTable
          products={lowStockProducts}
          title="Low Stock Report"
          emptyLabel="Everything is well stocked"
        />
      </div>
    </div>
  );
}
