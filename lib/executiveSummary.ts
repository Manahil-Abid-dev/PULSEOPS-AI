import { generateGuardedContent, extractJson } from "./aiClient";
import { metricsToPromptSummary, type BusinessMetrics } from "./businessMetrics";

export interface ExecutiveSummary {
  healthScore: number; // 0-100
  healthLabel: string; // e.g. "Excellent" | "Good" | "Fair" | "Needs Attention"
  headline: string;
  revenueSummary: string;
  inventorySummary: string;
  customerSummary: string;
  ordersSummary: string;
  invoiceSummary: string;
  opportunities: string[];
  risks: string[];
  actionItems: string[];
  proactiveRecommendations: string[];
}

const PROMPT_INSTRUCTIONS = `You are generating the daily AI Executive Summary for a business owner's dashboard.

Using ONLY the business metrics provided, return a JSON object with exactly these fields:
{
  "healthScore": number (0-100, your overall assessment of business health),
  "healthLabel": one of "Excellent" | "Good" | "Fair" | "Needs Attention",
  "headline": a single punchy sentence (max 20 words) summarizing the most important thing right now,
  "revenueSummary": 1-2 sentences about revenue performance and trend,
  "inventorySummary": 1-2 sentences about stock levels and inventory health,
  "customerSummary": 1-2 sentences about customer base and best customers,
  "ordersSummary": 1-2 sentences about order volume and fulfillment status,
  "invoiceSummary": 1-2 sentences about invoicing and overdue payments,
  "opportunities": array of 2-4 short, specific growth opportunities grounded in the metrics,
  "risks": array of 2-4 short, specific risks grounded in the metrics,
  "actionItems": array of 2-4 short, concrete, practical next actions (e.g. "Restock Product X before next week"),
  "proactiveRecommendations": array of 2-4 short standalone alerts a proactive assistant would surface unprompted (e.g. "Customer ABC has not ordered in 42 days.", "Invoice INV-105 is 6 days overdue.")
}

Every field must be grounded in the metrics given — never invent a specific product, customer, or invoice name that isn't in the data. If a category has nothing noteworthy, say so briefly rather than fabricating detail.`;

// Cache the generated summary alongside a lightweight fingerprint of the
// metrics it was built from, so we don't call Gemini again for the same
// data (task 10: avoid unnecessary AI calls), while still regenerating
// automatically whenever the underlying numbers actually change.
let cachedSummary: { fingerprint: string; summary: ExecutiveSummary; generatedAt: number } | null = null;

function fingerprint(metrics: BusinessMetrics): string {
  return JSON.stringify({
    r: Math.round(metrics.totalRevenue),
    o: metrics.totalOrders,
    c: metrics.totalCustomers,
    low: metrics.productsLowStockCount,
    out: metrics.productsOutOfStockCount,
    overdue: metrics.overdueInvoicesCount,
    growth: metrics.revenueGrowthPercent === null ? null : Math.round(metrics.revenueGrowthPercent),
  });
}

const SUMMARY_TTL_MS = 5 * 60_000;

export async function getExecutiveSummary(metrics: BusinessMetrics, opts: { forceRefresh?: boolean } = {}): Promise<ExecutiveSummary> {
  const fp = fingerprint(metrics);
  const now = Date.now();

  if (!opts.forceRefresh && cachedSummary && cachedSummary.fingerprint === fp && now - cachedSummary.generatedAt < SUMMARY_TTL_MS) {
    return cachedSummary.summary;
  }

  const summaryText = metricsToPromptSummary(metrics);

  let parsed: ExecutiveSummary;
  try {
    const raw = await generateGuardedContent({
      businessDataSummary: summaryText,
      userContent: PROMPT_INSTRUCTIONS,
      expectJson: true,
    });
    parsed = extractJson<ExecutiveSummary>(raw);
  } catch (err) {
    // Covers BOTH failure modes: the Gemini call itself throwing (quota
    // exhausted, network error, 503, etc.) and the model returning
    // malformed JSON. Either way, fall back to the deterministic,
    // metrics-only summary so a Gemini-side outage never takes down the
    // whole dashboard.
    console.error("[executiveSummary] falling back to deterministic summary:", err);
    parsed = buildFallbackSummary(metrics);
  }

  cachedSummary = { fingerprint: fp, summary: parsed, generatedAt: now };
  return parsed;
}

/** Deterministic, non-AI fallback so the dashboard degrades gracefully instead of erroring if Gemini is unavailable or returns bad output. */
function buildFallbackSummary(metrics: BusinessMetrics): ExecutiveSummary {
  const growth = metrics.revenueGrowthPercent;
  const healthScore = Math.max(
    0,
    Math.min(
      100,
      70 +
        (growth && growth > 0 ? 10 : growth && growth < 0 ? -10 : 0) -
        metrics.overdueInvoicesCount * 3 -
        metrics.productsOutOfStockCount * 2
    )
  );
  const healthLabel = healthScore >= 80 ? "Excellent" : healthScore >= 60 ? "Good" : healthScore >= 40 ? "Fair" : "Needs Attention";

  return {
    healthScore,
    healthLabel,
    headline: `Business health is ${healthLabel.toLowerCase()} based on current metrics.`,
    revenueSummary: `Recognized revenue is $${metrics.totalRevenue.toFixed(2)} across ${metrics.totalOrders} orders.`,
    inventorySummary: `${metrics.productsLowStockCount} product(s) are low on stock and ${metrics.productsOutOfStockCount} are out of stock.`,
    customerSummary: metrics.bestCustomer
      ? `${metrics.bestCustomer.name} is your top customer with $${metrics.bestCustomer.totalSpent.toFixed(2)} spent.`
      : "No customer order history yet.",
    ordersSummary: `${metrics.pendingOrders} order(s) pending, ${metrics.completedOrders} completed, ${metrics.cancelledOrders} cancelled.`,
    invoiceSummary: `${metrics.overdueInvoicesCount} invoice(s) overdue totaling $${metrics.overdueInvoicesTotal.toFixed(2)}.`,
    opportunities: metrics.highestRevenueProduct ? [`Promote ${metrics.highestRevenueProduct.name}, your highest-revenue product.`] : [],
    risks: metrics.overdueInvoicesCount > 0 ? [`${metrics.overdueInvoicesCount} overdue invoice(s) need follow-up.`] : [],
    actionItems: metrics.lowStockProducts.slice(0, 3).map((p) => `Restock ${p.name} (${p.quantity} left).`),
    proactiveRecommendations: metrics.dormantCustomers.slice(0, 3).map((c) => `${c.name} has not ordered in ${c.daysSinceLastOrder} days.`),
  };
}

export const EXECUTIVE_SUMMARY_TTL_MS = SUMMARY_TTL_MS;