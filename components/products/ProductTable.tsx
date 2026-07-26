"use client";

import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, ArrowUpDown, Eye, Pencil, Trash2, Package } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn, formatCurrency } from "@/lib/utils";
import type { Product, ProductSortField, ProductStatus, SortDirection } from "@/types/product";

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

interface Column {
  field: ProductSortField;
  label: string;
  hideOnMobile?: boolean;
}

const columns: Column[] = [
  { field: "name", label: "Product" },
  { field: "category", label: "Category", hideOnMobile: true },
  { field: "price", label: "Price" },
  { field: "quantity", label: "Stock" },
];

interface ProductTableProps {
  products: Product[];
  sortField: ProductSortField;
  sortDirection: SortDirection;
  onSort: (field: ProductSortField) => void;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductTable({
  products,
  sortField,
  sortDirection,
  onSort,
  onView,
  onEdit,
  onDelete,
}: ProductTableProps) {
  return (
    <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
      <table className="w-full text-sm min-w-[640px]">
        <thead>
          <tr className="border-b border-white/5">
            {columns.map((col) => {
              const active = sortField === col.field;
              return (
                <th
                  key={col.field}
                  className={cn(
                    "text-left font-medium text-muted text-xs pb-3 pr-4",
                    col.hideOnMobile && "hidden sm:table-cell"
                  )}
                >
                  <button
                    onClick={() => onSort(col.field)}
                    className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    {col.label}
                    {active ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 opacity-40" />
                    )}
                  </button>
                </th>
              );
            })}
            <th className="text-right font-medium text-muted text-xs pb-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <motion.tr
              key={product.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, delay: index * 0.02 }}
              className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors"
            >
              <td className="py-3 pr-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center shrink-0">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  <p className="font-medium text-foreground/90 truncate">{product.name}</p>
                </div>
              </td>
              <td className="py-3 pr-4 text-foreground/80 hidden sm:table-cell">{product.category}</td>
              <td className="py-3 pr-4 text-foreground/80">{formatCurrency(product.price)}</td>
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  <span className="text-foreground/80">{product.quantity}</span>
                  <Badge variant={statusVariant[product.status]} className="hidden md:inline-flex">
                    {statusLabel[product.status]}
                  </Badge>
                </div>
              </td>
              <td className="py-3">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => onView(product)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                    aria-label={`View ${product.name}`}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEdit(product)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-muted hover:text-secondary hover:bg-secondary/10 transition-colors"
                    aria-label={`Edit ${product.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(product)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-muted hover:text-error hover:bg-error/10 transition-colors"
                    aria-label={`Delete ${product.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
