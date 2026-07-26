"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Package, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ProductTable } from "@/components/products/ProductTable";
import { ProductFormModal } from "@/components/products/ProductFormModal";
import { ProductDetailsModal } from "@/components/products/ProductDetailsModal";
import { useProducts } from "@/hooks/useProducts";
import { useToast } from "@/components/providers/ToastProvider";
import { addProduct, updateProduct, deleteProduct } from "@/services/productService";
import { PRODUCT_CATEGORIES } from "@/types/product";
import type { Product, ProductFormValues, ProductSortField, SortDirection } from "@/types/product";

const PAGE_SIZE = 8;

const categoryFilterOptions = [
  { value: "all", label: "All categories" },
  ...PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c })),
];

export function ProductsView() {
  const { products, isLoading, error } = useProducts();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortField, setSortField] = useState<ProductSortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let result = products.filter((p) => {
      const matchesTerm = !term || p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term);
      const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
      return matchesTerm && matchesCategory;
    });

    result = [...result].sort((a, b) => {
      let comparison = 0;
      if (sortField === "createdAt") {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortField === "price" || sortField === "quantity") {
        comparison = a[sortField] - b[sortField];
      } else {
        comparison = String(a[sortField]).localeCompare(String(b[sortField]));
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [products, search, categoryFilter, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSort(field: ProductSortField) {
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

  function updateCategoryFilter(value: string) {
    setCategoryFilter(value);
    setPage(1);
  }

  function openAddForm() {
    setEditingProduct(null);
    setFormOpen(true);
  }

  function openEditForm(product: Product) {
    setViewingProduct(null);
    setEditingProduct(product);
    setFormOpen(true);
  }

  async function handleFormSubmit(values: ProductFormValues) {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, values);
        showToast("success", "Product updated", `${values.name} has been saved.`);
      } else {
        await addProduct(values);
        showToast("success", "Product added", `${values.name} has been added to your catalog.`);
      }
      setFormOpen(false);
      setEditingProduct(null);
    } catch {
      showToast("error", "Something went wrong", "Couldn't save this product. Please try again.");
    }
  }

  async function handleDelete() {
    if (!deletingProduct) return;
    try {
      await deleteProduct(deletingProduct.id);
      showToast("success", "Product deleted", `${deletingProduct.name} has been removed.`);
    } catch {
      showToast("error", "Couldn't delete product", "Please try again.");
    } finally {
      setDeletingProduct(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Products</h1>
          <p className="text-sm text-muted mt-1">Manage your product catalog and inventory.</p>
        </div>
        <Button onClick={openAddForm} size="md">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      <Card>
        <div className="flex items-center gap-3 flex-wrap mb-5">
          <div className="flex-1 min-w-[220px]">
            <Input
              value={search}
              onChange={(e) => updateSearch(e.target.value)}
              placeholder="Search by name or category..."
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="w-full sm:w-52">
            <Select
              value={categoryFilter}
              onChange={(e) => updateCategoryFilter(e.target.value)}
              options={categoryFilterOptions}
            />
          </div>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center text-center py-14">
            <div className="h-12 w-12 rounded-full bg-error/10 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-error" />
            </div>
            <p className="text-sm font-semibold text-foreground">Couldn&apos;t load products</p>
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
            icon={Package}
            title={products.length === 0 ? "No products yet" : "No matching products"}
            description={
              products.length === 0
                ? "Add your first product to start building your catalog."
                : "Try adjusting your search or filters."
            }
          />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
            <ProductTable
              products={paginated}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              onView={setViewingProduct}
              onEdit={openEditForm}
              onDelete={setDeletingProduct}
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

      <ProductFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        product={editingProduct}
      />

      <ProductDetailsModal
        open={Boolean(viewingProduct)}
        onClose={() => setViewingProduct(null)}
        product={viewingProduct}
        onEdit={() => viewingProduct && openEditForm(viewingProduct)}
      />

      <ConfirmDialog
        open={Boolean(deletingProduct)}
        title="Delete this product?"
        description={`This will permanently remove ${deletingProduct?.name ?? "this product"} from your catalog. This action can't be undone.`}
        onConfirm={handleDelete}
        onClose={() => setDeletingProduct(null)}
      />
    </div>
  );
}
