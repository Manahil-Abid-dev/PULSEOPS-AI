import type { OrderItem } from "@/types/order";

export type InvoiceStatus = "Draft" | "Sent" | "Paid" | "Overdue";

export type InvoiceItem = OrderItem;

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number; // percent, e.g. 8.5
  taxAmount: number;
  discount: number; // flat amount
  grandTotal: number;
  status: InvoiceStatus;
  dueDate: string; // ISO date string
  createdAt: string; // ISO date string
}

/** Fields collected from the Generate/Edit Invoice form. */
export type InvoiceFormValues = {
  orderId: string;
  taxRate: number;
  discount: number;
  status: InvoiceStatus;
  dueDate: string;
};

export type InvoiceSortField = "invoiceNumber" | "customerName" | "grandTotal" | "status" | "createdAt";
export type SortDirection = "asc" | "desc";

export const INVOICE_STATUSES: InvoiceStatus[] = ["Draft", "Sent", "Paid", "Overdue"];
