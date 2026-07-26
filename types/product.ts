export type ProductStatus = "in-stock" | "low-stock" | "out-of-stock";

export type ProductCategory =
  | "Apparel"
  | "Electronics"
  | "Home & Kitchen"
  | "Sports & Outdoors"
  | "Beauty & Health"
  | "Office Supplies"
  | "Toys & Games"
  | "Other";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  quantity: number;
  status: ProductStatus;
  createdAt: string; // ISO date string
}

/** Fields collected from the Add/Edit Product form. */
export type ProductFormValues = {
  name: string;
  category: ProductCategory;
  price: number;
  quantity: number;
  status: ProductStatus;
};

export type ProductSortField = "name" | "category" | "price" | "quantity" | "createdAt";
export type SortDirection = "asc" | "desc";

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  "Apparel",
  "Electronics",
  "Home & Kitchen",
  "Sports & Outdoors",
  "Beauty & Health",
  "Office Supplies",
  "Toys & Games",
  "Other",
];

/** Derives stock status from quantity using shared low-stock threshold rules. */
export function deriveStockStatus(quantity: number): ProductStatus {
  if (quantity <= 0) return "out-of-stock";
  if (quantity <= 10) return "low-stock";
  return "in-stock";
}
