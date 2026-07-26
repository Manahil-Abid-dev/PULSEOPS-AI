import type { Product } from "@/types/product";
import type { Customer } from "@/types/customer";
import type { Order } from "@/types/order";
import type { Invoice } from "@/types/invoice";

/** Invoice statuses that count as recognized revenue (billed, whether or not yet collected). */
const REVENUE_INVOICE_STATUSES = new Set(["Sent", "Paid", "Overdue"]);

export interface ProductAggregate {
  productId: string;
  productName: string;
  unitsSold: number;
  revenue: number;
}

export interface CustomerAggregate {
  customerId: string;
  customerName: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
}

export interface MonthlyRevenuePoint {
  month: string; // e.g. "Jan 2026"
  revenue: number;
}

export interface BusinessMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;

  bestCustomer: { name: string; totalSpent: number; orderCount: number } | null;
  topSellingProduct: { name: string; unitsSold: number } | null;
  highestRevenueProduct: { name: string; revenue: number } | null;

  productsLowStockCount: number;
  productsOutOfStockCount: number;
  lowStockProducts: { name: string; quantity: number }[]; // capped list for prompt-friendliness

  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;

  overdueInvoicesCount: number;
  overdueInvoicesTotal: number;
  overdueInvoices: { invoiceNumber: string; customerName: string; grandTotal: number; dueDate: string }[]; // capped

  monthlyRevenue: MonthlyRevenuePoint[]; // last 6 months
  revenueGrowthPercent: number | null; // vs previous month

  inventoryUnitCount: number;
  inventoryValue: number;

  dormantCustomers: { name: string; daysSinceLastOrder: number }[]; // no order in 40+ days, capped
}

function monthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function computeBusinessMetrics(
  products: Product[],
  customers: Customer[],
  orders: Order[],
  invoices: Invoice[]
): BusinessMetrics {
  const now = Date.now();

  // ---- Product aggregates (units sold / revenue), derived from order line items ----
  const productAgg = new Map<string, ProductAggregate>();
  for (const order of orders) {
    for (const item of order.items ?? []) {
      const key = item.productId || item.productName;
      const existing = productAgg.get(key) ?? {
        productId: item.productId,
        productName: item.productName,
        unitsSold: 0,
        revenue: 0,
      };
      existing.unitsSold += item.quantity ?? 0;
      existing.revenue += (item.quantity ?? 0) * (item.unitPrice ?? 0);
      productAgg.set(key, existing);
    }
  }
  const productAggList = [...productAgg.values()];
  const topSellingProduct = productAggList.sort((a, b) => b.unitsSold - a.unitsSold)[0] ?? null;
  const highestRevenueProduct = [...productAggList].sort((a, b) => b.revenue - a.revenue)[0] ?? null;

  // ---- Customer aggregates ----
  const customerAgg = new Map<string, CustomerAggregate>();
  for (const order of orders) {
    const existing = customerAgg.get(order.customerId) ?? {
      customerId: order.customerId,
      customerName: order.customerName,
      orderCount: 0,
      totalSpent: 0,
      lastOrderAt: null as string | null,
    };
    existing.orderCount += 1;
    existing.totalSpent += order.total ?? 0;
    if (!existing.lastOrderAt || new Date(order.createdAt) > new Date(existing.lastOrderAt)) {
      existing.lastOrderAt = order.createdAt;
    }
    customerAgg.set(order.customerId, existing);
  }
  const customerAggList = [...customerAgg.values()];
  const bestCustomerAgg = customerAggList.sort((a, b) => b.totalSpent - a.totalSpent)[0] ?? null;

  const dormantCustomers = customerAggList
    .filter((c) => c.lastOrderAt)
    .map((c) => ({
      name: c.customerName,
      daysSinceLastOrder: Math.floor((now - new Date(c.lastOrderAt as string).getTime()) / 86_400_000),
    }))
    .filter((c) => c.daysSinceLastOrder >= 40)
    .sort((a, b) => b.daysSinceLastOrder - a.daysSinceLastOrder)
    .slice(0, 5);

  // ---- Revenue (from recognized-status invoices) ----
  const recognizedInvoices = invoices.filter((inv) => REVENUE_INVOICE_STATUSES.has(inv.status));
  const totalRevenue = recognizedInvoices.reduce((sum, inv) => sum + (inv.grandTotal ?? 0), 0);

  const monthlyMap = new Map<string, number>();
  for (const inv of recognizedInvoices) {
    const key = monthKey(inv.createdAt);
    monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + (inv.grandTotal ?? 0));
  }
  const sortedMonthKeys = [...monthlyMap.keys()].sort();
  const last6Keys = sortedMonthKeys.slice(-6);
  const monthlyRevenue: MonthlyRevenuePoint[] = last6Keys.map((key) => ({
    month: monthLabel(key),
    revenue: monthlyMap.get(key) ?? 0,
  }));

  let revenueGrowthPercent: number | null = null;
  if (last6Keys.length >= 2) {
    const prev = monthlyMap.get(last6Keys[last6Keys.length - 2]) ?? 0;
    const curr = monthlyMap.get(last6Keys[last6Keys.length - 1]) ?? 0;
    revenueGrowthPercent = prev > 0 ? ((curr - prev) / prev) * 100 : curr > 0 ? 100 : 0;
  }

  // ---- Orders ----
  const pendingOrders = orders.filter((o) => o.status === "Pending" || o.status === "Processing").length;
  const completedOrders = orders.filter((o) => o.status === "Delivered").length;
  const cancelledOrders = orders.filter((o) => o.status === "Cancelled").length;
  const averageOrderValue = orders.length > 0 ? orders.reduce((s, o) => s + (o.total ?? 0), 0) / orders.length : 0;

  // ---- Inventory ----
  const lowStockProducts = products
    .filter((p) => p.status === "low-stock" || p.status === "out-of-stock")
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, 8)
    .map((p) => ({ name: p.name, quantity: p.quantity }));
  const productsLowStockCount = products.filter((p) => p.status === "low-stock").length;
  const productsOutOfStockCount = products.filter((p) => p.status === "out-of-stock").length;
  const inventoryUnitCount = products.reduce((s, p) => s + (p.quantity ?? 0), 0);
  const inventoryValue = products.reduce((s, p) => s + (p.quantity ?? 0) * (p.price ?? 0), 0);

  // ---- Invoices ----
  const overdueInvoicesList = invoices.filter((inv) => inv.status === "Overdue");
  const overdueInvoicesCount = overdueInvoicesList.length;
  const overdueInvoicesTotal = overdueInvoicesList.reduce((s, inv) => s + (inv.grandTotal ?? 0), 0);
  const overdueInvoices = overdueInvoicesList
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)
    .map((inv) => ({
      invoiceNumber: inv.invoiceNumber,
      customerName: inv.customerName,
      grandTotal: inv.grandTotal,
      dueDate: inv.dueDate,
    }));

  return {
    totalRevenue,
    totalOrders: orders.length,
    averageOrderValue,
    totalCustomers: customers.length,

    bestCustomer: bestCustomerAgg
      ? { name: bestCustomerAgg.customerName, totalSpent: bestCustomerAgg.totalSpent, orderCount: bestCustomerAgg.orderCount }
      : null,
    topSellingProduct: topSellingProduct ? { name: topSellingProduct.productName, unitsSold: topSellingProduct.unitsSold } : null,
    highestRevenueProduct: highestRevenueProduct
      ? { name: highestRevenueProduct.productName, revenue: highestRevenueProduct.revenue }
      : null,

    productsLowStockCount,
    productsOutOfStockCount,
    lowStockProducts,

    pendingOrders,
    completedOrders,
    cancelledOrders,

    overdueInvoicesCount,
    overdueInvoicesTotal,
    overdueInvoices,

    monthlyRevenue,
    revenueGrowthPercent,

    inventoryUnitCount,
    inventoryValue,

    dormantCustomers,
  };
}

/**
 * Renders metrics as a compact, human-readable block for the Gemini prompt.
 * This is what gets sent to the model INSTEAD of raw JSON dumps of every
 * product/customer/order/invoice record — typically a >90% reduction in
 * prompt size, and it also means individual customer PII (emails, phone
 * numbers) never has to leave Firestore to answer aggregate questions.
 */
export function metricsToPromptSummary(m: BusinessMetrics): string {
  const lines: string[] = [];
  lines.push(`Total Revenue (recognized): $${m.totalRevenue.toFixed(2)}`);
  lines.push(`Total Orders: ${m.totalOrders}`);
  lines.push(`Average Order Value: $${m.averageOrderValue.toFixed(2)}`);
  lines.push(`Total Customers: ${m.totalCustomers}`);
  if (m.bestCustomer) lines.push(`Best Customer: ${m.bestCustomer.name} ($${m.bestCustomer.totalSpent.toFixed(2)} across ${m.bestCustomer.orderCount} orders)`);
  if (m.topSellingProduct) lines.push(`Top Selling Product (by units): ${m.topSellingProduct.name} (${m.topSellingProduct.unitsSold} units)`);
  if (m.highestRevenueProduct) lines.push(`Highest Revenue Product: ${m.highestRevenueProduct.name} ($${m.highestRevenueProduct.revenue.toFixed(2)})`);
  lines.push(`Products Low Stock: ${m.productsLowStockCount}, Out of Stock: ${m.productsOutOfStockCount}`);
  if (m.lowStockProducts.length) {
    lines.push(`Low/Out-of-stock items: ${m.lowStockProducts.map((p) => `${p.name} (${p.quantity} left)`).join(", ")}`);
  }
  lines.push(`Pending Orders: ${m.pendingOrders}, Completed: ${m.completedOrders}, Cancelled: ${m.cancelledOrders}`);
  lines.push(`Overdue Invoices: ${m.overdueInvoicesCount} totaling $${m.overdueInvoicesTotal.toFixed(2)}`);
  if (m.overdueInvoices.length) {
    lines.push(
      `Overdue detail: ${m.overdueInvoices.map((i) => `${i.invoiceNumber} (${i.customerName}, $${i.grandTotal.toFixed(2)}, due ${i.dueDate})`).join("; ")}`
    );
  }
  if (m.monthlyRevenue.length) {
    lines.push(`Monthly Revenue (recent): ${m.monthlyRevenue.map((p) => `${p.month}: $${p.revenue.toFixed(2)}`).join(", ")}`);
  }
  if (m.revenueGrowthPercent !== null) {
    lines.push(`Revenue Growth (last month vs prior): ${m.revenueGrowthPercent.toFixed(1)}%`);
  }
  lines.push(`Inventory: ${m.inventoryUnitCount} units on hand, valued at $${m.inventoryValue.toFixed(2)}`);
  if (m.dormantCustomers.length) {
    lines.push(`Customers with no order in 40+ days: ${m.dormantCustomers.map((c) => `${c.name} (${c.daysSinceLastOrder}d)`).join(", ")}`);
  }
  return lines.join("\n");
}
