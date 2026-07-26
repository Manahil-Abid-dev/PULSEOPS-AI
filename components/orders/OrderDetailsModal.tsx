"use client";

import { Calendar, User, Hash, Pencil } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/order";

const statusVariant: Record<OrderStatus, "primary" | "secondary" | "success" | "warning" | "error"> = {
  Pending: "warning",
  Processing: "primary",
  Shipped: "secondary",
  Delivered: "success",
  Cancelled: "error",
};

interface OrderDetailsModalProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
  onEdit: () => void;
}

export function OrderDetailsModal({ open, onClose, order, onEdit }: OrderDetailsModalProps) {
  if (!order) return null;

  return (
    <Modal open={open} onClose={onClose} title="Order Details" className="max-w-lg">
      <div className="flex items-center gap-3 -mt-1 mb-5">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0">
          <Hash className="h-6 w-6 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-base font-semibold text-foreground truncate">{order.orderNumber}</p>
          <Badge variant={statusVariant[order.status]} className="mt-1">
            {order.status}
          </Badge>
        </div>
      </div>

      <dl className="space-y-3 mb-5">
        <div className="flex items-center gap-3 text-sm">
          <User className="h-4 w-4 text-muted shrink-0" />
          <dt className="sr-only">Customer</dt>
          <dd className="text-foreground/90">{order.customerName}</dd>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Calendar className="h-4 w-4 text-muted shrink-0" />
          <dt className="sr-only">Created</dt>
          <dd className="text-foreground/90">
            {new Date(order.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </dd>
        </div>
      </dl>

      <div className="rounded-xl border border-white/10 overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03]">
              <th className="text-left font-medium text-muted text-xs px-3 py-2">Product</th>
              <th className="text-right font-medium text-muted text-xs px-3 py-2">Qty</th>
              <th className="text-right font-medium text-muted text-xs px-3 py-2">Price</th>
              <th className="text-right font-medium text-muted text-xs px-3 py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={`${item.productId}-${index}`} className="border-b border-white/5 last:border-0">
                <td className="px-3 py-2 text-foreground/90">{item.productName}</td>
                <td className="px-3 py-2 text-right text-foreground/80">{item.quantity}</td>
                <td className="px-3 py-2 text-right text-foreground/80">{formatCurrency(item.unitPrice)}</td>
                <td className="px-3 py-2 text-right text-foreground/90 font-medium">
                  {formatCurrency(item.quantity * item.unitPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3 mb-6">
        <span className="text-sm text-muted">Order total</span>
        <span className="text-base font-semibold text-foreground">{formatCurrency(order.total)}</span>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="md" className="flex-1" onClick={onClose}>
          Close
        </Button>
        <Button size="md" className="flex-1" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Button>
      </div>
    </Modal>
  );
}
