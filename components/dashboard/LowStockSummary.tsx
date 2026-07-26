"use client";

import Link from "next/link";
import { PackageX } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import type { LowStockItem } from "@/types/dashboard";

interface LowStockSummaryProps {
  items: LowStockItem[];
}

export function LowStockSummary({ items }: LowStockSummaryProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Low Stock Summary</CardTitle>
        {items.length > 0 && <Badge variant="warning">{items.length} items</Badge>}
      </CardHeader>

      {items.length === 0 ? (
        <EmptyState
          icon={PackageX}
          title="Inventory looks healthy"
          description="No products are currently below their stock threshold."
        />
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const percent = Math.round((item.remaining / item.threshold) * 100);
            return (
              <li key={item.id}>
                <Link
                  href="/products"
                  className="flex items-center justify-between gap-3 rounded-xl p-2 -mx-2 hover:bg-white/5 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground/90 truncate">{item.name}</p>
                    <p className="text-xs text-muted">SKU {item.sku}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-warning">{item.remaining} left</p>
                    <div className="h-1.5 w-20 rounded-full bg-white/5 overflow-hidden mt-1">
                      <div
                        className="h-full rounded-full bg-warning"
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
