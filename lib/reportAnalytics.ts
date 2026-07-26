import type { Order } from "@/types/order";
import type { Invoice } from "@/types/invoice";
import type { Product } from "@/types/product";
import type { Customer } from "@/types/customer";
import type { RevenuePoint, StatusBreakdownPoint, TopProductPoint, ReportSummary } from "@/types/report";

/** Invoice statuses that count as recognized revenue (Draft invoices aren't finalized yet). */
const RECOGNIZED_STATUSES = new Set(["Sent", "Paid", "Overdue"]);

function isRecognized(invoice: Invoice): boolean {
  return RECOGNIZED_STATUSES.has(invoice.status);
}

/** Headline numbers for the Reports dashboard cards, computed live from Firestore-backed data. */
export function computeReportSummary(
  orders: Order[],
  invoices: Invoice[],
  products: Product[],
  customers: Customer[]
): ReportSummary {
  const recognized = invoices.filter(isRecognized);
  const totalRevenue = recognized.reduce((sum, inv) => sum + inv.grandTotal, 0);
  // Profit proxy: recognized product revenue net of discounts, excluding pass-through tax.
  const profit = recognized.reduce((sum, inv) => sum + (inv.subtotal - inv.discount), 0);
  return {
    totalRevenue,
    totalOrders: orders.length,
    totalProducts: products.length,
    totalCustomers: customers.length,
    profit,
  };
}

type Granularity = "day" | "week" | "month";

function dateKey(iso: string, granularity: Granularity): { key: string; label: string } {
  const date = new Date(iso);
  if (granularity === "day") {
    const key = date.toISOString().slice(0, 10);
    return { key, label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }) };
  }
  if (granularity === "week") {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - firstDayOfYear.getTime()) / 86400000);
    const week = Math.ceil((days + firstDayOfYear.getDay() + 1) / 7);
    return { key: `${date.getFullYear()}-W${week}`, label: `Week ${week}` };
  }
  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  return { key, label: date.toLocaleDateString(undefined, { month: "short", year: "2-digit" }) };
}

/** Buckets recognized invoice revenue into daily, weekly, or monthly points for the revenue charts. */
export function computeRevenueSeries(invoices: Invoice[], granularity: Granularity, buckets: number): RevenuePoint[] {
  const recognized = invoices.filter(isRecognized);
  const map = new Map<string, RevenuePoint>();

  for (const invoice of recognized) {
    const { key, label } = dateKey(invoice.createdAt, granularity);
    const existing = map.get(key);
    if (existing) {
      existing.revenue += invoice.grandTotal;
    } else {
      map.set(key, { label, revenue: invoice.grandTotal });
    }
  }

  return Array.from(map.keys())
    .sort()
    .slice(-buckets)
    .map((key) => map.get(key) as RevenuePoint);
}

/** Order counts grouped by status, used for the orders pie chart. */
export function computeOrderStatusBreakdown(orders: Order[]): StatusBreakdownPoint[] {
  const counts = new Map<string, number>();
  for (const order of orders) {
    counts.set(order.status, (counts.get(order.status) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([status, count]) => ({ status, count }));
}

/** Best-selling products by units sold across all non-cancelled orders. */
export function computeTopProducts(orders: Order[], limit = 5): TopProductPoint[] {
  const map = new Map<string, TopProductPoint>();
  for (const order of orders) {
    if (order.status === "Cancelled") continue;
    for (const item of order.items) {
      const revenue = item.quantity * item.unitPrice;
      const existing = map.get(item.productId);
      if (existing) {
        existing.quantitySold += item.quantity;
        existing.revenue += revenue;
      } else {
        map.set(item.productId, {
          productId: item.productId,
          name: item.productName,
          quantitySold: item.quantity,
          revenue,
        });
      }
    }
  }
  return Array.from(map.values())
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, limit);
}
