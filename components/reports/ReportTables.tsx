"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import type { Product, ProductStatus } from "@/types/product";

const statusVariant: Record<ProductStatus, "success" | "warning" | "error"> = {
  "in-stock": "success",
  "low-stock": "warning",
  "out-of-stock": "error",
};

const statusLabel: Record<ProductStatus, string> = {
  "in-stock": "In Stock",
  "low-stock": "Low Stock",
  "out-of-stock": "Out of Stock",
};

interface InventoryTableProps {
  products: Product[];
  title: string;
  emptyLabel: string;
}

export function InventoryTable({ products, title, emptyLabel }: InventoryTableProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      {products.length === 0 ? (
        <p className="text-xs text-muted py-6 text-center">{emptyLabel}</p>
      ) : (
        <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
          <table className="w-full text-sm min-w-[420px]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left font-medium text-muted text-xs pb-2">Product</th>
                <th className="text-right font-medium text-muted text-xs pb-2">Qty</th>
                <th className="text-right font-medium text-muted text-xs pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-white/5 last:border-0">
                  <td className="py-2.5 pr-3 text-foreground/90 truncate max-w-[180px]">{p.name}</td>
                  <td className="py-2.5 text-right text-foreground/80">{p.quantity}</td>
                  <td className="py-2.5 text-right">
                    <Badge variant={statusVariant[p.status]}>{statusLabel[p.status]}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export interface CustomerSpendRow {
  id: string;
  name: string;
  company: string;
  orderCount: number;
  totalSpent: number;
}

interface CustomerSpendTableProps {
  rows: CustomerSpendRow[];
}

export function CustomerSpendTable({ rows }: CustomerSpendTableProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Top Customers</CardTitle>
      </CardHeader>
      {rows.length === 0 ? (
        <p className="text-xs text-muted py-6 text-center">No customer orders yet</p>
      ) : (
        <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
          <table className="w-full text-sm min-w-[420px]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left font-medium text-muted text-xs pb-2">Customer</th>
                <th className="text-right font-medium text-muted text-xs pb-2">Orders</th>
                <th className="text-right font-medium text-muted text-xs pb-2">Spent</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-white/5 last:border-0">
                  <td className="py-2.5 pr-3 text-foreground/90 truncate max-w-[180px]">
                    {r.name}
                    <span className="text-muted"> — {r.company}</span>
                  </td>
                  <td className="py-2.5 text-right text-foreground/80">{r.orderCount}</td>
                  <td className="py-2.5 text-right text-foreground/90 font-medium">{formatCurrency(r.totalSpent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
