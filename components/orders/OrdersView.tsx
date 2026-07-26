"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, ShoppingCart, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { OrderTable } from "@/components/orders/OrderTable";
import { OrderFormModal } from "@/components/orders/OrderFormModal";
import { OrderDetailsModal } from "@/components/orders/OrderDetailsModal";
import { useOrders } from "@/hooks/useOrders";
import { useCustomers } from "@/hooks/useCustomers";
import { useProducts } from "@/hooks/useProducts";
import { useToast } from "@/components/providers/ToastProvider";
import { addOrder, updateOrder, deleteOrder, type ProductLookup } from "@/services/orderService";
import { ORDER_STATUSES } from "@/types/order";
import type { Order, OrderFormValues, OrderSortField, SortDirection } from "@/types/order";

const PAGE_SIZE = 8;

const statusFilterOptions = [
  { value: "all", label: "All statuses" },
  ...ORDER_STATUSES.map((s) => ({ value: s, label: s })),
];

export function OrdersView() {
  const { orders, isLoading, error } = useOrders();
  const { customers } = useCustomers();
  const { products } = useProducts();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortField, setSortField] = useState<OrderSortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);

  const productLookup: ProductLookup = useMemo(
    () => new Map(products.map((p) => [p.id, { name: p.name, price: p.price }])),
    [products]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom).getTime() : null;
    const to = dateTo ? new Date(dateTo).getTime() + 86400000 - 1 : null;

    let result = orders.filter((o) => {
      const matchesTerm =
        !term || o.orderNumber.toLowerCase().includes(term) || o.customerName.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      const createdTime = new Date(o.createdAt).getTime();
      const matchesFrom = from === null || createdTime >= from;
      const matchesTo = to === null || createdTime <= to;
      return matchesTerm && matchesStatus && matchesFrom && matchesTo;
    });

    result = [...result].sort((a, b) => {
      let comparison = 0;
      if (sortField === "createdAt") {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortField === "total") {
        comparison = a.total - b.total;
      } else {
        comparison = String(a[sortField]).localeCompare(String(b[sortField]));
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [orders, search, statusFilter, dateFrom, dateTo, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSort(field: OrderSortField) {
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
    setEditingOrder(null);
    setFormOpen(true);
  }

  function openEditForm(order: Order) {
    setViewingOrder(null);
    setEditingOrder(order);
    setFormOpen(true);
  }

  async function handleFormSubmit(values: OrderFormValues) {
    const customer = customers.find((c) => c.id === values.customerId);
    const customerName = customer ? `${customer.name} — ${customer.company}` : "Unknown customer";
    try {
      if (editingOrder) {
        await updateOrder(editingOrder.id, values, customerName, productLookup);
        showToast("success", "Order updated", `${editingOrder.orderNumber} has been saved.`);
      } else {
        await addOrder(values, customerName, productLookup);
        showToast("success", "Order created", "A new order has been added and stock updated.");
      }
      setFormOpen(false);
      setEditingOrder(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Couldn't save this order. Please try again.";
      showToast("error", "Something went wrong", message);
    }
  }

  async function handleDelete() {
    if (!deletingOrder) return;
    try {
      await deleteOrder(deletingOrder.id);
      showToast("success", "Order deleted", `${deletingOrder.orderNumber} has been removed and stock restored.`);
    } catch {
      showToast("error", "Couldn't delete order", "Please try again.");
    } finally {
      setDeletingOrder(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Orders</h1>
          <p className="text-sm text-muted mt-1">Track and manage every customer order.</p>
        </div>
        <Button onClick={openAddForm} size="md" disabled={customers.length === 0 || products.length === 0}>
          <Plus className="h-4 w-4" /> Add Order
        </Button>
      </div>

      <Card>
        <div className="flex items-center gap-3 flex-wrap mb-5">
          <div className="flex-1 min-w-[220px]">
            <Input
              value={search}
              onChange={(e) => updateFilterState(setSearch, e.target.value)}
              placeholder="Search by order # or customer..."
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
          <div className="w-full sm:w-40">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => updateFilterState(setDateFrom, e.target.value)}
              aria-label="From date"
            />
          </div>
          <div className="w-full sm:w-40">
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => updateFilterState(setDateTo, e.target.value)}
              aria-label="To date"
            />
          </div>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center text-center py-14">
            <div className="h-12 w-12 rounded-full bg-error/10 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-error" />
            </div>
            <p className="text-sm font-semibold text-foreground">Couldn&apos;t load orders</p>
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
            icon={ShoppingCart}
            title={orders.length === 0 ? "No orders yet" : "No matching orders"}
            description={
              orders.length === 0
                ? customers.length === 0 || products.length === 0
                  ? "Add a customer and a product first, then create your first order."
                  : "Create your first order to start tracking sales."
                : "Try adjusting your search or filters."
            }
          />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
            <OrderTable
              orders={paginated}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              onView={setViewingOrder}
              onEdit={openEditForm}
              onDelete={setDeletingOrder}
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

      <OrderFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        order={editingOrder}
        customers={customers}
        products={products}
      />

      <OrderDetailsModal
        open={Boolean(viewingOrder)}
        onClose={() => setViewingOrder(null)}
        order={viewingOrder}
        onEdit={() => viewingOrder && openEditForm(viewingOrder)}
      />

      <ConfirmDialog
        open={Boolean(deletingOrder)}
        title="Delete this order?"
        description={`This will permanently remove ${deletingOrder?.orderNumber ?? "this order"} and restore any reserved stock. This action can't be undone.`}
        onConfirm={handleDelete}
        onClose={() => setDeletingOrder(null)}
      />
    </div>
  );
}
