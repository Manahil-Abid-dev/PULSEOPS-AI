export type TrendDirection = "up" | "down" | "flat";

export interface StatCardData {
  id: string;
  label: string;
  value: string;
  changePercent: number;
  trend: TrendDirection;
  icon: "revenue" | "sales" | "customers" | "products";
  /** True when this value is pulled live from Firebase rather than demo data. */
  live?: boolean;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
  target: number;
}

export interface SalesChannelPoint {
  channel: string;
  sales: number;
}

export type ActivityType = "order" | "customer" | "product" | "payment" | "alert";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
}

export type NotificationLevel = "info" | "success" | "warning" | "error";

export interface NotificationItem {
  id: string;
  level: NotificationLevel;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

export interface LowStockItem {
  id: string;
  name: string;
  sku: string;
  remaining: number;
  threshold: number;
}

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: "plus" | "invoice" | "customer" | "report" | "sparkles" | "trending" | "alert" | "growth";
  href: string;
}

export interface BusinessHealth {
  score: number;
  label: string;
  summary: string;
  factors: { label: string; value: number }[];
}

export interface AIInsight {
  headline: string;
  body: string;
  confidence: number;
  generatedAt: string;
  // Additive fields for the full AI Executive Summary (all optional so the
  // original mock/demo data — and any component only using the fields
  // above — keeps working unchanged).
  revenueSummary?: string;
  inventorySummary?: string;
  customerSummary?: string;
  ordersSummary?: string;
  invoiceSummary?: string;
  opportunities?: string[];
  risks?: string[];
  actionItems?: string[];
  proactiveRecommendations?: string[];
}

/** A single small AI insight card (Top Product, Best Customer, etc. — task "AI Insight Cards"). */
export interface InsightCardData {
  id: string;
  label: string;
  value: string;
  hint?: string;
}

export interface DashboardData {
  stats: StatCardData[];
  revenueTrend: RevenuePoint[];
  salesByChannel: SalesChannelPoint[];
  activity: ActivityItem[];
  notifications: NotificationItem[];
  lowStock: LowStockItem[];
  quickActions: QuickAction[];
  health: BusinessHealth;
  insight: AIInsight;
  /** Optional — populated by the real dashboard API; absent from legacy mock data. */
  insightCards?: InsightCardData[];
  /** True when this payload came from live Firestore + Gemini rather than static mock data. */
  isLive?: boolean;
}
