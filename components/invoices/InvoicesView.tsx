"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Receipt, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { InvoiceTable } from "@/components/invoices/InvoiceTable";
import { InvoiceFormModal } from "@/components/invoices/InvoiceFormModal";
import { useInvoices } from "@/hooks/useInvoices";
import { useOrders } from "@/hooks/useOrders";
import { useToast } from "@/components/providers/ToastProvider";
import { addInvoiceFromOrder, updateInvoice, deleteInvoice } from "@/services/invoiceService";
import { INVOICE_STATUSES } from "@/types/invoice";
import type { Invoice, InvoiceFormValues, InvoiceSortField, SortDirection } from "@/types/invoice";

const PAGE_SIZE = 8;

const statusFilterOptions = [
  { value: "all", label: "All statuses" },
  ...INVOICE_STATUSES.map((s) => ({ value: s, label: s })),
];

export function InvoicesView() {
  const { invoices, isLoading, error } = useInvoices();
  const { orders } = useOrders();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<InvoiceSortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);

  const eligibleOrders = useMemo(
    () => orders.filter((o) => o.status !== "Cancelled" && !invoices.some((inv) => inv.orderId === o.id)),
    [orders, invoices]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    let result = invoices.filter((inv) => {
      const matchesTerm =
        !term || inv.invoiceNumber.toLowerCase().includes(term) || inv.customerName.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
      return matchesTerm && matchesStatus;
    });

    result = [...result].sort((a, b) => {
      let comparison = 0;
      if (sortField === "createdAt") {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortField === "grandTotal") {
        comparison = a.grandTotal - b.grandTotal;
      } else {
        comparison = String(a[sortField]).localeCompare(String(b[sortField]));
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [invoices, search, statusFilter, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSort(field: InvoiceSortField) {
    if (field === sortField) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  function updateFilterState(setter: (value: string) => void, value: string) {
    setter(value);
    setPage(1);
  }

  function openAddForm() {
    setEditingInvoice(null);
    setFormOpen(true);
  }

  function openEditForm(invoice: Invoice) {
    setEditingInvoice(invoice);
    setFormOpen(true);
  }

  async function handleFormSubmit(values: InvoiceFormValues) {
    try {
      if (editingInvoice) {
        await updateInvoice(editingInvoice, values);
        showToast("success", "Invoice updated", `${editingInvoice.invoiceNumber} has been saved.`);
      } else {
        const order = orders.find((o) => o.id === values.orderId);
        if (!order) {
          showToast("error", "Order not found", "Please pick a valid order.");
          return;
        }
        await addInvoiceFromOrder(order, values);
        showToast("success", "Invoice generated", `A new invoice for ${order.orderNumber} has been created.`);
      }
      setFormOpen(false);
      setEditingInvoice(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Couldn't save this invoice. Please try again.";
      showToast("error", "Something went wrong", message);
    }
  }

  async function handleDelete() {
    if (!deletingInvoice) return;
    try {
      await deleteInvoice(deletingInvoice.id);
      showToast("success", "Invoice deleted", `${deletingInvoice.invoiceNumber} has been removed.`);
    } catch {
      showToast("error", "Couldn't delete invoice", "Please try again.");
    } finally {
      setDeletingInvoice(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Invoices</h1>
          <p className="text-sm text-muted mt-1">Generate, track, and send invoices for completed orders.</p>
        </div>
        <Button onClick={openAddForm} size="md" disabled={eligibleOrders.length === 0}>
          <Plus className="h-4 w-4" /> Generate Invoice
        </Button>
      </div>

      <Card>
        <div className="flex items-center gap-3 flex-wrap mb-5">
          <div className="flex-1 min-w-[220px]">
            <Input
              value={search}
              onChange={(e) => updateFilterState(setSearch, e.target.value)}
              placeholder="Search by invoice # or customer..."
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="w-full sm:w-44">
            <Select
              value={statusFilter}
              onChange={(e) => updateFilterState(setStatusFilter, e.target.value)}
              options={statusFilterOptions}
            />
          </div>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center text-center py-14">
            <div className="h-12 w-12 rounded-full bg-error/10 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-error" />
            </div>
            <p className="text-sm font-semibold text-foreground">Couldn&apos;t load invoices</p>
            <p className="text-xs text-muted mt-1 max-w-sm">{error}</p>
          </div>
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title={invoices.length === 0 ? "No invoices yet" : "No matching invoices"}
            description={
              invoices.length === 0
                ? eligibleOrders.length === 0
                  ? "Create an order first, then generate an invoice from it."
                  : "Generate your first invoice from an existing order."
                : "Try adjusting your search or filters."
            }
          />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
            <InvoiceTable
              invoices={paginated}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              onEdit={openEditForm}
              onDelete={setDeletingInvoice}
            />
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </motion.div>
        )}
      </Card>

      <InvoiceFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        invoice={editingInvoice}
        eligibleOrders={eligibleOrders}
      />

      <ConfirmDialog
        open={Boolean(deletingInvoice)}
        title="Delete this invoice?"
        description={`This will permanently remove ${deletingInvoice?.invoiceNumber ?? "this invoice"}. This action can't be undone.`}
        onConfirm={handleDelete}
        onClose={() => setDeletingInvoice(null)}
      />
    </div>
  );
}
