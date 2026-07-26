export type ReportExportFormat = "pdf" | "csv";

export type ReportExportType =
  | "revenue"
  | "sales"
  | "orders"
  | "customers"
  | "inventory"
  | "low-stock"
  | "top-products"
  | "full";

export interface RevenuePoint {
  label: string;
  revenue: number;
}

export interface StatusBreakdownPoint {
  status: string;
  count: number;
}

export interface TopProductPoint {
  productId: string;
  name: string;
  quantitySold: number;
  revenue: number;
}

export interface ReportSummary {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  profit: number;
}
