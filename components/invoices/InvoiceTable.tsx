"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, ArrowUpDown, Eye, Pencil, Trash2, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn, formatCurrency } from "@/lib/utils";
import type { Invoice, InvoiceSortField, InvoiceStatus, SortDirection } from "@/types/invoice";

const statusVariant: Record<InvoiceStatus, "neutral" | "primary" | "success" | "error"> = {
  Draft: "neutral",
  Sent: "primary",
  Paid: "success",
  Overdue: "error",
};

interface Column {
  field: InvoiceSortField;
  label: string;
  hideOnMobile?: boolean;
}

const columns: Column[] = [
  { field: "invoiceNumber", label: "Invoice" },
  { field: "customerName", label: "Customer" },
  { field: "grandTotal", label: "Total" },
  { field: "status", label: "Status", hideOnMobile: true },
  { field: "createdAt", label: "Date", hideOnMobile: true },
];

interface InvoiceTableProps {
  invoices: Invoice[];
  sortField: InvoiceSortField;
  sortDirection: SortDirection;
  onSort: (field: InvoiceSortField) => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
}

export function InvoiceTable({ invoices, sortField, sortDirection, onSort, onEdit, onDelete }: InvoiceTableProps) {
  return (
    <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
      <table className="w-full text-sm min-w-[680px]">
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
          {invoices.map((invoice, index) => (
            <motion.tr
              key={invoice.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, delay: index * 0.02 }}
              className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors"
            >
              <td className="py-3 pr-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center shrink-0">
                    <Receipt className="h-4 w-4 text-primary" />
                  </div>
                  <p className="font-medium text-foreground/90 truncate">{invoice.invoiceNumber}</p>
                </div>
              </td>
              <td className="py-3 pr-4 text-foreground/80 truncate max-w-[160px]">{invoice.customerName}</td>
              <td className="py-3 pr-4 text-foreground/80">{formatCurrency(invoice.grandTotal)}</td>
              <td className="py-3 pr-4 hidden sm:table-cell">
                <Badge variant={statusVariant[invoice.status]}>{invoice.status}</Badge>
              </td>
              <td className="py-3 pr-4 text-foreground/70 hidden sm:table-cell">
                {new Date(invoice.createdAt).toLocaleDateString()}
              </td>
              <td className="py-3">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/invoices/${invoice.id}`}
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                    aria-label={`Preview ${invoice.invoiceNumber}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => onEdit(invoice)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-muted hover:text-secondary hover:bg-secondary/10 transition-colors"
                    aria-label={`Edit ${invoice.invoiceNumber}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(invoice)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-muted hover:text-error hover:bg-error/10 transition-colors"
                    aria-label={`Delete ${invoice.invoiceNumber}`}
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
