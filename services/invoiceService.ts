import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toIsoString } from "@/lib/firestoreCollection";
import { reserveNextSequence, formatSequence } from "@/lib/counters";
import type { Invoice, InvoiceFormValues, InvoiceItem, InvoiceStatus } from "@/types/invoice";
import type { Order } from "@/types/order";

const COLLECTION = "invoices";

function fromDoc(snapshot: QueryDocumentSnapshot<DocumentData>): Invoice {
  const data = snapshot.data();
  const items: InvoiceItem[] = Array.isArray(data.items)
    ? data.items.map((item: Record<string, unknown>) => ({
        productId: String(item.productId ?? ""),
        productName: String(item.productName ?? ""),
        quantity: typeof item.quantity === "number" ? item.quantity : 0,
        unitPrice: typeof item.unitPrice === "number" ? item.unitPrice : 0,
      }))
    : [];
  return {
    id: snapshot.id,
    invoiceNumber: data.invoiceNumber ?? "",
    orderId: data.orderId ?? "",
    orderNumber: data.orderNumber ?? "",
    customerId: data.customerId ?? "",
    customerName: data.customerName ?? "",
    items,
    subtotal: typeof data.subtotal === "number" ? data.subtotal : 0,
    taxRate: typeof data.taxRate === "number" ? data.taxRate : 0,
    taxAmount: typeof data.taxAmount === "number" ? data.taxAmount : 0,
    discount: typeof data.discount === "number" ? data.discount : 0,
    grandTotal: typeof data.grandTotal === "number" ? data.grandTotal : 0,
    status: (data.status as InvoiceStatus) ?? "Draft",
    dueDate: toIsoString(data.dueDate),
    createdAt: toIsoString(data.createdAt),
  };
}

/** Subscribes to live invoice updates. Returns an unsubscribe function. */
export function subscribeToInvoices(
  onData: (invoices: Invoice[]) => void,
  onError: (message: string) => void
) {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => onData(snapshot.docs.map(fromDoc)),
    (err) => onError(err.message || "Failed to load invoices from Firebase.")
  );
}

function computeAmounts(subtotal: number, taxRate: number, discount: number) {
  const safeDiscount = Math.min(Math.max(discount, 0), subtotal);
  const taxable = Math.max(subtotal - safeDiscount, 0);
  const taxAmount = taxable * (Math.max(taxRate, 0) / 100);
  const grandTotal = taxable + taxAmount;
  return { taxAmount, grandTotal, discount: safeDiscount };
}

/**
 * Generates an invoice from an existing order — the order's customer
 * and line items are copied over so nothing has to be re-typed. Only
 * billing fields (tax, discount, status, due date) are collected from
 * the form.
 */
export async function addInvoiceFromOrder(order: Order, values: InvoiceFormValues): Promise<string> {
  const invoiceRef = doc(collection(db, COLLECTION));

  await runTransaction(db, async (transaction) => {
    const seq = await reserveNextSequence(transaction, "invoices");
    const invoiceNumber = formatSequence("INV", seq);
    const { taxAmount, grandTotal, discount } = computeAmounts(order.subtotal, values.taxRate, values.discount);

    transaction.set(invoiceRef, {
      invoiceNumber,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      customerName: order.customerName,
      items: order.items,
      subtotal: order.subtotal,
      taxRate: values.taxRate,
      taxAmount,
      discount,
      grandTotal,
      status: values.status,
      dueDate: values.dueDate,
      createdAt: serverTimestamp(),
    });
  });

  return invoiceRef.id;
}

/** Updates an invoice's billing fields (tax, discount, status, due date). Line items stay tied to the source order. */
export async function updateInvoice(
  invoice: Invoice,
  values: Pick<InvoiceFormValues, "taxRate" | "discount" | "status" | "dueDate">
): Promise<void> {
  const { taxAmount, grandTotal, discount } = computeAmounts(invoice.subtotal, values.taxRate, values.discount);
  await updateDoc(doc(db, COLLECTION, invoice.id), {
    taxRate: values.taxRate,
    taxAmount,
    discount,
    grandTotal,
    status: values.status,
    dueDate: values.dueDate,
  });
}

export async function deleteInvoice(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
