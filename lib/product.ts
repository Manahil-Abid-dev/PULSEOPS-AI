import { adminDb } from "./firebase-admin";

export async function getProducts() {
  const snapshot = await adminDb.collection("products").get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}