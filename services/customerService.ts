import { createFirestoreCollection, toIsoString } from "@/lib/firestoreCollection";
import type { Customer, CustomerFormValues } from "@/types/customer";

const COLLECTION = "customers";

const collection = createFirestoreCollection<Customer>(COLLECTION, (snapshot) => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    name: data.name ?? "",
    company: data.company ?? "",
    email: data.email ?? "",
    phone: data.phone ?? "",
    status: data.status ?? "active",
    createdAt: toIsoString(data.createdAt),
  };
});

/** Subscribes to live customer updates. Returns an unsubscribe function. */
export function subscribeToCustomers(
  onData: (customers: Customer[]) => void,
  onError: (message: string) => void
) {
  return collection.subscribe(onData, onError);
}

export async function addCustomer(values: CustomerFormValues): Promise<string> {
  return collection.add(values);
}

export async function updateCustomer(id: string, values: CustomerFormValues): Promise<void> {
  return collection.update(id, values);
}

export async function deleteCustomer(id: string): Promise<void> {
  return collection.remove(id);
}
