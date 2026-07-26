import { adminDb } from "./firebase-admin";

export async function getCustomers() {
  const snapshot = await adminDb.collection("customers").get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}