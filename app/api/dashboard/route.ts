import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/auth-server";
import { checkRateLimit } from "@/lib/rateLimit";
import { getBusinessSnapshot } from "@/lib/businessSnapshot";
import { getExecutiveSummary } from "@/lib/executiveSummary";
import { formatCurrency, formatCompactNumber } from "@/lib/utils";
import type {
  DashboardData,
  StatCardData,
  RevenuePoint,
  SalesChannelPoint,
  ActivityItem,
  NotificationItem,
  LowStockItem,
  QuickAction,
  BusinessHealth,
  AIInsight,
  InsightCardData,
} from "@/types/dashboard";

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

export async function GET(req: NextRequest) {
  try {
    let user;
    try {
      user = await requireAuth(req);
    } catch (err) {
      if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }

    // Dashboard loads are more frequent than chat turns (every page visit),
    // so this gets a more generous limit than the copilot chat endpoint.
    const rate = checkRateLimit(`dashboard:${user.uid}`, 30, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many dashboard refreshes. Please wait a moment." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rate.retryAfterMs / 1000)) } }
      );
    }

    const forceRefresh = req.nextUrl.searchParams.get("refresh") === "1";
    const snapshot = await getBusinessSnapshot({ forceRefresh });
    const { metrics, products, orders, customers } = snapshot;

    const summary = await getExecutiveSummary(metrics, { forceRefresh });

    // ---- stats ----
    const stats: StatCardData[] = [
      {
        id: "revenue",
        label: "Total Revenue",
        value: formatCurrency(metrics.totalRevenue),
        changePercent: metrics.revenueGrowthPercent ?? 0,
        trend: metrics.revenueGrowthPercent === null ? "flat" : metrics.revenueGrowthPercent > 0 ? "up" : metrics.revenueGrowthPercent < 0 ? "down" : "flat",
        icon: "revenue",
        live: true,
      },
      {
        id: "orders",
        label: "Total Orders",
        value: formatCompactNumber(metrics.totalOrders),
        changePercent: 0,
        trend: metrics.pendingOrders > metrics.completedOrders ? "flat" : "up",
        icon: "sales",
        live: true,
      },
      {
        id: "customers",
        label: "Total Customers",
        value: formatCompactNumber(metrics.totalCustomers),
        changePercent: 0,
        trend: "flat",
        icon: "customers",
        live: true,
      },
      {
        id: "products",
        label: "Products",
        value: formatCompactNumber(products.length),
        changePercent: 0,
        trend: metrics.productsOutOfStockCount > 0 ? "down" : "flat",
        icon: "products",
        live: true,
      },
    ];

    // ---- revenue trend (real monthly revenue; "target" is a nominal +8% goal line, not a fabricated actual) ----
    const revenueTrend: RevenuePoint[] =
      metrics.monthlyRevenue.length > 0
        ? metrics.monthlyRevenue.map((point) => ({
            month: point.month,
            revenue: Math.round(point.revenue),
            target: Math.round(point.revenue * 1.08),
          }))
        : [{ month: "This month", revenue: 0, target: 0 }];

    // ---- sales by channel (proxy: revenue by product category, since the schema has no explicit sales channel) ----
    const categoryByProductId = new Map(products.map((p) => [p.id, p.category]));
    const categoryRevenue = new Map<string, number>();
    for (const order of orders) {
      for (const item of order.items ?? []) {
        const category = categoryByProductId.get(item.productId) ?? "Other";
        categoryRevenue.set(category, (categoryRevenue.get(category) ?? 0) + item.quantity * item.unitPrice);
      }
    }
    const salesByChannel: SalesChannelPoint[] = [...categoryRevenue.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([channel, sales]) => ({ channel, sales: Math.round(sales) }));

    // ---- activity feed ----
    const orderActivity: ActivityItem[] = orders
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4)
      .map((order) => ({
        id: `order-${order.id}`,
        type: "order",
        title: `Order ${order.orderNumber} — ${order.status}`,
        description: `${order.customerName} · ${formatCurrency(order.total)}`,
        timestamp: order.createdAt,
      }));
    const customerActivity: ActivityItem[] = customers
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
      .map((customer) => ({
        id: `customer-${customer.id}`,
        type: "customer",
        title: "New customer added",
        description: `${customer.name} (${customer.company})`,
        timestamp: customer.createdAt,
      }));
    const activity = [...orderActivity, ...customerActivity]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 6);

    // ---- low stock ----
    const lowStock: LowStockItem[] = products
      .filter((p) => p.status !== "in-stock")
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 5)
      .map((p) => ({ id: p.id, name: p.name, sku: p.id.slice(0, 6).toUpperCase(), remaining: p.quantity, threshold: 10 }));

    // ---- notifications ----
    const notifications: NotificationItem[] = [
      ...lowStock.map((item) => ({
        id: `notif-stock-${item.id}`,
        level: (item.remaining <= 0 ? "error" : "warning") as NotificationItem["level"],
        title: item.remaining <= 0 ? "Out of stock" : "Low stock alert",
        description: `${item.name} has ${item.remaining} unit${item.remaining === 1 ? "" : "s"} remaining`,
        timestamp: new Date().toISOString(),
        read: false,
      })),
      ...metrics.overdueInvoices.map((inv) => ({
        id: `notif-invoice-${inv.invoiceNumber}`,
        level: "error" as NotificationItem["level"],
        title: "Overdue invoice",
        description: `${inv.invoiceNumber} (${inv.customerName}) — ${formatCurrency(inv.grandTotal)}, due ${new Date(inv.dueDate).toLocaleDateString()}`,
        timestamp: new Date().toISOString(),
        read: false,
      })),
      ...metrics.dormantCustomers.map((c) => ({
        id: `notif-dormant-${c.name}`,
        level: "info" as NotificationItem["level"],
        title: "Customer gone quiet",
        description: `${c.name} hasn't ordered in ${c.daysSinceLastOrder} days`,
        timestamp: new Date().toISOString(),
        read: false,
      })),
    ].slice(0, 8);

    // ---- quick actions (task: Quick Actions) — deep-link into the AI Copilot with a prefilled prompt ----
    const quickActions: QuickAction[] = [
      { id: "analyze", label: "Analyze Business", description: "Full AI executive summary", icon: "sparkles", href: "/copilot?q=" + encodeURIComponent("Give me a full executive summary of my business right now.") },
      { id: "inventory", label: "Inventory Status", description: `${metrics.productsLowStockCount} low, ${metrics.productsOutOfStockCount} out of stock`, icon: "plus", href: "/copilot?q=" + encodeURIComponent("Give me a summary of my current inventory status.") },
      { id: "customers", label: "Customer Insights", description: `${metrics.totalCustomers} customers`, icon: "customer", href: "/copilot?q=" + encodeURIComponent("What insights can you give me about my customers?") },
      { id: "revenue", label: "Revenue Summary", description: formatCurrency(metrics.totalRevenue), icon: "trending", href: "/copilot?q=" + encodeURIComponent("Summarize my revenue performance and trend.") },
      { id: "invoices", label: "Invoice Analysis", description: `${metrics.overdueInvoicesCount} overdue`, icon: "invoice", href: "/copilot?q=" + encodeURIComponent("Analyze my invoices, especially anything overdue.") },
      { id: "risks", label: "Business Risks", description: "What needs attention", icon: "alert", href: "/copilot?q=" + encodeURIComponent("What are the biggest risks in my business right now?") },
      { id: "growth", label: "Growth Opportunities", description: "Where to focus next", icon: "growth", href: "/copilot?q=" + encodeURIComponent("What are my best growth opportunities right now?") },
    ];

    // ---- business health ----
    const inventoryHealthFactor = clamp(100 - metrics.productsOutOfStockCount * 10 - metrics.productsLowStockCount * 4);
    const invoiceHealthFactor = clamp(100 - metrics.overdueInvoicesCount * 12);
    const fulfillmentDenominator = metrics.completedOrders + metrics.cancelledOrders + metrics.pendingOrders || 1;
    const fulfillmentFactor = clamp((metrics.completedOrders / fulfillmentDenominator) * 100);
    const revenueFactor = clamp(50 + (metrics.revenueGrowthPercent ?? 0));

    const health: BusinessHealth = {
      score: Math.round(summary.healthScore),
      label: summary.healthLabel,
      summary: summary.headline,
      factors: [
        { label: "Revenue Growth", value: Math.round(revenueFactor) },
        { label: "Inventory Health", value: Math.round(inventoryHealthFactor) },
        { label: "Invoice Health", value: Math.round(invoiceHealthFactor) },
        { label: "Order Fulfillment", value: Math.round(fulfillmentFactor) },
      ],
    };

    // ---- AI insight (headline card) + full executive summary fields ----
    const insight: AIInsight = {
      headline: summary.headline,
      body: summary.actionItems[0] ?? summary.revenueSummary,
      confidence: 90,
      generatedAt: new Date().toISOString(),
      revenueSummary: summary.revenueSummary,
      inventorySummary: summary.inventorySummary,
      customerSummary: summary.customerSummary,
      ordersSummary: summary.ordersSummary,
      invoiceSummary: summary.invoiceSummary,
      opportunities: summary.opportunities,
      risks: summary.risks,
      actionItems: summary.actionItems,
      proactiveRecommendations: summary.proactiveRecommendations,
    };

    // ---- insight cards ----
    const insightCards: InsightCardData[] = [
      { id: "top-product", label: "Top Product", value: metrics.topSellingProduct?.name ?? "—", hint: metrics.topSellingProduct ? `${metrics.topSellingProduct.unitsSold} units sold` : "No sales yet" },
      { id: "best-customer", label: "Best Customer", value: metrics.bestCustomer?.name ?? "—", hint: metrics.bestCustomer ? formatCurrency(metrics.bestCustomer.totalSpent) : undefined },
      { id: "highest-revenue-product", label: "Highest Revenue Product", value: metrics.highestRevenueProduct?.name ?? "—", hint: metrics.highestRevenueProduct ? formatCurrency(metrics.highestRevenueProduct.revenue) : undefined },
      { id: "lowest-inventory", label: "Lowest Inventory", value: metrics.lowStockProducts[0]?.name ?? "All stocked", hint: metrics.lowStockProducts[0] ? `${metrics.lowStockProducts[0].quantity} left` : undefined },
      { id: "pending-orders", label: "Pending Orders", value: String(metrics.pendingOrders) },
      { id: "overdue-invoices", label: "Overdue Invoices", value: String(metrics.overdueInvoicesCount), hint: metrics.overdueInvoicesCount > 0 ? formatCurrency(metrics.overdueInvoicesTotal) : undefined },
      { id: "revenue-trend", label: "Revenue Trend", value: metrics.revenueGrowthPercent === null ? "—" : `${metrics.revenueGrowthPercent >= 0 ? "+" : ""}${metrics.revenueGrowthPercent.toFixed(1)}%`, hint: "vs. prior month" },
      { id: "monthly-growth", label: "Monthly Growth", value: metrics.revenueGrowthPercent === null ? "—" : `${metrics.revenueGrowthPercent >= 0 ? "+" : ""}${metrics.revenueGrowthPercent.toFixed(1)}%` },
      { id: "avg-order-value", label: "Average Order Value", value: formatCurrency(metrics.averageOrderValue) },
      { id: "inventory-health", label: "Inventory Health", value: `${inventoryHealthFactor}%`, hint: `${metrics.inventoryUnitCount} units on hand` },
    ];

    const data: DashboardData = {
      stats,
      revenueTrend,
      salesByChannel,
      activity,
      notifications,
      lowStock,
      quickActions,
      health,
      insight,
      insightCards,
      isLive: true,
    };

    return NextResponse.json(data);
  } catch (err) {
    console.error("[api/dashboard] unhandled error:", err);
    return NextResponse.json({ error: "Couldn't load dashboard data. Please try again." }, { status: 500 });
  }
}
