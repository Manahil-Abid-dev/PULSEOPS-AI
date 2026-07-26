import { adminDb } from "./firebase-admin";

export async function getInvoices() {
  const snapshot = await adminDb.collection("invoices").get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}