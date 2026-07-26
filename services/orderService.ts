import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toIsoString } from "@/lib/firestoreCollection";
import { reserveNextSequence, formatSequence } from "@/lib/counters";
import { deriveStockStatus } from "@/types/product";
import type { Order, OrderFormValues, OrderItem, OrderStatus } from "@/types/order";

const COLLECTION = "orders";
const PRODUCTS_COLLECTION = "products";

/** Minimal product info the caller already has in memory, used as a fallback when a fresh read is unavailable. */
export type ProductLookup = Map<string, { name: string; price: number }>;

function fromDoc(snapshot: QueryDocumentSnapshot<DocumentData>): Order {
  const data = snapshot.data();
  const items: OrderItem[] = Array.isArray(data.items)
    ? data.items.map((item: Record<string, unknown>) => ({
        productId: String(item.productId ?? ""),
        productName: String(item.productName ?? ""),
        quantity: typeof item.quantity === "number" ? item.quantity : 0,
        unitPrice: typeof item.unitPrice === "number" ? item.unitPrice : 0,
      }))
    : [];
  return {
    id: snapshot.id,
    orderNumber: data.orderNumber ?? "",
    customerId: data.customerId ?? "",
    customerName: data.customerName ?? "",
    items,
    subtotal: typeof data.subtotal === "number" ? data.subtotal : 0,
    total: typeof data.total === "number" ? data.total : 0,
    status: (data.status as OrderStatus) ?? "Pending",
    createdAt: toIsoString(data.createdAt),
  };
}

/** Subscribes to live order updates. Returns an unsubscribe function. */
export function subscribeToOrders(
  onData: (orders: Order[]) => void,
  onError: (message: string) => void
) {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => onData(snapshot.docs.map(fromDoc)),
    (err) => onError(err.message || "Failed to load orders from Firebase.")
  );
}

function computeTotals(items: OrderItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  return { subtotal, total: subtotal };
}

/**
 * Creates a new order. Inside a single transaction this reserves an
 * order number, reads the live price/stock for every product on the
 * order, blocks the write if stock is insufficient, and decrements
 * product quantities — so Firestore (and therefore the dashboard's
 * Low Stock Summary) always reflects the new totals immediately.
 */
export async function addOrder(
  values: OrderFormValues,
  customerName: string,
  productLookup: ProductLookup
): Promise<string> {
  const orderRef = doc(collection(db, COLLECTION));

  await runTransaction(db, async (transaction) => {
    const productRefs = values.items.map((item) => doc(db, PRODUCTS_COLLECTION, item.productId));
    const productSnaps = await Promise.all(productRefs.map((ref) => transaction.get(ref)));

    const willReserveStock = values.status !== "Cancelled";

    const resolvedItems: OrderItem[] = values.items.map((item, index) => {
      const snap = productSnaps[index];
      const data = snap.data();
      const currentQuantity = typeof data?.quantity === "number" ? data.quantity : 0;
      const lookup = productLookup.get(item.productId);
      const name = (data?.name as string | undefined) ?? lookup?.name ?? "Unknown product";
      const price = typeof data?.price === "number" ? data.price : lookup?.price ?? 0;

      if (willReserveStock && currentQuantity < item.quantity) {
        throw new Error(`Not enough stock for ${name}. Only ${currentQuantity} left.`);
      }
      return { productId: item.productId, productName: name, quantity: item.quantity, unitPrice: price };
    });

    const seq = await reserveNextSequence(transaction, "orders");
    const orderNumber = formatSequence("ORD", seq);
    const { subtotal, total } = computeTotals(resolvedItems);

    if (willReserveStock) {
      productSnaps.forEach((snap, index) => {
        const data = snap.data();
        const currentQuantity = typeof data?.quantity === "number" ? data.quantity : 0;
        const newQuantity = currentQuantity - resolvedItems[index].quantity;
        transaction.update(snap.ref, {
          quantity: newQuantity,
          status: deriveStockStatus(newQuantity),
        });
      });
    }

    transaction.set(orderRef, {
      orderNumber,
      customerId: values.customerId,
      customerName,
      items: resolvedItems,
      subtotal,
      total,
      status: values.status,
      createdAt: serverTimestamp(),
    });
  });

  return orderRef.id;
}

/**
 * Updates an existing order. Recomputes the stock delta between the
 * previous and the new line items (accounting for Cancelled orders
 * holding no reserved stock) and applies only the difference to each
 * affected product in the same transaction.
 */
export async function updateOrder(
  id: string,
  values: OrderFormValues,
  customerName: string,
  productLookup: ProductLookup
): Promise<void> {
  const orderRef = doc(db, COLLECTION, id);

  await runTransaction(db, async (transaction) => {
    const orderSnap = await transaction.get(orderRef);
    if (!orderSnap.exists()) throw new Error("This order no longer exists.");
    const existing = orderSnap.data();
    const oldItems: OrderItem[] = Array.isArray(existing.items) ? existing.items : [];
    const oldStatus: OrderStatus = (existing.status as OrderStatus) ?? "Pending";
    const oldWasActive = oldStatus !== "Cancelled";
    const newWillBeActive = values.status !== "Cancelled";

    const productIds = Array.from(
      new Set([...oldItems.map((i) => i.productId), ...values.items.map((i) => i.productId)])
    );
    const productRefs = productIds.map((pid) => doc(db, PRODUCTS_COLLECTION, pid));
    const productSnaps = await Promise.all(productRefs.map((ref) => transaction.get(ref)));
    const productMap = new Map(productIds.map((pid, index) => [pid, productSnaps[index]]));

    const oldQtyByProduct = new Map<string, number>();
    if (oldWasActive) {
      for (const item of oldItems) {
        oldQtyByProduct.set(item.productId, (oldQtyByProduct.get(item.productId) ?? 0) + item.quantity);
      }
    }
    const newQtyByProduct = new Map<string, number>();
    if (newWillBeActive) {
      for (const item of values.items) {
        newQtyByProduct.set(item.productId, (newQtyByProduct.get(item.productId) ?? 0) + item.quantity);
      }
    }

    const resolvedItems: OrderItem[] = values.items.map((item) => {
      const snap = productMap.get(item.productId);
      const data = snap?.data();
      const lookup = productLookup.get(item.productId);
      const name = (data?.name as string | undefined) ?? lookup?.name ?? "Unknown product";
      const price = typeof data?.price === "number" ? data.price : lookup?.price ?? 0;
      return { productId: item.productId, productName: name, quantity: item.quantity, unitPrice: price };
    });

    for (const pid of productIds) {
      const oldQty = oldQtyByProduct.get(pid) ?? 0;
      const newQty = newQtyByProduct.get(pid) ?? 0;
      const delta = newQty - oldQty; // positive delta = extra stock must be reserved now
      if (delta === 0) continue;

      const snap = productMap.get(pid);
      if (!snap || !snap.exists()) continue;
      const data = snap.data();
      const currentQuantity = typeof data?.quantity === "number" ? data.quantity : 0;
      const updatedQuantity = currentQuantity - delta;
      if (updatedQuantity < 0) {
        throw new Error(`Not enough stock for ${data?.name ?? "this product"} to save these changes.`);
      }
      transaction.update(snap.ref, {
        quantity: updatedQuantity,
        status: deriveStockStatus(updatedQuantity),
      });
    }

    const { subtotal, total } = computeTotals(resolvedItems);
    transaction.update(orderRef, {
      customerId: values.customerId,
      customerName,
      items: resolvedItems,
      subtotal,
      total,
      status: values.status,
    });
  });
}

/**
 * Deletes an order. If the order still held reserved stock (i.e. it
 * wasn't Cancelled), every line item's quantity is restored to the
 * matching product first.
 */
export async function deleteOrder(id: string): Promise<void> {
  const orderRef = doc(db, COLLECTION, id);

  await runTransaction(db, async (transaction) => {
    const orderSnap = await transaction.get(orderRef);
    if (!orderSnap.exists()) return;
    const data = orderSnap.data();
    const items: OrderItem[] = Array.isArray(data.items) ? data.items : [];
    const status: OrderStatus = (data.status as OrderStatus) ?? "Pending";

    if (status !== "Cancelled" && items.length > 0) {
      const productRefs = items.map((item) => doc(db, PRODUCTS_COLLECTION, item.productId));
      const productSnaps = await Promise.all(productRefs.map((ref) => transaction.get(ref)));
      productSnaps.forEach((snap, index) => {
        if (!snap.exists()) return;
        const pdata = snap.data();
        const currentQuantity = typeof pdata?.quantity === "number" ? pdata.quantity : 0;
        const restocked = currentQuantity + items[index].quantity;
        transaction.update(snap.ref, {
          quantity: restocked,
          status: deriveStockStatus(restocked),
        });
      });
    }

    transaction.delete(orderRef);
  });
}
