"use client";

import { Tag, DollarSign, Boxes, Calendar, Pencil } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
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

interface ProductDetailsModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  onEdit: () => void;
}

export function ProductDetailsModal({ open, onClose, product, onEdit }: ProductDetailsModalProps) {
  if (!product) return null;

  return (
    <Modal open={open} onClose={onClose} title="Product Details">
      <div className="flex items-center gap-3 -mt-1 mb-5">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0">
          <Boxes className="h-6 w-6 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-base font-semibold text-foreground truncate">{product.name}</p>
          <Badge variant={statusVariant[product.status]} className="mt-1">
            {statusLabel[product.status]}
          </Badge>
        </div>
      </div>

      <dl className="space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <Tag className="h-4 w-4 text-muted shrink-0" />
          <dt className="sr-only">Category</dt>
          <dd className="text-foreground/90">{product.category}</dd>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <DollarSign className="h-4 w-4 text-muted shrink-0" />
          <dt className="sr-only">Price</dt>
          <dd className="text-foreground/90">{formatCurrency(product.price)}</dd>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Boxes className="h-4 w-4 text-muted shrink-0" />
          <dt className="sr-only">Quantity in stock</dt>
          <dd className="text-foreground/90">{product.quantity} units</dd>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Calendar className="h-4 w-4 text-muted shrink-0" />
          <dt className="sr-only">Created</dt>
          <dd className="text-foreground/90">
            {new Date(product.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </dd>
        </div>
      </dl>

      <div className="flex items-center gap-3 pt-6">
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
