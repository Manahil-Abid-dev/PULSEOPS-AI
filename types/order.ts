export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  createdAt: string; // ISO date string
}

/** A single row in the Add/Edit Order form before totals are derived. */
export type OrderItemInput = {
  productId: string;
  quantity: number;
};

/** Fields collected from the Add/Edit Order form. */
export type OrderFormValues = {
  customerId: string;
  items: OrderItemInput[];
  status: OrderStatus;
};

export type OrderSortField = "orderNumber" | "customerName" | "total" | "status" | "createdAt";
export type SortDirection = "asc" | "desc";

export const ORDER_STATUSES: OrderStatus[] = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
