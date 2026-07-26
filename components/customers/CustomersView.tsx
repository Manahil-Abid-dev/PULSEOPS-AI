"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Users, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CustomerTable } from "@/components/customers/CustomerTable";
import { CustomerFormModal } from "@/components/customers/CustomerFormModal";
import { CustomerDetailsModal } from "@/components/customers/CustomerDetailsModal";
import { useCustomers } from "@/hooks/useCustomers";
import { useToast } from "@/components/providers/ToastProvider";
import { addCustomer, updateCustomer, deleteCustomer } from "@/services/customerService";
import type { Customer, CustomerFormValues, CustomerSortField, SortDirection } from "@/types/customer";

const PAGE_SIZE = 8;

const statusFilterOptions = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "pending", label: "Pending" },
];

export function CustomersView() {
  const { customers, isLoading, error } = useCustomers();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<CustomerSortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let result = customers.filter((c) => {
      const matchesTerm =
        !term ||
        c.name.toLowerCase().includes(term) ||
        c.company.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      return matchesTerm && matchesStatus;
    });

    result = [...result].sort((a, b) => {
      let comparison = 0;
      if (sortField === "createdAt") {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        comparison = String(a[sortField]).localeCompare(String(b[sortField]));
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [customers, search, statusFilter, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSort(field: CustomerSortField) {
    if (field === sortField) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function updateStatusFilter(value: string) {
    setStatusFilter(value);
    setPage(1);
  }

  function openAddForm() {
    setEditingCustomer(null);
    setFormOpen(true);
  }

  function openEditForm(customer: Customer) {
    setViewingCustomer(null);
    setEditingCustomer(customer);
    setFormOpen(true);
  }

  async function handleFormSubmit(values: CustomerFormValues) {
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, values);
        showToast("success", "Customer updated", `${values.name}'s profile has been saved.`);
      } else {
        await addCustomer(values);
        showToast("success", "Customer added", `${values.name} has been added to your CRM.`);
      }
      setFormOpen(false);
      setEditingCustomer(null);
    } catch {
      showToast("error", "Something went wrong", "Couldn't save this customer. Please try again.");
    }
  }

  async function handleDelete() {
    if (!deletingCustomer) return;
    try {
      await deleteCustomer(deletingCustomer.id);
      showToast("success", "Customer deleted", `${deletingCustomer.name} has been removed.`);
    } catch {
      showToast("error", "Couldn't delete customer", "Please try again.");
    } finally {
      setDeletingCustomer(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Customers</h1>
          <p className="text-sm text-muted mt-1">Manage your customer relationships in one place.</p>
        </div>
        <Button onClick={openAddForm} size="md">
          <Plus className="h-4 w-4" /> Add Customer
        </Button>
      </div>

      <Card>
        <div className="flex items-center gap-3 flex-wrap mb-5">
          <div className="flex-1 min-w-[220px]">
            <Input
              value={search}
              onChange={(e) => updateSearch(e.target.value)}
              placeholder="Search by name, company, or email..."
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={statusFilter}
              onChange={(e) => updateStatusFilter(e.target.value)}
              options={statusFilterOptions}
            />
          </div>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center text-center py-14">
            <div className="h-12 w-12 rounded-full bg-error/10 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-error" />
            </div>
            <p className="text-sm font-semibold text-foreground">Couldn&apos;t load customers</p>
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
            icon={Users}
            title={customers.length === 0 ? "No customers yet" : "No matching customers"}
            description={
              customers.length === 0
                ? "Add your first customer to start building your CRM."
                : "Try adjusting your search or filters."
            }
          />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
            <CustomerTable
              customers={paginated}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              onView={setViewingCustomer}
              onEdit={openEditForm}
              onDelete={setDeletingCustomer}
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

      <CustomerFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        customer={editingCustomer}
      />

      <CustomerDetailsModal
        open={Boolean(viewingCustomer)}
        onClose={() => setViewingCustomer(null)}
        customer={viewingCustomer}
        onEdit={() => viewingCustomer && openEditForm(viewingCustomer)}
      />

      <ConfirmDialog
        open={Boolean(deletingCustomer)}
        title="Delete this customer?"
        description={`This will permanently remove ${deletingCustomer?.name ?? "this customer"} from your CRM. This action can't be undone.`}
        onConfirm={handleDelete}
        onClose={() => setDeletingCustomer(null)}
      />
    </div>
  );
}
