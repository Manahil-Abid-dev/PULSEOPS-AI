import { adminDb } from "./firebase-admin";

export async function getOrders() {
  const snapshot = await adminDb.collection("orders").get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}