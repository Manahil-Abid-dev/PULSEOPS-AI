import { createFirestoreCollection, toIsoString } from "@/lib/firestoreCollection";
import type { Product, ProductFormValues } from "@/types/product";
import { deriveStockStatus } from "@/types/product";

const COLLECTION = "products";

const collection = createFirestoreCollection<Product>(COLLECTION, (snapshot) => {
  const data = snapshot.data();
  const quantity = typeof data.quantity === "number" ? data.quantity : 0;
  return {
    id: snapshot.id,
    name: data.name ?? "",
    category: data.category ?? "Other",
    price: typeof data.price === "number" ? data.price : 0,
    quantity,
    status: data.status ?? deriveStockStatus(quantity),
    createdAt: toIsoString(data.createdAt),
  };
});

/** Subscribes to live product updates. Returns an unsubscribe function. */
export function subscribeToProducts(
  onData: (products: Product[]) => void,
  onError: (message: string) => void
) {
  return collection.subscribe(onData, onError);
}

export async function addProduct(values: ProductFormValues): Promise<string> {
  return collection.add({ ...values, status: deriveStockStatus(values.quantity) });
}

export async function updateProduct(id: string, values: ProductFormValues): Promise<void> {
  return collection.update(id, { ...values, status: deriveStockStatus(values.quantity) });
}

export async function deleteProduct(id: string): Promise<void> {
  return collection.remove(id);
}
