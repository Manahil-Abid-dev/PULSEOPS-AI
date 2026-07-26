import { getAdminDb } from "./firebase-admin";
import { computeBusinessMetrics, type BusinessMetrics } from "./businessMetrics";
import { getServerEnv } from "./env";
import type { Product } from "@/types/product";
import type { Customer } from "@/types/customer";
import type { Order } from "@/types/order";
import type { Invoice } from "@/types/invoice";

export interface BusinessSnapshot {
  products: Product[];
  customers: Customer[];
  orders: Order[];
  invoices: Invoice[];
  metrics: BusinessMetrics;
  fetchedAt: number;
}

async function fetchCollection<T>(name: string): Promise<T[]> {
  const snapshot = await getAdminDb().collection(name).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as T);
}

let cache: BusinessSnapshot | null = null;
let inFlight: Promise<BusinessSnapshot> | null = null;

/**
 * PERFORMANCE NOTE (task 10):
 * Every dashboard load and every copilot chat message used to trigger 5
 * fresh Firestore collection reads (products/customers/orders/invoices/
 * reports), even if two requests landed a second apart. This short TTL
 * cache (default 30s, tune via DASHBOARD_SNAPSHOT_CACHE_MS) collapses
 * bursts of requests into a single Firestore round trip, while still
 * keeping the dashboard reasonably fresh. `forceRefresh` bypasses the
 * cache for explicit user-triggered actions like "Analyze Business".
 */
export async function getBusinessSnapshot(opts: { forceRefresh?: boolean } = {}): Promise<BusinessSnapshot> {
  const ttl = getServerEnv().DASHBOARD_SNAPSHOT_CACHE_MS;
  const now = Date.now();

  if (!opts.forceRefresh && cache && now - cache.fetchedAt < ttl) {
    return cache;
  }

  if (!opts.forceRefresh && inFlight) {
    return inFlight;
  }

  inFlight = (async () => {
    const [products, customers, orders, invoices] = await Promise.all([
      fetchCollection<Product>("products"),
      fetchCollection<Customer>("customers"),
      fetchCollection<Order>("orders"),
      fetchCollection<Invoice>("invoices"),
    ]);

    const metrics = computeBusinessMetrics(products, customers, orders, invoices);
    const snapshot: BusinessSnapshot = { products, customers, orders, invoices, metrics, fetchedAt: now };
    cache = snapshot;
    return snapshot;
  })();

  try {
    return await inFlight;
  } finally {
    inFlight = null;
  }
}
