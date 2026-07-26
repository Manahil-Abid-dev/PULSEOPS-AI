"use client";

import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, ArrowUpDown, Eye, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import type { Customer, CustomerSortField, CustomerStatus, SortDirection } from "@/types/customer";

const statusVariant: Record<CustomerStatus, "success" | "neutral" | "warning"> = {
  active: "success",
  inactive: "neutral",
  pending: "warning",
};

interface Column {
  field: CustomerSortField;
  label: string;
  hideOnMobile?: boolean;
}

const columns: Column[] = [
  { field: "name", label: "Customer" },
  { field: "company", label: "Company", hideOnMobile: true },
  { field: "status", label: "Status" },
  { field: "createdAt", label: "Created", hideOnMobile: true },
];

interface CustomerTableProps {
  customers: Customer[];
  sortField: CustomerSortField;
  sortDirection: SortDirection;
  onSort: (field: CustomerSortField) => void;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export function CustomerTable({
  customers,
  sortField,
  sortDirection,
  onSort,
  onView,
  onEdit,
  onDelete,
}: CustomerTableProps) {
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
          {customers.map((customer, index) => (
            <motion.tr
              key={customer.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, delay: index * 0.02 }}
              className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors"
            >
              <td className="py-3 pr-4">
                <div className="flex items-center gap-3">
                  <Avatar name={customer.name} size="sm" />
                  <div className="min-w-0">
                    <p className="font-medium text-foreground/90 truncate">{customer.name}</p>
                    <p className="text-xs text-muted truncate">{customer.email}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 pr-4 text-foreground/80 hidden sm:table-cell">{customer.company}</td>
              <td className="py-3 pr-4">
                <Badge variant={statusVariant[customer.status]} className="capitalize">
                  {customer.status}
                </Badge>
              </td>
              <td className="py-3 pr-4 text-muted hidden sm:table-cell">
                {new Date(customer.createdAt).toLocaleDateString()}
              </td>
              <td className="py-3">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => onView(customer)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                    aria-label={`View ${customer.name}`}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEdit(customer)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-muted hover:text-secondary hover:bg-secondary/10 transition-colors"
                    aria-label={`Edit ${customer.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(customer)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-muted hover:text-error hover:bg-error/10 transition-colors"
                    aria-label={`Delete ${customer.name}`}
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
